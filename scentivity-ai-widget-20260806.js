(() => {
  const actions = [
    ['scent_finder', 'Scent Finder', 'Tell us the scent style, product type, and budget you want.'],
    ['gift_finder', 'Gift Finder', 'Who is the gift for, what occasion, and what budget?'],
    ['product_search', 'Smart Search', 'Ask naturally, e.g. sweet mist under GH₵300.'],
    ['faq_assistant', 'FAQ Help', 'Ask about delivery, pickup, refunds, preorder, or payment.'],
    ['whatsapp_message', 'WhatsApp Order', 'Format your cart or request into a clean WhatsApp message.']
  ];

  function ensureWidget() {
    if (document.getElementById('scentivityAiLauncher')) return;

    const launcher = document.createElement('button');
    launcher.id = 'scentivityAiLauncher';
    launcher.className = 'scentivity-ai-launcher';
    launcher.type = 'button';
    launcher.innerHTML = '<span>✨</span><strong>Scent Helper</strong>';
    document.body.appendChild(launcher);

    const modal = document.createElement('div');
    modal.id = 'scentivityAiModal';
    modal.className = 'scentivity-ai-overlay';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <div class="scentivity-ai-modal" role="dialog" aria-modal="true" aria-labelledby="scentivityAiTitle">
        <button class="scentivity-ai-close" id="scentivityAiClose" type="button" aria-label="Close scent helper">×</button>
        <p class="eyebrow">Free Smart Scent Helper</p>
        <h2 id="scentivityAiTitle">Find the right scent faster.</h2>
        <p class="scentivity-ai-free-note">This free helper uses Scentivity’s product list and simple matching. No paid AI API key is needed.</p>
        <div class="scentivity-ai-tabs" role="tablist">
          ${actions.map(([key, label], index) => `<button type="button" class="${index === 0 ? 'active' : ''}" data-ai-action="${key}">${label}</button>`).join('')}
        </div>
        <p class="scentivity-ai-hint" id="scentivityAiHint">${actions[0][2]}</p>
        <textarea id="scentivityAiInput" rows="5" placeholder="Example: I want something sweet, feminine, long-lasting, and good for daily use. My budget is GH₵300."></textarea>
        <div class="scentivity-ai-actions">
          <button class="btn primary" id="scentivityAiSubmit" type="button">Get Suggestions</button>
          <button class="btn ghost" id="scentivityAiUseCart" type="button">Use my cart</button>
        </div>
        <div class="scentivity-ai-response" id="scentivityAiResponse" aria-live="polite"></div>
        <p class="scentivity-ai-note">Suggestions are based on product names, descriptions, tags, price, and stock data on the site. Confirm final availability before payment.</p>
      </div>`;
    document.body.appendChild(modal);

    bindWidget(modal, launcher);
  }

  function bindWidget(modal, launcher) {
    let currentAction = 'scent_finder';
    const close = document.getElementById('scentivityAiClose');
    const input = document.getElementById('scentivityAiInput');
    const responseBox = document.getElementById('scentivityAiResponse');
    const submit = document.getElementById('scentivityAiSubmit');
    const hint = document.getElementById('scentivityAiHint');
    const useCart = document.getElementById('scentivityAiUseCart');

    const openModal = () => {
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      setTimeout(() => input?.focus(), 50);
    };
    const closeModal = () => {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    };

    launcher.addEventListener('click', openModal);
    document.getElementById('openAiScentFinder')?.addEventListener('click', openModal);
    close?.addEventListener('click', closeModal);
    modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });

    modal.querySelectorAll('[data-ai-action]').forEach((button) => {
      button.addEventListener('click', () => {
        modal.querySelectorAll('[data-ai-action]').forEach((btn) => btn.classList.remove('active'));
        button.classList.add('active');
        currentAction = button.dataset.aiAction;
        const selected = actions.find(([key]) => key === currentAction);
        if (hint && selected) hint.textContent = selected[2];
      });
    });

    useCart?.addEventListener('click', () => {
      const cart = window.ScentivityAI?.getCartItems?.() || [];
      const cartText = cart.length ? JSON.stringify(cart, null, 2) : 'My cart is currently empty. Help me choose products.';
      input.value = `${input.value.trim()}\n\nCart/order details:\n${cartText}`.trim();
    });

    submit?.addEventListener('click', async () => {
      const question = input.value.trim();
      if (!question && currentAction !== 'stock_insights') {
        responseBox.innerHTML = '<p>Please type what you are looking for first.</p>';
        return;
      }
      submit.disabled = true;
      responseBox.innerHTML = '<p>Checking the current Scentivity product list...</p>';
      try {
        const answer = await window.ScentivityAI.askAI(currentAction, question || 'Show suggestions');
        responseBox.innerHTML = window.ScentivityAI.formatAnswer(answer);
      } catch (error) {
        responseBox.innerHTML = `<p>${error.message || 'Smart scent helper is temporarily unavailable.'}</p>`;
      } finally {
        submit.disabled = false;
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ensureWidget);
  else ensureWidget();
})();
