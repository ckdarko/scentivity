/*
 * Scentivity 2026 temporary holiday notice / checkout UX.
 * Dates use Africa/Accra time (UTC year round). There are NO edits to product data,
 * cart storage, stock counts, images, Paystack hooks, or existing cart actions.
 * Server-side payment initialization MUST be blocked separately (see patch file).
 */
(function () {
  'use strict';
  const START = Date.UTC(2026, 10, 15, 0, 0, 0); // Nov 15 Ghana
  const END = Date.UTC(2026, 11, 1, 0, 0, 0);    // Dec 1 Ghana
  const IMAGE = 'scentivity-break-notice-2026.webp';
  const isPaused = () => Date.now() >= START && Date.now() < END;
  const isAfter = () => Date.now() >= END;
  let originalCheckoutButtonText = null;
  let bar = null;
  let notice = null;

  const breakMessage = 'Orders are paused from 15–30 November 2026. We reopen 1 December 2026 with our massive end-of-year sale.';
  const scrollTextDuring = [
    'IMPORTANT NOTICE',
    'Scentivity is on break: 15–30 November 2026',
    'Purchases temporarily paused',
    'We resume 1 December 2026',
    'Massive end-of-year sale coming!'
  ];
  const scrollTextAfter = [
    'WELCOME BACK!',
    'Scentivity reopened 1 December 2026',
    'Massive end-of-year sale',
    'Shop your favourite scents!'
  ];

  function renderMarquee(paused) {
    const contents = paused ? scrollTextDuring : scrollTextAfter;
    if (!bar) {
      bar = document.createElement('div');
      bar.className = 'scentivity-holiday-marquee';
      bar.id = 'scentivityHolidayMarquee';
      bar.setAttribute('role', 'status');
      bar.setAttribute('aria-label', paused ? breakMessage : 'Scentivity is open. End-of-year sale.');
      document.body.insertBefore(bar, document.body.firstChild);
    }
    bar.setAttribute('aria-label', paused ? breakMessage : 'Scentivity has reopened. Our end-of-year sale is here.');
    const repeated = () => '<div class="scentivity-holiday-marquee__group" aria-hidden="true">' +
      contents.map(text => '<span class="scentivity-holiday-marquee__dot">✦</span><span>' + text + '</span>').join('') +
      '</div>';
    bar.innerHTML = '<div class="scentivity-holiday-marquee__inner">' + repeated() + repeated() + '</div>';
  }

  function renderNotice(paused) {
    const main = document.querySelector('main');
    if (!main) return;
    if (!notice) {
      notice = document.createElement('section');
      notice.id = 'scentivityHolidayNotice';
      notice.className = 'scentivity-holiday-notice';
      notice.setAttribute('aria-label', 'Scentivity holiday notice');
      main.insertBefore(notice, main.firstElementChild);
    }
    const content = paused
      ? '<p class="scentivity-holiday-notice__eyebrow">Important Notice</p>' +
        '<h2>We’re taking a short break</h2>' +
        '<p>Orders are paused <strong>15–30 November 2026</strong>. Feel free to browse our products while we’re away.</p>' +
        '<p><strong>We resume 1 December 2026</strong> with a massive end-of-year sale!</p>'
      : '<p class="scentivity-holiday-notice__eyebrow">Welcome back</p>' +
        '<h2>We’ve reopened for orders!</h2>' +
        '<p>Shopping resumed on <strong>1 December 2026</strong>. Explore our end-of-year sale and favourite scents.</p>';
    // Image is optimised WebP from the supplied notice. Its file is a new root asset,
    // not a replacement for anything in assets/products/uploads.
    const image = paused
      ? '<a class="scentivity-holiday-notice__poster" href="' + IMAGE + '" target="_blank" rel="noopener" aria-label="View full holiday notice"><img src="' + IMAGE + '" width="112" height="112" alt="Scentivity break notice: November 15–30, resumes December 1, 2026" loading="lazy" decoding="async"></a>'
      : '';
    notice.innerHTML = '<div>' + content + '</div>' + image;
  }

  function updateCheckout(paused) {
    const form = document.getElementById('checkoutForm');
    if (!form) return;
    const submit = form.querySelector('.checkout-submit, button[type="submit"]');
    if (submit) {
      if (originalCheckoutButtonText === null) originalCheckoutButtonText = submit.textContent;
      submit.disabled = paused;
      submit.setAttribute('aria-disabled', String(paused));
      submit.textContent = paused ? 'Checkout reopens 1 December' : originalCheckoutButtonText;
    }
    let info = document.getElementById('scentivityHolidayCheckoutMessage');
    if (paused) {
      if (!info) {
        info = document.createElement('p');
        info.id = 'scentivityHolidayCheckoutMessage';
        info.className = 'scentivity-holiday-checkout-message';
        form.insertBefore(info, form.firstElementChild);
      }
      info.textContent = 'Purchases are temporarily paused from 15–30 November 2026. Browse as usual; checkout reopens 1 December.';
    } else if (info) info.remove();
  }

  function render() {
    const paused = isPaused();
    const after = isAfter();
    document.body.classList.toggle('scentivity-holiday-paused', paused);
    document.body.classList.toggle('scentivity-holiday-reopened', after);
    if (paused || after) {
      renderMarquee(paused);
      renderNotice(paused);
    } else {
      if (bar) { bar.remove(); bar = null; }
      if (notice) { notice.remove(); notice = null; }
    }
    updateCheckout(paused);
  }

  // Capture submissions before the original checkout listener to prevent user checkout during closure.
  document.addEventListener('submit', function (event) {
    if (!isPaused()) return;
    if (!event.target || event.target.id !== 'checkoutForm') return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const status = document.getElementById('paymentStatus');
    if (status) status.textContent = breakMessage;
    window.alert('Scentivity is on break (15–30 November). Orders resume on 1 December 2026.');
  }, true);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render, {once:true});
  } else render();
  // Handles a page kept open across the midnight Dec 1 reopening without needing a redeploy.
  window.setInterval(function () {
    const wasPaused = document.body.classList.contains('scentivity-holiday-paused');
    const wasReopened = document.body.classList.contains('scentivity-holiday-reopened');
    if (wasPaused !== isPaused() || wasReopened !== isAfter()) render();
  }, 60 * 1000);
})();
