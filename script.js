const yearNode = document.getElementById("year");
const cursorGlow = document.querySelector(".cursor-glow");
const revealNodes = document.querySelectorAll("[data-reveal]");
const metricValues = document.querySelectorAll("[data-count]");
const menuToggle = document.querySelector(".menu-toggle");
const header = document.querySelector(".site-header");
const internalLinks = document.querySelectorAll('a[href^="#"]');

if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

if (window.matchMedia("(prefers-reduced-motion: no-preference)").matches && cursorGlow) {
  window.addEventListener("pointermove", (event) => {
    cursorGlow.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
  });
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 }
);

revealNodes.forEach((node) => revealObserver.observe(node));

const animateMetric = (node) => {
  const rawTarget = Number(node.dataset.count);
  const isDecimal = String(node.dataset.count).includes(".");
  const isYear = rawTarget >= 1900;
  const duration = 1200;
  const startTime = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = rawTarget * eased;

    if (isYear) {
      node.textContent = Math.round(value);
    } else if (isDecimal) {
      node.textContent = value.toFixed(2);
    } else {
      node.textContent = Math.round(value);
    }

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
};

const metricObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateMetric(entry.target);
        metricObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.6 }
);

metricValues.forEach((metric) => metricObserver.observe(metric));

const scrollToSection = (hash) => {
  if (!hash || hash === "#") {
    return;
  }

  const target = document.querySelector(hash);
  if (!target) {
    return;
  }

  const headerOffset = header ? header.offsetHeight + 28 : 28;
  const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;

  window.scrollTo({
    top,
    behavior: "smooth",
  });
};

internalLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const { hash } = link;
    if (!hash) {
      return;
    }

    event.preventDefault();
    scrollToSection(hash);
    window.history.replaceState(null, "", hash);
  });
});

if (menuToggle && header) {
  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    header.classList.toggle("nav-open", !expanded);
    document.body.classList.toggle("menu-open", !expanded);
  });

  header.querySelectorAll(".site-nav a").forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle.setAttribute("aria-expanded", "false");
      header.classList.remove("nav-open");
      document.body.classList.remove("menu-open");
    });
  });
}

if (window.location.hash) {
  window.addEventListener("load", () => {
    scrollToSection(window.location.hash);
  });
}
