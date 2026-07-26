// Shared starfield backdrop for the inner pages (case studies + essays).
// Port of the final index.html solution. The load-bearing decisions, all
// confirmed by on-device testing against iOS 26 Safari:
//
// - NOT a <canvas>: a canvas kept visually pinned to the viewport during
//   scroll was the confirmed cause of a black bar in the toolbar safe area.
// - NOT position:fixed on touch devices, and no scroll coupling of any kind:
//   iOS 26 Safari scrims/blacks out any full-viewport layer that stays
//   visually stationary while the page scrolls (fixed in every variant,
//   per-frame JS transform pinning, and animation-timeline scroll parallax
//   all failed; the JS and scroll-timeline routes also jittered the stars).
// - On touch devices the sky is a static full-document layer with slow
//   time-based star drift. On desktop (hover + fine pointer, deliberately
//   not a width query so iPads with the same buggy Safari stay safe) the
//   bug doesn't exist, so the layer is plain position:fixed and stays
//   pinned like the original design.
// - The nebula gradient is NOT tiled via background-repeat on touch
//   devices: any repeating background-image seam (even a mathematically
//   symmetric one) risks a visible hairline at the tile boundary once
//   rasterized, and dvh-based sizing "breathes" as Safari's toolbar
//   animates. Instead, once the page's true full height is known (after
//   defer lets the whole document parse first), buildBackground() below
//   generates ONE non-repeating background-image explicitly covering that
//   exact height, with each blob placed at its own fixed pixel position.
//   No tiling at all means no tiling seam is possible.
//
// Each page still needs in its own head CSS (FOUC-critical, so not injected
// here): viewport-fit=cover in the meta viewport, color-scheme:dark plus the
// nebula gradient on html (paints the safe-area strips), and
// body { background-color:#070912; position:relative; } with NO
// background-attachment:fixed (broken in iOS Safari).
(function () {
  var css =
    '#starfield{position:absolute;inset:0;z-index:0;pointer-events:none;overflow:hidden;' +
    'background-color:#070912;background-repeat:no-repeat;background-position:top;' +
    'background-size:100% 100svh;background-image:' +
    'radial-gradient(ellipse at 85% 15%, rgba(30,85,200,0.50) 0%, transparent 55%),' +
    'radial-gradient(ellipse at 90% 85%, rgba(15,135,135,0.44) 0%, transparent 50%),' +
    'radial-gradient(ellipse at 10% 50%, rgba(50,40,165,0.28) 0%, transparent 46%);}' +
    '@media (hover: hover) and (pointer: fine){#starfield{position:fixed;}}' +
    '.star{position:absolute;border-radius:50%;background:#fff;}' +
    '@keyframes star-twinkle{0%,100%{opacity:var(--op-lo);}50%{opacity:var(--op-hi);}}' +
    '@keyframes star-drift{from{transform:translate(0,0);}to{transform:translate(var(--drift-x),var(--drift-y));}}' +
    '.meteor{position:absolute;border-radius:2px;transform-origin:left center;opacity:0;}' +
    '@keyframes meteor-move{0%{transform:translate(0,0) rotate(var(--angle));opacity:0;}' +
    '8%{opacity:1;}85%{opacity:1;}' +
    '100%{transform:translate(var(--dx),var(--dy)) rotate(var(--angle));opacity:0;}}';

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var field = document.createElement('div');
  field.id = 'starfield';
  field.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(field, document.body.firstChild);

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isDesktopFixed = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function rand(min, max) { return Math.random() * (max - min) + min; }

  // On touch devices, replace the CSS-defined hero-only background with one
  // continuous, non-repeating image sized to the page's actual full height —
  // the hero blobs at their original fixed pixel spot, plus ambient blobs
  // spaced down the rest of the page. No repeat, so no tiling seam is
  // possible. Desktop (position:fixed, viewport-pinned) keeps the plain
  // CSS-defined hero-only background as-is.
  function buildBackground(totalH) {
    if (isDesktopFixed || !totalH) return;
    var vh = window.innerHeight;
    var layers = [
      'radial-gradient(ellipse at 85% ' + Math.round(vh * 0.15) + 'px, rgba(30,85,200,0.50) 0%, transparent ' + Math.round(vh * 0.55) + 'px)',
      'radial-gradient(ellipse at 90% ' + Math.round(vh * 0.85) + 'px, rgba(15,135,135,0.44) 0%, transparent ' + Math.round(vh * 0.50) + 'px)',
      'radial-gradient(ellipse at 10% ' + Math.round(vh * 0.50) + 'px, rgba(50,40,165,0.28) 0%, transparent ' + Math.round(vh * 0.46) + 'px)'
    ];

    var colors = ['rgba(30,85,200,0.34)', 'rgba(15,135,135,0.28)'];
    var xPos = [80, 20];
    var spacing = vh * 1.3;
    var radius = Math.round(vh * 0.5);
    var i = 0;
    for (var y = vh * 1.1; y < totalH - vh * 0.3; y += spacing) {
      layers.push('radial-gradient(ellipse at ' + xPos[i % 2] + '% ' + Math.round(y) + 'px, ' + colors[i % 2] + ' 0%, transparent ' + radius + 'px)');
      i++;
    }

    field.style.backgroundImage = layers.join(',');
    field.style.backgroundSize = '100% ' + Math.round(totalH) + 'px';
    field.style.backgroundRepeat = 'no-repeat';
    field.style.backgroundPosition = 'top';
  }

  function build() {
    field.innerHTML = '';
    var w = field.offsetWidth, h = field.offsetHeight;
    if (!w || !h) return;

    buildBackground(h);

    // Original canvas counts (180 stars / 28 meteors) were per viewport; on
    // touch devices the field spans the full document, so scale by area with
    // hard caps so long pages can't spawn thousands of animated elements.
    // The caps were tuned for shorter pages — on long case studies (20+
    // viewport heights) they diluted density far below the per-viewport
    // intent, leaving most of the scroll with barely any visible stars.
    var density = (w * h) / (window.innerWidth * window.innerHeight);
    var starCount = Math.min(Math.round(180 * density), 1600);
    for (var i = 0; i < starCount; i++) {
      var r = rand(0.2, 1.3);
      var base = rand(0.05, 0.40);
      var dur = rand(9, 45);
      var driftDur = rand(50, 120);
      var el = document.createElement('div');
      el.className = 'star';
      el.style.cssText =
        'left:' + rand(0, w) + 'px; top:' + rand(0, h) + 'px; width:' + (r * 2) + 'px; height:' + (r * 2) + 'px;' +
        '--op-lo:' + Math.max(0, base - 0.08) + '; --op-hi:' + (base + 0.08) + ';' +
        '--drift-x:' + rand(-40, 40) + 'px; --drift-y:' + rand(-30, 30) + 'px;' +
        (reduceMotion ? 'opacity:' + base + ';' :
          'animation: star-twinkle ' + dur + 's ease-in-out ' + (-rand(0, dur)) + 's infinite,' +
          ' star-drift ' + driftDur + 's ease-in-out ' + (-rand(0, driftDur)) + 's infinite alternate;');
      field.appendChild(el);
    }

    if (!reduceMotion) {
      var meteorCount = Math.min(Math.round(28 * density), 220);
      for (var j = 0; j < meteorCount; j++) {
        var angleDeg = rand(22.5, 33.75);
        var angleRad = angleDeg * Math.PI / 180;
        var length = rand(40, 240);
        var opacity = rand(0.06, 0.28);
        var width = rand(0.4, 1.8);
        // Short travel loop (~1 viewport) so each meteor recycles quickly,
        // like the original canvas respawning meteors as they exited.
        var travel = Math.max(window.innerWidth, window.innerHeight) * 1.2;
        var dx = Math.cos(angleRad) * travel;
        var dy = Math.sin(angleRad) * travel;
        var speed = rand(30, 90);
        var mDur = travel / speed;
        var m = document.createElement('div');
        m.className = 'meteor';
        m.style.cssText =
          'left:' + rand(0, w * 1.2) + 'px; top:' + rand(-length, h) + 'px; width:' + length + 'px; height:' + width + 'px;' +
          'background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,' + (opacity * 0.3) + ') 20%, rgba(255,255,255,' + opacity + ') 100%);' +
          '--angle:' + angleDeg + 'deg; --dx:' + dx + 'px; --dy:' + dy + 'px;' +
          'animation: meteor-move ' + mDur + 's linear ' + (-rand(0, mDur)) + 's infinite;';
        field.appendChild(m);
      }
    }
  }

  build();

  // Rebuild only when the width actually changes (rotation, real resize).
  // iOS fires resize continuously while the Safari toolbar collapses during
  // scroll; rebuilding on those re-randomizes star positions mid-scroll.
  var lastW = window.innerWidth;
  var resizeRaf = 0;
  window.addEventListener('resize', function () {
    if (resizeRaf) return;
    resizeRaf = requestAnimationFrame(function () {
      resizeRaf = 0;
      if (window.innerWidth !== lastW) {
        lastW = window.innerWidth;
        build();
      }
    });
  });
})();
