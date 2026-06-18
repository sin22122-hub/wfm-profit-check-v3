const GOOGLE_FORM_ACTION =
  'https://docs.google.com/forms/d/e/1FAIpQLSdhzTKW4jMkBPbQ58tJ2UJHQP2XNjwfJyD5MowF6FCc-dZhhA/formResponse';

const FIELD_MAP = {
  storeName: 'entry.1083752353',
  contactName: 'entry.330864519',
  phone: 'entry.1707906243',
  instagram: 'entry.527231499',
  storeType: 'entry.1449582445',
  businessType: 'entry.672256556',
  month: 'entry.1620963029',

  serviceRevenue: 'entry.1565655071',
  productRevenue: 'entry.2144465784',
  courseRevenue: 'entry.2131624406',
  otherRevenue: 'entry.1544107389',

  materialCost: 'entry.2030999767',
  productCost: 'entry.1150918617',
  techCommission: 'entry.997512654',
  assistantCommission: 'entry.1989153449',
  otherDirectCost: 'entry.1795654069',

  managerSalary: 'entry.710802695',
  staffSalary: 'entry.1053487491',
  laborInsurance: 'entry.27186313',
  bonus: 'entry.1110803399',
  otherHR: 'entry.361948318',

  rent: 'entry.1331278291',
  utilities: 'entry.1392612934',
  internetPhone: 'entry.143996885',
  posFee: 'entry.1947709599',
  cleaning: 'entry.473529161',
  misc: 'entry.209420695',

  metaAds: 'entry.1388228547',
  googleAds: 'entry.452803521',
  lineAds: 'entry.104503006',
  kol: 'entry.658077112',
  creative: 'entry.2089281697',
  otherAds: 'entry.1996606019',

  nonCashPayment: 'entry.1195904051',

  socialActive: 'entry.2392598',
  platforms: 'entry.24937666',
  weeklyPosts: 'entry.464291172',
  shortVideo: 'entry.1559783128',

  mainPain: 'entry.364503572',
  growthGoal: 'entry.784548526',
  learningPreference: 'entry.1326005160',

  totalCustomers: 'entry.1367995338',
  newCustomers: 'entry.906145170',
  returningCustomers: 'entry.589494914',
  referralCustomers: 'entry.1782207378',

  customerChannels: 'entry.1480554934',
  stableSource: 'entry.650352818',

  adLeads: 'entry.1405237024',
  bookings: 'entry.97661074',
  visits: 'entry.1363388595',
  deals: 'entry.759472950',
  adTracking: 'entry.1895985700',
};

function appendHiddenInput(form, name, value) {
  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = name;
  input.value = String(value ?? '');
  form.appendChild(input);
}

function normalizeValue(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

export function buildGoogleFormPayload(data) {
  const entries = [];

  Object.entries(FIELD_MAP).forEach(([key, entryId]) => {
    const value = data[key];

    if (Array.isArray(value)) {
      value.forEach((item) => {
        const normalized = normalizeValue(item);
        if (normalized !== '') entries.push([entryId, normalized]);
      });
      return;
    }

    const normalized = normalizeValue(value);
    if (normalized !== '') entries.push([entryId, normalized]);
  });

  return entries;
}

export async function submitToGoogleForm(data) {
  const entries = buildGoogleFormPayload(data);

  if (!entries.length) {
    throw new Error('沒有可送出的表單資料');
  }

  return new Promise((resolve) => {
    const iframeName = `pfm_google_form_target_${Date.now()}`;

    const iframe = document.createElement('iframe');
    iframe.name = iframeName;
    iframe.style.display = 'none';

    const form = document.createElement('form');
    form.action = GOOGLE_FORM_ACTION;
    form.method = 'POST';
    form.target = iframeName;
    form.acceptCharset = 'UTF-8';
    form.style.display = 'none';

    entries.forEach(([entryId, value]) => appendHiddenInput(form, entryId, value));

    // Google Forms accepts normal browser form posts most reliably.
    // These hidden fields are harmless and help avoid blank-response rows on some forms.
    appendHiddenInput(form, 'submit', 'Submit');

    document.body.appendChild(iframe);
    document.body.appendChild(form);

    let settled = false;
    const cleanup = () => {
      if (settled) return;
      settled = true;
      form.remove();
      iframe.remove();
      resolve(true);
    };

    iframe.addEventListener('load', cleanup, { once: true });
    form.submit();

    // Google blocks readable responses, so keep a short fallback.
    window.setTimeout(cleanup, 1800);
  });
}
