// ===== DATA =====

const DATA = {

  celular: "5530820068",

  oficina: "5552869086",

  extension: "114",

  email: "alejandro.flores@loperena.mx",

  whatsappText: "Hola, vi tu tarjeta digital",

  links: {
    linkedin: "https://www.linkedin.com/in/alejandro-flores-pati%C3%B1o-86101055/?skipRedirect=true",
    pdfcv: "./assets/cv/CV_Alejandro_Flores_Patino.pdf"
  },

vcard: {

  firstName: "Alejandro",

  lastName: "Flores Patiño",

  org: "Loperena Lerch y Martín del Campo",

  title: "Socio",

  celular: "5530820068",

  oficina: "5552869086",

  extension: "114",

  email: "alejandro.flores@loperena.mx",

  linkedin: "https://www.linkedin.com/in/alejandro-flores-pati%C3%B1o-86101055/?skipRedirect=true",

  photo: "https://claudiapiba.github.io/storylaw/alejandro-flores/assets/img/foto-ale.jpeg",

  address: {
    street: "Campeche 315 Piso 3",
    city: "Ciudad de México",
    state: "CDMX",
    zip: "06170",
    country: "México"
  }

}
};

// ===== HELPERS =====

const $ = (q) => document.querySelector(q);

function toast(msg){

  const el = $("#toast");

  if(!el) return;

  el.textContent = msg;

  el.classList.add("show");

  clearTimeout(toast._t);

  toast._t = setTimeout(() => {
    el.classList.remove("show");
  }, 1800);
}

async function copyText(text){

  try{

    await navigator.clipboard.writeText(text);

    toast("Copiado");

  }catch{

    const ta = document.createElement("textarea");

    ta.value = text;

    document.body.appendChild(ta);

    ta.select();

    document.execCommand("copy");

    ta.remove();

    toast("Copiado");
  }
}

// ===== VCARD =====

async function buildVCard(v){

  let photoLine = "";

  if(v.photo){

    try{

      const base64 =
        await imageToBase64(v.photo);

      photoLine =
`PHOTO;ENCODING=b;TYPE=JPEG:${base64}`;

    }catch(error){

      console.error("Error cargando foto", error);
    }
  }

  return [

    "BEGIN:VCARD",

    "VERSION:3.0",

    `N:${v.lastName};${v.firstName};;;`,

    `FN:${v.firstName} ${v.lastName}`,

    v.org
      ? `ORG:${v.org}`
      : "",

    v.title
      ? `TITLE:${v.title}`
      : "",

    v.celular
      ? `TEL;TYPE=CELL:${v.celular}`
      : "",

    v.oficina
      ? `TEL;TYPE=WORK:${v.oficina}`
      : "",

    v.extension
      ? `NOTE:Extensión ${v.extension}`
      : "",

    v.email
      ? `EMAIL:${v.email}`
      : "",

    v.linkedin
      ? `URL:${v.linkedin}`
      : "",

    v.address
      ? `ADR;TYPE=WORK:;;${v.address.street};${v.address.city};${v.address.state};${v.address.zip};${v.address.country}`
      : "",

    photoLine,

    "END:VCARD"

  ].filter(Boolean).join("\n");
}

function download(filename, content, type="text/plain"){

  const blob = new Blob([content], { type });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");

  a.href = url;

  a.download = filename;

  document.body.appendChild(a);

  a.click();

  a.remove();

  URL.revokeObjectURL(url);
}

// ===== QUICK BUTTONS =====

document.querySelectorAll(".pill").forEach((btn, index) => {

  btn.addEventListener("click", () => {

    // WHATSAPP

    if(index === 0){

      const url =
        `https://wa.me/${DATA.celular}?text=${encodeURIComponent(DATA.whatsappText)}`;

      window.open(url, "_blank");

      return;
    }

    // OFICINA

    if(index === 1){

      window.location.href =
        `tel:${DATA.oficina}`;

      return;
    }

    // EMAIL

    if(index === 2){

      window.location.href =
        `mailto:${DATA.email}`;

      return;
    }

  });

});

// ===== LINKS =====

document.querySelectorAll("[data-link]").forEach((el) => {

  el.addEventListener("click", (e) => {

    e.preventDefault();

    const key = el.getAttribute("data-link");

    const url = DATA.links[key];

    if(!url){

      toast("Link pendiente");

      return;
    }

    window.open(url, "_blank");

  });

});

// ===== COPY EMAIL BUTTON =====

$("#copyBtn")?.addEventListener("click", () => {

  copyText(DATA.email);

});

// ===== COPY BUTTONS =====

document.querySelectorAll("[data-copy]").forEach((btn) => {

  btn.addEventListener("click", () => {

    const value = btn.dataset.copy;

    // selector

    if(value.startsWith("#")){

      const text =
        document.querySelector(value)?.textContent?.trim();

      if(text) copyText(text);

      return;
    }

    // texto directo

    copyText(value);

  });

});

// ===== ACCORDION =====

const accBtn = $(".accBtn");

const panel = $(".accPanel");

function closeAccordion(){

  accBtn?.setAttribute("aria-expanded", "false");

  if(panel){
    panel.style.maxHeight = "0px";
  }
}

function openAccordion(){

  accBtn?.setAttribute("aria-expanded", "true");

  if(panel){
    panel.style.maxHeight =
      panel.scrollHeight + "px";
  }
}

accBtn?.addEventListener("click", () => {

  const expanded =
    accBtn.getAttribute("aria-expanded") === "true";

  expanded
    ? closeAccordion()
    : openAccordion();
});

// ===== SHARE =====

async function shareCard(){

  const payload = {

    title: "Tarjeta digital",

    text: "Te comparto mi tarjeta digital",

    url: window.location.href
  };

  if(navigator.share){

    try{

      await navigator.share(payload);

      toast("Compartido");

    }catch{}

  }else{

    copyText(window.location.href);

    toast("Link copiado");
  }
}

$("#shareBtn")?.addEventListener("click", shareCard);

// ===== SAVE CONTACT =====

async function saveContact(){

  const vcf =
    await buildVCard(DATA.vcard);

  download(
    "alejandro-flores-patino.vcf",
    vcf,
    "text/vcard"
  );

  toast("Contacto descargado");
}

$("#saveContactBtn")?.addEventListener(
  "click",
  saveContact
);

async function imageToBase64(url){

  const response = await fetch(url);

  const blob = await response.blob();

  return new Promise((resolve, reject) => {

    const reader = new FileReader();

    reader.onloadend = () => {

      const base64 =
        reader.result
          .split(",")[1];

      resolve(base64);
    };

    reader.onerror = reject;

    reader.readAsDataURL(blob);

  });
}