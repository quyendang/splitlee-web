(() => {
  const card = document.getElementById('card');
  const error = document.getElementById('error');
  const errorTitle = document.getElementById('error-title');
  const errorMessage = document.getElementById('error-message');

  const titleEl = document.getElementById('title');
  const metaEl = document.getElementById('meta');
  const totalEl = document.getElementById('total');
  const modeEl = document.getElementById('mode');
  const peopleList = document.getElementById('people-list');
  const payerSection = document.getElementById('payer-section');
  const payerTitle = document.getElementById('payer-title');
  const payerSubtitle = document.getElementById('payer-subtitle');
  const paymentSection = document.getElementById('payment-section');
  const paymentTemplate = document.getElementById('payment-template');
  const paymentName = document.getElementById('payment-name');
  const paymentLink = document.getElementById('payment-link');
  const paymentPrimaryLabel = document.getElementById('payment-primary-label');
  const paymentPrimaryValue = document.getElementById('payment-primary-value');
  const paymentSecondaryRow = document.getElementById('payment-secondary-row');
  const paymentSecondaryLabel = document.getElementById('payment-secondary-label');
  const paymentSecondaryValue = document.getElementById('payment-secondary-value');
  const paymentNoteRow = document.getElementById('payment-note-row');
  const paymentNote = document.getElementById('payment-note');
  const qrBlock = document.getElementById('qr-block');
  const paymentQR = document.getElementById('payment-qr');

  function showError(title, message) {
    card.hidden = true;
    error.hidden = false;
    errorTitle.textContent = title;
    errorMessage.textContent = message;
  }

  function base64urlDecode(input) {
    let value = input.replace(/-/g, '+').replace(/_/g, '/');
    const pad = value.length % 4;
    if (pad) value += '='.repeat(4 - pad);

    try {
      return atob(value);
    } catch {
      return null;
    }
  }

  function formatAmount(minorUnits, currency) {
    const noDecimal = currency === 'VND';
    const amount = noDecimal ? minorUnits : minorUnits / 100;
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: noDecimal ? 0 : 2,
      minimumFractionDigits: noDecimal ? 0 : 2
    }).format(amount);
  }

  function formatMode(mode) {
    switch (mode) {
      case 'equal':
        return 'Equal split';
      case 'proportional':
        return 'Proportional split';
      default:
        return 'Split summary';
    }
  }

  function parsePayload() {
    const fragment = window.location.hash.replace(/^#/, '');
    if (!fragment) return null;

    const decoded = base64urlDecode(fragment);
    if (!decoded) {
      showError('This Splitlee link is invalid.', 'The payload could not be decoded.');
      return null;
    }

    let payload;
    try {
      payload = JSON.parse(decoded);
    } catch {
      showError('This Splitlee link is invalid.', 'The payload is not valid JSON.');
      return null;
    }

    if (typeof payload.v !== 'number') {
      showError('This Splitlee link is invalid.', 'Missing payload version.');
      return null;
    }

    if (payload.v > 2) {
      showError('This split was created with a newer version of Splitlee.', 'Please update your app and retry.');
      return null;
    }

    if (!payload.title || !payload.currency || !Array.isArray(payload.people) || typeof payload.total !== 'number') {
      showError('This Splitlee link is invalid.', 'Required split fields are missing.');
      return null;
    }

    return payload;
  }

  function shareIDFromPath() {
    const match = window.location.pathname.match(/^\/s\/([^/]+)\/?$/);
    return match ? decodeURIComponent(match[1]) : null;
  }

  async function fetchPayloadByShareID(shareID) {
    try {
      const response = await fetch(`/api/share/${encodeURIComponent(shareID)}`, {
        headers: { accept: 'application/json' }
      });

      if (!response.ok) {
        showError('This Splitlee link could not be opened.', 'The shared split may have expired or been removed.');
        return null;
      }

      const payload = await response.json();
      if (!payload || typeof payload.v !== 'number') {
        showError('This Splitlee link is invalid.', 'The shared data is missing required fields.');
        return null;
      }

      return payload;
    } catch {
      showError('This Splitlee link could not be opened.', 'A network error occurred while loading the shared split.');
      return null;
    }
  }

  function render(payload) {
    titleEl.textContent = payload.title;

    const date = payload.date ? new Date(payload.date) : null;
    const dateLabel = date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString() : '';
    metaEl.textContent = [payload.merchant, dateLabel].filter(Boolean).join(' • ');

    totalEl.textContent = formatAmount(payload.total, payload.currency);
    modeEl.textContent = formatMode(payload.mode);

    while (peopleList.firstChild) {
      peopleList.removeChild(peopleList.firstChild);
    }

    payload.people.forEach((person) => {
      const li = document.createElement('li');
      const name = document.createElement('span');
      const amount = document.createElement('strong');

      name.textContent = String(person.name || 'Unknown');
      amount.textContent = formatAmount(Number(person.amount || 0), payload.currency);

      li.appendChild(name);
      li.appendChild(amount);
      peopleList.appendChild(li);
    });

    if (payload.payer && payload.payer.name) {
      payerTitle.textContent = `Paid by ${payload.payer.name}`;
      payerSubtitle.textContent = 'Everyone else can pay this person back using the method below.';
      payerSection.hidden = false;
    } else {
      payerSection.hidden = true;
    }

    if (payload.paymentMethod) {
      paymentTemplate.textContent = payload.paymentMethod.templateName || payload.paymentMethod.template || '';
      paymentName.textContent = payload.paymentMethod.displayName || payload.paymentMethod.template || 'Payment method';
      paymentPrimaryLabel.textContent = payload.paymentMethod.primaryLabel || 'Details';
      paymentPrimaryValue.textContent = payload.paymentMethod.primaryValue || '';

      if (payload.paymentMethod.secondaryLabel && payload.paymentMethod.secondaryValue) {
        paymentSecondaryLabel.textContent = payload.paymentMethod.secondaryLabel;
        paymentSecondaryValue.textContent = payload.paymentMethod.secondaryValue;
        paymentSecondaryRow.hidden = false;
      } else {
        paymentSecondaryRow.hidden = true;
      }

      if (payload.paymentMethod.notes) {
        paymentNote.textContent = payload.paymentMethod.notes;
        paymentNoteRow.hidden = false;
      } else {
        paymentNoteRow.hidden = true;
      }

      if (payload.paymentMethod.paymentURL) {
        paymentLink.href = payload.paymentMethod.paymentURL;
        paymentLink.hidden = false;
      } else {
        paymentLink.hidden = true;
        paymentLink.removeAttribute('href');
      }

      if (payload.paymentMethod.qrImageBase64) {
        paymentQR.src = `data:image/png;base64,${payload.paymentMethod.qrImageBase64}`;
        qrBlock.hidden = false;
      } else {
        qrBlock.hidden = true;
        paymentQR.removeAttribute('src');
      }

      paymentSection.hidden = false;
    } else {
      paymentSection.hidden = true;
    }

    error.hidden = true;
    card.hidden = false;
  }

  async function init() {
    const fragmentPayload = parsePayload();
    if (fragmentPayload) {
      render(fragmentPayload);
      return;
    }

    const shareID = shareIDFromPath();
    if (shareID) {
      const payload = await fetchPayloadByShareID(shareID);
      if (payload) render(payload);
      return;
    }

    showError('No split data found.', 'This Splitlee link has no payload.');
  }

  init();
})();
