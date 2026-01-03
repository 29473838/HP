// ======================
// 1) 여기에 CSV URL 붙여넣기
// ======================
const SHEETS = {
  ORG_CSV_URL: "",       // 조직도 CSV
  MEDALS_CSV_URL: "",    // 훈장 CSV
  PROMOTION_CSV_URL: "", // 진급 CSV
  GUIDE_CSV_URL: "",     // 가이드 CSV
};

// ======================
// 2) 샘플 데이터 (연동 실패/미설정 시 표시)
// ======================
const SAMPLE = {
  MEDALS: [
    { medal_id:"II_A1", name:"II군단 공로 훈장 - 사령관급", icon:"⚜", summary:"x", how_to_earn:"2군단에 대한 무한한 헌신과 충성을 보여준 자에게 수여", rarity:"Gold", sort:"10" },
    { medal_id:"II_A2", name:"II군단 공로 훈장 - 장교급", icon:"⚜", summary:"x", how_to_earn:"2군단에 대한 무한한 헌신과 충성을 보여준 자에게 수여", rarity:"Silver", sort:"20" },
    { medal_id:"II_A3", name:"II군단 공로 훈장 - 군단병급", icon:"⚜", summary:"x", how_to_earn:"2군단에 대한 무한한 헌신과 충성을 보여준 자에게 수여", rarity:"Bronze", sort:"30" },
    { medal_id:"II_B1", name:"지휘관 공로 훈장 - 금장", icon:"⚜", summary:"x", how_to_earn:"전장뿐만 아니라 행정적으로도 모범이 되며, 연대·군단·제국의 성공에 지속적인 영향을 미친 지휘관에게 수여", rarity:"Gold", sort:"40" },
    { medal_id:"II_B2", name:"지휘관 공로 훈장 - 은장", icon:"⚜", summary:"x", how_to_earn:"전장뿐만 아니라 행정적으로도 모범이 되며, 연대·군단·제국의 성공에 지속적인 영향을 미친 지휘관에게 수여", rarity:"Silver", sort:"50" },
    { medal_id:"II_B3", name:"지휘관 공로 훈장 - 동장", icon:"⚜", summary:"x", how_to_earn:"전장뿐만 아니라 행정적으로도 모범이 되며, 연대·군단·제국의 성공에 지속적인 영향을 미친 지휘관에게 수여", rarity:"Bronze", sort:"60" },
    { medal_id:"II_C1", name:"솔선수범 공로 훈장 - 금장", icon:"⚜", summary:"x", how_to_earn:"제국의 발전을 위해 주어진 기본 임무 그 이상의 능동적인 행동을 보여준 자에게 수여", rarity:"Gold", sort:"41" },
    { medal_id:"II_C2", name:"솔선수범 공로 훈장 - 은장", icon:"⚜", summary:"x", how_to_earn:"제국의 발전을 위해 주어진 기본 임무 그 이상의 능동적인 행동을 보여준 자에게 수여", rarity:"Silver", sort:"51" },
    { medal_id:"II_C3", name:"솔선수범 공로 훈장 - 동장", icon:"⚜", summary:"x", how_to_earn:"제국의 발전을 위해 주어진 기본 임무 그 이상의 능동적인 행동을 보여준 자에게 수여", rarity:"Bronze", sort:"61" },
    { medal_id:"II_D1", name:"전공 십자 훈장 - 금장", icon:"⚜", summary:"x", how_to_earn:"수차례의 전투에서 뛰어난 용맹을 증명하고, 군의 전황을 뒤바꿀 정도의 활약을 한 병사에게 수여", rarity:"Gold", sort:"42" },
    { medal_id:"II_D2", name:"전공 십자 훈장 - 은장", icon:"⚜", summary:"x", how_to_earn:"수차례의 전투에서 뛰어난 용맹을 증명하고, 군의 전황을 뒤바꿀 정도의 활약을 한 병사에게 수여", rarity:"Silver", sort:"52" },
    { medal_id:"II_D3", name:"전공 십자 훈장 - 동장", icon:"⚜", summary:"x", how_to_earn:"수차례의 전투에서 뛰어난 용맹을 증명하고, 군의 전황을 뒤바꿀 정도의 활약을 한 병사에게 수여", rarity:"Bronze", sort:"62" },
    { medal_id:"II_E1", name:"군사 공로 훈장 - 금장", icon:"⚜", summary:"x", how_to_earn:"공동체의 이상적인 구성원으로서, 동료와 상급자 모두에게 귀감이 되는 모범적인 자에게 수여", rarity:"Gold", sort:"43" },
    { medal_id:"II_E2", name:"군사 공로 훈장 - 은장", icon:"⚜", summary:"x", how_to_earn:"공동체의 이상적인 구성원으로서, 동료와 상급자 모두에게 귀감이 되는 모범적인 자에게 수여", rarity:"Silver", sort:"53" },
    { medal_id:"II_E3", name:"군사 공로 훈장 - 동장", icon:"⚜", summary:"x", how_to_earn:"공동체의 이상적인 구성원으로서, 동료와 상급자 모두에게 귀감이 되는 모범적인 자에게 수여", rarity:"Bronze", sort:"63" },
    { medal_id:"II_F1", name:"기수 공로 훈장 - 금장", icon:"⚜", summary:"x", how_to_earn:"대대기, 연대 독수리기 등 군의 상징인 군기를 훌륭하게 수호한 뛰어난 기수에게 수여", rarity:"Gold", sort:"44" },
    { medal_id:"II_F2", name:"기수 공로 훈장 - 은장", icon:"⚜", summary:"x", how_to_earn:"대대기, 연대 독수리기 등 군의 상징인 군기를 훌륭하게 수호한 뛰어난 기수에게 수여", rarity:"Silver", sort:"54" },
    { medal_id:"II_F3", name:"기수 공로 훈장 - 동장", icon:"⚜", summary:"x", how_to_earn:"대대기, 연대 독수리기 등 군의 상징인 군기를 훌륭하게 수호한 뛰어난 기수에게 수여", rarity:"Bronze", sort:"64" },
    { medal_id:"II_G1", name:"모병 공로 훈장 - 금장", icon:"⚜", summary:"x", how_to_earn:"각 연대의 인원 확충 및 세력 확장에 크게 기여한 모집 담당자에게 수여", rarity:"Gold", sort:"45" },
    { medal_id:"II_G2", name:"모병 공로 훈장 - 은장", icon:"⚜", summary:"x", how_to_earn:"각 연대의 인원 확충 및 세력 확장에 크게 기여한 모집 담당자에게 수여", rarity:"Silver", sort:"55" },
    { medal_id:"II_G3", name:"모병 공로 훈장 - 동장", icon:"⚜", summary:"x", how_to_earn:"각 연대의 인원 확충 및 세력 확장에 크게 기여한 모집 담당자에게 수여", rarity:"Bronze", sort:"65" },
    { medal_id:"II_H1", name:"예술 공로 훈장 - 금장", icon:"⚜", summary:"x", how_to_earn:"제국에 긍정적인 영향을 주는 고품질의 창작물(영상, 아트 등)을 제작한 시민에게 수여", rarity:"Gold", sort:"46" },
    { medal_id:"II_H2", name:"예술 공로 훈장 - 은장", icon:"⚜", summary:"x", how_to_earn:"제국에 긍정적인 영향을 주는 고품질의 창작물(영상, 아트 등)을 제작한 시민에게 수여", rarity:"Silver", sort:"56" },
    { medal_id:"II_H3", name:"예술 공로 훈장 - 동장", icon:"⚜", summary:"x", how_to_earn:"제국에 긍정적인 영향을 주는 고품질의 창작물(영상, 아트 등)을 제작한 시민에게 수여", rarity:"Bronze", sort:"66" },
    { medal_id:"II_I2", name:"사회 공로 훈장 - 은장", icon:"⚜", summary:"x", how_to_earn:"부대 분위기를 개선하고, 언제나 환영하는 태도와 전문적인 매너를 유지한 모범 구성원에게 수여", rarity:"Silver", sort:"57" },
    { medal_id:"II_J1", name:"봉사 팬던트 - 금장", icon:"⚜", summary:"x", how_to_earn:"문서 작업, 모집 지원, 기타 잡무 등 부대 유지에 필요한 헌신적인 노력을 기울인 병사에게 수여", rarity:"Gold", sort:"48" },
    { medal_id:"II_J2", name:"봉사 팬던트 - 은장", icon:"⚜", summary:"x", how_to_earn:"문서 작업, 모집 지원, 기타 잡무 등 부대 유지에 필요한 헌신적인 노력을 기울인 병사에게 수여", rarity:"Silver", sort:"58" },
    { medal_id:"II_J3", name:"봉사 팬던트 - 동장", icon:"⚜", summary:"x", how_to_earn:"문서 작업, 모집 지원, 기타 잡무 등 부대 유지에 필요한 헌신적인 노력을 기울인 병사에게 수여", rarity:"Bronze", sort:"68" },
    { medal_id:"II_K3", name:"정예 펜던트 - 동장", icon:"⚜", summary:"x", how_to_earn:"연대 내 정예 대대에서 최고의 실력을 증명한 병사에게 수여", rarity:"Bronze", sort:"69" },

  ],
  ORG: [
    { id:"c18", parent_id:"", display_name:"군단장", unit:"제2군단", rank:"Commandant", role:"총지휘", profile_url:"", medal_ids:"COMMAND" },
    { id:"r18", parent_id:"c18", display_name:"연대장", unit:"제18연대", rank:"Colonel", role:"연대 운영", profile_url:"", medal_ids:"VALOR|LOYALTY" },
    { id:"b1", parent_id:"r18", display_name:"1대대장", unit:"1대대", rank:"Major", role:"전선 운용", profile_url:"", medal_ids:"VALOR" },
    { id:"b2", parent_id:"r18", display_name:"2대대장", unit:"2대대", rank:"Major", role:"지원/특임", profile_url:"", medal_ids:"LOYALTY" },
  ],
  PROMOTION: [
    { rank:"Conscrit", code:"R0", color:"silver", requirements:"기본 직급", responsibilities:"훈련병", sort:"10" },
    { rank:"Soldat", code:"R1", color:"red", requirements:"1P", responsibilities:"이병", sort:"20" },
    { rank:"Soldat de Premier", code:"R2", color:"red", requirements:"7P", responsibilities:"일병", sort:"30" },
    { rank:"Caporal", code:"R3", color:"yellow", requirements:"16P", responsibilities:"상병", sort:"40" },
    { rank:"Caporal de Premier", code:"R4", color:"yellow", requirements:"24P", responsibilities:"병장", sort:"50" },
    { rank:"Caporal Fourrier", code:"R5", color:"yellow", requirements:"32P", responsibilities:"일등병장", sort:"60" },
    { rank:"Sergent", code:"R6", color:"gold", requirements:"50P", responsibilities:"하사", sort:"70" },
  ],
  GUIDE: [
    { section:"기본 규칙", title:"명령 체계", body:"작전 중 지휘관 지시를 우선합니다.\n의견은 작전 종료 후 보고 채널에서 정리합니다.", sort:"10" },
    { section:"게임 진행 방식", title:"x", body:"집합 시간 30분 전 대기.", sort:"20" },
  ],
};

// ======================
// DOM Helper
// ======================
const $ = (id) => document.getElementById(id);

const IS_ADMIN = !!window.__IS_ADMIN__;

function adminLoginUrl(){
  const next = location.pathname + location.search + location.hash;
  return "/admin/login?next=" + encodeURIComponent(next);
}

function handleAdmin401(err){
  const msg = String(err || "");
  if (msg.includes("API 401")){
    location.href = adminLoginUrl();
    return true;
  }
  return false;
}


(function setUpdatedAt(){
  const el = $("updatedAt");
  if (!el) return;
  const d = new Date();
  el.textContent = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
})();

// 모바일 메뉴
(function mobileNav(){
  const navToggle = $("navToggle");
  const navMobile = $("navMobile");
  if (!navToggle || !navMobile) return;

  navToggle.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!expanded));
    navMobile.classList.toggle("show");
    navMobile.setAttribute("aria-hidden", String(expanded));
  });

  navMobile.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      navToggle.setAttribute("aria-expanded", "false");
      navMobile.classList.remove("show");
      navMobile.setAttribute("aria-hidden", "true");
    });
  });
})();

// 스크롤 리빌
(function revealOnScroll(){
  const els = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add("is-in");
    });
  }, { threshold: 0.12 });
  els.forEach(el => io.observe(el));
})();

// ======================
// CSV 로더/파서
// ======================
async function fetchText(url){
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.text();
}

function parseCSV(text){
  const lines = [];
  let cur="", inQuotes=false;
  for (let i=0;i<text.length;i++){
    const ch = text[i];
    if (ch === '"'){
      if (inQuotes && text[i+1] === '"'){ cur+='"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === "\n" && !inQuotes){
      lines.push(cur); cur="";
    } else if (ch !== "\r"){
      cur+=ch;
    }
  }
  if (cur.trim().length) lines.push(cur);

  const splitLine = (line) => {
    const out=[];
    let s="", q=false;
    for (let i=0;i<line.length;i++){
      const c=line[i];
      if (c === '"'){
        if (q && line[i+1] === '"'){ s+='"'; i++; }
        else q=!q;
      } else if (c === "," && !q){
        out.push(s); s="";
      } else s+=c;
    }
    out.push(s);
    return out.map(v => v.trim());
  };

  const header = splitLine(lines[0] || "");
  const rows=[];
  for (let i=1;i<lines.length;i++){
    const cols = splitLine(lines[i]);
    if (!cols.join("").trim()) continue;
    const obj={};
    header.forEach((h, idx) => obj[h] = (cols[idx] ?? "").trim());
    rows.push(obj);
  }
  return rows;
}

function escapeHTML(s){
  return String(s)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#39;");
}
function toInt(v, d=999999){
  const n = Number(String(v ?? "").trim());
  return Number.isFinite(n) ? n : d;
}

async function loadSheetOrSample(url, sampleRows, statusEl){
  if (!url || !url.startsWith("http")){
    if (statusEl) statusEl.textContent = "샘플";
    return { rows: sampleRows };
  }
  try{
    const text = await fetchText(url);
    const rows = parseCSV(text);
    if (!rows.length) throw new Error("empty CSV");
    if (statusEl) statusEl.textContent = "스프레드시트";
    return { rows };
  }catch(e){
    console.warn("Load failed:", e);
    if (statusEl) statusEl.textContent = "샘플(연동 실패)";
    return { rows: sampleRows };
  }
}

// ======================
// 훈장
// ======================
let medalImageOverrides = {};
async function loadMedalImageOverrides(){
  try{
    const data = await apiJSON("/api/medals/images", { method:"GET" });
    medalImageOverrides = data.images || {};
  }catch(e){
    medalImageOverrides = {};
  }
  return medalImageOverrides;
}

function applyMedalImageOverrides(medals){
  const map = medalImageOverrides || {};
  return medals.map(m => {
    const key = String(m.medal_id || "").trim();
    if (key && map[key]) m.image_url = map[key];
    return m;
  });
}

function ensureMedalAdminActions(){
  if (!IS_ADMIN) return;
  const grid = $("medalsGrid");
  if (!grid || grid.__adminBound) return;
  grid.__adminBound = true;

  // 숨겨진 업로드 input (재사용)
  let input = document.getElementById("medalImageInput");
  if (!input){
    input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.id = "medalImageInput";
    input.hidden = true;
    document.body.appendChild(input);
  }

  let targetMedalId = "";

  grid.addEventListener("click", async (ev) => {
    const upBtn = ev.target.closest(".medal-img-btn");
    const delBtn = ev.target.closest(".medal-img-clear");
    if (upBtn){
      targetMedalId = upBtn.getAttribute("data-medal-id") || "";
      if (!targetMedalId) return;
      input.value = "";
      input.click();
      return;
    }
    if (delBtn){
      const medalId = delBtn.getAttribute("data-medal-id") || "";
      if (!medalId) return;
      try{
        await apiJSON("/api/medals/images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ medal_id: medalId, image_url: "" })
        });
        delete medalImageOverrides[medalId];
        // state가 있으면 즉시 반영
        if (typeof state !== 'undefined' && Array.isArray(state.medals)){
          state.medals.forEach(m => { if (String(m.medal_id) === String(medalId)) m.image_url = ""; });
          renderMedals(state.medals);
        }
      }catch(e){
        if (!handleAdmin401(e)) alert("삭제에 실패했습니다.");
      }
      return;
    }
  });

  input.addEventListener("change", async () => {
    const file = input.files?.[0];
    if (!file || !targetMedalId) return;

    // 8MB 제한
    if (file.size > 8 * 1024 * 1024){
      alert("이미지 용량이 너무 큽니다. (최대 8MB)");
      return;
    }

    try{
      const url = await uploadGuideImage(file);
      await apiJSON("/api/medals/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medal_id: targetMedalId, image_url: url })
      });
      medalImageOverrides[targetMedalId] = url;

      if (typeof state !== 'undefined' && Array.isArray(state.medals)){
        state.medals.forEach(m => { if (String(m.medal_id) === String(targetMedalId)) m.image_url = url; });
        renderMedals(state.medals);
      }
    }catch(e){
      if (!handleAdmin401(e)) alert("업로드/저장에 실패했습니다.");
    }
  });
}

let medalsById = new Map();
function normalizeMedals(rows){
  return rows.map(r => ({
    medal_id: String(r.medal_id || "").trim(),
    name: String(r.name || "").trim(),
    icon: String(r.icon || "⚜").trim(),
    image_url: String(r.image_url || r.image || "").trim(), // ✅ 이미지 URL (선택)
    summary: String(r.summary || "").trim(),
    how_to_earn: String(r.how_to_earn || "").trim(),
    rarity: String(r.rarity || "Common").trim(),
    sort: String(r.sort || "").trim(),
  })).filter(m => m.medal_id);
}
function buildMedalIndex(medals){
  medalsById = new Map();
  medals.forEach(m => medalsById.set(m.medal_id, m));
}
function medalCardHTML(m){
  const media = m.image_url
    ? `<img class="medal__img" src="${escapeHTML(m.image_url)}" alt="${escapeHTML(m.name)}" loading="lazy" />`
    : `<div class="medal__icon" aria-hidden="true">${escapeHTML(m.icon)}</div>`;

  const adminActions = IS_ADMIN ? `
    <div class="medal-admin">
      <button class="btn btn--ghost btn--sm medal-img-btn" data-medal-id="${escapeHTML(m.medal_id)}">사진 업로드</button>
      <button class="btn btn--ghost btn--sm medal-img-clear" data-medal-id="${escapeHTML(m.medal_id)}">사진 제거</button>
    </div>
  ` : "";

  return `
    <article class="card medal-card">
      <div class="medal__top">
        ${media}
        <div class="medal__meta">
          <h3>${escapeHTML(m.name)}</h3>
          <p class="muted">${escapeHTML(m.summary)}</p>
        </div>
      </div>

      <div class="divider"></div>
      <div class="muted" style="white-space:pre-wrap">${escapeHTML(m.how_to_earn)}</div>

      <div class="muted" style="margin-top:10px; font-size:12px">
        <span class="badge badge--gold">ID</span> <code>${escapeHTML(m.medal_id)}</code>
        &nbsp;·&nbsp;
        <span class="badge">${escapeHTML(m.rarity)}</span>
      </div>

      ${adminActions}
    </article>
  `;
}

function renderMedals(medals){
  const grid = $("medalsGrid");
  if (!grid) return;

  const q = ($("medalSearch")?.value || "").trim().toLowerCase();
  const rarity = ($("medalRarity")?.value || "").trim();

  const filtered = medals.filter(m => {
    const hay = `${m.medal_id} ${m.name} ${m.summary} ${m.how_to_earn} ${m.rarity}`.toLowerCase();
    return (!q || hay.includes(q)) && (!rarity || m.rarity === rarity);
  });

  filtered.sort((a,b) => toInt(a.sort) - toInt(b.sort) || a.name.localeCompare(b.name));

  grid.innerHTML = filtered.length ? filtered.map(medalCardHTML).join("") : `<div class="muted">조건에 맞는 훈장이 없습니다.</div>`;
}

// ======================
// 조직도
// ======================
function normalizeOrg(rows){
  return rows.map(r => ({
    id: String(r.id || "").trim(),
    parent_id: String(r.parent_id || "").trim(),
    display_name: String(r.display_name || "").trim(),
    unit: String(r.unit || "").trim(),
    rank: String(r.rank || "").trim(),
    role: String(r.role || "").trim(),
    profile_url: String(r.profile_url || "").trim(),
    medal_ids: String(r.medal_ids || "").trim(),
  })).filter(n => n.id);
}
function buildTree(nodes){
  const map = new Map();
  const children = new Map();
  nodes.forEach(n => { map.set(n.id, n); children.set(n.id, []); });
  map.forEach(n => {
    const pid = n.parent_id;
    if (pid && children.has(pid)) children.get(pid).push(n.id);
  });
  const roots = [];
  map.forEach(n => {
    if (!n.parent_id || !map.has(n.parent_id)) roots.push(n.id);
  });
  return { map, children, roots };
}
function rankColorClass(rankText){
  const t = (rankText || "").toLowerCase();
  if (t.includes("colonel") || t.includes("command") || t.includes("general")) return "is-gold";
  if (t.includes("captain") || t.includes("major")) return "is-red";
  if (t.includes("sergeant") || t.includes("corporal") || t.includes("soldier")) return "is-blue";
  if (t.includes("recruit") || t.includes("cadet")) return "is-silver";
  return "is-emerald";
}
function medalChipsHTML(medal_ids){
  const ids = String(medal_ids || "").split("|").map(s => s.trim()).filter(Boolean);
  if (!ids.length) return "";
  const chips = ids.map(id => {
    const m = medalsById.get(id);
    if (!m) return `<span class="medal-chip"><span class="ico">⚜</span><b>${escapeHTML(id)}</b></span>`;
    const title = `${m.name} (${m.rarity})`;
    return `<span class="medal-chip" title="${escapeHTML(title)}"><span class="ico">${escapeHTML(m.icon)}</span><b>${escapeHTML(m.name)}</b></span>`;
  }).join("");
  return `<div class="org-medals">${chips}</div>`;
}
function renderOrgNode(tree, id){
  const node = tree.map.get(id);
  const kids = tree.children.get(id) || [];

  const wrap = document.createElement("div");
  wrap.className = "org-node";

  const colorCls = rankColorClass(node.rank);
  const nameHTML = node.profile_url
    ? `<a href="${escapeHTML(node.profile_url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(node.display_name || "이름 미지정")}</a>`
    : `${escapeHTML(node.display_name || "이름 미지정")}`;

  const card = document.createElement("div");
  card.className = "org-card";
  card.innerHTML = `
    <div class="org-top">
      <p class="org-name">${nameHTML}</p>
      ${node.rank ? `<span class="rank-pill ${colorCls}">${escapeHTML(node.rank)}</span>` : ``}
    </div>
    <div class="org-meta">${node.unit ? `<div>${escapeHTML(node.unit)}</div>` : ``}</div>
    ${node.role ? `<div class="org-role">${escapeHTML(node.role)}</div>` : ``}
    ${medalChipsHTML(node.medal_ids)}
  `;
  wrap.appendChild(card);

  if (kids.length){
    const childrenRow = document.createElement("div");
    childrenRow.className = "org-children";
    kids.forEach(kidId => {
      const branch = document.createElement("div");
      branch.className = "org-branch";
      branch.appendChild(renderOrgNode(tree, kidId));
      childrenRow.appendChild(branch);
    });
    wrap.appendChild(childrenRow);
  }
  return wrap;
}
function renderOrgTree(nodes){
  const orgTreeEl = $("orgTree");
  if (!orgTreeEl) return;

  const q = ($("orgSearch")?.value || "").trim().toLowerCase();
  const fullTree = buildTree(nodes);

  let displaySet = new Set(fullTree.map.keys());
  if (q){
    displaySet = new Set();
    const matches = nodes.filter(n => {
      const hay = `${n.display_name} ${n.unit} ${n.rank} ${n.role}`.toLowerCase();
      return hay.includes(q);
    });

    const addAncestors = (id) => {
      let cur = fullTree.map.get(id);
      while (cur){
        displaySet.add(cur.id);
        if (!cur.parent_id) break;
        cur = fullTree.map.get(cur.parent_id);
      }
    };
    const addDescendants = (id) => {
      const stack = [id];
      while (stack.length){
        const x = stack.pop();
        displaySet.add(x);
        (fullTree.children.get(x) || []).forEach(k => stack.push(k));
      }
    };

    matches.forEach(m => { addAncestors(m.id); addDescendants(m.id); });
  }

  const filteredNodes = nodes.filter(n => displaySet.has(n.id));
  const tree = buildTree(filteredNodes);

  orgTreeEl.innerHTML = "";
  if (!tree.roots.length){
    orgTreeEl.innerHTML = `<div class="muted">조직도 데이터가 비어있습니다.</div>`;
    return;
  }

  const row = document.createElement("div");
  row.style.display = "flex";
  row.style.justifyContent = "center";
  row.style.flexWrap = "wrap";
  tree.roots.forEach(rootId => row.appendChild(renderOrgNode(tree, rootId)));
  orgTreeEl.appendChild(row);
}

// ======================
// 가이드 (아코디언)
// ======================
function normalizeGuide(rows){
  return rows.map(r => ({
    section: String(r.section || "기타").trim(),
    title: String(r.title || "").trim(),
    body: String(r.body || "").trim(),
    sort: String(r.sort || "").trim(),
  })).filter(x => x.title || x.body);
}
function renderGuide(items){
  const root = $("guideContent");
  if (!root) return;

  const q = ($("guideSearch")?.value || "").trim().toLowerCase();
  const filtered = items.filter(it => {
    if (!q) return true;
    const hay = `${it.section} ${it.title} ${it.body}`.toLowerCase();
    return hay.includes(q);
  });

  filtered.sort((a,b) => toInt(a.sort) - toInt(b.sort) || a.section.localeCompare(b.section));

  if (!filtered.length){
    root.innerHTML = `<div class="muted">검색 결과가 없습니다.</div>`;
    return;
  }

  const bySection = new Map();
  filtered.forEach(it => {
    if (!bySection.has(it.section)) bySection.set(it.section, []);
    bySection.get(it.section).push(it);
  });

  const html = [];
  bySection.forEach((arr, section) => {
    html.push(`
      <div class="acc-item open">
        <button class="acc-btn" type="button">
          <span class="acc-title">${escapeHTML(section)}</span>
          <span class="acc-meta">항목 ${arr.length}개 ▾</span>
        </button>
        <div class="acc-body">
          ${arr.map(a => `
            <div style="margin-top:10px">
              <div style="font-weight:600; color: rgba(233,237,247,0.90)">${escapeHTML(a.title)}</div>
              <div style="margin-top:6px; white-space:pre-wrap">${escapeHTML(a.body)}</div>
              <div class="divider"></div>
            </div>
          `).join("")}
        </div>
      </div>
    `);
  });

  root.innerHTML = html.join("");
  root.querySelectorAll(".acc-item").forEach(item => {
    item.querySelector(".acc-btn").addEventListener("click", () => item.classList.toggle("open"));
  });
}

// ======================
// 진급 (테이블 + 흐름)
// ======================
function normalizePromotion(rows){
  return rows.map(r => ({
    rank: String(r.rank || "").trim(),
    code: String(r.code || "").trim(),
    requirements: String(r.requirements || "").trim(),
    responsibilities: String(r.responsibilities || "").trim(),
    sort: String(r.sort || "").trim(),
  })).filter(x => x.rank);
}
function renderPromotionTable(rows){
  const tbody = $("promotionTable")?.querySelector("tbody");
  if (!tbody) return;

  const q = ($("rankSearch")?.value || "").trim().toLowerCase();
  const filtered = rows
    .filter(r => {
      if (!q) return true;
      const hay = `${r.rank} ${r.code} ${r.requirements} ${r.responsibilities}`.toLowerCase();
      return hay.includes(q);
    })
    .sort((a,b) => toInt(a.sort) - toInt(b.sort) || a.rank.localeCompare(b.rank));

  tbody.innerHTML = filtered.length
    ? filtered.map(r => `
        <tr>
          <td>
            <div style="font-family:'Cinzel', ui-serif; letter-spacing:.2px">${escapeHTML(r.rank)}</div>
            ${r.code ? `<div class="muted" style="font-size:12px">${escapeHTML(r.code)}</div>` : ``}
          </td>
          <td style="white-space:pre-wrap; color: var(--muted)">${escapeHTML(r.requirements)}</td>
          <td style="white-space:pre-wrap; color: var(--muted)">${escapeHTML(r.responsibilities)}</td>
        </tr>
      `).join("")
    : `<tr><td colspan="3" class="muted">검색 결과가 없습니다.</td></tr>`;
}
function renderPromotionFlow(){
  const flow = $("promotionFlow");
  if (!flow) return;
  flow.innerHTML = `
    <div class="step">
      <div class="step__dot"></div>
      <div class="step__body">
        <div class="step__title">전투 / 훈련 참여</div>
        <div class="step__desc">1P</div>
      </div>
    </div>
    <div class="step">
      <div class="step__dot"></div>
      <div class="step__body">
        <div class="step__title">킬 3위권</div>
        <div class="step__desc">1P</div>
      </div>
    </div>
    <div class="step">
      <div class="step__dot"></div>
      <div class="step__body">
        <div class="step__title">기수 및 플래그 가드</div>
        <div class="step__desc">1P</div>
      </div>
    </div>
    <div class="step">
      <div class="step__dot"></div>
      <div class="step__body">
        <div class="step__title">일주일 개근</div>
        <div class="step__desc">1P</div>
      </div>
    </div>
        <div class="step">
      <div class="step__dot"></div>
      <div class="step__body">
        <div class="step__title">인원 초대</div>
        <div class="step__desc">2P</div>
      </div>
    </div>
  `;
}

// ======================
// 전체 로드
// ======================
let state = { medals: [], org: [], guide: [], promotion: [] };

async function loadAll(){
  const medalsRes = await loadSheetOrSample(SHEETS.MEDALS_CSV_URL, SAMPLE.MEDALS, $("medalStatus"));
  state.medals = normalizeMedals(medalsRes.rows);
  // ✅ 메달 이미지 오버라이드(관리자 업로드/수정 반영)
  await loadMedalImageOverrides();
  applyMedalImageOverrides(state.medals);

  buildMedalIndex(state.medals);
  renderMedals(state.medals);
  ensureMedalAdminActions();

  const orgRes = await loadSheetOrSample(SHEETS.ORG_CSV_URL, SAMPLE.ORG, $("orgStatus"));
  state.org = normalizeOrg(orgRes.rows);
  renderOrgTree(state.org);

  const guideRes = await loadSheetOrSample(SHEETS.GUIDE_CSV_URL, SAMPLE.GUIDE, $("guideStatus"));
  state.guide = normalizeGuide(guideRes.rows);
  renderGuide(state.guide);

  const promoRes = await loadSheetOrSample(SHEETS.PROMOTION_CSV_URL, SAMPLE.PROMOTION, $("promotionStatus"));
  state.promotion = normalizePromotion(promoRes.rows);
  renderPromotionTable(state.promotion);
  renderPromotionFlow();
}

// 이벤트 바인딩
function bind(){
  $("medalSearch")?.addEventListener("input", () => renderMedals(state.medals));
  $("medalRarity")?.addEventListener("change", () => renderMedals(state.medals));
  $("reloadMedals")?.addEventListener("click", loadAll);

  $("orgSearch")?.addEventListener("input", () => renderOrgTree(state.org));
  $("reloadOrg")?.addEventListener("click", loadAll);

  $("guideSearch")?.addEventListener("input", () => renderGuide(state.guide));
  $("reloadGuide")?.addEventListener("click", loadAll);

  $("rankSearch")?.addEventListener("input", () => renderPromotionTable(state.promotion));
  $("reloadPromotion")?.addEventListener("click", loadAll);
}

bind();
loadAll();


function fitOrgEmbedHeight(){
  const wrap = document.querySelector(".org-embed--auto");
  if (!wrap) return;

  const rect = wrap.getBoundingClientRect();
  const bottomGap = 24; 
  const minH = 560;     
  const h = window.innerHeight - rect.top - bottomGap;

  wrap.style.height = Math.max(minH, h) + "px";
}

window.addEventListener("load", fitOrgEmbedHeight);
window.addEventListener("resize", fitOrgEmbedHeight);


const ORG_DOC_A = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRrbb1yQW1Cu-nye78N4klXo9DFrs3JSHgyKZR6wxzZr-HAvsTL1nXcZBRB0PMZDDlRhFVe5UWO7rAz/pubhtml";
const ORG_DOC_B = "1-3u5-qPHRVRl2ODPRBLfEA0hx9yT6wGh4UGDPsqJOy8";


const ORG_A = [
  { gid: "2071714382", label: "RÉGIMENT ÉTAT-MAJOR" },
];


const ORG_B = [
  { gid: "1816577667", label: "RÉGIMENT ELITE" },
  { gid: "938620042",  label: "1ER BATAILLON" },
  { gid: "1616402309", label: "2E BATAILLON" },
  { gid: "927274577",  label: "DEPOT" },
  { gid: "0",          label: "AUDIT" },
  { gid: "1641797029", label: "TRACKER" },
  { gid: "1097054235", label: "ACTIVITY TACKER" },
  { gid: "81743109",   label: "MEDAL ROSTER" },
];


const ORG_EXCLUDE = new Set(["2071714382"]);

function orgUrl(docOrPubUrl, gid){
  const base = String(docOrPubUrl).startsWith("http")
    ? String(docOrPubUrl)
    : `https://docs.google.com/spreadsheets/d/${docOrPubUrl}/pubhtml`;

  const u = new URL(base);
  u.searchParams.set("gid", String(gid));
  u.searchParams.set("single", "true");
  u.searchParams.set("widget", "true");
  u.searchParams.set("headers", "false");
  u.searchParams.set("rm", "minimal");
  return u.toString();
}

function setActiveTab(container, activeBtn){
  container.querySelectorAll(".org-tab").forEach(b => b.classList.remove("is-active"));
  activeBtn.classList.add("is-active");
}

function fitOrgHeight(){
  const wrap = document.querySelector(".org-embed--auto");
  if (!wrap) return;
  const rect = wrap.getBoundingClientRect();
  const bottomGap = 24;
  const minH = 560;
  const h = window.innerHeight - rect.top - bottomGap;
  wrap.style.height = Math.max(minH, h) + "px";
}

function initOrgEmbed(){
  const tabsA = document.getElementById("orgTabsA");
  const tabsB = document.getElementById("orgTabsB");
  const frame = document.getElementById("orgFrame");
  if (!tabsA || !tabsB || !frame) return;

  // A 탭 렌더 (2개만)
  tabsA.innerHTML = "";
  ORG_A.forEach((it, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "org-tab";
    btn.textContent = it.label;
    btn.addEventListener("click", () => {
      frame.src = orgUrl(ORG_DOC_A, it.gid);
      setActiveTab(tabsA, btn);
    });
    tabsA.appendChild(btn);

    // 첫 로드시 기본 선택
    if (idx === 0) {
      frame.src = orgUrl(ORG_DOC_A, it.gid);
      btn.classList.add("is-active");
    }
  });

  // B 탭 렌더 (exclude 제외한 것만)
  tabsB.innerHTML = "";
  const filteredB = ORG_B.filter(x => !ORG_EXCLUDE.has(String(x.gid)));
  if (!filteredB.length){
    const hint = document.createElement("div");
    hint.className = "muted";
    hint.style.fontSize = "13px";
    hint.textContent = "문서B에서 표시할 시트 gid를 ORG_B 배열에 추가하세요. (문서A의 2개 gid는 자동 제외됨)";
    tabsB.appendChild(hint);
  } else {
    filteredB.forEach((it) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "org-tab";
      btn.textContent = it.label;
      btn.addEventListener("click", () => {
        frame.src = orgUrl(ORG_DOC_B, it.gid);
        setActiveTab(tabsB, btn);
        // A쪽 active는 유지(그룹 별로 독립)
      });
      tabsB.appendChild(btn);
    });
  }

  fitOrgHeight();
}

window.addEventListener("load", initOrgEmbed);
window.addEventListener("resize", fitOrgHeight);

// ======================
// 게임 가이드 (리치 에디터 + 저장)
// ======================
async function apiJSON(url, opts){
  const options = { credentials: "same-origin", ...(opts || {}) };
  const res = await fetch(url, options);
  if (!res.ok){
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}

function wrapGuideView(html){
  return `<div class="ql-editor">${html || ""}</div>`;
}

function defaultGuideHTML(){
  return `
    <h3>기본 규칙</h3>
    <ul>
      <li><b>명령 체계</b>를 준수하고, 작전 중에는 간결하게 보고합니다.</li>
      <li>비매너/팀킬/트롤 금지. 위반 시 규정에 따라 조치합니다.</li>
      <li>작전 중 이탈 시 사유를 보고합니다.</li>
    </ul>
    <h3>작전 참여 절차</h3>
    <ol>
      <li>집합 → 인원 점호</li>
      <li>장비 점검 → 역할 배치</li>
      <li>브리핑 → 작전 수행</li>
      <li>결과 보고 → 기록 반영</li>
    </ol>
    <p class="muted">※ 이 내용은 <b>편집</b> 버튼을 눌러 자유롭게 수정할 수 있습니다.</p>
  `;
}

async function uploadGuideAsset(file){
  const fd = new FormData();
  fd.append("file", file);
  const data = await apiJSON("/api/upload-asset", { method: "POST", body: fd });
  return data;
}

async function uploadGuideImage(file){
  const data = await uploadGuideAsset(file);
  if (!data || !data.ok || data.kind !== "image"){
    throw new Error("이미지 업로드가 아닙니다.");
  }
  return data.url;
}

// Quill 에디터에서 이미지 클릭 시 크기/정렬을 조절할 수 있는 간단 툴박스
function attachGuideMediaTools(quill){
  if (!quill || quill.__mediaToolsAttached) return;
  quill.__mediaToolsAttached = true;

  const root = quill.root;
  const wrap = document.getElementById("guideEditorWrap");
  if (!root || !wrap) return;

  const tools = document.createElement("div");
  tools.className = "guide-img-tools";
  tools.innerHTML = `
    <div class="guide-img-tools__row">
      <button type="button" data-w="40">40%</button>
      <button type="button" data-w="60">60%</button>
      <button type="button" data-w="80">80%</button>
      <button type="button" data-w="100">100%</button>
      <span class="guide-img-tools__sep"></span>
      <button type="button" data-align="left">좌</button>
      <button type="button" data-align="center">중</button>
      <button type="button" data-align="right">우</button>
      <span class="guide-img-tools__sep"></span>
      <button type="button" data-action="remove" class="danger">삭제</button>
    </div>
    <div class="guide-img-tools__row">
      <span class="guide-img-tools__label">크기</span>
      <input type="range" min="20" max="100" step="5" value="80" />
      <span class="guide-img-tools__value">80%</span>
    </div>
  `;
  document.body.appendChild(tools);

  let currentEl = null;
  const slider = tools.querySelector('input[type="range"]');
  const valueEl = tools.querySelector('.guide-img-tools__value');

  function hide(){
    tools.classList.remove("show");
    if (currentEl) currentEl.classList.remove("is-selected");
    currentEl = null;
  }

  function applyWidth(percent){
    if (!currentEl) return;
    currentEl.style.width = `${percent}%`;
    currentEl.style.maxWidth = "100%";
    currentEl.style.display = "block";
    if (currentEl.tagName === "IMG" || currentEl.tagName === "VIDEO"){
      currentEl.style.height = "auto";
    }
  }

  function applyAlign(align){
    if (!currentEl) return;
    currentEl.style.display = "block";
    currentEl.style.maxWidth = "100%";
    if (align === "left"){
      currentEl.style.marginLeft = "0";
      currentEl.style.marginRight = "auto";
    } else if (align === "center"){
      currentEl.style.marginLeft = "auto";
      currentEl.style.marginRight = "auto";
    } else if (align === "right"){
      currentEl.style.marginLeft = "auto";
      currentEl.style.marginRight = "0";
    }
  }

  function position(){
    if (!currentEl) return;
    const r = currentEl.getBoundingClientRect();
    const top = Math.max(12, r.top - tools.offsetHeight - 10);
    const left = Math.min(window.innerWidth - tools.offsetWidth - 12, Math.max(12, r.left));
    tools.style.top = `${top + window.scrollY}px`;
    tools.style.left = `${left + window.scrollX}px`;
  }

  root.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;

    // IMG / VIDEO / AUDIO만 대상
    const media = target.closest("img,video,audio");
    if (!media || !(media instanceof HTMLElement)) return;

    e.preventDefault();
    e.stopPropagation();

    if (currentEl && currentEl !== media){
      currentEl.classList.remove("is-selected");
    }
    currentEl = media;
    currentEl.classList.add("is-selected");

    // 현재 스타일을 슬라이더에 반영
    const w = (currentEl.style.width || "").replace("%", "");
    const p = w ? parseInt(w, 10) : 80;
    slider.value = String(isFinite(p) ? p : 80);
    valueEl.textContent = `${slider.value}%`;

    tools.classList.add("show");
    position();
  });

  // 에디터 밖 클릭 시 닫기
  document.addEventListener("click", (e) => {
    if (!currentEl) return;
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    if (tools.contains(t)) return;
    if (root.contains(t)) return;
    hide();
  });

  window.addEventListener("scroll", () => { if (currentEl) position(); }, { passive: true });

  tools.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn || !(btn instanceof HTMLButtonElement)) return;

    const w = btn.dataset.w;
    const align = btn.dataset.align;
    const action = btn.dataset.action;

    if (w){
      const p = parseInt(w, 10);
      slider.value = String(p);
      valueEl.textContent = `${p}%`;
      applyWidth(p);
      applyAlign("center");
      position();
      return;
    }
    if (align){
      applyAlign(align);
      position();
      return;
    }
    if (action === "remove"){
      currentEl.remove();
      hide();
    }
  });

  slider.addEventListener("input", () => {
    const p = parseInt(slider.value, 10);
    valueEl.textContent = `${p}%`;
    applyWidth(p);
    position();
  });
}


function ensureQuill(){
  if (window.__guideQuill) return window.__guideQuill;
  if (!window.Quill) throw new Error("Quill이 로드되지 않았습니다.");

  // 커스텀 오디오/비디오 블롯 등록 (업로드한 파일을 <video>/<audio>로 삽입)
  if (!window.__guideBlotsRegistered){
    const BlockEmbed = Quill.import("blots/block/embed");

    class HtmlVideoBlot extends BlockEmbed {
      static blotName = "htmlVideo";
      static tagName = "video";

      static create(value){
        const node = super.create();
        node.setAttribute("controls", "");
        node.setAttribute("preload", "metadata");
        node.setAttribute("playsinline", "");
        node.style.width = (value && value.width) ? value.width : "80%";
        node.style.maxWidth = "100%";
        node.style.display = "block";
        node.style.marginLeft = "auto";
        node.style.marginRight = "auto";
        node.style.borderRadius = "16px";

        const url = typeof value === "string" ? value : (value?.url || "");
        const type = typeof value === "object" ? (value?.type || "") : "";

        node.innerHTML = "";
        const source = document.createElement("source");
        source.setAttribute("src", url);
        if (type) source.setAttribute("type", type);
        node.appendChild(source);
        return node;
      }

      static value(node){
        const source = node.querySelector("source");
        return {
          url: source?.getAttribute("src") || "",
          type: source?.getAttribute("type") || "",
        };
      }
    }

    class HtmlAudioBlot extends BlockEmbed {
      static blotName = "htmlAudio";
      static tagName = "audio";

      static create(value){
        const node = super.create();
        node.setAttribute("controls", "");
        node.setAttribute("preload", "metadata");
        node.style.width = (value && value.width) ? value.width : "100%";
        node.style.maxWidth = "100%";
        node.style.display = "block";
        node.style.marginLeft = "auto";
        node.style.marginRight = "auto";

        const url = typeof value === "string" ? value : (value?.url || "");
        const type = typeof value === "object" ? (value?.type || "") : "";

        node.innerHTML = "";
        const source = document.createElement("source");
        source.setAttribute("src", url);
        if (type) source.setAttribute("type", type);
        node.appendChild(source);
        return node;
      }

      static value(node){
        const source = node.querySelector("source");
        return {
          url: source?.getAttribute("src") || "",
          type: source?.getAttribute("type") || "",
        };
      }
    }

    Quill.register(HtmlVideoBlot);
    Quill.register(HtmlAudioBlot);
    window.__guideBlotsRegistered = true;
  }

  const toolbar = [
    [{ header: [1,2,3,false] }],
    [{ size: ["small", false, "large", "huge"] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote", "code-block"],
    ["link", "image", "video"],
    ["clean"]
  ];

  const quill = new Quill("#guideEditor", {
    theme: "snow",
    placeholder: "여기에 게임 가이드를 작성하세요…",
    modules: {
      toolbar: {
        container: toolbar,
        handlers: {
          image: async function(){
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*,.png,.jpg,.jpeg,.gif,.webp";
            input.click();

            input.onchange = async () => {
              const file = input.files?.[0];
              if (!file) return;

              try{
                const data = await uploadGuideAsset(file);
                if (data.kind !== "image") throw new Error("이미지 파일이 아닙니다.");

                const url = data.url;
                const range = quill.getSelection(true) || { index: quill.getLength(), length: 0 };
                quill.insertEmbed(range.index, "image", url, "user");
                quill.setSelection(range.index + 1, 0);

                // 기본 스타일: 80% + 가운데
                setTimeout(() => {
                  const imgs = quill.root.querySelectorAll(`img[src="${url}"]`);
                  const img = imgs[imgs.length - 1];
                  if (img){
                    img.style.width = "80%";
                    img.style.height = "auto";
                    img.style.maxWidth = "100%";
                    img.style.display = "block";
                    img.style.marginLeft = "auto";
                    img.style.marginRight = "auto";
                  }
                }, 0);
              }catch(e){
                console.error(e);
                if (!handleAdmin401(e)){
                  alert("이미지 업로드에 실패했습니다.\n" + (e?.message || e));
                }
              }
            };
          },

          video: async function(){
            const input = document.createElement("input");
            input.type = "file";
            // MKV까지 선택 가능하게
            input.accept = "video/*,.mkv,.mp4,.webm,.mov,.avi";
            input.click();

            input.onchange = async () => {
              const file = input.files?.[0];
              if (!file) return;

              try{
                const data = await uploadGuideAsset(file);

                const range = quill.getSelection(true) || { index: quill.getLength(), length: 0 };

                if (data.kind === "video"){
                  quill.insertEmbed(range.index, "htmlVideo", { url: data.url, type: data.content_type || "" }, "user");
                  quill.insertText(range.index + 1, "\n", "user");
                  // MKV 등 브라우저 미지원 포맷 대비 다운로드 링크도 같이
                  quill.insertText(range.index + 2, `다운로드: ${data.name || "video"}`, { link: data.url }, "user");
                  quill.insertText(range.index + 2 + (`다운로드: ${data.name || "video"}`).length, "\n", "user");
                  quill.setSelection(range.index + 3, 0);
                } else {
                  // 비디오로 판정 안 되면 링크로 삽입
                  quill.insertText(range.index, data.name || "파일", { link: data.url }, "user");
                  quill.insertText(range.index + (data.name || "파일").length, "\n", "user");
                }
              }catch(e){
                console.error(e);
                if (!handleAdmin401(e)){
                  alert("동영상 업로드에 실패했습니다.\n" + (e?.message || e));
                }
              }
            };
          }
        }
      }
    }
  });

  // 오디오/파일(첨부) 버튼을 툴바에 추가
  const tb = quill.getModule("toolbar");
  if (tb && tb.container && !tb.container.querySelector(".ql-audio")){
    const group = document.createElement("span");
    group.className = "ql-formats";
    group.innerHTML = `
      <button type="button" class="ql-audio" title="오디오 업로드">♫</button>
      <button type="button" class="ql-attach" title="파일 업로드">📎</button>
    `;
    tb.container.appendChild(group);

    tb.addHandler("audio", async () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac";
      input.click();

      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;

        try{
          const data = await uploadGuideAsset(file);
          const range = quill.getSelection(true) || { index: quill.getLength(), length: 0 };

          if (data.kind === "audio"){
            quill.insertEmbed(range.index, "htmlAudio", { url: data.url, type: data.content_type || "" }, "user");
            quill.insertText(range.index + 1, "\n", "user");
            quill.insertText(range.index + 2, `다운로드: ${data.name || "audio"}`, { link: data.url }, "user");
            quill.insertText(range.index + 2 + (`다운로드: ${data.name || "audio"}`).length, "\n", "user");
            quill.setSelection(range.index + 3, 0);
          } else {
            quill.insertText(range.index, data.name || "파일", { link: data.url }, "user");
            quill.insertText(range.index + (data.name || "파일").length, "\n", "user");
          }
        }catch(e){
          console.error(e);
          if (!handleAdmin401(e)){
            alert("오디오 업로드에 실패했습니다.\n" + (e?.message || e));
          }
        }
      };
    });

    tb.addHandler("attach", async () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "*/*";
      input.click();

      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;

        try{
          const data = await uploadGuideAsset(file);
          const range = quill.getSelection(true) || { index: quill.getLength(), length: 0 };
          const label = data.name || "파일";
          quill.insertText(range.index, label, { link: data.url }, "user");
          quill.insertText(range.index + label.length, "\n", "user");
          quill.setSelection(range.index + label.length + 1, 0);
        }catch(e){
          console.error(e);
          if (!handleAdmin401(e)){
            alert("파일 업로드에 실패했습니다.\n" + (e?.message || e));
          }
        }
      };
    });
  }

  // 이미지/비디오/오디오 클릭 시 크기/정렬 조절 툴박스 활성화
  attachGuideMediaTools(quill);

  window.__guideQuill = quill;
  return quill;
}


async function initGuideEditor(){
  const view = $("guideView");
  const savedAt = $("guideSavedAt");
  const wrap = $("guideEditorWrap");
  const editBtn = $("guideEditBtn");
  const saveBtn = $("guideSaveBtn");
  const cancelBtn = $("guideCancelBtn");
  if (!view || !savedAt) return;

  const canEdit = IS_ADMIN && wrap && editBtn && saveBtn && cancelBtn;

  let currentHTML = "";
  let currentUpdatedAt = "-";
  let currentDelta = null;

  function setMode(editing){
    if (!canEdit) return;
    if (editing){
      view.hidden = true;
      wrap.hidden = false;
      editBtn.hidden = true;
      saveBtn.hidden = false;
      cancelBtn.hidden = false;
    } else {
      view.hidden = false;
      wrap.hidden = true;
      editBtn.hidden = false;
      saveBtn.hidden = true;
      cancelBtn.hidden = true;
    }
  }

  async function load(){
    try{
      const data = await apiJSON("/api/guide", { method:"GET" });
      currentHTML = (data.html || "").trim();
      currentUpdatedAt = data.updated_at || "-";
      currentDelta = data.delta || null;
    }catch(e){
      console.error(e);
      // 읽기라도 보여주기
      currentHTML = currentHTML || "";
    }

    view.innerHTML = wrapGuideView(currentHTML || defaultGuideHTML());
    savedAt.textContent = currentUpdatedAt;
    if (canEdit) setMode(false);
  }

  // 읽기 전용이면 로드만 하고 종료
  if (!canEdit){
    load();
    return;
  }

  const quill = ensureQuill();

  editBtn.addEventListener("click", () => {
    // 저장된 Delta가 있으면 그대로 복원(서식 유지)
    if (currentDelta){
      quill.setContents(currentDelta);
    } else {
      quill.setContents(quill.clipboard.convert(currentHTML || defaultGuideHTML()));
    }
    setMode(true);
  });

  cancelBtn.addEventListener("click", () => {
    // 편집 취소 시 저장된 내용으로 되돌림
    if (currentDelta){
      quill.setContents(currentDelta);
    }
    setMode(false);
  });

  saveBtn.addEventListener("click", async () => {
    saveBtn.disabled = true;
    try{
      const html = quill.root.innerHTML;
      const delta = quill.getContents();
      const data = await apiJSON("/api/guide", {
        method:"POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html, delta })
      });
      // 저장 성공 시 현재 Delta 갱신(서식 유지)
      currentDelta = delta;
      currentHTML = (data.html || "").trim();
      currentUpdatedAt = data.updated_at || "-";
      view.innerHTML = wrapGuideView(currentHTML || defaultGuideHTML());
      savedAt.textContent = currentUpdatedAt;
      setMode(false);
    }catch(e){
      console.error(e);
      if (!handleAdmin401(e)) alert("저장에 실패했습니다.");
    }finally{
      saveBtn.disabled = false;
    }
  });

  load();
}

window.addEventListener("load", initGuideEditor);
