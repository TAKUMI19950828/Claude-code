// しょうぎむすめ！ 紹介サイト 演出スクリプト
(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ===== 舞い散る花びらと駒 =====
  function spawnPetals() {
    if (reduceMotion) return;
    const field = document.querySelector(".petal-field");
    if (!field) return;
    const glyphs = ["🌸", "✿", "歩", "✦", "♥", "❀"];
    const colors = ["#ff9dc2", "#7cd8d0", "#b794ec", "#ffd86f"];
    const count = window.innerWidth < 720 ? 12 : 22;
    for (let i = 0; i < count; i += 1) {
      const petal = document.createElement("span");
      petal.className = "petal";
      petal.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
      petal.style.left = `${Math.random() * 100}%`;
      petal.style.color = colors[Math.floor(Math.random() * colors.length)];
      petal.style.fontSize = `${12 + Math.random() * 16}px`;
      petal.style.opacity = `${0.35 + Math.random() * 0.45}`;
      petal.style.animationDuration = `${9 + Math.random() * 12}s`;
      petal.style.animationDelay = `${-Math.random() * 15}s`;
      field.appendChild(petal);
    }
  }

  // ===== スクロールで要素をふわっと表示 =====
  function setupReveal() {
    const targets = document.querySelectorAll(
      ".story-text, .char-spotlight, .feature-card, .system-card"
    );
    if (reduceMotion || !("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("in"));
      return;
    }
    targets.forEach((el, index) => {
      el.classList.add("reveal");
      el.style.transitionDelay = `${(index % 4) * 80}ms`;
    });
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    targets.forEach((el) => observer.observe(el));
  }

  // ===== トップへ戻るボタン =====
  function setupBackToTop() {
    const button = document.querySelector(".back-to-top");
    if (!button) return;
    const toggle = () => button.classList.toggle("show", window.scrollY > 600);
    window.addEventListener("scroll", toggle, { passive: true });
    toggle();
  }

  // ===== 現在地のナビをハイライト =====
  function setupNavHighlight() {
    const links = [...document.querySelectorAll(".nav-links a")];
    const map = new Map();
    links.forEach((link) => {
      const section = document.querySelector(link.getAttribute("href"));
      if (section) map.set(section, link);
    });
    if (!map.size || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            links.forEach((l) => l.classList.remove("active"));
            map.get(entry.target)?.classList.add("active");
          }
        });
      },
      { threshold: 0.4 }
    );
    map.forEach((_, section) => observer.observe(section));
  }

  // ===== ご褒美CGギャラリーのライトボックス =====
  function setupLightbox() {
    const items = document.querySelectorAll(".char-gallery-item");
    if (!items.length) return;

    const overlay = document.createElement("div");
    overlay.className = "lightbox";
    overlay.innerHTML = `
      <div class="lightbox-inner">
        <button type="button" class="lightbox-close" aria-label="閉じる">×</button>
        <img class="lightbox-img" src="" alt="" />
        <p class="lightbox-caption"></p>
      </div>`;
    document.body.appendChild(overlay);

    const img = overlay.querySelector(".lightbox-img");
    const caption = overlay.querySelector(".lightbox-caption");
    const closeBtn = overlay.querySelector(".lightbox-close");

    function open(item) {
      const full = item.dataset.full || item.querySelector("img")?.src || "";
      const alt = item.querySelector("img")?.alt || "";
      img.src = full;
      img.alt = alt;
      caption.textContent = item.dataset.caption || alt;
      overlay.classList.add("show");
      document.body.classList.add("lightbox-open");
    }
    function close() {
      overlay.classList.remove("show");
      document.body.classList.remove("lightbox-open");
      img.src = "";
    }

    items.forEach((item) => {
      item.addEventListener("click", () => open(item));
    });
    closeBtn.addEventListener("click", close);
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) close();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") close();
    });
  }

  // ===== Xシェアリンクを現在のURLで生成 =====
  function setupShare() {
    const share = document.querySelector(".footer-share-x");
    if (!share) return;
    const url = location.href.split("#")[0];
    const text = "かわいい3人と指す、ブラウザだけで遊べる美少女将棋『しょうぎむすめ！』";
    share.href =
      "https://twitter.com/intent/tweet?text=" +
      encodeURIComponent(text) +
      "&url=" +
      encodeURIComponent(url) +
      "&hashtags=" +
      encodeURIComponent("しょうぎむすめ");
  }

  // ===== CTAクリック計測（gtag / dataLayer があれば送信、無ければ無害） =====
  function setupCtaTracking() {
    document.querySelectorAll("[data-cta]").forEach((el) => {
      el.addEventListener("click", () => {
        const id = el.dataset.cta;
        if (typeof window.gtag === "function") {
          window.gtag("event", "cta_click", { cta_id: id });
        } else if (Array.isArray(window.dataLayer)) {
          window.dataLayer.push({ event: "cta_click", cta_id: id });
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    spawnPetals();
    setupReveal();
    setupBackToTop();
    setupNavHighlight();
    setupLightbox();
    setupShare();
    setupCtaTracking();
  });
})();
