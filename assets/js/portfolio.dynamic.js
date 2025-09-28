/* ==== Dynamic Projects renderer ======================================= */
/* Configure your categories once, the script will build filters + cards. */
// Parent groups
const GROUPS = {
  custom: { label: "Custom Homes", class: "g-custom" },
  subdiv: { label: "Sub Divisions", class: "g-subdiv" }
};

// Children with group mapping
const PORTFOLIO_CONFIG = [
  { id: "filter-remodeling",   label: "Custom Homes 1", group: "custom", folder: "proj-01", gallery: "portfolio-gallery-remodeling",  count: 6 },
  { id: "filter-construction", label: "Custom Homes 2", group: "custom", folder: "proj-02", gallery: "portfolio-gallery-construction", count: 6 },
  { id: "filter-repairs",      label: "Custom Homes 3", group: "custom", folder: "proj-03", gallery: "portfolio-gallery-repairs",      count: 6 },
  { id: "filter-design",       label: "Custom Homes 4", group: "custom", folder: "proj-04", gallery: "portfolio-gallery-book",         count: 6 },

  { id: "filter-project5",     label: "Sub Divisions 1", group: "subdiv", folder: "proj-05", gallery: "portfolio-gallery-book",         count: 6 },
  { id: "filter-project6",     label: "Sub Divisions 2", group: "subdiv", folder: "proj-06", gallery: "portfolio-gallery-book",         count: 4 },
  { id: "filter-project7",     label: "Sub Divisions 3", group: "subdiv", folder: "proj-07", gallery: "portfolio-gallery-book",         count: 3 },
  { id: "filter-project8",     label: "Sub Divisions 4", group: "subdiv", folder: "proj-08", gallery: "portfolio-gallery-book",         count: 11 }
];


function renderPortfolioDynamically() {
  const parentUL = document.querySelector(".portfolio-flters");      // top bar (All, parents)
  const childUL  = document.querySelector(".portfolio-subflters");   // second bar (children)
  const grid     = document.querySelector(".portfolio-container");
  if (!parentUL || !childUL || !grid) return;
  
  /* ensure childUL exists *after* parentUL */
  if (!childUL) {
    childUL = document.createElement("ul");
    childUL.className = "portfolio-subflters";
    parentUL.insertAdjacentElement("afterend", childUL);
  }

  // ----- Build PARENT filter tabs -----
  const fragParents = document.createDocumentFragment();

  const liAll = document.createElement("li");
  liAll.textContent = "All";
  liAll.dataset.filter = "*";
  liAll.dataset.role = "parent";
  liAll.className = "filter-active";
  fragParents.appendChild(liAll);

  Object.entries(GROUPS).forEach(([key, g]) => {
    const li = document.createElement("li");
    li.textContent = g.label;
    li.dataset.filter = `.${g.class}`;  // parent filter targets group class
    li.dataset.role = "parent";
    li.dataset.group = key;             // remember which group
    fragParents.appendChild(li);
  });

  //parentUL.innerHTML = "";
  // only remove LI children (don’t nuke sibling childUL)
  parentUL.querySelectorAll("li").forEach(li => li.remove());
  parentUL.appendChild(fragParents);

  // ----- Build CARDS (each gets both a child-class and a group-class) -----
  const fragCards = document.createDocumentFragment();
  PORTFOLIO_CONFIG.forEach(cat => {
    const g = GROUPS[cat.group];
    for (let i = 1; i <= cat.count; i++) {
      const n2 = String(i).padStart(2, "0");
      const imgPath = `assets/img/${cat.folder}/pic${n2}.jpg`;
      const title   = `${cat.label}-${n2}`;

      const col = document.createElement("div");
      col.className = `col-lg-4 col-md-6 portfolio-item ${cat.id} ${g.class}`;

      col.innerHTML = `
        <div class="portfolio-content h-100">
          <img src="${imgPath}" class="img-fluid" alt="${title}">
          <div class="portfolio-info">
            <h4>${title}</h4>
            <a href="${imgPath}" title="${title}"
               data-gallery="${cat.gallery}"
               class="glightbox preview-link">
              <i class="bi bi-zoom-in"></i>
            </a>
          </div>
        </div>
      `;
      fragCards.appendChild(col);
    }
  });
  grid.innerHTML = "";
  grid.appendChild(fragCards);

  // ----- Build CHILD tabs on demand -----
  function renderChildTabs(groupKey) {
    childUL.innerHTML = "";
    const kids = PORTFOLIO_CONFIG.filter(c => c.group === groupKey);
    if (!kids.length) { childUL.style.display = "none"; return; }

    const frag = document.createDocumentFragment();
    kids.forEach(cat => {
      const li = document.createElement("li");
      li.textContent = cat.label;
      li.dataset.filter = `.${cat.id}`;  // child filter targets child class
      li.dataset.role = "child";
      frag.appendChild(li);
    });
    childUL.appendChild(frag);
    childUL.style.display = ""; // show row
  }
  
  // expose for outside handlers (optional)
  window._renderChildTabs = renderChildTabs;
}

document.addEventListener("DOMContentLoaded", () => {
  renderPortfolioDynamically();

  // Lightbox
  if (typeof GLightbox !== "undefined") {
    GLightbox({ selector: ".glightbox", touchNavigation: true, loop: true, openEffect: "zoom", closeEffect: "zoom" });
  }

  // Isotope
  const container = document.querySelector(".portfolio-container");
  const childUL   = document.querySelector(".portfolio-subflters");
  const parentUL  = document.querySelector(".portfolio-flters");

  const startIso = () => {
    window._isoInstance && window._isoInstance.destroy?.();
    window._isoInstance = new Isotope(container, {
      itemSelector: ".portfolio-item",
      layoutMode: "masonry",
      percentPosition: true,
      masonry: { columnWidth: ".portfolio-item", gutter: 0 }
    });
  };
  if (container && typeof Isotope !== "undefined") {
    if (document.readyState === "complete") startIso();
    else window.addEventListener("load", startIso, { once: true });
  }

  // Helpers to set active styles
  const setActive = (ul, el) => {
    ul.querySelectorAll("li").forEach(x => x.classList.remove("filter-active"));
    el && el.classList.add("filter-active");
  };

  // Parent clicks: filter by group, and (re)render child row
  parentUL.addEventListener("click", (e) => {
    const li = e.target.closest("li");
    if (!li) return;
    e.preventDefault();

    setActive(parentUL, li);
    const filter = li.dataset.filter || "*";
    window._isoInstance && window._isoInstance.arrange({ filter });

    // If "All" -> hide child row; otherwise render children for that group
    const groupKey = li.dataset.group;
    if (!groupKey) {
      childUL.style.display = "none";
      childUL.innerHTML = "";
    } else {
      // Build child tabs for this group
      childUL.innerHTML = "";
      const kids = PORTFOLIO_CONFIG.filter(c => c.group === groupKey);
      if (kids.length) {
        const frag = document.createDocumentFragment();
        kids.forEach(cat => {
          const chi = document.createElement("li");
          chi.textContent = cat.label;
          chi.dataset.filter = `.${cat.id}`;
          chi.dataset.role = "child";
          frag.appendChild(chi);
        });
        childUL.appendChild(frag);
        childUL.style.display = "";
      }
    }
  });

  // Child clicks: filter by specific child
  childUL.addEventListener("click", (e) => {
    const li = e.target.closest("li");
    if (!li) return;
    e.preventDefault();
    setActive(childUL, li);
    const filter = li.dataset.filter || "*";
    window._isoInstance && window._isoInstance.arrange({ filter });
  });

  // AOS
  if (typeof AOS !== "undefined") {
    AOS.init({ duration: 700, easing: "ease-outQuad", once: true, offset: 80 });
  }
});
