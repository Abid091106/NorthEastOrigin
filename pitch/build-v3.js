// North East Origins pitch, v3: the organisers' format (cover + 5 slides:
// problem, what we built, business model, first 100 customers, team), in the
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
      { placeholder: { options: { name: 'title', type: 'title', x: 0.6, y: 2.25, w: 6.4, h: 1.0, fontSize: 44, bold: true, color: C.background2, fontFace: 'Arial', align: 'left', valign: 'bottom', margin: 0 }, text: '' } },
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


  // ---------- Business model numbers (assumptions, shown on slide 4) ----------
  const GBP_PER_USD = 0.77 // approximate; prices below are quoted in USD by the providers
  const PRICE = 8 // £ per Founder Pro per month
  const FIXED_USD = 25 + 25 // Render Standard web service + Supabase Pro
  const FIXED = Math.round(FIXED_USD * GBP_PER_USD) + 6 // + domain and transactional email ≈ £6
  // AI: ~300 explained matches per Pro founder per month, ~3k input + 300 output tokens each,
  // Claude Haiku 5.5 at $0.10 / $0.50 per million tokens (short prompts).
  const AI_USD = (300 * 3000 * 0.10 + 300 * 300 * 0.50) / 1e6
  const AI = AI_USD * GBP_PER_USD
  const CARD = PRICE * 0.015 + 0.20 // UK card fees ≈ 1.5% + 20p
  const VAR = AI + CARD
  const MARGIN = PRICE - VAR
  const BREAK_EVEN = Math.ceil(FIXED / MARGIN)
  const at = (n) => ({ revenue: n * PRICE, cost: FIXED + n * VAR, profit: n * PRICE - (FIXED + n * VAR) })
  const h100 = at(100)
  const gbp = (v, d = 0) => '£' + v.toLocaleString('en-GB', { minimumFractionDigits: d, maximumFractionDigits: d })

  // 1 — Cover
  pres.addSection({ title: 'Cover' })
  let s = pres.addSlide({ masterName: 'COVER', sectionTitle: 'Cover' })
  s.addImage({ data: logo, x: 0.6, y: 0.65, w: 2.2, h: 1.344, objectName: 'bridge logo', altText: 'North East Origins bridge logo' })
  s.addText('North East Origins', { placeholder: 'title' })
  s.addText('A live platform where North East founders publish projects and open specific needs, and local builders find where their skills count.', { placeholder: 'body' })
  txt(s, 'PROJECTS · PEOPLE · PROGRESS  /  NORTH EAST ENGLAND', { x: 0.6, y: 4.6, w: 6, h: 0.3, fontSize: 11, color: C.accent4, charSpacing: 2 })
  txt(s, 'north-east-origins.onrender.com', { x: 0.6, y: 4.95, w: 5, h: 0.35, fontSize: 14, bold: true, color: C.accent1, hyperlink: { url: 'https://north-east-origins.onrender.com/' } })
  ;[[HEX.green, 1.3], [HEX.blue, 2.3], [HEX.yellow, 3.3]].forEach(([col, y], i) => {
    s.addShape(pres.shapes.LINE, { x: 7.4, y, w: 2.6, h: 0, line: { color: col, width: 9 }, objectName: 'cover route ' + i })
    s.addShape(pres.shapes.OVAL, { x: 7.75 + i * 0.6, y: y - 0.17, w: 0.34, h: 0.34, fill: { color: HEX.paper }, line: { color: col, width: 4 }, objectName: 'cover stop ' + i })
  })
  s.addNotes('North East Origins. We built a live platform for North East England: founders publish projects and open specific needs, and local builders find where their skills count. It is live at north-east-origins.onrender.com.')

  // 2 — Problem and who has it
  pres.addSection({ title: 'Problem' })
  s = content('Good ideas stall without the right people', 'The problem and who has it', 'Problem')
  ;[
    [I.rocket, 'Who has it', 'Early-stage founders across the North East: students, graduates and local professionals with an idea and a skills gap.'],
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
    ['NORTH EAST ORIGINS', ['Public project pages', 'Dated progress timeline', 'Skill & location discovery', 'Private applications']],
    ['OUT', ['The right people apply to the exact need', 'Founders review privately and form a team']],
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
    { text: `Founder Pro  ·  ${gbp(PRICE)}/month`, options: { bold: true, fontSize: 18, fontFace: 'Arial', breakLine: true } },
    { text: 'AI-explained candidate matches, unlimited needs, applicant tracking. Contributors and browsing stay free.', options: { fontSize: 12 } },
  ], { x: 0.7, y: 1.5, w: 4.05, h: 0.9, color: C.text1 })
  const costRows = [
    ['Cost to serve (monthly)', ''],
    ['Hosting: Render + Supabase Pro', `${gbp(Math.round(FIXED_USD * GBP_PER_USD))} ($${FIXED_USD})`],
    ['Domain + transactional email', '£6'],
    ['AI per Pro founder (Claude Haiku 5.5)', gbp(AI, 2)],
    ['Card fees per Pro founder', gbp(CARD, 2)],
  ]
  costRows.forEach(([k, v], i) => {
    const y = 2.6 + i * 0.32
    txt(s, k, { x: 0.5, y, w: 3.2, h: 0.3, fontSize: i ? 12 : 11, bold: !i, color: i ? C.background2 : C.accent1, charSpacing: i ? 0 : 1, valign: 'middle' })
    txt(s, v, { x: 3.7, y, w: 1.2, h: 0.3, fontSize: 12, bold: true, color: C.background2, align: 'right', valign: 'middle' })
  })
  txt(s, [
    { text: `Break-even: ${BREAK_EVEN} paying founders`, options: { bold: true, color: C.accent1, breakLine: true } },
    { text: `At 100: ${gbp(h100.revenue)} revenue, ${gbp(h100.cost)} cost, ${gbp(h100.profit)}/month profit`, options: { color: C.background2 } },
  ], { x: 0.5, y: 4.25, w: 4.5, h: 0.6, fontSize: 13 })
  const pts = [10, 50, 100]
  s.addChart(pres.charts.BAR, [
    { name: 'Revenue', labels: pts.map((n) => `${n} founders`), values: pts.map((n) => Math.round(at(n).revenue)) },
    { name: 'Cost', labels: pts.map((n) => `${n} founders`), values: pts.map((n) => Math.round(at(n).cost)) },
  ], {
    x: 5.2, y: 1.35, w: 4.4, h: 3.5, barDir: 'col', barGapWidthPct: 60, chartColors: [HEX.yellow, HEX.mutedDark],
    showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '"£"#,##0', dataLabelColor: HEX.onDark, dataLabelFontSize: 11, dataLabelFontFace: '+mn-lt',
    showTitle: true, title: 'Monthly revenue vs cost', titleFontSize: 13, titleColor: HEX.onDark, titleFontFace: '+mn-lt',
    catAxisLabelColor: HEX.onDark, catAxisLabelFontSize: 11, catAxisLabelFontFace: '+mn-lt',
    valAxisHidden: true, valGridLine: { style: 'none' }, catGridLine: { style: 'none' },
    showLegend: true, legendPos: 'b', legendColor: HEX.onDark, legendFontSize: 11, legendFontFace: '+mn-lt',
    objectName: 'revenue vs cost chart', altText: `Revenue vs cost: 10 founders ${gbp(at(10).revenue)} vs ${gbp(at(10).cost)}; 50 founders ${gbp(at(50).revenue)} vs ${gbp(at(50).cost)}; 100 founders ${gbp(at(100).revenue)} vs ${gbp(at(100).cost)}`,
  })
  txt(s, 'Assumptions: $1 ≈ £0.77; ~300 explained matches per Pro founder per month; profit is before paying the team.', { x: 0.5, y: 4.88, w: 9, h: 0.28, fontSize: 10, color: C.accent4 })
  s.addNotes(`Founders pay ${gbp(PRICE)} a month for Founder Pro: AI-explained candidate matches, unlimited needs and applicant tracking. Contributors and browsing are always free, because they are the supply that makes the platform useful. Fixed costs are about ${gbp(FIXED)} a month: Render and Supabase Pro at $${FIXED_USD}, plus domain and email. AI is cheap: about 300 explained matches a month on Claude Haiku 5.5 costs around ${gbp(AI, 2)} per founder. With card fees, each founder costs about ${gbp(VAR, 2)}, so we break even at ${BREAK_EVEN} paying founders. At 100 founders: ${gbp(h100.revenue)} revenue, ${gbp(h100.cost)} cost, about ${gbp(h100.profit)} a month profit before paying ourselves. Later: partner plans for universities and innovation hubs.`)

  // 5 — First 100 customers
  s = content('Our first 100 customers', 'Go to market', 'Business case')
  ;[
    ['WHO', 'North East founders with an idea and a skills gap, starting with student and graduate founders.'],
    ['THE OFFER', `“Founding 100”: 3 months of Founder Pro free, then ${gbp(PRICE)}/month. Contributors free forever.`],
    ['ROUTE IN', 'Claude Builder Club and hackathons like this one, university enterprise teams, student societies and local tech meetups. Every project page is shareable, so founders bring their own contributors.'],
  ].forEach(([h, b], i) => {
    const y = 1.4 + i * 0.95
    station(s, null, 0.5, y + 0.05, 0.3, ROUTE_S[i], h)
    txt(s, h, { x: 0.95, y, w: 3.9, h: 0.3, fontSize: 11, bold: true, color: ROUTE_S[i], charSpacing: 2 })
    txt(s, b, { x: 0.95, y: y + 0.3, w: 3.95, h: 0.62, fontSize: 12, color: C.background2 })
  })
  s.addShape(pres.shapes.LINE, { x: 0.65, y: 1.75, w: 0, h: 1.95, line: { color: HEX.line, width: 3 }, objectName: 'gtm route' })
  ticket(s, 5.2, 1.4, 4.3, 1.75, 'targets ticket')
  txt(s, 'TARGETS · FIRST 6 MONTHS', { x: 5.45, y: 1.52, w: 3.9, h: 0.3, fontSize: 10, bold: true, color: C.accent2, charSpacing: 2 })
  ;[['1,000', 'contributors'], ['300', 'projects published'], ['100', 'paying founders']].forEach(([n, l], i) => {
    const x = 5.45 + i * 1.33
    txt(s, n, { x, y: 1.85, w: 1.3, h: 0.6, fontSize: 28, bold: true, color: C.text1, fontFace: 'Arial' })
    txt(s, l, { x, y: 2.45, w: 1.25, h: 0.55, fontSize: 11, color: C.accent6 })
  })
  ticket(s, 5.2, 3.35, 4.3, 1.45, 'risk ticket', C.accent1)
  txt(s, [
    { text: 'BIGGEST RISK: THE EMPTY ROOM', options: { bold: true, fontSize: 10, charSpacing: 2, breakLine: true } },
    { text: 'Needs that get no applicants. We recruit contributors first, then track one number: open needs with an applicant within 7 days.', options: { fontSize: 12 } },
  ], { x: 5.45, y: 3.5, w: 3.9, h: 1.2, color: C.text1 })
  s.addNotes(`Who: North East founders with an idea and a skills gap, starting with student and graduate founders. Offer: Founding 100, three months of Founder Pro free, then ${gbp(PRICE)} a month; contributors are always free. Route in: the Claude Builder Club and hackathons, university enterprise teams, student societies and local meetups, and every shareable project page pulls in more people. Targets for the first six months: 1,000 contributors, 300 published projects, 100 paying founders, which needs about one in three publishing founders to convert. Biggest risk: an empty room, where needs get no applicants. So we recruit contributors first and track one number: open needs that get an applicant within seven days.`)

  // 6 — Team
  pres.addSection({ title: 'Team' })
  s = content('The team', 'Who and why us', 'Team')
  const lanes = [
    ['P1', 'Platform & identity', 'API, database, security rules, accounts, hosting'],
    ['P2', 'Projects', 'Project pages, publishing, founder dashboard'],
    ['P3', 'Progress', 'Posts, milestones, timeline'],
    ['P4', 'Opportunities', 'Needs, applications, founder review'],
    ['P5', 'Discovery & integration', 'Explore, filters, demo data, end-to-end tests'],
  ]
  route(s, 0.75, 1.75, 8.5, HEX.green, 'team route')
  lanes.forEach(([id, h, b], i) => {
    const x = 0.5 + i * 1.84
    s.addShape(pres.shapes.OVAL, { x: x + 0.05, y: 1.45, w: 0.6, h: 0.6, fill: { color: [C.accent1, C.accent2, C.accent3, C.accent1, C.accent2][i] }, line: { color: HEX.canvas, width: 3 }, objectName: id + ' station' })
    txt(s, id, { x: x + 0.05, y: 1.45, w: 0.6, h: 0.6, fontSize: 13, bold: true, color: i === 0 || i === 3 ? C.text1 : C.background1, align: 'center', valign: 'middle' })
    txt(s, h, { x, y: 2.25, w: 1.7, h: 0.55, fontSize: 14, bold: true, color: C.background2, fontFace: 'Arial' })
    txt(s, b, { x, y: 2.8, w: 1.65, h: 0.8, fontSize: 12, color: C.accent4 })
  })
  ticket(s, 0.5, 3.8, 9.0, 1.0, 'why ticket')
  txt(s, [
    { text: 'WHY THIS TEAM  ', options: { bold: true, fontSize: 10, color: C.accent2, charSpacing: 2, breakLine: true } },
    { text: `We build for our own community of North East builders. Five people, each directing AI coding agents, shipped a live, secure app in an afternoon through ${status.mergedPrs} reviewed pull requests.`, options: { fontSize: 13, color: C.text1 } },
  ], { x: 0.75, y: 3.9, w: 8.5, h: 0.85 })
  s.addNotes(`Five people, five lanes: platform and identity, projects, progress, opportunities, and discovery and integration. Each of us directed AI coding agents in our own lane and merged reviewed pull requests one at a time, which is how we shipped a live, secure app in an afternoon. We are building for our own community of North East builders.`)

  await pres.writeFile({ fileName: out })
  await applyTheme(out, THEME)
  console.log(`Wrote ${out} from main @ ${status.sha}; break-even ${BREAK_EVEN}, profit@100 ${h100.profit.toFixed(0)}`)
}
main().catch((e) => { console.error(e); process.exit(1) })
