(function () {
  'use strict';

  var deck  = document.getElementById('deck');
  var slides = Array.prototype.slice.call(deck.querySelectorAll('.slide'));
  var links  = Array.prototype.slice.call(document.querySelectorAll('.deck-nav__link'));
  var current = 0;

  var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  function scrollMode() { return motionQuery.matches ? 'auto' : 'smooth'; }

  /* ---- Estado activo no índice lateral -------------------------------- */
  function setActive(index) {
    if (index < 0 || index >= slides.length) { return; }
    current = index;
    for (var i = 0; i < links.length; i++) {
      if (i === index) {
        links[i].setAttribute('aria-current', 'true');
      } else {
        links[i].removeAttribute('aria-current');
      }
    }
  }

  /* ---- Ir a unha sección ---------------------------------------------- */
  function goTo(index, moveFocus) {
    if (index < 0) { index = 0; }
    if (index > slides.length - 1) { index = slides.length - 1; }

    var target = slides[index];
    target.scrollIntoView({ behavior: scrollMode(), block: 'start' });
    setActive(index);

    if (moveFocus) {
      try { target.focus({ preventScroll: true }); }
      catch (err) { target.focus(); }
    }
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', '#' + target.id);
    }
  }

  /* ---- Clicks no índice ------------------------------------------------ */
  links.forEach(function (link, index) {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      goTo(index, true);
    });
  });

  /* ---- Sección activa con IntersectionObserver ------------------------- */
  if ('IntersectionObserver' in window) {
    var ratios = {};
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        ratios[entry.target.id] = entry.intersectionRatio;
      });
      var best = -1, bestIndex = current;
      slides.forEach(function (slide, index) {
        var ratio = ratios[slide.id] || 0;
        if (ratio > best) { best = ratio; bestIndex = index; }
      });
      if (best > 0) { setActive(bestIndex); }
    }, {
      root: deck,
      threshold: [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1]
    });
    slides.forEach(function (slide) { observer.observe(slide); });
  } else {
    /* Reserva para navegadores sen IntersectionObserver */
    deck.addEventListener('scroll', function () {
      var middle = deck.scrollTop + deck.clientHeight / 2;
      for (var i = slides.length - 1; i >= 0; i--) {
        if (slides[i].offsetTop <= middle) { setActive(i); break; }
      }
    }, { passive: true });
  }

  /* ---- Navegación por teclado ----------------------------------------- */
  document.addEventListener('keydown', function (event) {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) { return; }

    var el = event.target;
    if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) { return; }

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
      case 'PageDown':
        event.preventDefault(); goTo(current + 1, true); break;
      case 'ArrowUp':
      case 'ArrowLeft':
      case 'PageUp':
        event.preventDefault(); goTo(current - 1, true); break;
      case 'Home':
        event.preventDefault(); goTo(0, true); break;
      case 'End':
        event.preventDefault(); goTo(slides.length - 1, true); break;
    }
  });

  /* ---- Botón de impresión --------------------------------------------- */
  document.getElementById('print-btn').addEventListener('click', function () {
    window.print();
  });

  /* ---- Ancoraxe inicial se a URL trae hash ----------------------------- */
  if (window.location.hash) {
    var startIndex = -1;
    slides.forEach(function (slide, index) {
      if ('#' + slide.id === window.location.hash) { startIndex = index; }
    });
    if (startIndex > -1) {
      window.requestAnimationFrame(function () {
        slides[startIndex].scrollIntoView({ behavior: 'auto', block: 'start' });
        setActive(startIndex);
      });
    }
  }
})();
