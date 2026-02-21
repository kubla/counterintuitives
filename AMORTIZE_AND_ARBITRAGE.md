# Amortize & Arbitrage
## Spec: 15-Year vs 30-Year “Invest the Difference” Break-Even Calculator

A single-page static website (GitHub Pages) that answers one question:

> If you can afford the 15-year monthly payment, at what constant investment return is it better to take the 30-year mortgage and invest the monthly difference?

This calculator is intentionally simple: no inflation, no taxes, no fees, no refinancing, no volatility. It is a first-order, mechanical comparison.

---

## 1) What the site does

Given:
- Mortgage principal `L`
- 15-year APR `r15`
- 30-year APR `r30`

The site computes:
- The monthly payments for each mortgage
- The monthly amount available to invest if you choose the 30-year loan
- The **break-even** annual investment return `R*` where both strategies end with the same investment account value after 30 years
- A side-by-side summary of each strategy showing:
  - Total money deployed over 30 years (identical in both strategies)
  - Total mortgage interest paid
  - Total contributed to the investment account
  - Ending investment account value (computed at a user-provided return, or else at the break-even return)
  - Investment gains (ending value minus contributions)
  - Ending home equity (principal repaid)

---

## 2) Strategies compared

Let:
- `n15 = 180` months
- `n30 = 360` months
- `P15` = monthly payment on the 15-year mortgage
- `P30` = monthly payment on the 30-year mortgage
- `D = P15 - P30` = monthly dollars “freed” by choosing the 30-year mortgage

### Scenario A: 15-year mortgage, then invest
- Months 1–180: pay `P15` to mortgage
- Months 181–360: invest `P15` per month

### Scenario B: 30-year mortgage, invest the difference
- Months 1–360: pay `P30` to mortgage
- Months 1–360: invest `D` per month

### The key identity the site must show
Both scenarios deploy the same dollars each month:

- Scenario A monthly deployment: `P15`
- Scenario B monthly deployment: `P30 + D = P30 + (P15 - P30) = P15`

Therefore both scenarios deploy the same total over 30 years:

- Scenario A total deployed: `360 * P15`
- Scenario B total deployed: `360 * (P30 + D) = 360 * P15`

This is the point of the model: the trade is *when* the investment happens and how much interest you pay, not whether you “spend more” overall.

---

## 3) Inputs

### Required
1) Mortgage amount `L`
- USD currency input
- Min: $1
- Max: $100,000,000
- Default: $1,000,000

2) 15-year APR `r15`
- Percent input
- Default: 5.35

3) 30-year APR `r30`
- Percent input
- Default: 6.01

### Optional
4) Test investment return `Rtest`
- Annual effective percent input
- Can be negative (down to -99.99)
- Default: blank

If `Rtest` is blank, the site still produces complete scenario summaries by computing ending account values at `R*` and labeling them clearly as “at break-even return.”

---

## 4) Outputs

### 4.1 Payment panel (always visible)
- `P15` (15-year monthly payment)
- `P30` (30-year monthly payment)
- `D = P15 - P30` (monthly amount invested in Scenario B)

Validation rule:
- If `D <= 0`, display an error and suppress break-even results:
  - “The 30-year payment is not lower than the 15-year payment. There is no monthly difference to invest, so this model does not apply.”

### 4.2 Break-even panel (always visible if `D > 0`)
- Break-even annual effective return `R*`
- Break-even monthly return `i*`
- A short explanation:
  - “At `R*`, Scenario A and Scenario B end with the same investment account value after 30 years. Above `R*`, investing earlier (Scenario B) wins. Below `R*`, paying down the mortgage faster (Scenario A) wins.”

### 4.3 Scenario summaries (always visible if `D > 0`)
Two cards side-by-side on desktop, stacked on mobile.

Each card must show these fields:

**Common**
- Total deployed over 30 years:
  - `TotalDeployed = 360 * P15`
  - Show the equality explicitly:
    - Scenario A: `360 * P15`
    - Scenario B: `360 * (P30 + D) = 360 * P15`
- Ending home equity:
  - `EquityEnd = L` (principal repaid; ignore home appreciation)

**Scenario A**
- Mortgage: 15-year (180 payments)
- Mortgage payments total: `Pay15Total = 180 * P15`
- Mortgage interest total: `Interest15 = Pay15Total - L`
- Investment contributions:
  - `InvestContribA = 180 * P15`
- Investment ending value:
  - `FVA` computed at:
    - `Rtest` if provided, else `R*`
- Investment gains:
  - `GainsA = FVA - InvestContribA`

**Scenario B**
- Mortgage: 30-year (360 payments)
- Mortgage payments total: `Pay30Total = 360 * P30`
- Mortgage interest total: `Interest30 = Pay30Total - L`
- Investment contributions:
  - `InvestContribB = 360 * D`
- Investment ending value:
  - `FVB` computed at:
    - `Rtest` if provided, else `R*`
- Investment gains:
  - `GainsB = FVB - InvestContribB`

If `Rtest` is provided, show:
- Winner label: “Scenario A wins” or “Scenario B wins”
- Advantage: `Delta = FVB - FVA`

Also show a small caption above the cards:
- “Scenario results computed at return: X% annual effective”
  - X is `Rtest` if provided, else `R*`

---

## 5) User-facing page copy (final)

### Header copy (top of page)
**Title:** Amortize & Arbitrage  
**Subtitle:** 15-year vs 30-year mortgage break-even return calculator

**Intro paragraph:**
This tool compares two strategies for people who can afford a 15-year mortgage payment. Either you take the 15-year loan and invest later, or you take the 30-year loan and invest the monthly payment difference immediately. The calculator tells you the break-even investment return where the 30-year strategy starts to win.

### “How to use” block (under inputs)
1) Enter your loan amount and the 15-year and 30-year rates.  
2) Optionally enter a return you expect from your alternative investment.  
3) Read the break-even return, then compare the side-by-side scenario summaries.

### “What this means” block (under results)
Both scenarios assume you deploy the same total dollars over 30 years, equal to the 15-year monthly payment times 360 months. The only difference is timing: Scenario A reduces mortgage interest by paying down principal faster; Scenario B invests sooner but pays more mortgage interest.

### Footer caveats (bottom of page)
This is a simplified model. It ignores taxes, fees, refinancing, volatility, sequence risk, home appreciation, and any behavioral risk of failing to invest the difference. Use it as a sanity check, not as personalized financial advice.

---

## 6) Math (implementation)

### 6.1 Mortgage payment formula
Inputs:
- Principal `L`
- APR `r` as a decimal (example: 0.0535)
- Term `n` months
- Monthly rate `rho = r / 12`

If `r == 0`:
- `P = L / n`

Else:
- `P = L * ( rho * (1 + rho)^n ) / ( (1 + rho)^n - 1 )`

Compute:
- `P15` using `r15` and `n15 = 180`
- `P30` using `r30` and `n30 = 360`
- `D = P15 - P30`

### 6.2 Investment compounding model
Investment return input is annual effective `R` as a decimal.

Convert to monthly:
- `i = (1 + R)^(1/12) - 1`

Future value of end-of-month contributions:
- If `i == 0`: `FV(C, i, m) = C * m`
- Else: `FV(C, i, m) = C * ( (1 + i)^m - 1 ) / i`

Scenario investment ending values:
- `FVA = FV(P15, i, 180)`
- `FVB = FV(D,   i, 360)`

### 6.3 Break-even return
Break-even is where `FVA == FVB`, assuming `D > 0`.

Closed form:
- `x = (P15 / D) - 1`
- `i* = x^(1/180) - 1`
- `R* = (1 + i*)^12 - 1`

---

## 7) Product requirements

### Responsiveness
- One column on mobile
- Two-column scenario cards on desktop

### Performance
- Recompute on every input change with a 200ms debounce
- Calculations must be synchronous and instant for typical inputs

### Formatting
- Currency via `Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })`
- Percents displayed with:
  - Inputs: 2 decimals
  - Break-even: 3 decimals
  - Return caption: 2 decimals

### Shareability
- Persist state in the URL query string:
  - `?L=1000000&r15=5.35&r30=6.01&R=8`
- On load, parse and populate inputs.
- Provide a “Copy share link” button using the Clipboard API.

### Accessibility
- Every input has a `<label>`
- Results announced clearly with text, not color alone
- Keyboard navigation works end to end

---

## 8) Technical constraints and structure

### Constraints
- No build step
- No React
- No external libraries

### Files
- `index.html`
- `styles.css`
- `app.js`

The site must run correctly as a static GitHub Pages deployment.

---

## 9) Acceptance criteria

1) With defaults (`L=1,000,000`, `r15=5.35`, `r30=6.01`), the site shows:
- `D > 0`
- A finite `R*`
- Scenario cards show identical total deployed over 30 years.

2) If `Rtest` is blank:
- Scenario cards still show ending investment values computed at `R*`, labeled accordingly.

3) If `Rtest` is provided:
- Scenario cards show values at `Rtest`
- Winner label is correct (based on `FVB - FVA`)
- Delta is shown.

4) If `D <= 0`:
- Error is shown
- Break-even and scenario results are hidden or replaced with “N/A”.

5) Share link round-trips all values exactly.
