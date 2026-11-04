// North East Origins pitch, v3: five slides (cover with team, problem,
// what we built, business model, first 100 customers), in the
// redesigned site style. Build facts on slide 3 come from origin/main.
//
// Usage: PPTX_SKILL_DIR=<pptx skill dir> NODE_PATH=./node_modules \
//        node build-v3.js <repo-path> <output.pptx>
const fs = require('fs')
const path = require('path')
const pptxgen = require('pptxgenjs')
const React = require('react')
const ReactDOMServer = require('react-dom/server')
const sharp = require('sharp')
const fa = require('react-icons/fa')
const { collect } = require('./status')
const { applyTheme } = require(path.join(process.env.PPTX_SKILL_DIR, 'scripts/apply_theme.js'))

const repo = process.argv[2] || '..'
const out = process.argv[3] || 'North-East-Origins-pitch.pptx'
const status = collect(repo)

// Colours from frontend/src/lib/design-tokens.css
const HEX = {
  canvas: '141B1D', ink: '172331', paper: 'EEECDF', band: 'DCDACC', onDark: 'ECEBDF', mutedDark: '97A6A4',
  mutedPaper: '526171', green: '00792C', blue: '0098D4', yellow: 'FFD300', line: '3A4446',
}
const THEME = {
  name: 'North East Origins Network',
  headFontFace: 'Arial',
  bodyFontFace: 'Calibri',
  colors: {
    dk1: HEX.ink, lt1: 'FFFFFF', dk2: HEX.canvas, lt2: HEX.paper,
    accent1: HEX.yellow, accent2: HEX.green, accent3: HEX.blue, accent4: HEX.mutedDark,
    accent5: HEX.band, accent6: HEX.mutedPaper, hlink: HEX.blue, folHlink: HEX.mutedDark,
  },
}

async function png(svg, width) {
  return 'image/png;base64,' + (await sharp(Buffer.from(svg)).resize({ width }).png().toBuffer()).toString('base64')
}
const icon = (Comp, color) => png(ReactDOMServer.renderToStaticMarkup(React.createElement(Comp, { color: '#' + color, size: 256 })), 256)

async function main() {
  const pres = new pptxgen()
  pres.layout = 'LAYOUT_16x9' // 10 x 5.625 in
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace }
  pres.title = 'North East Origins — pitch'
  pres.author = 'North East Origins team'
  const C = pres.SchemeColor
  const logo = await png(fs.readFileSync(path.join(__dirname, 'bridge.svg')), 720)

  pres.defineSlideMaster({
    title: 'COVER',
    background: { color: HEX.canvas },
    objects: [
      { placeholder: { options: { name: 'title', type: 'title', x: 0.6, y: 2.25, w: 5.8, h: 1.0, fontSize: 44, bold: true, color: C.background2, fontFace: 'Arial', align: 'left', valign: 'bottom', margin: 0 }, text: '' } },
      { placeholder: { options: { name: 'body', type: 'body', x: 0.6, y: 3.35, w: 5.6, h: 0.9, fontSize: 18, color: C.accent4, align: 'left', valign: 'top', margin: 0 }, text: '' } },
    ],
  })
  pres.defineSlideMaster({
    title: 'NETWORK',
    background: { color: HEX.canvas },
    slideNumber: { x: 9.0, y: 5.2, w: 0.5, h: 0.3, fontSize: 10, color: HEX.mutedDark, align: 'right' },
    objects: [
      { image: { data: logo, x: 0.5, y: 5.17, w: 0.45, h: 0.275 } },
      { text: { text: 'North East Origins  /  Projects. People. Progress.', options: { x: 1.05, y: 5.2, w: 5.5, h: 0.3, fontSize: 10, color: HEX.mutedDark, margin: 0 } } },
      { placeholder: { options: { name: 'kicker', type: 'body', x: 0.5, y: 0.3, w: 9, h: 0.3, fontSize: 10, color: C.accent4, charSpacing: 2, align: 'left', margin: 0 }, text: '' } },
      { placeholder: { options: { name: 'title', type: 'title', x: 0.5, y: 0.6, w: 9, h: 0.65, fontSize: 30, bold: true, color: C.background2, fontFace: 'Arial', align: 'left', valign: 'middle', margin: 0 }, text: '' } },
    ],
  })

  const I = {}
  for (const [k, comp, col] of [
    ['users', fa.FaUserFriends, HEX.ink], ['clock', fa.FaHourglassHalf, HEX.ink], ['search', fa.FaSearchLocation, HEX.ink],
    ['rocket', fa.FaRocket, HEX.ink], ['filter', fa.FaFilter, HEX.ink], ['check', fa.FaClipboardCheck, HEX.ink],
    ['chart', fa.FaChartLine, HEX.ink], ['lock', fa.FaLock, HEX.ink], ['db', fa.FaDatabase, HEX.ink], ['shield', fa.FaShieldAlt, HEX.ink],
    ['tag', fa.FaTags, HEX.ink], ['hand', fa.FaHandshake, HEX.ink], ['globe', fa.FaGlobeEurope, HEX.ink], ['server', fa.FaServer, HEX.ink],
    ['heart', fa.FaHeart, HEX.ink], ['bolt', fa.FaBolt, HEX.ink], ['github', fa.FaGithub, HEX.ink], ['seed', fa.FaSeedling, HEX.ink],
    ['code', fa.FaCode, HEX.ink], ['link', fa.FaExternalLinkAlt, HEX.ink],
  ]) I[k] = await icon(comp, col)

  const txt = (s, text, o) => s.addText(text, { isTextBox: true, margin: 0, valign: 'top', ...o })
  // Motif 1: square paper "ticket" with a hard offset shadow, as on the site.
  const ticket = (s, x, y, w, h, name, fill = C.background2) =>
    s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: fill }, line: { type: 'none' }, objectName: name,
      shadow: { type: 'outer', color: '000000', opacity: 0.35, blur: 0, offset: 6, angle: 55 } })
  // Motif 2: route station (coloured disc with an icon), joined by route lines.
  const station = (s, img, x, y, d, fill, name) => {
    s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill }, line: { color: HEX.canvas, width: 3 }, objectName: name + ' station' })
    if (img) s.addImage({ data: img, x: x + d * 0.26, y: y + d * 0.26, w: d * 0.48, h: d * 0.48, objectName: name, altText: name })
  }
  const route = (s, x, y, w, color, name = 'route line') =>
    s.addShape(pres.shapes.LINE, { x, y, w, h: 0, line: { color, width: 7 }, objectName: name })
  const content = (title, kicker, section) => {
    const s = pres.addSlide({ masterName: 'NETWORK', sectionTitle: section })
    s.addText(kicker.toUpperCase(), { placeholder: 'kicker' })
    s.addText(title, { placeholder: 'title' })
    return s
  }
  const ROUTE = [HEX.green, HEX.blue, HEX.yellow]
  const ROUTE_S = [C.accent2, C.accent3, C.accent1]


  // ---------- Business model numbers (from the live pricing page + assumptions) ----------
  // frontend/src/components/ui/PricingPage.tsx on main: Investor membership £5.99/month.
  // Founders and contributors are free. Billing is not switched on yet.
  const GBP_PER_USD = 0.77 // approximate; providers quote USD
  const PRICE = 5.99
  const HOSTING_USD = 25 + 25 // Render Standard web service + Supabase Pro
  const HOSTING = Math.round(HOSTING_USD * GBP_PER_USD)
  const DOMAIN_EMAIL = 6
  // Planned AI matching for free contributors: ~20 explained matches per contributor per month,
  // ~3k input + 300 output tokens each, Claude Haiku 5.5 at $0.10 / $0.50 per million tokens.
  const CONTRIBUTORS = 1000
  const AI_PER_CONTRIBUTOR = (20 * (3000 * 0.10 + 300 * 0.50) / 1e6) * GBP_PER_USD
  const AI = Math.ceil(CONTRIBUTORS * AI_PER_CONTRIBUTOR)
  const FIXED = HOSTING + DOMAIN_EMAIL + AI
  const CARD = PRICE * 0.015 + 0.20 // UK card fees ≈ 1.5% + 20p
  const MARGIN = PRICE - CARD
  const BREAK_EVEN = Math.ceil(FIXED / MARGIN)
  const at = (n) => ({ revenue: n * PRICE, cost: FIXED + n * CARD, profit: n * PRICE - (FIXED + n * CARD) })
  const h100 = at(100)
  const gbp = (v, d = 0) => '£' + v.toLocaleString('en-GB', { minimumFractionDigits: d, maximumFractionDigits: d })

  // 1 — Cover
  pres.addSection({ title: 'Cover' })
  let s = pres.addSlide({ masterName: 'COVER', sectionTitle: 'Cover' })
  s.addImage({ data: logo, x: 0.6, y: 0.65, w: 2.2, h: 1.344, objectName: 'bridge logo', altText: 'North East Origins bridge logo' })
  s.addText('North East Origins', { placeholder: 'title' })
  s.addText('Where North East founders publish projects and open specific needs, and local builders find where their skills count.', { placeholder: 'body' })
  txt(s, 'PROJECTS · PEOPLE · PROGRESS  /  NORTH EAST ENGLAND', { x: 0.6, y: 4.6, w: 6, h: 0.3, fontSize: 11, color: C.accent4, charSpacing: 2 })
  txt(s, 'north-east-origins.onrender.com', { x: 0.6, y: 4.95, w: 5, h: 0.35, fontSize: 14, bold: true, color: C.accent1, hyperlink: { url: 'https://north-east-origins.onrender.com/' } })
  // Team, on the cover so the deck stays at five slides.
  ticket(s, 6.55, 0.65, 2.95, 4.3, 'team ticket')
  txt(s, 'THE TEAM', { x: 6.8, y: 0.82, w: 2.5, h: 0.3, fontSize: 10, bold: true, color: C.accent2, charSpacing: 2 })
  s.addShape(pres.shapes.LINE, { x: 6.97, y: 1.35, w: 0, h: 2.0, line: { color: HEX.green, width: 4 }, objectName: 'team route' })
  ;[['P1', 'Platform & identity'], ['P2', 'Projects'], ['P3', 'Progress timeline'], ['P4', 'Opportunities'], ['P5', 'Discovery & integration']].forEach(([id, lane], i) => {
    const y = 1.2 + i * 0.5
    s.addShape(pres.shapes.OVAL, { x: 6.8, y, w: 0.34, h: 0.34, fill: { color: HEX.paper }, line: { color: HEX.green, width: 3 }, objectName: id + ' stop' })
    txt(s, [{ text: id + '  ', options: { bold: true, color: C.accent2 } }, { text: lane, options: { color: C.text1 } }], { x: 7.3, y: y - 0.02, w: 2.1, h: 0.38, fontSize: 13, valign: 'middle' })
  })
  txt(s, `Five people, each directing AI coding agents in their own lane, shipped a live, secure app in an afternoon through ${status.mergedPrs} reviewed PRs.`, { x: 6.8, y: 3.75, w: 2.5, h: 1.1, fontSize: 11, color: C.accent6 })
  s.addNotes('Five people, each owning one part of the product and directing AI coding agents: platform and identity, projects, progress, opportunities, and discovery and integration. We merged reviewed pull requests one at a time. North East Origins. We built a live platform for North East England: founders publish projects and open specific needs, and local builders find where their skills count. It is live at north-east-origins.onrender.com.')

  // 2 — Problem and who has it
  pres.addSection({ title: 'Problem' })
  s = content('Good ideas stall without the right people', 'The problem and who has it', 'Problem')
  ;[
    [I.rocket, 'Who has it', 'North East founders with an idea and a skills gap, builders looking for a project, and investors who can’t see what’s being built locally.'],
    [I.clock, 'The pain', 'Friends share your skills, not complement them. Listings go stale. Builders can’t see where they’d make a difference.'],
    [I.bolt, 'Why now', 'AI tools make building cheaper and faster, so the bottleneck has moved from code to finding the right people.'],
  ].forEach(([img, h, b], i) => {
    const x = 0.5 + i * 3.07
    ticket(s, x, 1.45, 2.85, 2.75, h + ' ticket')
    station(s, img, x + 0.3, 1.7, 0.65, ROUTE_S[i], h)
    txt(s, h, { x: x + 0.3, y: 2.5, w: 2.3, h: 0.4, fontSize: 18, bold: true, color: C.text1, fontFace: 'Arial' })
    txt(s, b, { x: x + 0.3, y: 2.95, w: 2.3, h: 1.2, fontSize: 13, color: C.accent6 })
  })
  txt(s, [
    { text: 'Most tools ask “Who are you?”  ', options: { color: C.accent4 } },
    { text: 'We ask “What are you building, and what does it need?”', options: { color: C.accent1, bold: true } },
  ], { x: 0.5, y: 4.45, w: 9, h: 0.5, fontSize: 16, valign: 'middle' })
  s.addNotes('Who: early-stage founders in the North East, from students to local professionals. The pain: the people around you have the same skills, listings never show whether a project is moving, and would-be contributors cannot see where they fit. Why now: AI tools have made building cheap, so the hard part is finding the right people. This is our hypothesis and we will validate it with the first 100 founders.')

  // 3 — What we built
  pres.addSection({ title: 'Product' })
  s = content('What we built', 'In → product → out', 'Product')
  const flow = [
    ['IN', ['A founder’s project and its specific needs', 'A builder’s skills, place and hours']],
    ['NORTH EAST ORIGINS', ['Public project pages', 'Dated progress timeline', 'Skill & location discovery', 'Private applications', 'Investor membership']],
    ['OUT', ['The right people apply to the exact need', 'Founders form a team', 'Investors follow real progress']],
  ]
  route(s, 1.0, 2.6, 7.6, HEX.blue, 'flow route')
  flow.forEach(([h, lines], i) => {
    const x = 0.5 + i * 3.07
    const dark = i === 1
    ticket(s, x, 1.4, 2.85, 2.4, h + ' ticket', dark ? C.accent1 : C.background2)
    txt(s, h, { x: x + 0.25, y: 1.55, w: 2.4, h: 0.3, fontSize: 11, bold: true, color: [C.accent2, C.text1, C.accent3][i], charSpacing: 2 })
    txt(s, lines.map((l, j) => ({ text: l, options: { breakLine: j < lines.length - 1, bold: dark, paraSpaceAfter: dark ? 4 : 10 } })), { x: x + 0.25, y: 1.95, w: 2.45, h: 1.75, fontSize: 14, color: C.text1 })
  })
  txt(s, 'WHY IT BEATS THE ALTERNATIVES', { x: 0.5, y: 4.0, w: 9, h: 0.3, fontSize: 11, bold: true, color: C.accent1, charSpacing: 2 })
  txt(s, 'LinkedIn is profile-first. Group chats are unstructured and vanish. Job boards are for paid roles. We show what’s being built, how it’s progressing and exactly what it needs.', { x: 0.5, y: 4.3, w: 9, h: 0.5, fontSize: 13, color: C.background2 })
  txt(s, `Live: React + Express + Supabase (Postgres, Auth, Row Level Security) on Render. ${status.mergedPrs} reviewed PRs merged; main @ ${status.sha}.`, { x: 0.5, y: 4.85, w: 9, h: 0.3, fontSize: 10, color: C.accent4 })
  s.addNotes(`In: a founder’s project and its specific needs, and a builder’s skills, location and availability. The product: public project pages with a dated timeline, discovery by skill and location, and private applications. Out: the right people apply to the exact need and founders form a team. Against the alternatives: LinkedIn is about people not projects, group chats are unstructured, job boards are for paid roles. Built as React, Express and Supabase with Row Level Security, live on Render. Generated from main at ${status.sha}.`)

  // 4 — Business model
  pres.addSection({ title: 'Business case' })
  s = content('Who pays, and does it make money?', 'Business model', 'Business case')
  ticket(s, 0.5, 1.4, 4.4, 1.05, 'price ticket', C.accent1)
  txt(s, [
    { text: `Investors pay ${gbp(PRICE, 2)}/month`, options: { bold: true, fontSize: 18, fontFace: 'Arial', breakLine: true } },
    { text: 'To discover NE projects by sector, place and stage, and follow their progress. Founders and contributors stay free.', options: { fontSize: 12 } },
  ], { x: 0.7, y: 1.5, w: 4.05, h: 0.9, color: C.text1 })
  const costRows = [
    ['Cost to serve (monthly)', ''],
    ['Hosting: Render + Supabase Pro', `${gbp(HOSTING)} ($${HOSTING_USD})`],
    ['Domain + transactional email', gbp(DOMAIN_EMAIL)],
    [`AI matching for ${CONTRIBUTORS.toLocaleString('en-GB')} free contributors`, gbp(AI)],
    ['Card fees per investor', gbp(CARD, 2)],
  ]
  costRows.forEach(([k, v], i) => {
    const y = 2.6 + i * 0.32
    txt(s, k, { x: 0.5, y, w: 3.4, h: 0.3, fontSize: i ? 12 : 11, bold: !i, color: i ? C.background2 : C.accent1, charSpacing: i ? 0 : 1, valign: 'middle' })
    txt(s, v, { x: 3.7, y, w: 1.2, h: 0.3, fontSize: 12, bold: true, color: C.background2, align: 'right', valign: 'middle' })
  })
  txt(s, [
    { text: `Break-even: ${BREAK_EVEN} investors`, options: { bold: true, color: C.accent1, breakLine: true } },
    { text: `At 100: ${gbp(h100.revenue)} revenue, ${gbp(h100.cost)} cost, ${gbp(h100.profit)}/month profit`, options: { color: C.background2 } },
  ], { x: 0.5, y: 4.25, w: 4.5, h: 0.6, fontSize: 13 })
  const pts = [10, 50, 100]
  s.addChart(pres.charts.BAR, [
    { name: 'Revenue', labels: pts.map((n) => `${n} investors`), values: pts.map((n) => Math.round(at(n).revenue)) },
    { name: 'Cost', labels: pts.map((n) => `${n} investors`), values: pts.map((n) => Math.round(at(n).cost)) },
  ], {
    x: 5.2, y: 1.35, w: 4.4, h: 3.5, barDir: 'col', barGapWidthPct: 60, chartColors: [HEX.yellow, HEX.mutedDark],
    showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '"£"#,##0', dataLabelColor: HEX.onDark, dataLabelFontSize: 11, dataLabelFontFace: '+mn-lt',
    showTitle: true, title: 'Monthly revenue vs cost', titleFontSize: 13, titleColor: HEX.onDark, titleFontFace: '+mn-lt',
    catAxisLabelColor: HEX.onDark, catAxisLabelFontSize: 11, catAxisLabelFontFace: '+mn-lt',
    valAxisHidden: true, valGridLine: { style: 'none' }, catGridLine: { style: 'none' },
    showLegend: true, legendPos: 'b', legendColor: HEX.onDark, legendFontSize: 11, legendFontFace: '+mn-lt',
    objectName: 'revenue vs cost chart', altText: pts.map((n) => `${n} investors: ${gbp(at(n).revenue)} revenue vs ${gbp(at(n).cost)} cost`).join('; '),
  })
  txt(s, 'Price from our live pricing page; billing not switched on yet. Assumes $1 ≈ £0.77; AI matching is planned. Profit is before paying the team.', { x: 0.5, y: 4.88, w: 9, h: 0.28, fontSize: 10, color: C.accent4 })
  s.addNotes(`Investors pay ${gbp(PRICE, 2)} a month, the price on our live pricing page, to discover North East projects by sector, place and stage and follow their progress. Founders and contributors are always free, because they are what makes the platform worth paying for. We never process investments or score projects. Costs: hosting on Render and Supabase Pro is about ${gbp(HOSTING)} a month, plus ${gbp(DOMAIN_EMAIL)} for domain and email, plus about ${gbp(AI)} of AI matching for ${CONTRIBUTORS} free contributors on Claude Haiku 5.5. Card fees are about ${gbp(CARD, 2)} per investor. That puts break-even at ${BREAK_EVEN} investors. At 100 investors: ${gbp(h100.revenue)} revenue, ${gbp(h100.cost)} cost, about ${gbp(h100.profit)} a month profit before paying ourselves. Billing is not switched on yet; the price is shown but no payment is taken.`)

  // 5 — First 100 customers
  s = content('Our first 100 customers', 'Go to market', 'Business case')
  ;[
    ['WHO', 'Angel investors and early-stage funds interested in the North East, plus university and corporate innovation scouts.'],
    ['THE OFFER', `“Founding 100”: first month free, then ${gbp(PRICE, 2)}/month, cancel anytime. Founders and contributors free forever.`],
    ['ROUTE IN', 'Regional angel networks and investor events, university demo days, and founders on the platform inviting the investors they already know.'],
  ].forEach(([h, b], i) => {
    const y = 1.4 + i * 1.12
    station(s, null, 0.5, y + 0.05, 0.3, ROUTE_S[i], h)
    txt(s, h, { x: 0.95, y, w: 3.9, h: 0.3, fontSize: 11, bold: true, color: ROUTE_S[i], charSpacing: 2 })
    txt(s, b, { x: 0.95, y: y + 0.3, w: 3.95, h: 0.75, fontSize: 12, color: C.background2 })
  })
  s.addShape(pres.shapes.LINE, { x: 0.65, y: 1.75, w: 0, h: 2.3, line: { color: HEX.line, width: 3 }, objectName: 'gtm route' })
  ticket(s, 5.2, 1.4, 4.3, 1.75, 'targets ticket')
  txt(s, 'TARGETS · FIRST 6 MONTHS', { x: 5.45, y: 1.52, w: 3.9, h: 0.3, fontSize: 10, bold: true, color: C.accent2, charSpacing: 2 })
  ;[['300', 'projects published'], ['1,000', 'contributors'], ['100', 'paying investors']].forEach(([n, l], i) => {
    const x = 5.45 + i * 1.33
    txt(s, n, { x, y: 1.85, w: 1.3, h: 0.6, fontSize: 28, bold: true, color: C.text1, fontFace: 'Arial' })
    txt(s, l, { x, y: 2.45, w: 1.25, h: 0.55, fontSize: 11, color: C.accent6 })
  })
  ticket(s, 5.2, 3.35, 4.3, 1.45, 'risk ticket', C.accent1)
  txt(s, [
    { text: 'BIGGEST RISK: TOO LITTLE TO DISCOVER', options: { bold: true, fontSize: 10, charSpacing: 2, breakLine: true } },
    { text: 'Investors won’t pay to browse an empty map. Founders join free first; we only charge once 300 projects are live and moving.', options: { fontSize: 12 } },
  ], { x: 5.45, y: 3.5, w: 3.9, h: 1.2, color: C.text1 })
  s.addNotes(`Who: angel investors and early-stage funds interested in the North East, plus university and corporate innovation scouts. Offer: Founding 100, first month free, then ${gbp(PRICE, 2)} a month, cancel any time; founders and contributors are free forever. Route in: regional angel networks and investor events, university demo days, and founders inviting investors they already know. Targets for the first six months: 300 published projects and 1,000 contributors to make the platform worth browsing, and 100 paying investors. Biggest risk: too little to discover. So founders join free first, and we only start charging once there are about 300 live projects.`)

  await pres.writeFile({ fileName: out })
  await applyTheme(out, THEME)
  console.log(`Wrote ${out} from main @ ${status.sha}; fixed £${FIXED}, break-even ${BREAK_EVEN}, profit@100 ${h100.profit.toFixed(0)}`)
}
main().catch((e) => { console.error(e); process.exit(1) })
