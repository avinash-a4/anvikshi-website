/* ===================================================
   ANVIKSHI SOLUTIONS — Interactivity & Animations
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- NAVBAR SCROLL EFFECT ---------- */
  const navbar = document.getElementById('navbar');
  const handleNavScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  /* ---------- HAMBURGER / MOBILE NAV ---------- */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('mobile-open');
    navbar.classList.toggle('menu-open');
    document.body.style.overflow = navLinks.classList.contains('mobile-open') ? 'hidden' : '';
  });

  // Close mobile nav on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (navLinks.classList.contains('mobile-open')) {
        hamburger.classList.remove('active');
        navLinks.classList.remove('mobile-open');
        navbar.classList.remove('menu-open');
        document.body.style.overflow = '';
      }
    });
  });

  /* ---------- DROPDOWN (DESKTOP) ---------- */
  const dropdown = document.getElementById('servicesDropdown');
  let dropdownTimeout;

  dropdown.addEventListener('mouseenter', () => {
    clearTimeout(dropdownTimeout);
    dropdown.classList.add('open');
  });
  dropdown.addEventListener('mouseleave', () => {
    dropdownTimeout = setTimeout(() => dropdown.classList.remove('open'), 200);
  });

  // Touch support for mobile
  dropdown.querySelector('.dropdown-trigger').addEventListener('click', (e) => {
    if (window.innerWidth <= 768) {
      e.preventDefault();
      dropdown.classList.toggle('open');
    }
  });

  /* ---------- SMOOTH SCROLL ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = navbar.offsetHeight + 20;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ---------- SCROLL REVEAL (INTERSECTION OBSERVER) ---------- */
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Stagger children slightly
        const parent = entry.target.closest('.about-grid, .pillars-grid, .industries-grid, .partners-row');
        if (parent) {
          const siblings = parent.querySelectorAll('.reveal');
          const index = Array.from(siblings).indexOf(entry.target);
          entry.target.style.transitionDelay = `${index * 120}ms`;
        }
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  /* ---------- CONTACT FORM (handled by form-handler.js) ---------- */

  /* ---------- ACTIVE NAV LINK ON SCROLL ---------- */
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = navLinks.querySelectorAll('a[href^="#"]');

  const highlightNav = () => {
    const scrollY = window.scrollY + 200;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollY >= top && scrollY < top + height) {
        navAnchors.forEach(a => {
          a.style.color = '';
          if (a.getAttribute('href') === '#' + id) {
            a.style.color = 'var(--orange)';
          }
        });
      }
    });
  };
  window.addEventListener('scroll', highlightNav, { passive: true });

});
