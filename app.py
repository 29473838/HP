from __future__ import annotations

import os
import uuid
import json
from datetime import datetime, timezone
from pathlib import Path
import shutil
import threading

from flask import Flask, jsonify, render_template, request, session, redirect, url_for, send_from_directory, abort
from werkzeug.utils import secure_filename
from werkzeug.security import check_password_hash

from functools import wraps

import bleach
from bleach.css_sanitizer import CSSSanitizer


BASE_DIR = Path(__file__).resolve().parent
REPO_DATA_DIR = BASE_DIR / "data"
REPO_UPLOADS_DIR = BASE_DIR / "static" / "uploads"

# Persistent storage (Railway: mount a Volume and set PERSIST_ROOT=/app/storage)
PERSIST_ROOT = (os.environ.get("PERSIST_ROOT") or "").strip()
if PERSIST_ROOT:
    _persist = Path(PERSIST_ROOT)
    DATA_DIR = Path(os.environ.get("DATA_DIR") or str(_persist / "data"))
    UPLOAD_DIR = Path(os.environ.get("UPLOAD_DIR") or str(_persist / "uploads"))
else:
    DATA_DIR = Path(os.environ.get("DATA_DIR") or str(REPO_DATA_DIR))
    UPLOAD_DIR = Path(os.environ.get("UPLOAD_DIR") or str(REPO_UPLOADS_DIR))

GUIDE_FILE = DATA_DIR / "guide.html"
GUIDE_DELTA_FILE = DATA_DIR / "guide_delta.json"
MEDAL_IMAGES_FILE = DATA_DIR / "medal_images.json"

DATA_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

def _seed_tree(src_root: Path, dst_root: Path, overwrite: bool = False) -> None:
    if not src_root.exists():
        return
    dst_root.mkdir(parents=True, exist_ok=True)
    for p in src_root.rglob("*"):
        rel = p.relative_to(src_root)
        dst = dst_root / rel
        if p.is_dir():
            dst.mkdir(parents=True, exist_ok=True)
        else:
            if dst.exists() and not overwrite:
                continue
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(p, dst)

def _bootstrap_persistent() -> None:
    # Railway Volume이 비어있을 때: 레포에 들어있는 기존 데이터(작은 파일)만 1회 복사
    # 업로드(특히 mp4)는 용량이 커서 부팅이 느려지면 플랫폼이 종료할 수 있어 기본 OFF
    if not PERSIST_ROOT:
        return

    force = str(os.environ.get("FORCE_BOOTSTRAP") or "").lower() in ("1", "true", "yes")
    seed_uploads = str(os.environ.get("SEED_UPLOADS_ON_BOOT") or "").lower() in ("1", "true", "yes")

    try:
        data_empty = not any(DATA_DIR.iterdir())
    except Exception:
        data_empty = True

    try:
        up_empty = not any(UPLOAD_DIR.iterdir())
    except Exception:
        up_empty = True

    if force or data_empty:
        _seed_tree(REPO_DATA_DIR, DATA_DIR, overwrite=False)

    # ⚠️ 기본 OFF. 필요하면 Railway Variables에 SEED_UPLOADS_ON_BOOT=1을 "한 번만" 켜고 배포 후 끄기.
    if seed_uploads and (force or up_empty):
        _seed_tree(REPO_UPLOADS_DIR, UPLOAD_DIR, overwrite=False)

_bootstrap_persistent()

ALLOWED_IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".jfif"}

ALLOWED_VIDEO_EXTS = {".mp4", ".webm", ".ogg", ".mov", ".mkv", ".avi"}
ALLOWED_AUDIO_EXTS = {".mp3", ".wav", ".ogg", ".m4a", ".aac", ".flac"}
# 보안상 위험할 수 있는 확장자는 업로드 차단(정적 경로에서 실행/다운로드 방지)
BLOCKED_ASSET_EXTS = {".py", ".js", ".html", ".htm", ".css", ".exe", ".bat", ".cmd", ".ps1", ".sh", ".dll"}


css_sanitizer = CSSSanitizer(
    allowed_css_properties=[
        "color",
        "background-color",
        "font-size",
        "font-weight",
        "font-style",
        "text-decoration",
        "text-align",
        "line-height",
        "margin",
        "margin-left",
        "margin-right",
        "margin-top",
        "margin-bottom",
        "padding",
        "padding-left",
        "padding-right",
        "padding-top",
        "padding-bottom",
        "border",
        "border-color",
        "border-width",
        "border-style",
        "border-radius",
        "width",
        "height",
        "max-width",
    ]
)

ALLOWED_TAGS = [
    "p",
    "br",
    "hr",
    "span",
    "div",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "blockquote",
    "pre",
    "code",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "ol",
    "ul",
    "li",
    "a",
    "img",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",

    "video",
    "audio",
    "source",
]

ALLOWED_ATTRS = {
    "*": ["class", "style"],
    "a": ["href", "title", "target", "rel", "class", "style"],
    "img": ["src", "alt", "title", "width", "height", "class", "style"],
    "th": ["colspan", "rowspan", "class", "style"],
    "td": ["colspan", "rowspan", "class", "style"],
    "video": ["src", "poster", "preload", "controls", "autoplay", "loop", "muted", "playsinline", "class", "style"],
    "audio": ["src", "preload", "controls", "autoplay", "loop", "muted", "class", "style"],
    "source": ["src", "type"],
}

app = Flask(__name__)
# 세션 키(배포 시 환경변수 SECRET_KEY 권장)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "18e-secret-key-change-me")

# 업로드 최대 크기(MB). MAX_CONTENT_LENGTH_MB 우선(없으면 MAX_CONTENT_LENGTH 사용).
_MAX_MB = os.environ.get("MAX_CONTENT_LENGTH_MB") or os.environ.get("MAX_CONTENT_LENGTH") or "1024"
app.config["MAX_CONTENT_LENGTH"] = int(_MAX_MB) * 1024 * 1024
# 큰 파일 업로드 시 메모리 폭증 방지(작은 폼만 메모리에 유지하고 큰 파일은 임시파일로 스풀)
app.config["MAX_FORM_MEMORY_SIZE"] = int(os.environ.get("MAX_FORM_MEMORY_SIZE") or str(2 * 1024 * 1024))




def is_admin() -> bool:
    return bool(session.get('is_admin'))

def admin_required_api(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not is_admin():
            return jsonify({'error': 'admin_required'}), 401
        return fn(*args, **kwargs)
    return wrapper

def admin_required_page(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not is_admin():
            return redirect(url_for('admin_login', next=request.path))
        return fn(*args, **kwargs)
    return wrapper

# 업로드 파일은 /static/uploads/ 로 접근하지만, 실제 저장은 Volume(UPLOAD_DIR)일 수 있어 별도 서빙 라우트를 둡니다.
@app.get("/static/uploads/<path:filename>")
def serve_uploads(filename: str):
    p = UPLOAD_DIR / filename
    if p.exists() and p.is_file():
        return send_from_directory(UPLOAD_DIR, filename)

    rp = REPO_UPLOADS_DIR / filename
    if rp.exists() and rp.is_file():
        return send_from_directory(REPO_UPLOADS_DIR, filename)

    abort(404)

# 업로드 마이그레이션(레포 static/uploads -> Volume uploads) : 부팅 시 느려서 재시작되는 문제를 피하기 위해 수동 실행
_migrate_state = {"running": False, "done": False, "copied": 0, "skipped": 0, "errors": 0, "last_error": None}
_migrate_lock = threading.Lock()

def _migrate_uploads_job(overwrite: bool = False):
    src = REPO_UPLOADS_DIR
    dst = UPLOAD_DIR
    with _migrate_lock:
        _migrate_state.update({"running": True, "done": False, "copied": 0, "skipped": 0, "errors": 0, "last_error": None})

    try:
        if not src.exists():
            return
        dst.mkdir(parents=True, exist_ok=True)

        for p in src.rglob("*"):
            try:
                rel = p.relative_to(src)
                out = dst / rel
                if p.is_dir():
                    out.mkdir(parents=True, exist_ok=True)
                    continue

                if out.exists() and not overwrite:
                    with _migrate_lock:
                        _migrate_state["skipped"] += 1
                    continue

                out.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(p, out)
                with _migrate_lock:
                    _migrate_state["copied"] += 1
            except Exception as e:
                with _migrate_lock:
                    _migrate_state["errors"] += 1
                    _migrate_state["last_error"] = str(e)
    finally:
        with _migrate_lock:
            _migrate_state["running"] = False
            _migrate_state["done"] = True

@app.get("/api/admin/migrate-uploads")
@admin_required_api
def api_migrate_uploads_status():
    with _migrate_lock:
        return jsonify(_migrate_state)

@app.post("/api/admin/migrate-uploads")
@admin_required_api
def api_migrate_uploads_start():
    with _migrate_lock:
        if _migrate_state.get("running"):
            return jsonify({"ok": True, "started": False, "state": _migrate_state})

    overwrite = str(request.args.get("overwrite") or "").lower() in ("1", "true", "yes")
    t = threading.Thread(target=_migrate_uploads_job, args=(overwrite,), daemon=True)
    t.start()
    return jsonify({"ok": True, "started": True})



def _dir_size(p: Path) -> int:
    total = 0
    try:
        for root, _, files in os.walk(p):
            for fn in files:
                try:
                    total += (Path(root) / fn).stat().st_size
                except Exception:
                    pass
    except Exception:
        return 0
    return total


@app.get("/api/storage-stats")
@admin_required_api
def api_storage_stats():
    return jsonify({
        "ok": True,
        "persist_root": PERSIST_ROOT or "",
        "data_dir": str(DATA_DIR),
        "upload_dir": str(UPLOAD_DIR),
        "data_bytes": _dir_size(DATA_DIR),
        "uploads_bytes": _dir_size(UPLOAD_DIR),
        "repo_uploads_bytes": _dir_size(REPO_UPLOADS_DIR),
        "max_upload_mb": int(app.config.get("MAX_CONTENT_LENGTH", 0) // (1024 * 1024)) if app.config.get("MAX_CONTENT_LENGTH") else None,
    })

@app.get("/admin/tools")
@admin_required_page
def admin_tools():
    return render_template("admin_tools.html")
@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    next_url = request.args.get('next') or request.form.get('next') or url_for('home')
    if request.method == 'GET':
        return render_template('admin_login.html', error=None, next=next_url)

    password = (request.form.get('password') or '').strip()
    if check_password_hash(ADMIN_PASSWORD_HASH, password):
        session['is_admin'] = True
        session['admin_at'] = _iso_now() if '_iso_now' in globals() else datetime.now(timezone.utc).isoformat()
        return redirect(next_url)

    return render_template('admin_login.html', error='비밀번호가 올바르지 않습니다.', next=next_url), 401

@app.get('/admin/logout')
def admin_logout():
    session.clear()
    return redirect(url_for('home'))

@app.get('/api/admin/status')
def api_admin_status():
    return jsonify({'is_admin': is_admin()})

@app.route("/")
def home():
    return render_template("index.html", is_admin=is_admin())


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _file_mtime_iso(p: Path) -> str:
    if not p.exists():
        return "-"
    dt = datetime.fromtimestamp(p.stat().st_mtime, tz=timezone.utc)
    return dt.isoformat()


@app.get("/api/guide")
def api_get_guide():
    html = ""
    if GUIDE_FILE.exists():
        html = GUIDE_FILE.read_text(encoding="utf-8")

    delta = None
    if GUIDE_DELTA_FILE.exists():
        try:
            delta = json.loads(GUIDE_DELTA_FILE.read_text(encoding="utf-8"))
        except Exception:
            delta = None

    return jsonify({"html": html, "delta": delta, "updated_at": _file_mtime_iso(GUIDE_FILE)})


@app.post("/api/guide")
@admin_required_api
def api_save_guide():
    data = request.get_json(silent=True) or {}
    html = str(data.get("html") or "")
    delta = data.get("delta")

    # 너무 큰 본문 제한(대략)
    if len(html) > 500_000:
        return jsonify({"error": "content_too_large"}), 413

    # Delta 저장(서식/정렬/크기 등 유지용)
    if delta is not None:
        try:
            if not isinstance(delta, dict) or "ops" not in delta or not isinstance(delta["ops"], list):
                return jsonify({"error": "invalid_delta"}), 400
            if len(delta["ops"]) > 20_000:
                return jsonify({"error": "delta_too_large"}), 413

            for op in delta["ops"][:5000]:
                if not isinstance(op, dict):
                    continue
                ins = op.get("insert")
                if isinstance(ins, dict):
                    for _, v in ins.items():
                        url = ""
                        if isinstance(v, dict):
                            url = str(v.get("url") or v.get("src") or "")
                        else:
                            url = str(v or "")
                        if url.startswith("javascript:"):
                            return jsonify({"error": "invalid_url"}), 400

            GUIDE_DELTA_FILE.write_text(json.dumps(delta, ensure_ascii=False), encoding="utf-8")
        except Exception:
            return jsonify({"error": "invalid_delta"}), 400

    cleaned = bleach.clean(
        html,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRS,
        protocols=["http", "https", "data"],
        strip=True,
        css_sanitizer=css_sanitizer,
    ).strip()

    GUIDE_FILE.write_text(cleaned, encoding="utf-8")
    return jsonify({"ok": True, "html": cleaned, "updated_at": _file_mtime_iso(GUIDE_FILE)})


@app.post("/api/upload-image")
@admin_required_api
def api_upload_image():
    # 프론트 구현에 따라 필드명이 image/file 등으로 달라질 수 있어 유연하게 받습니다.
    f = request.files.get("image") or request.files.get("file") or request.files.get("upload")
    if not f:
        return jsonify({
            "error": "missing_file",
            "hint": "FormData에 image(또는 file) 필드로 이미지를 담아 전송하세요.",
            "received_keys": list(request.files.keys()),
        }), 400
    if not f or not f.filename:
        return jsonify({"error": "empty_filename"}), 400

    orig_name = (f.filename or "")
    # 확장자는 원본 파일명에서 추출(한글 파일명도 안전)
    ext = Path(orig_name).suffix.lower()

    if ext not in ALLOWED_IMAGE_EXTS:
        return jsonify({"error": "unsupported_file_type"}), 400

    safe_name = f"{uuid.uuid4().hex}{ext}"
    out_path = UPLOAD_DIR / safe_name
    f.save(out_path)

    url = f"/static/uploads/{safe_name}"
    return jsonify({"ok": True, "url": url})



@app.post("/api/upload-asset")
@admin_required_api
def api_upload_asset():
    """
    이미지/동영상/오디오/일반 파일 업로드를 지원합니다.
    - 브라우저 재생은 포맷 지원 여부(예: MKV)에 따라 달라질 수 있습니다.
    """
    f = request.files.get("file") or request.files.get("image") or request.files.get("upload")
    if not f or not f.filename:
        return jsonify({"error": "missing_file", "received_keys": list(request.files.keys())}), 400

    orig_name = (f.filename or "")
    # 확장자는 원본 파일명에서 추출(한글 파일명도 안전)
    ext = Path(orig_name).suffix.lower()

    if ext in BLOCKED_ASSET_EXTS:
        return jsonify({"error": "blocked_file_type"}), 400
    if not ext:
        return jsonify({"error": "missing_extension"}), 400

    safe_name = f"{uuid.uuid4().hex}{ext}"
    out_path = UPLOAD_DIR / safe_name
    f.save(out_path)

    url = f"/static/uploads/{safe_name}"
    content_type = (f.mimetype or "").lower()

    if ext in ALLOWED_IMAGE_EXTS or content_type.startswith("image/"):
        kind = "image"
    elif ext in ALLOWED_VIDEO_EXTS or content_type.startswith("video/"):
        kind = "video"
    elif ext in ALLOWED_AUDIO_EXTS or content_type.startswith("audio/"):
        kind = "audio"
    else:
        kind = "file"

    # name: 원본 파일명(에디터 표시용)
    # stored_name: 서버에 저장된 실제 파일명(UUID 기반)
    return jsonify({
        "ok": True,
        "url": url,
        "kind": kind,
        "name": orig_name,
        "stored_name": safe_name,
        "ext": ext,
        "content_type": content_type,
    })



def _load_medal_images() -> dict:
    if not MEDAL_IMAGES_FILE.exists():
        return {}
    try:
        return json.loads(MEDAL_IMAGES_FILE.read_text(encoding='utf-8'))
    except Exception:
        return {}

def _save_medal_images(data: dict) -> None:
    MEDAL_IMAGES_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')

@app.get('/api/medals/images')
def api_get_medal_images():
    return jsonify({'images': _load_medal_images()})

@app.post('/api/medals/images')
@admin_required_api
def api_set_medal_image():
    payload = request.get_json(silent=True) or {}
    medal_id = str(payload.get('medal_id') or '').strip()
    image_url = str(payload.get('image_url') or '').strip()
    if not medal_id:
        return jsonify({'error': 'missing_medal_id'}), 400
    # 허용: 사이트 업로드 경로(/static/uploads/...) 또는 http(s) 이미지
    if image_url:
        if image_url.startswith('/static/uploads/'):
            pass
        elif image_url.startswith('http://') or image_url.startswith('https://'):
            pass
        else:
            return jsonify({'error': 'invalid_image_url'}), 400

    data = _load_medal_images()
    if image_url:
        data[medal_id] = image_url
    else:
        # 빈 값이면 삭제
        data.pop(medal_id, None)
    _save_medal_images(data)
    return jsonify({'ok': True, 'images': data})

if __name__ == "__main__":
    # Windows에서 폴더 경로 문제 줄이기 위해 host 지정 안 함
    app.run(debug=True, port=8000)