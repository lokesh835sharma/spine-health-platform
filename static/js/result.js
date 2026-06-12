/* ============================================================
   RESULT.JS — Risk meter animation, factor bars, count-up
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Animated counter ---- */
  function animateCount(el, from, to, duration = 1500) {
    const start = performance.now();
    const update = (time) => {
      const progress = Math.min((time - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.round(from + (to - from) * eased);
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  /* ---- Risk meter ---- */
  const meterFill   = document.getElementById('riskMeterFill');
  const meterNeedle = document.getElementById('riskMeterNeedle');
  const scoreDisplay = document.getElementById('riskScoreDisplay');

  if (meterFill && typeof riskScore !== 'undefined') {
    // Short delay so user sees the animation
    setTimeout(() => {
      meterFill.style.width   = riskScore + '%';
      if (meterNeedle) meterNeedle.style.left = riskScore + '%';
      // Apply color from backend
      if (typeof riskColor !== 'undefined') {
        meterFill.style.background = riskColor;
      }
    }, 300);

    if (scoreDisplay) {
      setTimeout(() => animateCount(scoreDisplay, 0, riskScore, 1500), 300);
    }
  }

  /* ---- Factor bars ---- */
  const factorBars = document.querySelectorAll('.factor-bar');
  const barObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const targetWidth = e.target.dataset.width || '0%';
          setTimeout(() => {
            e.target.style.width = targetWidth;
          }, 200);
          barObserver.unobserve(e.target);
        }
      });
    },
    { threshold: 0.3 }
  );
  factorBars.forEach(bar => {
    bar.style.width = '0%';
    barObserver.observe(bar);
  });

  /* ---- Animate-up cards ---- */
  const animCards = document.querySelectorAll('.animate-up');
  const cardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.animationPlayState = 'running';
          cardObserver.unobserve(e.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  animCards.forEach(el => {
    el.style.animationPlayState = 'paused';
    cardObserver.observe(el);
  });

  /* ---- Risk hero card entrance ---- */
  const heroCard = document.querySelector('.result-hero-card');
  if (heroCard) {
    heroCard.style.opacity = '0';
    heroCard.style.transform = 'translateY(24px)';
    heroCard.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    setTimeout(() => {
      heroCard.style.opacity = '1';
      heroCard.style.transform = 'translateY(0)';
    }, 100);
  }

});
