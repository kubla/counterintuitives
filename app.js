const fmtCurrency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const fmtPct2 = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtPct3 = new Intl.NumberFormat('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

const el = {
  loan: document.getElementById('loan'),
  apr15: document.getElementById('apr15'),
  apr30: document.getElementById('apr30'),
  rtest: document.getElementById('rtest'),
  p15: document.getElementById('p15'),
  p30: document.getElementById('p30'),
  d: document.getElementById('d'),
  error: document.getElementById('error'),
  breakEvenPanel: document.getElementById('breakEvenPanel'),
  scenarioPanel: document.getElementById('scenarioPanel'),
  rstar: document.getElementById('rstar'),
  istar: document.getElementById('istar'),
  rstarInline: document.getElementById('rstarInline'),
  returnCaption: document.getElementById('returnCaption'),
  winnerLine: document.getElementById('winnerLine'),
  scenarioA: document.getElementById('scenarioA'),
  scenarioB: document.getElementById('scenarioB'),
  copyLink: document.getElementById('copyLink')
};

function payment(L, aprPct, n) {
  const r = aprPct / 100;
  if (r === 0) return L / n;
  const rho = r / 12;
  const pow = (1 + rho) ** n;
  return L * ((rho * pow) / (pow - 1));
}

function fv(c, i, m) {
  if (i === 0) return c * m;
  return c * (((1 + i) ** m - 1) / i);
}

function asPct(value, digitsFmt) {
  return `${digitsFmt.format(value * 100)}%`;
}

function row(label, value) {
  return `<div><dt>${label}</dt><dd>${value}</dd></div>`;
}

function buildQuery() {
  const params = new URLSearchParams();
  params.set('L', el.loan.value);
  params.set('r15', el.apr15.value);
  params.set('r30', el.apr30.value);
  if (el.rtest.value !== '') params.set('R', el.rtest.value);
  return `${location.pathname}?${params.toString()}`;
}

function parseQuery() {
  const q = new URLSearchParams(location.search);
  if (q.has('L')) el.loan.value = q.get('L');
  if (q.has('r15')) el.apr15.value = q.get('r15');
  if (q.has('r30')) el.apr30.value = q.get('r30');
  if (q.has('R')) el.rtest.value = q.get('R');
}

function calculate() {
  const L = Number(el.loan.value);
  const r15 = Number(el.apr15.value);
  const r30 = Number(el.apr30.value);
  const testGiven = el.rtest.value !== '';
  const Rtest = Number(el.rtest.value) / 100;

  const P15 = payment(L, r15, 180);
  const P30 = payment(L, r30, 360);
  const D = P15 - P30;

  el.p15.textContent = fmtCurrency.format(P15);
  el.p30.textContent = fmtCurrency.format(P30);
  el.d.textContent = fmtCurrency.format(D);

  history.replaceState(null, '', buildQuery());

  if (!Number.isFinite(D) || D <= 0) {
    el.error.hidden = false;
    el.error.textContent = 'The 30-year payment is not lower than the 15-year payment. There is no monthly difference to invest, so this model does not apply.';
    el.breakEvenPanel.hidden = true;
    el.scenarioPanel.hidden = true;
    return;
  }

  const x = P15 / D - 1;
  const istar = x ** (1 / 180) - 1;
  const rstar = (1 + istar) ** 12 - 1;

  el.error.hidden = true;
  el.breakEvenPanel.hidden = false;
  el.scenarioPanel.hidden = false;

  el.rstar.textContent = asPct(rstar, fmtPct3);
  el.istar.textContent = asPct(istar, fmtPct3);
  el.rstarInline.textContent = asPct(rstar, fmtPct3);

  const useR = testGiven ? Rtest : rstar;
  const i = (1 + useR) ** (1 / 12) - 1;

  const pay15Total = 180 * P15;
  const pay30Total = 360 * P30;
  const totalDeployed = 360 * P15;
  const investContribA = 180 * P15;
  const investContribB = 360 * D;
  const FVA = fv(P15, i, 180);
  const FVB = fv(D, i, 360);
  const gainsA = FVA - investContribA;
  const gainsB = FVB - investContribB;

  const retLabel = testGiven ? asPct(useR, fmtPct2) : `${asPct(rstar, fmtPct3)} (break-even return)`;
  el.returnCaption.textContent = `Scenario results computed at return: ${retLabel} annual effective`;

  if (testGiven) {
    const delta = FVB - FVA;
    const winner = delta > 0 ? 'Scenario B wins' : delta < 0 ? 'Scenario A wins' : 'Tie';
    el.winnerLine.textContent = `${winner}. Advantage (Scenario B - Scenario A): ${fmtCurrency.format(delta)}.`;
  } else {
    el.winnerLine.textContent = '';
  }

  el.scenarioA.innerHTML = [
    row('Total deployed over 30 years', `${fmtCurrency.format(totalDeployed)} (360 × P15)`),
    row('Ending home equity', fmtCurrency.format(L)),
    row('Mortgage payments total', fmtCurrency.format(pay15Total)),
    row('Mortgage interest total', fmtCurrency.format(pay15Total - L)),
    row('Investment contributions', fmtCurrency.format(investContribA)),
    row('Investment ending value', fmtCurrency.format(FVA)),
    row('Investment gains', fmtCurrency.format(gainsA))
  ].join('');

  el.scenarioB.innerHTML = [
    row('Total deployed over 30 years', `${fmtCurrency.format(totalDeployed)} (360 × (P30 + D) = 360 × P15)`),
    row('Ending home equity', fmtCurrency.format(L)),
    row('Mortgage payments total', fmtCurrency.format(pay30Total)),
    row('Mortgage interest total', fmtCurrency.format(pay30Total - L)),
    row('Investment contributions', fmtCurrency.format(investContribB)),
    row('Investment ending value', fmtCurrency.format(FVB)),
    row('Investment gains', fmtCurrency.format(gainsB))
  ].join('');
}

let timer;
function debouncedCalculate() {
  clearTimeout(timer);
  timer = setTimeout(calculate, 200);
}

[el.loan, el.apr15, el.apr30, el.rtest].forEach((input) => input.addEventListener('input', debouncedCalculate));

el.copyLink.addEventListener('click', async () => {
  const full = `${location.origin}${buildQuery()}`;
  try {
    await navigator.clipboard.writeText(full);
    el.copyLink.textContent = 'Copied!';
    setTimeout(() => {
      el.copyLink.textContent = 'Copy share link';
    }, 1000);
  } catch {
    el.copyLink.textContent = 'Clipboard unavailable';
    setTimeout(() => {
      el.copyLink.textContent = 'Copy share link';
    }, 1200);
  }
});

parseQuery();
calculate();
