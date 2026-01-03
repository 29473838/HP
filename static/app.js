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
    { medal_id:"VALOR", name:"x", icon:"✦", summary:"x", how_to_earn:"x", rarity:"Rare", sort:"10" },
    { medal_id:"LOYALTY", name:"x", icon:"✠", summary:"x", how_to_earn:"x", rarity:"Uncommon", sort:"20" },
    { medal_id:"COMMAND", name:"x", icon:"⚜", summary:"x", how_to_earn:"x", rarity:"Epic", sort:"30" },
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

async function uploadGuideImage(file){
  const fd = new FormData();
  fd.append("image", file);
  try{
    const data = await apiJSON("/api/upload-image", { method:"POST", body: fd });
    return data.url;
  }catch(e){
    // 로그인 세션이 풀렸거나(401) 권한이 없으면 로그인으로 이동
    if (handleAdmin401(e)) throw e;
    throw e;
  }
}

// Quill 에디터에서 이미지 클릭 시 크기/정렬을 조절할 수 있는 간단 툴박스
function attachGuideImageTools(quill){
  if (!quill || quill.__imgToolsAttached) return;
  quill.__imgToolsAttached = true;

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

  let currentImg = null;
  const slider = tools.querySelector('input[type="range"]');
  const valueEl = tools.querySelector('.guide-img-tools__value');

  function hide(){
    tools.classList.remove("show");
    if (currentImg) currentImg.classList.remove("is-selected");
    currentImg = null;
  }

  function applyWidth(percent){
    if (!currentImg) return;
    currentImg.style.width = `${percent}%`;
    currentImg.style.height = "auto";
    currentImg.style.maxWidth = "100%";
    currentImg.style.display = "block";
  }

  function applyAlign(align){
    if (!currentImg) return;
    currentImg.style.display = "block";
    currentImg.style.maxWidth = "100%";
    if (align === "left"){
      currentImg.style.marginLeft = "0";
      currentImg.style.marginRight = "auto";
    } else if (align === "center"){
      currentImg.style.marginLeft = "auto";
      currentImg.style.marginRight = "auto";
    } else if (align === "right"){
      currentImg.style.marginLeft = "auto";
      currentImg.style.marginRight = "0";
    }
  }

  function position(){
    if (!currentImg) return;
    const r = currentImg.getBoundingClientRect();
    const top = Math.max(12, r.top - tools.offsetHeight - 10);
    const left = Math.min(window.innerWidth - tools.offsetWidth - 12, Math.max(12, r.left));
    tools.style.top = `${top + window.scrollY}px`;
    tools.style.left = `${left + window.scrollX}px`;
  }

  // 이미지 클릭 시 툴박스 표시
  root.addEventListener("click", (ev) => {
    // 편집 모드일 때만
    if (wrap.hidden) return;
    const t = ev.target;
    if (t && t.tagName === "IMG"){
      ev.preventDefault();
      if (currentImg && currentImg !== t) currentImg.classList.remove("is-selected");
      currentImg = t;
      currentImg.classList.add("is-selected");

      // 기본 값 동기화
      const w = parseInt(String(currentImg.style.width || "").replace("%",""), 10);
      const percent = Number.isFinite(w) && w > 0 ? w : 80;
      slider.value = String(percent);
      valueEl.textContent = `${percent}%`;

      tools.classList.add("show");
      position();
    } else {
      hide();
    }
  });

  // 외부 클릭 시 닫기
  document.addEventListener("click", (ev) => {
    if (!currentImg) return;
    const el = ev.target;
    if (el === currentImg) return;
    if (tools.contains(el)) return;
    // 편집 래퍼 밖 클릭이면 닫기
    if (!document.getElementById("guideEditorWrap")?.contains(el)) hide();
  });

  // 리사이즈/스크롤 시 위치 재계산
  window.addEventListener("resize", position);
  window.addEventListener("scroll", position, { passive: true });

  // 버튼/슬라이더 동작
  tools.addEventListener("click", (ev) => {
    const btn = ev.target.closest("button");
    if (!btn || !currentImg) return;
    const w = btn.getAttribute("data-w");
    const align = btn.getAttribute("data-align");
    const action = btn.getAttribute("data-action");

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
      currentImg.remove();
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

  const toolbar = [
    [{ header: [1,2,3,false] }],
    [{ size: ["small", false, "large", "huge"] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote", "code-block"],
    ["link", "image"],
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
            input.accept = "image/*";
            input.click();

            input.onchange = async () => {
              const file = input.files?.[0];
              if (!file) return;

              // 8MB 정도까지만 (서버 제한과 맞추기)
              if (file.size > 8 * 1024 * 1024){
                alert("이미지 용량이 너무 큽니다. (최대 8MB)");
                return;
              }

              try{
                const url = await uploadGuideImage(file);
                const range = quill.getSelection(true) || { index: quill.getLength(), length: 0 };
                quill.insertEmbed(range.index, "image", url, "user");
                quill.setSelection(range.index + 1, 0);

                // 삽입 직후 기본 스타일(네이버 블로그 느낌: 적당히 크게 + 가운데)
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
          }
        }
      }
    }
  });

  // 이미지 클릭 시 크기/정렬 조절 툴박스 활성화
  attachGuideImageTools(quill);

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
    }catch(e){
      console.error(e);
      // 읽기라도 보여주기
      currentHTML = currentHTML || "";
    }

    view.innerHTML = currentHTML || defaultGuideHTML();
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
    quill.root.innerHTML = currentHTML || defaultGuideHTML();
    setMode(true);
  });

  cancelBtn.addEventListener("click", () => {
    setMode(false);
  });

  saveBtn.addEventListener("click", async () => {
    saveBtn.disabled = true;
    try{
      const html = quill.root.innerHTML;
      const data = await apiJSON("/api/guide", {
        method:"POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html })
      });
      currentHTML = (data.html || "").trim();
      currentUpdatedAt = data.updated_at || "-";
      view.innerHTML = currentHTML || defaultGuideHTML();
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
