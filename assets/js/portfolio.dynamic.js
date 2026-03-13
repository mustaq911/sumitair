/* ==== Dynamic Projects renderer — Stacked Gallery Edition ============= */
/* Drop-in replacement for portfolio.dynamic.js                           */
/* Compatible with existing PORTFOLIO_CONFIG folder/image structure.      */

const GROUPS = {
  custom: { label: "Custom Homes",  class: "g-custom" },
  subdiv: { label: "Sub Divisions", class: "g-subdiv"  }
};

const PORTFOLIO_CONFIG = [
  { id: "filter-remodeling",   label: "Custom Homes 1",   group: "custom", folder: "proj-01", gallery: "portfolio-gallery-remodeling",  count: 6  },
  { id: "filter-construction", label: "Custom Homes 2",   group: "custom", folder: "proj-02", gallery: "portfolio-gallery-construction", count: 6  },
  { id: "filter-repairs",      label: "Custom Homes 3",   group: "custom", folder: "proj-03", gallery: "portfolio-gallery-repairs",      count: 6  },
  { id: "filter-design",       label: "Custom Homes 4",   group: "custom", folder: "proj-04", gallery: "portfolio-gallery-book",         count: 6  },
  { id: "filter-project5",     label: "Sub Divisions 1",  group: "subdiv", folder: "proj-05", gallery: "portfolio-gallery-book",         count: 6  },
  { id: "filter-project6",     label: "Sub Divisions 2",  group: "subdiv", folder: "proj-06", gallery: "portfolio-gallery-book",         count: 4  },
  { id: "filter-project7",     label: "Sub Divisions 3",  group: "subdiv", folder: "proj-07", gallery: "portfolio-gallery-book",         count: 3  },
  { id: "filter-project8",     label: "Sub Divisions 4",  group: "subdiv", folder: "proj-08", gallery: "portfolio-gallery-book",         count: 11 }
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function imgPath(cat, idx) {
  return `assets/img/${cat.folder}/pic${String(idx).padStart(2,"0")}.jpg`;
}

function buildImages(cat) {
  const imgs = [];
  for (let i = 1; i <= cat.count; i++) {
    imgs.push({ src: imgPath(cat, i), title: `${cat.label} — ${String(i).padStart(2,"0")}`, gallery: cat.gallery });
  }
  return imgs;
}

/* ------------------------------------------------------------------ */
/*  Build ONE stacked-gallery widget for a category                   */
/* ------------------------------------------------------------------ */
function buildGalleryWidget(cat) {
  const images = buildImages(cat);
  let current = 0;

  /* ---- Bootstrap col wrapper (2-per-row grid) ---- */
  const col = document.createElement("div");
  col.className = `col-lg-6 col-md-6 col-12 sgw-col sgw-cat ${cat.id} ${GROUPS[cat.group].class}`;
  col.dataset.catId = cat.id;
  col.style.display = "none"; // hidden until selected

  /* ---- Project label above widget ---- */
  const label = document.createElement("h5");
  label.className = "sgw-project-label";
  label.textContent = cat.label;
  col.appendChild(label);

  /* ---- inner widget wrapper ---- */
  const wrap = document.createElement("div");
  wrap.className = "sgw-wrap";
  col.appendChild(wrap);

  /* ---- stage row ---- */
  const stage = document.createElement("div");
  stage.className = "sgw-stage";

  /* prev arrow */
  const btnPrev = document.createElement("button");
  btnPrev.className = "sgw-arrow sgw-prev";
  btnPrev.setAttribute("aria-label","Previous");
  btnPrev.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`;

  /* stack */
  const stackEl = document.createElement("div");
  stackEl.className = "sgw-stack";

  // ghost layers
  for (let i = 0; i < 3; i++) {
    const ghost = document.createElement("div");
    ghost.className = "sgw-ghost";
    stackEl.appendChild(ghost);
  }

  // card
  const card = document.createElement("div");
  card.className = "sgw-card";

  const counter = document.createElement("span");
  counter.className = "sgw-counter";

  const mainImg = document.createElement("img");
  mainImg.className = "sgw-main-img";
  mainImg.alt = "";

  const zoomBtn = document.createElement("a");
  zoomBtn.className = "sgw-zoom glightbox";
  zoomBtn.title = "";
  zoomBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>`;

  const caption = document.createElement("div");
  caption.className = "sgw-caption";
  caption.innerHTML = `<h4 class="sgw-cap-title"></h4><p class="sgw-cap-sub"></p>`;

  card.append(counter, mainImg, zoomBtn, caption);
  stackEl.appendChild(card);

  /* next arrow */
  const btnNext = document.createElement("button");
  btnNext.className = "sgw-arrow sgw-next";
  btnNext.setAttribute("aria-label","Next");
  btnNext.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`;

  stage.append(btnPrev, stackEl, btnNext);

  /* progress bar */
  const progressBar = document.createElement("div");
  progressBar.className = "sgw-progress";
  const progressFill = document.createElement("div");
  progressFill.className = "sgw-progress-fill";
  progressBar.appendChild(progressFill);

  /* thumbnail strip */
  const thumbsRow = document.createElement("div");
  thumbsRow.className = "sgw-thumbs";

  images.forEach((img, idx) => {
    const t = document.createElement("div");
    t.className = "sgw-thumb" + (idx === 0 ? " sgw-active" : "");
    const tImg = document.createElement("img");
    tImg.src = img.src;
    tImg.alt = img.title;
    tImg.loading = "lazy";
    t.appendChild(tImg);
    t.addEventListener("click", () => goTo(idx));
    thumbsRow.appendChild(t);
  });

  wrap.append(stage, progressBar, thumbsRow);
  // col already has label + wrap appended above

  /* ---- state helpers ---- */
  function updateUI() {
    const img = images[current];
    counter.textContent = `${current + 1} / ${images.length}`;
    caption.querySelector(".sgw-cap-title").textContent = img.title;
    caption.querySelector(".sgw-cap-sub").textContent   = cat.label;
    zoomBtn.href = img.src;
    zoomBtn.title = img.title;
    zoomBtn.setAttribute("data-gallery", img.gallery);
    progressFill.style.width = `${((current + 1) / images.length) * 100}%`;
    thumbsRow.querySelectorAll(".sgw-thumb").forEach((t, i) => t.classList.toggle("sgw-active", i === current));
    const activeThumb = thumbsRow.querySelectorAll(".sgw-thumb")[current];
    activeThumb && activeThumb.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }

  function goTo(idx, animate = true) {
    if (idx === current && animate) return;
    current = ((idx % images.length) + images.length) % images.length;
    if (animate) {
      mainImg.classList.add("sgw-fade-out");
      setTimeout(() => {
        mainImg.src = images[current].src;
        mainImg.alt = images[current].title;
        mainImg.classList.remove("sgw-fade-out");
        updateUI();
        /* re-init lightbox on new href */
        rebindLightbox();
      }, 280);
    } else {
      mainImg.src = images[current].src;
      mainImg.alt = images[current].title;
      updateUI();
    }
  }

  /* set initial */
  mainImg.src = images[0].src;
  mainImg.alt = images[0].title;
  updateUI();

  /* button events */
  btnPrev.addEventListener("click", () => goTo(current - 1));
  btnNext.addEventListener("click", () => goTo(current + 1));

  /* keyboard (only when widget is visible) */
  document.addEventListener("keydown", e => {
    if (col.style.display === "none") return;
    if (e.key === "ArrowLeft")  goTo(current - 1);
    if (e.key === "ArrowRight") goTo(current + 1);
  });

  /* auto-advance 
  let autoTimer = null;
  function startAuto() { autoTimer = setInterval(() => goTo(current + 1), 4500); }
  function stopAuto()  { clearInterval(autoTimer); }
  stackEl.addEventListener("mouseenter", stopAuto);
  stackEl.addEventListener("mouseleave", startAuto);
  startAuto();*/

  col._goTo = goTo; // expose for external use
  return col;
}

/* ------------------------------------------------------------------ */
/*  Re-init GLightbox after DOM changes                               */
/* ------------------------------------------------------------------ */
function rebindLightbox() {
  if (typeof GLightbox !== "undefined") {
    if (window._lightboxInstance) { try { window._lightboxInstance.destroy(); } catch(e){} }
    window._lightboxInstance = GLightbox({
      selector: ".sgw-zoom.glightbox",
      touchNavigation: true,
      loop: true,
      openEffect:  "zoom",
      closeEffect: "zoom"
    });
  }
}

/* ------------------------------------------------------------------ */
/*  Main render                                                        */
/* ------------------------------------------------------------------ */
function renderPortfolioDynamically() {
  const parentUL  = document.querySelector(".portfolio-flters");
  const childUL   = document.querySelector(".portfolio-subflters");
  const grid      = document.querySelector(".portfolio-container");
  if (!parentUL || !childUL || !grid) return;

  /* ---- Build parent tabs ---- */
  parentUL.querySelectorAll("li").forEach(li => li.remove());
  const fragParents = document.createDocumentFragment();

  const liAll = document.createElement("li");
  liAll.textContent = "All";
  liAll.dataset.filter = "*";
  liAll.dataset.role   = "parent";
  liAll.className = "filter-active";
  fragParents.appendChild(liAll);

  Object.entries(GROUPS).forEach(([key, g]) => {
    const li = document.createElement("li");
    li.textContent    = g.label;
    li.dataset.filter = `.${g.class}`;
    li.dataset.role   = "parent";
    li.dataset.group  = key;
    fragParents.appendChild(li);
  });
  parentUL.appendChild(fragParents);

  /* ---- Build gallery widgets (one per category) ---- */
  grid.innerHTML = "";
  // Ensure grid acts as a Bootstrap row for 2-col layout
  grid.classList.add("row", "gy-4");
  const widgets = {};
  PORTFOLIO_CONFIG.forEach(cat => {
    const w = buildGalleryWidget(cat);
    widgets[cat.id] = w;
    grid.appendChild(w);
  });

  /* ---- Show widgets by filter ---- */
  function showWidgets(filterClass) {
    Object.values(widgets).forEach(w => { w.style.display = "none"; });

    if (filterClass === "*") {
      /* "All": show ALL widgets in a 2×N grid */
      Object.values(widgets).forEach(w => { w.style.display = ""; });
    } else {
      /* Group filter: show all widgets in that group */
      const cls = filterClass.replace(".", "");
      Object.values(widgets).forEach(w => {
        if (w.classList.contains(cls)) w.style.display = "";
      });
    }
  }

  function showSingleWidget(catId) {
    Object.values(widgets).forEach(w => { w.style.display = "none"; });
    if (widgets[catId]) widgets[catId].style.display = "";
  }

  /* Initial: All view */
  showWidgets("*");
  rebindLightbox();

  /* ---- Child tabs ---- */
  function renderChildTabs(groupKey) {
    childUL.innerHTML = "";
    const kids = PORTFOLIO_CONFIG.filter(c => c.group === groupKey);
    if (!kids.length) { childUL.style.display = "none"; return; }
    const frag = document.createDocumentFragment();
    kids.forEach(cat => {
      const li = document.createElement("li");
      li.textContent    = cat.label;
      li.dataset.filter = `.${cat.id}`;
      li.dataset.catId  = cat.id;
      li.dataset.role   = "child";
      frag.appendChild(li);
    });
    childUL.appendChild(frag);
    childUL.style.display = "";
  }
  window._renderChildTabs = renderChildTabs;

  /* ---- Active state helper ---- */
  const setActive = (ul, el) => {
    ul.querySelectorAll("li").forEach(x => x.classList.remove("filter-active"));
    el && el.classList.add("filter-active");
  };

  /* ---- Parent click ---- */
  parentUL.addEventListener("click", e => {
    const li = e.target.closest("li");
    if (!li) return;
    e.preventDefault();
    setActive(parentUL, li);
    childUL.innerHTML = "";
    childUL.style.display = "none";

    const groupKey = li.dataset.group;
    if (!groupKey) {
      /* "All" */
      showWidgets("*");
    } else {
      /* Show all widgets in this group */
      showWidgets(li.dataset.filter);
      renderChildTabs(groupKey);
    }
    rebindLightbox();
  });

  /* ---- Child click ---- */
  childUL.addEventListener("click", e => {
    const li = e.target.closest("li");
    if (!li) return;
    e.preventDefault();
    setActive(childUL, li);
    showSingleWidget(li.dataset.catId);
    rebindLightbox();
  });

  /* AOS */
  if (typeof AOS !== "undefined") {
    AOS.init({ duration: 700, easing: "ease-out-quad", once: true, offset: 80 });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderPortfolioDynamically();
  if (typeof GLightbox !== "undefined") { rebindLightbox(); }
});