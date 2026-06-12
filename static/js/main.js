/* ============================================================
   MAIN.JS — Shared utilities, navbar, scroll effects
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Navbar scroll effect ---- */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const onScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 30);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- Mobile nav toggle ---- */
  const navToggle = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const isOpen = navLinks.classList.contains('open');
      navToggle.setAttribute('aria-expanded', isOpen);
    });
    // Close on link click
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }

  /* ---- Intersection Observer for .animate-up ---- */
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.animationPlayState = 'running';
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll('.animate-up').forEach(el => {
    el.style.animationPlayState = 'paused';
    observer.observe(el);
  });

  /* ---- Risk bar entry animation (home page) ---- */
  const riskBars = document.querySelectorAll('.risk-bar');
  const riskObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const target = e.target.style.width;
          e.target.style.width = '0';
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              e.target.style.width = target;
            });
          });
          riskObserver.unobserve(e.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  riskBars.forEach(bar => riskObserver.observe(bar));

});
