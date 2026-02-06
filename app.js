// ===== Demo data =====
const DATA = {
  phone: "5581451364",
  email: "hola@tudominio.com",
  whatsappText: "Hola, vi tu tarjeta digital 🙂",
  links: {
    linkedin: "https://www.linkedin.com/",
    instagram: "https://www.instagram.com/",
    website: "https://example.com",
    pdfcv: "https://example.com/cv.pdf"
  },
  vcard: {
    firstName: "Juan",
    lastName: "Pérez",
    org: "Equipo / Organización",
    title: "Especialista",
    phone: "+52 55 1234 5678",
    email: "hola@tudominio.com",
    url: "https://example.com"
  }
};

// ===== Helpers =====
const $ = (q) => document.querySelector(q);

function toast(msg){
  const el = $("#toast");
  if(!el) return;
  el.textContent = msg;
  el.classList.add("show");
  window.clearTimeout(toast._t);
  toast._t = window.setTimeout(()=> el.classList.remove("show"), 1800);
}

async function copyText(text){
  try{
    await navigator.clipboard.writeText(text);
    toast("Copiado ✅");
  }catch{
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
    toast("Copiado ✅");
  }
}

function buildVCard(v){
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${v.lastName};${v.firstName};;;`,
    `FN:${v.firstName} ${v.lastName}`,
    v.org ? `ORG:${v.org}` : "",
    v.title ? `TITLE:${v.title}` : "",
    v.phone ? `TEL;TYPE=CELL:${v.phone}` : "",
    v.email ? `EMAIL;TYPE=INTERNET:${v.email}` : "",
    v.url ? `URL:${v.url}` : "",
    "END:VCARD"
  ].filter(Boolean).join("\n");
}

function download(filename, content, type="text/plain"){
  const blob = new Blob([content], {type});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function formatWebForLabel(url){
  try{
    const u = new URL(url);
    return u.host.replace(/^www\./, "");
  }catch{
    return String(url || "").replace(/^https?:\/\//, "").replace(/^www\./, "");
  }
}

// ===== Fill web text =====
const webTxt = $("#webTxt");
if (webTxt) webTxt.textContent = formatWebForLabel(DATA.links.website);

// ===== Share =====
async function shareCard(){
  const url = window.location.href;
  const payload = {
    title: "Tarjeta digital",
    text: "Te comparto mi tarjeta digital",
    url
  };

  if (navigator.share){
    try{
      await navigator.share(payload);
      toast("Compartido ✨");
    }catch{
      // user cancelled -> no toast
    }
  }else{
    await copyText(url);
    toast("Link copiado 🔗");
  }
}

$("#shareBtn")?.addEventListener("click", shareCard);
$("#shareFromSheet")?.addEventListener("click", () => { shareCard(); closeSheet(); });

// ===== Interactions (event delegation) =====
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  const link = e.target.closest("[data-link]");
  const copyBtn = e.target.closest("[data-copy]");

  if(btn){
    e.preventDefault();
    const action = btn.getAttribute("data-action");

    if(action === "whatsapp"){
      const url = `https://wa.me/52${DATA.phone}?text=${encodeURIComponent(DATA.whatsappText)}`;
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    if(action === "call"){
      window.location.href = `tel:+52${DATA.phone}`;
      return;
    }
    if(action === "email"){
      window.location.href = `mailto:${DATA.email}`;
      return;
    }
  }

  if(link){
    e.preventDefault();
    const key = link.getAttribute("data-link");
    const url = DATA.links[key];
    if(!url){
      toast("Link pendiente ✨");
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }

  if(copyBtn){
    e.preventDefault();
    const targetSel = copyBtn.getAttribute("data-copy");
    const text = document.querySelector(targetSel)?.textContent?.trim() || "";
    if(text) copyText(text);
    return;
  }
});

// Copy mail button
$("#copyBtn")?.addEventListener("click", () => copyText(DATA.email));

// ===== Accordion =====
const accBtn = $(".accBtn");
const panel = $(".accPanel");

function closeAccordion(){
  accBtn?.setAttribute("aria-expanded", "false");
  if(panel) panel.style.maxHeight = "0px";
}
function openAccordion(){
  accBtn?.setAttribute("aria-expanded", "true");
  if(panel) panel.style.maxHeight = panel.scrollHeight + "px";
}

accBtn?.addEventListener("click", () => {
  const expanded = accBtn.getAttribute("aria-expanded") === "true";
  expanded ? closeAccordion() : openAccordion();
});

// recalcula height si cambia tamaño (rotación)
window.addEventListener("resize", () => {
  const expanded = accBtn?.getAttribute("aria-expanded") === "true";
  if(expanded && panel) panel.style.maxHeight = panel.scrollHeight + "px";
});

// ===== Save contact =====
function saveContact(){
  const vcf = buildVCard(DATA.vcard);
  download("juan-perez.vcf", vcf, "text/vcard");
  toast("Contacto descargado 📇");
}
$("#saveContactBtn")?.addEventListener("click", saveContact);
$("#saveContactFromSheet")?.addEventListener("click", () => { saveContact(); closeSheet(); });

// ===== Theme toggle (persist) =====
const themeBtn = $("#themeBtn");
const saved = localStorage.getItem("demoTheme");
if(saved) document.documentElement.setAttribute("data-theme", saved);

themeBtn?.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "" : "dark";
  if(next) document.documentElement.setAttribute("data-theme", next);
  else document.documentElement.removeAttribute("data-theme");

  localStorage.setItem("demoTheme", next);
  toast(next === "dark" ? "Tema oscuro" : "Tema claro");
});

// ===== Bottom sheet controls =====
const sheet = document.getElementById("sheet");
const sheetOverlay = document.getElementById("sheetOverlay");
const openSheetBtn = document.getElementById("openSheetBtn");
const closeSheetBtn = document.getElementById("closeSheetBtn");

function openSheet(){
  sheetOverlay.hidden = false;
  sheetOverlay.classList.add("open");
  sheet.classList.add("open");
  sheet.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeSheet(){
  sheetOverlay.classList.remove("open");
  sheet.classList.remove("open");
  sheet.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";

  window.setTimeout(() => { sheetOverlay.hidden = true; }, 220);
}

openSheetBtn?.addEventListener("click", openSheet);
closeSheetBtn?.addEventListener("click", closeSheet);
sheetOverlay?.addEventListener("click", closeSheet);

document.addEventListener("keydown", (e) => {
  if(e.key === "Escape" && sheet?.classList.contains("open")) closeSheet();
});

// ===== Swipe down to close (mobile) =====
let startY = 0;
let currentY = 0;
let dragging = false;

function onTouchStart(e){
  if(!sheet.classList.contains("open")) return;
  dragging = true;
  startY = e.touches[0].clientY;
  currentY = startY;
  sheet.style.transition = "none";
}

function onTouchMove(e){
  if(!dragging) return;
  currentY = e.touches[0].clientY;
  const delta = Math.max(0, currentY - startY);
  sheet.style.transform = `translateX(-50%) translateY(${delta}px)`;
}

function onTouchEnd(){
  if(!dragging) return;
  dragging = false;
  sheet.style.transition = "";

  const delta = Math.max(0, currentY - startY);
  if(delta > 120){
    sheet.style.transform = "";
    closeSheet();
  }else{
    sheet.style.transform = "";
  }
}

sheet?.addEventListener("touchstart", onTouchStart, {passive:true});
sheet?.addEventListener("touchmove", onTouchMove, {passive:true});
sheet?.addEventListener("touchend", onTouchEnd);
