/* =========================================================
   Lê Thị Ngọc Hằng — Portfolio
   Interactions: loader, scroll reveal, nav, project modal/gallery
   ========================================================= */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     Twinkling stars overlay (decorative, purely visual)
  --------------------------------------------------------- */
  var starsField = document.getElementById('starsField');
  if (starsField && !prefersReducedMotion) {
    var STAR_COUNT = 32;
    var starsHtml = '';
    for (var s = 0; s < STAR_COUNT; s++) {
      var size = (Math.random() * 10 + 8).toFixed(1);
      var x = (Math.random() * 100).toFixed(1);
      var y = (Math.random() * 100).toFixed(1);
      var dur = (Math.random() * 2.5 + 2.5).toFixed(2);
      var delay = (Math.random() * 5).toFixed(2);
      var peak = (Math.random() * 0.35 + 0.55).toFixed(2);
      starsHtml += '<span class="star" style="--size:' + size + 'px; --x:' + x + '%; --y:' + y +
        '%; --dur:' + dur + 's; --delay:' + delay + 's; --peak:' + peak + '"></span>';
    }
    starsField.innerHTML = starsHtml;
  }

  /* ---------------------------------------------------------
     1. Page-load transition
  --------------------------------------------------------- */
  var loader = document.getElementById('loader');
  function revealPage() {
    document.body.classList.add('is-loaded');
    if (loader) {
      loader.classList.add('is-hidden');
      window.setTimeout(function () { loader.remove(); }, 1000);
    }
  }
  if (loader) {
    requestAnimationFrame(function () { loader.classList.add('is-ready'); });
    window.setTimeout(revealPage, prefersReducedMotion ? 50 : 650);
  } else {
    document.body.classList.add('is-loaded');
  }

  /* ---------------------------------------------------------
     2. Scroll progress bar + header state + back-to-top
  --------------------------------------------------------- */
  var progressBar = document.getElementById('progressBar');
  var siteHeader = document.getElementById('siteHeader');
  var backToTop = document.getElementById('backToTop');

  function onScroll() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = pct + '%';

    if (siteHeader) {
      siteHeader.classList.toggle('is-scrolled', scrollTop > 40);
    }
    if (backToTop) {
      backToTop.style.opacity = scrollTop > 500 ? '1' : '0';
      backToTop.style.pointerEvents = scrollTop > 500 ? 'auto' : 'none';
    }
    updateActiveNav();
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  if (backToTop) {
    backToTop.style.transition = 'opacity .3s ease, transform .35s var(--ease, ease), background .35s ease';
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------------------------------------------------------
     3. Custom cursor accent (desktop pointer only)
  --------------------------------------------------------- */
  var cursorDot = document.getElementById('cursorDot');
  if (cursorDot && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    window.addEventListener('mousemove', function (e) {
      cursorDot.style.left = e.clientX + 'px';
      cursorDot.style.top = e.clientY + 'px';
      cursorDot.classList.add('is-active');
    }, { passive: true });

    document.addEventListener('mouseleave', function () { cursorDot.classList.remove('is-active'); });

    var hoverTargets = 'a, button, .project-card, .gallery-arrow';
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest(hoverTargets)) cursorDot.classList.add('is-hover');
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest(hoverTargets)) cursorDot.classList.remove('is-hover');
    });
  } else if (cursorDot) {
    cursorDot.remove();
  }

  /* ---------------------------------------------------------
     4. Mobile nav toggle
  --------------------------------------------------------- */
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');

  function closeNav() {
    if (!navLinks) return;
    navLinks.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* ---------------------------------------------------------
     5. Smooth-scroll navigation + active link highlight
  --------------------------------------------------------- */
  var navAnchors = document.querySelectorAll('[data-nav]');
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  var navLinkEls = document.querySelectorAll('.nav-link');

  navAnchors.forEach(function (link) {
    link.addEventListener('click', function (e) {
      var href = link.getAttribute('href');
      if (!href || href.charAt(0) !== '#') return;
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      closeNav();
      var headerOffset = 76;
      var top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({ top: top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });

  function updateActiveNav() {
    var scrollPos = window.scrollY + 140;
    var current = sections.length ? sections[0].id : null;
    sections.forEach(function (sec) {
      if (scrollPos >= sec.offsetTop) current = sec.id;
    });
    navLinkEls.forEach(function (link) {
      var match = link.getAttribute('href') === '#' + current;
      link.classList.toggle('is-active', match);
    });
  }

  /* ---------------------------------------------------------
     6. Scroll-reveal via IntersectionObserver
  --------------------------------------------------------- */
  var revealEls = document.querySelectorAll('[data-reveal], [data-reveal-left], [data-reveal-right]');
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);

          // Trigger language bars once the education card is visible
          if (entry.target.classList.contains('education-card')) {
            entry.target.querySelectorAll('.lang-fill').forEach(function (bar, i) {
              window.setTimeout(function () { bar.classList.add('is-filled'); }, 200 + i * 180);
            });
          }
          // Trigger stat counters once the stats grid is visible
          if (entry.target.classList.contains('stat')) {
            animateCount(entry.target.querySelector('.stat-num'));
          }
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    document.querySelectorAll('.lang-fill').forEach(function (b) { b.classList.add('is-filled'); });
    document.querySelectorAll('.stat-num').forEach(animateCount);
  }

  /* ---------------------------------------------------------
     7. Animated stat counters
  --------------------------------------------------------- */
  function animateCount(el) {
    if (!el || el.dataset.counted) return;
    el.dataset.counted = 'true';
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var isDecimal = el.getAttribute('data-decimal') === 'true';
    var duration = 1400;
    var startTime = null;

    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = target * eased;
      el.textContent = (isDecimal ? current.toFixed(1) : Math.round(current)) + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = (isDecimal ? target.toFixed(1) : target) + suffix;
    }
    requestAnimationFrame(step);
  }

  /* ---------------------------------------------------------
     8. Project data + modal / gallery
  --------------------------------------------------------- */
  var PROJECTS = {
    trip: {
      tag: 'Event Planning · Coordination',
      title: 'Company Trip — MOR10 Anniversary',
      desc: "As core organizer, I brainstormed, planned, and coordinated the trip from the very first step — including a full series of events celebrating MOR Software's 10th anniversary. The scope covered vendor and venue logistics, a detailed run-of-show, staff satisfaction surveys, custom uniform production, and \u2018Bảo Tàng MOR10\u2019 — a first-of-its-kind virtual museum built for the team to relive a decade of memories."
    },
    yep: {
      tag: 'Event Planning · Vendor Management',
      title: 'Year End Party — Dream of Horizon',
      desc: "As core organizer, I planned the year-end celebration, working across departments to gather information for the rewards ceremony. I was also directly responsible for vendor relationships — venue, staging, and on-site facilities — to bring \u2018Dream of Horizon\u2019 to life."
    },
    badminton: {
      tag: 'Sports & Wellness',
      title: 'MSG Badminton Championship',
      desc: 'Badminton Championship is an annual sport event that encourages employees to interact with their co-workers while supporting mental and physical health. Season 2 brought teams together for a day of friendly competition.'
    },
    other: {
      tag: 'Culture & Engagement',
      title: 'Year-Round Culture Activities',
      desc: "Alongside the flagship annual events, I own the internal activities calendar that connects and boosts employee experience — Mid-Autumn Festival, International Men's & Women's Day, a spring festival charity fundraiser, and the office Christmas party. My role spans ideation, key messaging, office decoration, and hosting each program as MC."
    },
    procurement: {
      tag: 'Office Operations · Procurement',
      title: 'Office Renovation & Procurement',
      desc: "Took ownership of office operations projects such as facilities replacement, renovation, and expansion — sourcing and evaluating suitable suppliers, negotiating pricing, and managing the full purchasing process from request to delivery."
    },
    payment: {
      tag: 'Procurement · Payment & Documentation',
      title: 'Budget & Payment Processing',
      desc: "Responsible for the financial side of procurement — collecting and comparing quotations, confirming budgets with stakeholders, and implementing the payment process end to end for approved purchases."
    },
    policy: {
      tag: 'HR Policy · Compliance',
      title: 'Employee Handbook & Policy Refresh',
      desc: "Led the review and rewrite of internal HR policies and the employee handbook, working with department leads to align documentation with current labor regulations and company growth."
    }
  };

  /* Auto-detect gallery images: for each project folder, probe files named
     "<key>-01.jpg", "<key>-02.jpg", ... (2-digit, 3-digit, or unpadded;
     .jpg/.png/.jpeg) until a number is missing. Adding a new photo to the
     folder (next number in the sequence) then shows up automatically —
     no code change needed, as long as the numbering stays contiguous. */
  function tryImage(src) {
    return new Promise(function (resolve) {
      var img = new Image();
      img.onload = function () { resolve(src); };
      img.onerror = function () { resolve(null); };
      img.src = src;
    });
  }

  function findNumberedImage(folder, prefix, n) {
    var numForms = [String(n).padStart(2, '0'), String(n).padStart(3, '0'), String(n)];
    var exts = ['jpg', 'png', 'jpeg'];
    var candidates = [];
    numForms.forEach(function (num) {
      exts.forEach(function (ext) {
        var src = 'images/' + folder + '/' + prefix + num + '.' + ext;
        if (candidates.indexOf(src) === -1) candidates.push(src);
      });
    });
    return candidates.reduce(function (chain, src) {
      return chain.then(function (found) { return found || tryImage(src); });
    }, Promise.resolve(null));
  }

  function autoDetectImages(folder, prefix) {
    var files = [];
    var MAX = 200;
    function step(n) {
      if (n > MAX) return Promise.resolve(files);
      return findNumberedImage(folder, prefix, n).then(function (src) {
        if (!src) return files;
        files.push(src.substring(('images/' + folder + '/').length));
        return step(n + 1);
      });
    }
    return step(1);
  }

  var modalOverlay = document.getElementById('modalOverlay');
  var modalImageLayers = [document.getElementById('modalImageA'), document.getElementById('modalImageB')];
  var activeLayer = 0;
  var modalTag = document.getElementById('modalTag');
  var modalTitle = document.getElementById('modalTitle');
  var modalDesc = document.getElementById('modalDesc');
  var modalClose = document.getElementById('modalClose');
  var galleryPrev = document.getElementById('galleryPrev');
  var galleryNext = document.getElementById('galleryNext');
  var galleryDots = document.getElementById('galleryDots');
  var modalLoader = document.getElementById('modalLoader');

  var currentProject = null;
  var currentFolder = null;
  var currentIndex = 0;
  var lastFocusedEl = null;
  var loadToken = 0;

  function clearImageLayers() {
    loadToken++;
    modalImageLayers.forEach(function (layer) {
      layer.classList.remove('is-shown');
      layer.removeAttribute('src');
      layer.alt = '';
    });
  }

  /* Two stacked <img> layers cross-fade between each other: the incoming
     photo is preloaded off-screen and only swapped in once fully decoded,
     then the outgoing layer fades out at the same time. This avoids the
     "new photo painted over the old one" artifact WebKit/iPadOS shows when
     a single <img>'s src is swapped mid-transition, and it removes the old
     fixed loading delay since we're not waiting on an arbitrary timer. */
  function loadImage(index) {
    if (!currentProject) return;
    currentIndex = (index + currentProject.images.length) % currentProject.images.length;
    var src = 'images/' + currentFolder + '/' + currentProject.images[currentIndex];
    var alt = currentProject.title + ' — photo ' + (currentIndex + 1);
    var thisLoad = ++loadToken;

    modalLoader.classList.add('is-visible');

    var preloader = new Image();
    preloader.onload = preloader.onerror = function () {
      if (thisLoad !== loadToken) return;
      modalLoader.classList.remove('is-visible');
      var incoming = modalImageLayers[1 - activeLayer];
      var outgoing = modalImageLayers[activeLayer];
      incoming.src = src;
      incoming.alt = alt;
      incoming.classList.add('is-shown');
      outgoing.classList.remove('is-shown');
      activeLayer = 1 - activeLayer;
    };
    preloader.src = src;

    galleryDots.querySelectorAll('button').forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === currentIndex);
    });
  }

  function buildDots(count) {
    galleryDots.innerHTML = '';
    for (var i = 0; i < count; i++) {
      var dot = document.createElement('button');
      dot.setAttribute('aria-label', 'Go to image ' + (i + 1));
      (function (idx) {
        dot.addEventListener('click', function () { loadImage(idx); });
      })(i);
      galleryDots.appendChild(dot);
    }
  }

  function showGallery(data) {
    if (currentProject !== data) return;
    var hasMultiple = data.images.length > 1;
    var hasAny = data.images.length > 0;
    galleryPrev.style.display = hasMultiple ? 'flex' : 'none';
    galleryNext.style.display = hasMultiple ? 'flex' : 'none';
    galleryDots.style.display = hasMultiple ? 'flex' : 'none';

    if (!hasAny) {
      clearImageLayers();
      modalLoader.classList.remove('is-visible');
      return;
    }

    buildDots(data.images.length);
    loadImage(0);
  }

  function openModal(keyFolder, keyProject, triggerEl) {
    var data = PROJECTS[keyProject];
    if (!data) return;
    currentProject = data;
    currentFolder = keyFolder;
    lastFocusedEl = triggerEl || document.activeElement;

    modalTag.textContent = data.tag;
    modalTitle.textContent = data.title;
    modalDesc.textContent = data.desc;

    modalOverlay.classList.add('is-open');
    document.documentElement.classList.add('no-scroll');
    modalClose.focus();

    if (data.images) {
      showGallery(data);
    } else {
      clearImageLayers();
      modalLoader.classList.add('is-visible');
      autoDetectImages(keyFolder, keyProject + '-').then(function (images) {
        data.images = images;
        showGallery(data);
      });
    }
  }

  function closeModal() {
    modalOverlay.classList.remove('is-open');
    document.documentElement.classList.remove('no-scroll');
    currentProject = null;
    currentFolder = null;
    if (lastFocusedEl) lastFocusedEl.focus();
  }

  document.querySelectorAll('.project-card').forEach(function (card) {
    card.addEventListener('click', function () {
      openModal(card.getAttribute('data-folder'), card.getAttribute('data-project'), card);
    });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(card.getAttribute('data-folder'), card.getAttribute('data-project'), card);
      }
    });
  });

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', function (e) {
      if (e.target === modalOverlay) closeModal();
    });
  }
  if (galleryPrev) galleryPrev.addEventListener('click', function () { loadImage(currentIndex - 1); });
  if (galleryNext) galleryNext.addEventListener('click', function () { loadImage(currentIndex + 1); });

  document.addEventListener('keydown', function (e) {
    if (!modalOverlay.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft') loadImage(currentIndex - 1);
    if (e.key === 'ArrowRight') loadImage(currentIndex + 1);
  });

  // Basic swipe support for the gallery on touch devices
  (function enableSwipe() {
    var frame = document.querySelector('.modal-image-frame');
    if (!frame) return;
    var startX = 0;
    frame.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    frame.addEventListener('touchend', function (e) {
      var diff = e.changedTouches[0].clientX - startX;
      if (Math.abs(diff) > 40) loadImage(currentIndex + (diff < 0 ? 1 : -1));
    }, { passive: true });
  })();

  /* ---------------------------------------------------------
     Background gallery preloader — after the page has settled,
     quietly walks every project's gallery using
     requestIdleCallback so it only runs when the browser has
     spare time, never competing with scrolling or interaction.
     Each project is detected and preloaded one image at a time
     (never in parallel), and the result is cached onto
     PROJECTS[key].images — the same cache the modal already
     checks — so opening a project later skips detection
     entirely and shows already-cached photos instantly.
  --------------------------------------------------------- */
  var idleCallback = window.requestIdleCallback || function (cb) {
    return window.setTimeout(function () {
      cb({ didTimeout: false, timeRemaining: function () { return 50; } });
    }, 300);
  };

  function preloadImageList(folder, images) {
    return images.reduce(function (chain, filename) {
      return chain.then(function () {
        return new Promise(function (resolve) {
          idleCallback(function () {
            var img = new Image();
            img.onload = img.onerror = resolve;
            img.src = 'images/' + folder + '/' + filename;
          });
        });
      });
    }, Promise.resolve());
  }

  function preloadProjectGallery(folder, projectKey) {
    var data = PROJECTS[projectKey];
    if (!data) return Promise.resolve();
    if (data.images) return preloadImageList(folder, data.images);
    return autoDetectImages(folder, projectKey + '-').then(function (images) {
      data.images = images;
      return preloadImageList(folder, images);
    });
  }

  function preloadAllGalleriesInBackground() {
    var queue = [];
    document.querySelectorAll('.project-card').forEach(function (card) {
      var folder = card.getAttribute('data-folder');
      var projectKey = card.getAttribute('data-project');
      if (folder && projectKey) queue.push({ folder: folder, projectKey: projectKey });
    });

    queue.reduce(function (chain, item) {
      return chain.then(function () { return preloadProjectGallery(item.folder, item.projectKey); });
    }, Promise.resolve());
  }

  /* ---------------------------------------------------------
     Init
  --------------------------------------------------------- */
  onScroll();
  idleCallback(preloadAllGalleriesInBackground);
})();
