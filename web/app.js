(() => {
  const localeButtons = Array.from(document.querySelectorAll('[data-locale]'));

  const landing = document.getElementById('landing');
  const card = document.getElementById('card');
  const error = document.getElementById('error');
  const errorTitle = document.getElementById('error-title');
  const errorMessage = document.getElementById('error-message');

  const landingKicker = document.getElementById('landing-kicker');
  const landingTitle = document.getElementById('landing-title');
  const landingCopy = document.getElementById('landing-copy');
  const landingPoint1 = document.getElementById('landing-point-1');
  const landingPoint2 = document.getElementById('landing-point-2');
  const landingPoint3 = document.getElementById('landing-point-3');
  const modeLabel = document.getElementById('mode-label');
  const totalLabel = document.getElementById('total-label');
  const peopleTitle = document.getElementById('people-title');
  const paymentTitle = document.getElementById('payment-title');
  const paymentNoteLabel = document.getElementById('payment-note-label');
  const privacy1 = document.getElementById('privacy-1');
  const privacy2 = document.getElementById('privacy-2');
  const downloadLabel = document.getElementById('download-label');
  const paymentLink = document.getElementById('payment-link');

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
  const paymentPrimaryLabel = document.getElementById('payment-primary-label');
  const paymentPrimaryValue = document.getElementById('payment-primary-value');
  const paymentSecondaryRow = document.getElementById('payment-secondary-row');
  const paymentSecondaryLabel = document.getElementById('payment-secondary-label');
  const paymentSecondaryValue = document.getElementById('payment-secondary-value');
  const paymentNoteRow = document.getElementById('payment-note-row');
  const paymentNote = document.getElementById('payment-note');
  const qrBlock = document.getElementById('qr-block');
  const paymentQR = document.getElementById('payment-qr');

  const STRINGS = {
    en: {
      landingKicker: 'Split receipts. Keep repayment clear.',
      landingTitle: 'Minimal bill splitting for real groups.',
      landingCopy: 'Scan a receipt, add items manually, assign people, and share repayment details in a clean flow that works across regions.',
      landingPoint1: 'Scan or add manually',
      landingPoint2: 'Share payment details',
      landingPoint3: 'No payment processing',
      splitMode: 'Split mode',
      total: 'Total',
      people: 'People',
      payBack: 'Pay Back',
      openLink: 'Open Link',
      note: 'Note',
      details: 'Details',
      privacy1: 'This link contains only final split summary data.',
      privacy2: 'Splitlee shares payment details only and does not process payments.',
      downloadLabel: 'Download Splitlee',
      modeEqual: 'Equal split',
      modeProportional: 'Proportional split',
      modeDefault: 'Split summary',
      payerTitle: (name) => `Paid by ${name}`,
      payerSubtitle: 'Everyone else can pay this person back using the method below.',
      errorInvalid: 'This Splitlee link is invalid.',
      errorDecode: 'The payload could not be decoded.',
      errorJson: 'The payload is not valid JSON.',
      errorVersion: 'Missing payload version.',
      errorNewer: 'Please update your app and retry.',
      errorMissing: 'Required split fields are missing.',
      errorOpen: 'This Splitlee link could not be opened.',
      errorExpired: 'The shared split may have expired or been removed.',
      errorNetwork: 'A network error occurred while loading the shared split.',
      noPayloadTitle: 'No split data found.',
      noPayloadMessage: 'This Splitlee link has no payload.',
      appStoreAria: 'Download Splitlee on the App Store',
      appStoreAlt: 'Download on the App Store'
    },
    vi: {
      landingKicker: 'Chia hóa đơn gọn, rõ người trả.',
      landingTitle: 'Chia tiền tối giản cho nhóm thật.',
      landingCopy: 'Quét hóa đơn, nhập món thủ công, gán người, và chia sẻ thông tin chuyển lại trong một luồng gọn gàng, dùng được ở nhiều khu vực.',
      landingPoint1: 'Quét hoặc nhập tay',
      landingPoint2: 'Chia sẻ cách thanh toán',
      landingPoint3: 'Không xử lý thanh toán',
      splitMode: 'Kiểu chia',
      total: 'Tổng',
      people: 'Mọi người',
      payBack: 'Chuyển lại',
      openLink: 'Mở liên kết',
      note: 'Ghi chú',
      details: 'Chi tiết',
      privacy1: 'Liên kết này chỉ chứa dữ liệu tổng kết cuối cùng.',
      privacy2: 'Splitlee chỉ chia sẻ thông tin thanh toán và không xử lý thanh toán.',
      downloadLabel: 'Tải Splitlee',
      modeEqual: 'Chia đều',
      modeProportional: 'Chia theo tỉ lệ',
      modeDefault: 'Tổng kết chia tiền',
      payerTitle: (name) => `Người trả trước: ${name}`,
      payerSubtitle: 'Mọi người có thể chuyển lại cho người này theo phương thức bên dưới.',
      errorInvalid: 'Liên kết Splitlee này không hợp lệ.',
      errorDecode: 'Không giải mã được dữ liệu.',
      errorJson: 'Dữ liệu không phải JSON hợp lệ.',
      errorVersion: 'Thiếu phiên bản dữ liệu.',
      errorNewer: 'Hãy cập nhật app rồi thử lại.',
      errorMissing: 'Thiếu các trường bắt buộc của lần chia.',
      errorOpen: 'Không thể mở liên kết Splitlee này.',
      errorExpired: 'Lần chia được chia sẻ có thể đã hết hạn hoặc bị xóa.',
      errorNetwork: 'Có lỗi mạng khi tải lần chia được chia sẻ.',
      noPayloadTitle: 'Không tìm thấy dữ liệu chia tiền.',
      noPayloadMessage: 'Liên kết Splitlee này chưa có dữ liệu.',
      appStoreAria: 'Tải Splitlee trên App Store',
      appStoreAlt: 'Tải trên App Store'
    }
  };

  const LOCALE_KEY = 'splitlee_web_locale';
  let currentLocale = resolveLocale();
  let currentPayload = null;

  function resolveLocale() {
    const params = new URLSearchParams(window.location.search);
    const explicit = params.get('lang');
    if (explicit === 'en' || explicit === 'vi') {
      localStorage.setItem(LOCALE_KEY, explicit);
      return explicit;
    }

    const stored = localStorage.getItem(LOCALE_KEY);
    if (stored === 'en' || stored === 'vi') return stored;

    return navigator.language.toLowerCase().startsWith('vi') ? 'vi' : 'en';
  }

  function t(key, ...args) {
    const value = STRINGS[currentLocale][key] ?? STRINGS.en[key];
    return typeof value === 'function' ? value(...args) : value;
  }

  function syncLocaleUI() {
    localeButtons.forEach((button) => {
      const active = button.dataset.locale === currentLocale;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    document.querySelectorAll('.download-badge img').forEach((img) => {
      img.alt = t('appStoreAlt');
    });

    document.querySelectorAll('.download-badge-link').forEach((link) => {
      link.setAttribute('aria-label', t('appStoreAria'));
    });

    landingKicker.textContent = t('landingKicker');
    landingTitle.textContent = t('landingTitle');
    landingCopy.textContent = t('landingCopy');
    landingPoint1.textContent = t('landingPoint1');
    landingPoint2.textContent = t('landingPoint2');
    landingPoint3.textContent = t('landingPoint3');
    modeLabel.textContent = t('splitMode');
    totalLabel.textContent = t('total');
    peopleTitle.textContent = t('people');
    paymentTitle.textContent = t('payBack');
    paymentLink.textContent = t('openLink');
    paymentNoteLabel.textContent = t('note');
    privacy1.textContent = t('privacy1');
    privacy2.textContent = t('privacy2');
    downloadLabel.textContent = t('downloadLabel');
  }

  function setLocale(locale) {
    if (!STRINGS[locale] || locale === currentLocale) return;
    currentLocale = locale;
    localStorage.setItem(LOCALE_KEY, locale);
    document.documentElement.lang = locale;
    syncLocaleUI();
    if (currentPayload) {
      render(currentPayload);
    } else if (!landing.hidden) {
      showLanding();
    }
  }

  function showError(title, message) {
    landing.hidden = true;
    card.hidden = true;
    error.hidden = false;
    errorTitle.textContent = title;
    errorMessage.textContent = message;
  }

  function showLanding() {
    landing.hidden = false;
    card.hidden = true;
    error.hidden = true;
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
    return new Intl.NumberFormat(currentLocale, {
      style: 'currency',
      currency,
      maximumFractionDigits: noDecimal ? 0 : 2,
      minimumFractionDigits: noDecimal ? 0 : 2
    }).format(amount);
  }

  function formatMode(mode) {
    switch (mode) {
      case 'equal':
        return t('modeEqual');
      case 'proportional':
        return t('modeProportional');
      default:
        return t('modeDefault');
    }
  }

  function parsePayload() {
    const fragment = window.location.hash.replace(/^#/, '');
    if (!fragment) return null;

    const decoded = base64urlDecode(fragment);
    if (!decoded) {
      showError(t('errorInvalid'), t('errorDecode'));
      return null;
    }

    let payload;
    try {
      payload = JSON.parse(decoded);
    } catch {
      showError(t('errorInvalid'), t('errorJson'));
      return null;
    }

    if (typeof payload.v !== 'number') {
      showError(t('errorInvalid'), t('errorVersion'));
      return null;
    }

    if (payload.v > 2) {
      showError(t('errorInvalid'), t('errorNewer'));
      return null;
    }

    if (!payload.title || !payload.currency || !Array.isArray(payload.people) || typeof payload.total !== 'number') {
      showError(t('errorInvalid'), t('errorMissing'));
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
        showError(t('errorOpen'), t('errorExpired'));
        return null;
      }

      const payload = await response.json();
      if (!payload || typeof payload.v !== 'number') {
        showError(t('errorInvalid'), t('errorMissing'));
        return null;
      }

      return payload;
    } catch {
      showError(t('errorOpen'), t('errorNetwork'));
      return null;
    }
  }

  function render(payload) {
    currentPayload = payload;

    titleEl.textContent = payload.title;

    const date = payload.date ? new Date(payload.date) : null;
    const dateLabel = date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString(currentLocale) : '';
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
      payerTitle.textContent = t('payerTitle', payload.payer.name);
      payerSubtitle.textContent = t('payerSubtitle');
      payerSection.hidden = false;
    } else {
      payerSection.hidden = true;
    }

    if (payload.paymentMethod) {
      paymentTemplate.textContent = payload.paymentMethod.templateName || payload.paymentMethod.template || '';
      paymentName.textContent = payload.paymentMethod.displayName || payload.paymentMethod.template || t('details');
      paymentPrimaryLabel.textContent = payload.paymentMethod.primaryLabel || t('details');
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
    document.documentElement.lang = currentLocale;
    syncLocaleUI();

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

    showLanding();
  }

  localeButtons.forEach((button) => {
    button.addEventListener('click', () => setLocale(button.dataset.locale));
  });

  init();
})();
