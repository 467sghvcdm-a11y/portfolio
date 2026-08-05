(function () {
  var EXCLUDE_SELECTOR = '.cs-recognition-badge, .hero-img img, .cs-video img';
  var GROUP_SELECTOR = '.cs-recipe-pair, figure';
  var CANDIDATE_SELECTOR = '.card img, .cs-recipe img, #essay-drawer-body img';

  var refs = null;
  var wired = typeof WeakSet !== 'undefined' ? new WeakSet() : null;
  var elToGroup = new Map();
  var lastFocused = null;
  var currentGroup = [];
  var currentIndex = 0;

  function captionFor(el) {
    var recipe = el.closest('.cs-recipe');
    if (recipe) {
      var label = recipe.querySelector('.cs-recipe-label');
      if (label) return label.textContent.trim();
    }
    var figure = el.closest('figure');
    if (figure) {
      var figcap = figure.querySelector('figcaption');
      if (figcap) return figcap.textContent.trim();
    }
    return '';
  }

  function buildOverlay() {
    var overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('tabindex', '-1');

    var figureWrap = document.createElement('div');
    figureWrap.className = 'lightbox-figure';
    overlay.appendChild(figureWrap);

    var img = document.createElement('img');
    figureWrap.appendChild(img);

    var prevBtn = document.createElement('button');
    prevBtn.className = 'lightbox-nav lightbox-prev';
    prevBtn.setAttribute('aria-label', 'Previous image');
    prevBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    overlay.appendChild(prevBtn);

    var nextBtn = document.createElement('button');
    nextBtn.className = 'lightbox-nav lightbox-next';
    nextBtn.setAttribute('aria-label', 'Next image');
    nextBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 14 14" fill="none"><path d="M5 2l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    overlay.appendChild(nextBtn);

    var info = document.createElement('div');
    info.className = 'lightbox-info';
    overlay.appendChild(info);

    var caption = document.createElement('div');
    caption.className = 'lightbox-caption';
    info.appendChild(caption);

    var counter = document.createElement('div');
    counter.className = 'lightbox-counter';
    info.appendChild(counter);

    var closeBtn = document.createElement('button');
    closeBtn.className = 'lightbox-close';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 14 14" fill="none"><path d="M1.5 1.5l11 11M12.5 1.5l-11 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
    overlay.appendChild(closeBtn);

    document.body.appendChild(overlay);
    return { overlay: overlay, figureWrap: figureWrap, img: img, info: info, caption: caption, prevBtn: prevBtn, nextBtn: nextBtn, counter: counter, closeBtn: closeBtn };
  }

  function unzoom() {
    refs.overlay.classList.remove('lightbox-zoomed');
    refs.img.classList.remove('lightbox-zoomed-img');
  }

  function render() {
    var el = currentGroup[currentIndex];
    unzoom();
    refs.img.src = el.currentSrc || el.src;
    refs.img.alt = el.alt || '';
    var captionText = captionFor(el);
    refs.caption.textContent = captionText;
    var multi = currentGroup.length > 1;
    refs.prevBtn.style.display = multi ? '' : 'none';
    refs.nextBtn.style.display = multi ? '' : 'none';
    refs.counter.style.display = multi ? '' : 'none';
    if (multi) refs.counter.textContent = (currentIndex + 1) + ' / ' + currentGroup.length;
    refs.info.style.display = (captionText || multi) ? '' : 'none';
  }

  function open(el) {
    lastFocused = document.activeElement;
    currentGroup = elToGroup.get(el) || [el];
    currentIndex = currentGroup.indexOf(el);
    if (currentIndex < 0) currentIndex = 0;
    // Images inside the homepage's essay drawer sit on a dark floating
    // panel over the starfield, not a bone card, so the lightbox itself
    // should read dark there instead of the usual bone/card treatment.
    refs.overlay.classList.toggle('lightbox-dark', !!el.closest('#essay-drawer-body'));
    render();
    refs.overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    // Focus the dialog container, not the close button - keeps focus inside
    // the dialog for screen readers/Escape without triggering the button's
    // visible focus ring on every single open (browsers treat this kind of
    // programmatic focus as keyboard-worthy, so it showed up unconditionally).
    refs.overlay.focus({ preventScroll: true });
  }

  function close() {
    refs.overlay.classList.remove('open');
    unzoom();
    document.body.style.overflow = '';
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    // Let the 0.22s exit transition finish before clearing the image,
    // so it fades out in place instead of popping away instantly.
    setTimeout(function () { refs.img.src = ''; }, 240);
  }

  function step(dir) {
    if (currentGroup.length < 2) return;
    currentIndex = (currentIndex + dir + currentGroup.length) % currentGroup.length;
    render();
  }

  function toggleZoom() {
    var zooming = !refs.img.classList.contains('lightbox-zoomed-img');
    refs.overlay.classList.toggle('lightbox-zoomed', zooming);
    refs.img.classList.toggle('lightbox-zoomed-img', zooming);
    if (zooming) {
      // Center the scroll position on the point that was tapped, once laid out.
      requestAnimationFrame(function () {
        refs.overlay.scrollLeft = (refs.overlay.scrollWidth - refs.overlay.clientWidth) / 2;
        refs.overlay.scrollTop = (refs.overlay.scrollHeight - refs.overlay.clientHeight) / 2;
      });
    }
  }

  // Re-scans for lightbox-eligible images and (re)builds the group map.
  // Safe to call repeatedly — e.g. after the homepage's essay drawer
  // fetches and inserts a different field note's content, since that
  // content (and its images) don't exist yet at initial page load.
  function scan() {
    var candidates = document.querySelectorAll(CANDIDATE_SELECTOR);
    var excluded = document.querySelectorAll(EXCLUDE_SELECTOR);
    var excludedSet = new Set(Array.prototype.slice.call(excluded));
    var targets = Array.prototype.filter.call(candidates, function (el) {
      return !excludedSet.has(el);
    });
    if (!targets.length) return;

    var groupMap = new Map(); // container -> [img,...]
    var singletons = [];

    targets.forEach(function (el) {
      var container = el.closest(GROUP_SELECTOR);
      if (!container) { singletons.push(el); return; }
      var siblingImgs = Array.prototype.filter.call(
        container.querySelectorAll('img'),
        function (i) { return targets.indexOf(i) !== -1; }
      );
      if (siblingImgs.length > 1) {
        if (!groupMap.has(container)) groupMap.set(container, siblingImgs);
      } else {
        singletons.push(el);
      }
    });

    groupMap.forEach(function (imgs) {
      imgs.forEach(function (el) { elToGroup.set(el, imgs); });
    });
    singletons.forEach(function (el) { elToGroup.set(el, [el]); });

    targets.forEach(function (el) {
      el.classList.add('lightbox-trigger');
      if (wired && wired.has(el)) return;
      if (wired) wired.add(el);
      el.addEventListener('click', function () { open(el); });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    refs = buildOverlay();

    // Swipe-to-navigate: horizontal drag over the image area steps between
    // grouped images. Only active when not zoomed, so pinch/pan-scroll on a
    // zoomed image keeps working. A real swipe suppresses the trailing click
    // so it doesn't also toggle zoom.
    var touchStartX = 0, touchStartY = 0, touchStartTime = 0, suppressNextClick = false;
    var SWIPE_MIN_DIST = 40;

    refs.figureWrap.addEventListener('touchstart', function (e) {
      if (refs.overlay.classList.contains('lightbox-zoomed')) return;
      if (!e.touches || e.touches.length !== 1) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
    }, { passive: true });

    refs.figureWrap.addEventListener('touchend', function (e) {
      if (refs.overlay.classList.contains('lightbox-zoomed')) return;
      if (!e.changedTouches || e.changedTouches.length !== 1) return;
      var dx = e.changedTouches[0].clientX - touchStartX;
      var dy = e.changedTouches[0].clientY - touchStartY;
      var dt = Date.now() - touchStartTime;
      if (Math.abs(dx) >= SWIPE_MIN_DIST && Math.abs(dx) > Math.abs(dy) * 1.5 && dt < 600) {
        suppressNextClick = true;
        // Most browsers never fire a trailing click after a real drag, so
        // don't let the flag linger and swallow the *next* tap-to-zoom.
        setTimeout(function () { suppressNextClick = false; }, 500);
        step(dx > 0 ? -1 : 1);
      }
    }, { passive: true });

    refs.closeBtn.addEventListener('click', close);
    refs.prevBtn.addEventListener('click', function (e) { e.stopPropagation(); step(-1); });
    refs.nextBtn.addEventListener('click', function (e) { e.stopPropagation(); step(1); });
    refs.img.addEventListener('click', function (e) {
      e.stopPropagation();
      if (suppressNextClick) { suppressNextClick = false; return; }
      toggleZoom();
    });
    refs.overlay.addEventListener('click', function (e) {
      if (e.target === refs.overlay) close();
    });
    document.addEventListener('keydown', function (e) {
      if (!refs.overlay.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
    });

    scan();
  });

  // Exposed so index.html's essay-drawer fetch handler can call it after
  // inserting a field note's content, whose images don't exist at initial
  // page load and so are invisible to the DOMContentLoaded scan above.
  window.lightboxScan = function () {
    if (!refs) return;
    scan();
  };
})();
