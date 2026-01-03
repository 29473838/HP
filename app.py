from __future__ import annotations

import os
import uuid
import json
import shutil
from datetime import datetime, timezone
from pathlib import Path

from flask import Flask, jsonify, render_template, request, session, redirect, url_for, send_from_directory
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

# 관리자 비밀번호는 해시로 저장됩니다. (환경변수 ADMIN_PASSWORD_HASH로 덮어쓸 수 있음)
ADMIN_PASSWORD_HASH = os.environ.get("ADMIN_PASSWORD_HASH", 'scrypt:32768:8:1$GH4CbJkloIf3hOzE$7614f33eef03ba54161eb4dd0658df64908975a80d55ffde66505bab666a57c772efffe03a2c7b0099152aed47cd733c683788fb518af3ada906d48a44fc0384')

ALLOWED_IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".jfif"}

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
    # 폴더 생성
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    # Railway Volume이 비어있을 때: 레포에 들어있는 기존 데이터/업로드를 1회 복사(씨딩)
    force = str(os.environ.get("FORCE_BOOTSTRAP") or "").lower() in ("1", "true", "yes")
    if PERSIST_ROOT:
        data_empty = not any(DATA_DIR.iterdir())
        up_empty = not any(UPLOAD_DIR.iterdir())
        if force or data_empty:
            _seed_tree(REPO_DATA_DIR, DATA_DIR, overwrite=False)
        if force or up_empty:
            _seed_tree(REPO_UPLOADS_DIR, UPLOAD_DIR, overwrite=False)

_bootstrap_persistent()
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
]

ALLOWED_ATTRS = {
    "*": ["class", "style"],
    "a": ["href", "title", "target", "rel", "class", "style"],
    "img": ["src", "alt", "title", "width", "height", "class", "style"],
    "th": ["colspan", "rowspan", "class", "style"],
    "td": ["colspan", "rowspan", "class", "style"],
}

app = Flask(__name__)
# 세션 키(배포 시 환경변수 SECRET_KEY 권장)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "18e-secret-key-change-me")
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
# 이미지 업로드 등 기본 제한(필요 시 조절)
app.config["MAX_CONTENT_LENGTH"] = int(os.environ.get("MAX_CONTENT_LENGTH_MB", "1024")) * 1024 * 1024  # MB



def is_admin() -> bool:
    return bool(session.get('is_admin'))

def admin_required_api(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not is_admin():
            return jsonify({'error': 'admin_required'}), 401
        return fn(*args, **kwargs)
    return wrapper

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


@app.get('/static/uploads/<path:filename>')
def serve_uploads(filename: str):
    # UPLOAD_DIR이 static 폴더 밖(예: Railway Volume)이어도 /static/uploads/...로 접근 가능
    return send_from_directory(UPLOAD_DIR, filename)


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

    return jsonify({"html": html, "updated_at": _file_mtime_iso(GUIDE_FILE)})


@app.post("/api/guide")
@admin_required_api
def api_save_guide():
    data = request.get_json(silent=True) or {}
    html = str(data.get("html") or "")

    # 너무 큰 본문 제한(대략)
    if len(html) > 300_000:
        return jsonify({"error": "content_too_large"}), 413

    cleaned = bleach.clean(
        html,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRS,
        protocols=["http", "https", "data"],
        strip=True,
        css_sanitizer=css_sanitizer,
    )

    # Quill이 빈 문서로 저장할 때 <p><br></p>로 오는 경우가 많아서 정리
    cleaned = cleaned.strip()

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

    orig_ext = Path(f.filename).suffix.lower()
    filename = secure_filename(f.filename)
    ext = orig_ext or Path(filename).suffix.lower()

    if not ext:
        return jsonify({"error": "missing_extension"}), 400

    if ext not in ALLOWED_IMAGE_EXTS:
        return jsonify({"error": "unsupported_file_type"}), 400

    safe_name = f"{uuid.uuid4().hex}{ext}"
    out_path = UPLOAD_DIR / safe_name
    f.save(out_path)

    url = f"/static/uploads/{safe_name}"
    return jsonify({"ok": True, "url": url})



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
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", "8000")), debug=False)