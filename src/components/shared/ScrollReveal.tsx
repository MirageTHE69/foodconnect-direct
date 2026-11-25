import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Fades/slides content in as it scrolls into view.
 * Applies to section content inside any [data-reveal-root] wrapper, and staggers
 * the children of any [data-stagger] grid. Skips the hero (it has its own entrance).
 */
const SELECTOR = "[data-reveal-root] section > .container > *, [data-stagger] > *";

export function ScrollReveal() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    const scan = () => {
      document.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
        if (el.classList.contains("reveal") || el.closest("#hero, [data-no-reveal]")) return;
        const parent = el.parentElement;
        const index = parent?.hasAttribute("data-stagger") ? Array.from(parent.children).indexOf(el) % 8 : 0;
        el.style.setProperty("--reveal-i", String(index));
        el.classList.add("reveal");
        io.observe(el);
      });
    };

    scan();
    // Content loaded later (categories, products) gets picked up too.
    let frame = 0;
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(scan);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(frame);
      mo.disconnect();
      io.disconnect();
    };
  }, [pathname]);

  return null;
}

/** Thin progress bar at the top of the page showing scroll position. */
export function ScrollProgress() {
  useEffect(() => {
    const bar = document.getElementById("scroll-progress");
    if (!bar) return;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      id="scroll-progress"
      aria-hidden
      className="fixed top-0 left-0 right-0 h-[3px] z-[60] origin-left bg-gradient-to-r from-primary via-primary to-brand-orange"
      style={{ transform: "scaleX(0)" }}
    />
  );
}
