'use strict';

(() => {
  const input = document.getElementById('promptInput');
  const submit = document.getElementById('submitBtn');
  const status = document.querySelector('.action-bar .note');
  const actions = document.querySelectorAll('.action-icon');

  if (!input || !submit || !status) return;

  const announce = message => {
    status.textContent = message;
  };

  const copyText = async text => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const temporary = document.createElement('textarea');
    temporary.value = text;
    temporary.setAttribute('readonly', '');
    temporary.style.position = 'fixed';
    temporary.style.opacity = '0';
    document.body.append(temporary);
    temporary.select();
    const copied = document.execCommand('copy');
    temporary.remove();
    if (!copied) throw new Error('Copy was unavailable');
  };

  submit.addEventListener('click', () => {
    const destinations = (submit.dataset.destinations || '')
      .split(',')
      .map(destination => destination.trim())
      .filter(destination => {
        try {
          return ['http:', 'https:'].includes(new URL(destination).protocol);
        } catch {
          return false;
        }
      });

    if (destinations.length) {
      const destination = destinations[Math.floor(Math.random() * destinations.length)];
      window.location.assign(destination);
      return;
    }

    if (!input.value.trim()) {
      announce('Enter a prompt first.');
      input.focus();
      return;
    }
    announce('This demo has no AI generation service connected. Your prompt stays in this browser.');
  });

  actions.forEach(button => {
    button.addEventListener('click', async () => {
      try {
        switch (button.getAttribute('aria-label')) {
          case 'Copy':
            if (!input.value.trim()) return announce('Enter a prompt before copying.');
            await copyText(input.value);
            announce('Prompt copied.');
            break;
          case 'Save': {
            if (!input.value.trim()) return announce('Enter a prompt before saving.');
            const file = new Blob([input.value], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(file);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'my-prompt.txt';
            link.click();
            URL.revokeObjectURL(url);
            announce('Prompt downloaded to your device.');
            break;
          }
          case 'Redo':
            input.value = '';
            input.focus();
            announce('Prompt cleared.');
            break;
          case 'Like':
          case 'Dislike':
            button.setAttribute('aria-pressed', String(button.getAttribute('aria-pressed') !== 'true'));
            announce('Thanks for your feedback.');
            break;
          case 'Share':
            await copyText(window.location.href);
            announce('Page link copied.');
            break;
        }
      } catch {
        announce('This action is not available in the current browser context.');
      }
    });
  });
})();
