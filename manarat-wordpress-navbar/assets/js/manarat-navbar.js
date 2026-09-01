/**
 * Manarat navbar behaviour.
 *
 * Vanilla, no dependencies, ~3KB. Three jobs:
 *   1. Smart scroll — hide on the way down, return on the way up.
 *   2. A sliding pill that follows the active / hovered nav item.
 *   3. An accessible mobile drawer with a focus trap.
 *
 * Everything degrades: with JS off the navbar is a normal sticky header and
 * the current page is still marked by WordPress's own class.
 */
(function () {
  'use strict';

  var header = document.querySelector('[data-manarat-navbar]');
  if (!header) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ------------------------------------------------ 1. smart scroll ------- */

  var progress = header.querySelector('[data-manarat-progress]');
  var lastY = window.scrollY;
  var ticking = false;
  var HIDE_AFTER = 140;   // don't start hiding until we're clear of the hero
  var DELTA = 6;          // ignore sub-pixel jitter

  function onScroll() {
    var y = window.scrollY;

    header.classList.toggle('is-stuck', y > 8);

    // Never hide while the drawer is open, or for reduced-motion users.
    if (!document.body.classList.contains('manarat-locked') && !reduced.matches) {
      if (Math.abs(y - lastY) > DELTA) {
        if (y > lastY && y > HIDE_AFTER) {
          header.classList.add('is-hidden');
        } else {
          header.classList.remove('is-hidden');
        }
        lastY = y;
      }
    }

    if (progress) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      header.style.setProperty('--mn-progress', max > 0 ? (y / max).toFixed(4) : '0');
    }

    ticking = false;
  }

  window.addEventListener(
    'scroll',
    function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(onScroll);
      }
    },
    { passive: true }
  );
  onScroll();

  /* ------------------------------------------------ 2. sliding pill ------- */

  var nav = document.getElementById('manarat-nav');
  var pill = nav && nav.querySelector('[data-manarat-pill]');
  var list = nav && nav.querySelector('.manarat-nav__list');

  if (nav && pill && list) {
    var activeLink =
      list.querySelector('.current-menu-item > a') ||
      list.querySelector('.current_page_item > a') ||
      list.querySelector('.current-menu-ancestor > a');

    function moveTo(link) {
      if (!link) {
        pill.style.width = '0px';
        nav.classList.remove('is-ready');
        return;
      }
      var navBox = list.getBoundingClientRect();
      var box = link.getBoundingClientRect();
      pill.style.width = box.width + 'px';
      pill.style.setProperty('--mn-pill-x', (box.left - navBox.left) + 'px');
      nav.classList.add('is-ready');
    }

    var settle = null;
    function rest() {
      clearTimeout(settle);
      settle = setTimeout(function () { moveTo(activeLink); }, 220);
    }

    list.addEventListener('pointerover', function (e) {
      var link = e.target.closest('a');
      if (link && list.contains(link)) {
        clearTimeout(settle);
        moveTo(link);
      }
    });
    list.addEventListener('pointerleave', rest);
    list.addEventListener('focusin', function (e) {
      var link = e.target.closest('a');
      if (link) { clearTimeout(settle); moveTo(link); }
    });
    list.addEventListener('focusout', rest);

    // Fonts change metrics, so measure again once they have loaded.
    moveTo(activeLink);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { moveTo(activeLink); });
    }
    var ro = window.ResizeObserver ? new ResizeObserver(function () { moveTo(activeLink); }) : null;
    if (ro) ro.observe(list);
    window.addEventListener('resize', function () { moveTo(activeLink); });
  }

  /* ------------------------------------------------ 3. mobile drawer ------ */

  var burger = document.querySelector('[data-manarat-burger]');
  var drawer = document.querySelector('[data-manarat-drawer]');

  if (burger && drawer) {
    var panel = drawer.querySelector('.manarat-drawer__panel');
    var returnTo = null;

    function focusables() {
      return Array.prototype.filter.call(
        panel.querySelectorAll('a[href], button:not([disabled])'),
        function (el) { return el.offsetParent !== null; }
      );
    }

    function open() {
      returnTo = document.activeElement;
      drawer.hidden = false;
      // Next frame, so the transition has a start state to animate from.
      requestAnimationFrame(function () {
        drawer.classList.add('is-open');
        var first = focusables()[0];
        if (first) first.focus();
      });
      burger.setAttribute('aria-expanded', 'true');
      document.body.classList.add('manarat-locked');
      document.body.style.overflow = 'hidden';
      header.classList.remove('is-hidden');
    }

    function close() {
      drawer.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('manarat-locked');
      document.body.style.overflow = '';

      var done = function () { drawer.hidden = true; };
      if (reduced.matches) done();
      else setTimeout(done, 400);

      if (returnTo && returnTo.focus) returnTo.focus();
    }

    burger.addEventListener('click', function () {
      if (burger.getAttribute('aria-expanded') === 'true') close();
      else open();
    });

    drawer.addEventListener('click', function (e) {
      if (e.target.closest('[data-manarat-close]')) close();
      // Following a link should also dismiss the drawer.
      else if (e.target.closest('a[href]')) close();
    });

    document.addEventListener('keydown', function (e) {
      if (drawer.hidden) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }

      if (e.key === 'Tab') {
        var items = focusables();
        if (!items.length) return;
        var first = items[0];
        var last = items[items.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    // Leaving mobile width with the drawer open would strand it.
    window.matchMedia('(min-width: 1024px)').addEventListener('change', function (e) {
      if (e.matches && !drawer.hidden) close();
    });
  }
})();
