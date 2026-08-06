(() => {
  const task = document.getElementById('aiAdminTask');
  const input = document.getElementById('aiAdminInput');
  const output = document.getElementById('aiAdminOutput');
  const button = document.getElementById('aiAdminSubmit');
  const copyButton = document.getElementById('aiAdminCopy');

  if (!task || !input || !output || !button) return;

  button.addEventListener('click', async () => {
    const value = input.value.trim();
    if (!value) {
      output.textContent = 'Enter product, review, stock, or caption details first.';
      return;
    }
    button.disabled = true;
    output.textContent = 'Generating...';
    try {
      const answer = await window.ScentivityAI.askAI(task.value, value);
      output.textContent = answer;
    } catch (error) {
      output.textContent = error.message || 'AI admin helper is temporarily unavailable.';
    } finally {
      button.disabled = false;
    }
  });

  copyButton?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(output.textContent || '');
      copyButton.textContent = 'Copied';
      setTimeout(() => copyButton.textContent = 'Copy Output', 1200);
    } catch (_) {}
  });
})();
