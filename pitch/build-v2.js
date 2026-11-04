// North East Origins pitch, v2: matches the redesigned site (dark canvas, paper
// "ticket" cards, transit-route colours, bridge logo). The "Live now" slide is
// generated from origin/main, so rerunning after `git fetch` refreshes it.
//
// Usage: PPTX_SKILL_DIR=<pptx skill dir> NODE_PATH=./node_modules \
//        node build-v2.js <repo-path> <output.pptx>
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
const out = process.argv[3] || 'North-East-Origins-pitch-v2.pptx'
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

  // 1 — Cover
  pres.addSection({ title: 'Opening' })
  let s = pres.addSlide({ masterName: 'COVER', sectionTitle: 'Opening' })
  s.addImage({ data: logo, x: 0.6, y: 0.65, w: 2.2, h: 1.344, objectName: 'bridge logo', altText: 'North East Origins bridge logo' })
  s.addText('North East Origins', { placeholder: 'title' })
  s.addText('Discover what the North East is building. Find a project worth joining, or the people who can help build yours.', { placeholder: 'body' })
  txt(s, 'PROJECTS · PEOPLE · PROGRESS  /  NORTH EAST ENGLAND', { x: 0.6, y: 4.85, w: 6, h: 0.3, fontSize: 11, color: C.accent4, charSpacing: 2 })
  ;[[HEX.green, 1.3], [HEX.blue, 2.3], [HEX.yellow, 3.3]].forEach(([col, y], i) => {
    s.addShape(pres.shapes.LINE, { x: 7.4, y, w: 2.6, h: 0, line: { color: col, width: 9 }, objectName: 'cover route ' + i })
    s.addShape(pres.shapes.OVAL, { x: 7.75 + i * 0.6, y: y - 0.17, w: 0.34, h: 0.34, fill: { color: HEX.paper }, line: { color: col, width: 4 }, objectName: 'cover stop ' + i })
  })
  s.addNotes('North East Origins helps people across the region find a project worth joining, or the people who can help build theirs. Projects first, not profiles.')

  // 2 — Problem
  pres.addSection({ title: 'Problem and idea' })
  s = content('Good ideas stall without the right people', 'The problem', 'Problem and idea')
  ;[
    [I.users, 'Same circle, same skills', 'Course-mates and friends often share skills instead of complementing them.'],
    [I.clock, 'Listings go stale', 'A directory entry says nothing about whether a project is still moving.'],
    [I.search, 'Hard to see where you fit', 'Contributors can’t easily find where their skills make an immediate difference.'],
  ].forEach(([img, h, b], i) => {
    const x = 0.5 + i * 3.07
    ticket(s, x, 1.55, 2.85, 3.2, h + ' ticket')
    station(s, img, x + 0.3, 1.85, 0.7, ROUTE_S[i], h)
    txt(s, h, { x: x + 0.3, y: 2.8, w: 2.3, h: 0.7, fontSize: 18, bold: true, color: C.text1, fontFace: 'Arial' })
    txt(s, b, { x: x + 0.3, y: 3.5, w: 2.3, h: 1.1, fontSize: 14, color: C.accent6 })
  })
  s.addNotes('A student has an idea but everyone around them studies the same thing. Listings never show if anything is happening. Contributors can’t see where they fit. This is a hypothesis we want to validate.')

  // 3 — Idea
  s = content('Projects first, not profiles', 'The idea', 'Problem and idea')
  txt(s, [
    { text: 'Most tools ask ', options: { color: C.background2, breakLine: false } },
    { text: '“Who are you?”', options: { color: C.accent4, breakLine: true } },
    { text: 'We ask ', options: { color: C.background2 } },
    { text: '“What are you building, and what does it need?”', options: { color: C.accent1 } },
  ], { x: 0.5, y: 1.45, w: 4.1, h: 2.4, fontSize: 24, bold: true, fontFace: 'Arial' })
  ticket(s, 4.9, 1.45, 4.6, 3.35, 'comparison ticket')
  txt(s, 'TYPICAL', { x: 6.45, y: 1.65, w: 1.4, h: 0.3, fontSize: 10, bold: true, color: C.accent6, charSpacing: 2 })
  txt(s, 'NORTH EAST ORIGINS', { x: 7.85, y: 1.65, w: 1.6, h: 0.3, fontSize: 10, bold: true, color: C.accent2, charSpacing: 2 })
  ;[
    ['Discover', 'People, CVs', 'Projects & needs'],
    ['Momentum', 'Claims', 'Dated progress'],
    ['The ask', '“Let’s connect”', '“React dev, 5 h/wk”'],
    ['Claims', 'Implied fact', 'Self-reported label'],
  ].forEach(([k, a, b], i) => {
    const y = 2.05 + i * 0.65
    s.addShape(pres.shapes.LINE, { x: 5.1, y, w: 4.2, h: 0, line: { color: HEX.band, width: 1 }, objectName: 'row rule' })
    txt(s, k, { x: 5.1, y: y + 0.1, w: 1.3, h: 0.45, fontSize: 14, bold: true, color: C.text1, valign: 'middle' })
    txt(s, a, { x: 6.45, y: y + 0.1, w: 1.35, h: 0.45, fontSize: 13, color: C.accent6, valign: 'middle' })
    txt(s, b, { x: 7.85, y: y + 0.1, w: 1.55, h: 0.45, fontSize: 13, bold: true, color: C.text1, valign: 'middle' })
  })
  s.addNotes('The project is the unit of discovery. Momentum is dated progress, asks are specific, and claims are labelled self-reported.')

  // 4 — How it works (route)
  pres.addSection({ title: 'Product' })
  s = content('How it works', 'One journey, three stops', 'Product')
  route(s, 1.0, 2.0, 2.9, HEX.green); route(s, 3.95, 2.0, 3.0, HEX.blue)
  ;[
    [I.rocket, 'Founder publishes', 'Project page with pitch, stage and location; dated progress; a specific open need.'],
    [I.filter, 'Contributor discovers', 'Filters by skill, sector and location, reads the timeline and applies to the exact need.'],
    [I.check, 'Founder reviews', 'Sees the application privately with a minimal applicant summary and decides.'],
  ].forEach(([img, h, b], i) => {
    const x = 0.5 + i * 3.07
    station(s, img, x + 0.05, 1.55, 0.9, ROUTE_S[i], h)
    txt(s, `0${i + 1}`, { x: x + 1.1, y: 1.6, w: 1, h: 0.4, fontSize: 12, bold: true, color: C.accent4, charSpacing: 2 })
    ticket(s, x, 2.75, 2.85, 2.0, h + ' ticket')
    txt(s, h, { x: x + 0.25, y: 2.92, w: 2.45, h: 0.4, fontSize: 15, bold: true, color: C.text1, fontFace: 'Arial' })
    txt(s, b, { x: x + 0.25, y: 3.38, w: 2.4, h: 1.3, fontSize: 13, color: C.accent6 })
  })
  s.addNotes('The core journey we demo: founder publishes, contributor discovers and applies, founder reviews. All data is real and persists in Supabase.')

  // 5 — Project page
  s = content('Every project gets a living public page', 'The project page', 'Product')
  ticket(s, 0.5, 1.45, 4.9, 3.4, 'project page mock')
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.45, w: 4.9, h: 0.38, fill: { color: C.accent5 }, line: { type: 'none' }, objectName: 'mock band' })
  txt(s, 'PROTOTYPE  ·  NEWCASTLE  ·  FICTIONAL DEMO', { x: 0.7, y: 1.45, w: 4.5, h: 0.38, fontSize: 10, bold: true, color: C.text1, charSpacing: 2, valign: 'middle' })
  txt(s, 'TyneFlow AI', { x: 0.7, y: 1.95, w: 4.5, h: 0.42, fontSize: 20, bold: true, color: C.text1, fontFace: 'Arial' })
  txt(s, 'Low-cost sensors to monitor river quality and urban run-off on the Tyne.', { x: 0.7, y: 2.4, w: 4.5, h: 0.5, fontSize: 13, color: C.accent6 })
  s.addShape(pres.shapes.LINE, { x: 0.85, y: 3.0, w: 0, h: 0.75, line: { color: HEX.green, width: 4 }, objectName: 'mini route' })
  ;[['Milestone · self-reported', 'First sensor node logging readings'], ['Progress', 'Ingestion API design agreed']].forEach(([k, v], i) => {
    const y = 2.92 + i * 0.5
    s.addShape(pres.shapes.OVAL, { x: 0.76, y: y + 0.08, w: 0.18, h: 0.18, fill: { color: HEX.paper }, line: { color: HEX.green, width: 3 }, objectName: 'mini stop' })
    txt(s, [{ text: k + '   ', options: { bold: true, color: C.accent2 } }, { text: v, options: { color: C.text1 } }], { x: 1.1, y, w: 4.1, h: 0.34, fontSize: 12, valign: 'middle' })
  })
  s.addShape(pres.shapes.LINE, { x: 0.7, y: 3.95, w: 4.5, h: 0, line: { color: HEX.band, width: 1, dashType: 'dash' }, objectName: 'need rule' })
  txt(s, [{ text: 'Open need: FastAPI developer', options: { bold: true, color: C.text1, breakLine: true } }, { text: '6 h/week · remote · voluntary', options: { color: C.accent6 } }], { x: 0.7, y: 4.05, w: 3.2, h: 0.6, fontSize: 12, valign: 'middle' })
  s.addShape(pres.shapes.RECTANGLE, { x: 4.2, y: 4.15, w: 1.0, h: 0.4, fill: { color: C.accent1 }, line: { type: 'none' }, objectName: 'apply button' })
  txt(s, 'Apply', { x: 4.2, y: 4.15, w: 1.0, h: 0.4, fontSize: 12, bold: true, color: C.text1, align: 'center', valign: 'middle' })
  ;[
    [I.tag, 'Pitch, sector, stage, place', 'A shareable URL once published; drafts stay private.'],
    [I.chart, 'Dated timeline', 'Progress, milestones and roadblocks, newest first.'],
    [I.hand, 'Specific open needs', 'Skills, hours, work mode and compensation up front.'],
  ].forEach(([img, h, b], i) => {
    const y = 1.5 + i * 1.12
    station(s, img, 5.8, y, 0.55, ROUTE_S[i], h)
    txt(s, h, { x: 6.5, y: y - 0.02, w: 3.0, h: 0.34, fontSize: 15, bold: true, color: C.background2 })
    txt(s, b, { x: 6.5, y: y + 0.32, w: 3.0, h: 0.6, fontSize: 13, color: C.accent4 })
  })
  s.addNotes('TyneFlow AI is one of our fictional demo projects. The page shows the pitch, a dated timeline so you can see if it is moving, and specific needs you can apply to.')

  // 6 — Trust
  s = content('Trust is designed in, not bolted on', 'Principles', 'Product')
  ;[
    [I.chart, 'Progress over promises', 'Posting frequency is never a quality score. Milestones are labelled self-reported.'],
    [I.lock, 'Private by default', 'Applications are visible only to the applicant and the project owner.'],
    [I.db, 'Enforced in the database', 'Supabase Auth tokens, validated inputs and Row Level Security on every table.'],
    [I.shield, 'No overclaiming', 'Imported text is data. No implied equity, no investment scores.'],
  ].forEach(([img, h, b], i) => {
    const x = 0.5 + (i % 2) * 4.6, y = 1.45 + Math.floor(i / 2) * 1.75
    ticket(s, x, y, 4.4, 1.5, h + ' ticket')
    station(s, img, x + 0.25, y + 0.25, 0.6, [C.accent2, C.accent3, C.accent3, C.accent1][i], h)
    txt(s, h, { x: x + 1.05, y: y + 0.22, w: 3.15, h: 0.36, fontSize: 16, bold: true, color: C.text1, fontFace: 'Arial' })
    txt(s, b, { x: x + 1.05, y: y + 0.6, w: 3.15, h: 0.8, fontSize: 13, color: C.accent6 })
  })
  s.addNotes('We never rank by how often people post, keep applications private and enforce it in the database, and avoid overclaiming traction, equity or investment.')

  // 7 — Region
  s = content('Built for the North East', 'Where and who', 'Product')
  const towns = ['Newcastle', 'Gateshead', 'Sunderland', 'Durham', 'Teesside', 'Northumberland']
  route(s, 0.75, 2.05, 3.9, HEX.green, 'region route 1'); route(s, 0.75, 3.05, 3.9, HEX.blue, 'region route 2')
  towns.forEach((t, i) => {
    const x = 0.6 + (i % 3) * 1.4, y = 1.88 + Math.floor(i / 3) * 1.0
    s.addShape(pres.shapes.OVAL, { x, y, w: 0.34, h: 0.34, fill: { color: HEX.paper }, line: { color: i < 3 ? HEX.green : HEX.blue, width: 4 }, objectName: t + ' stop' })
    txt(s, t, { x: x - 0.3, y: y + 0.42, w: 1.3, h: 0.3, fontSize: 12, color: C.background2, align: 'left' })
  })
  txt(s, 'Launch focus. Remote contributors and the rest of the region welcome.', { x: 0.5, y: 4.0, w: 4.3, h: 0.6, fontSize: 13, color: C.accent4 })
  ;[
    [I.rocket, 'Founders', 'Publish projects, share progress, open needs, review applicants.'],
    [I.code, 'Contributors', 'Students, graduates and local professionals who want to build.'],
    [I.heart, 'Followers', 'Follow a project without committing to join (planned).'],
  ].forEach(([img, h, b], i) => {
    const y = 1.45 + i * 1.1
    station(s, img, 5.3, y, 0.55, ROUTE_S[i], h)
    txt(s, h, { x: 6.0, y: y - 0.02, w: 3.5, h: 0.34, fontSize: 15, bold: true, color: C.background2 })
    txt(s, b, { x: 6.0, y: y + 0.32, w: 3.5, h: 0.6, fontSize: 13, color: C.accent4 })
  })
  txt(s, 'Students are an early channel, not an eligibility requirement.', { x: 5.3, y: 4.75, w: 4.2, h: 0.3, fontSize: 11, italic: true, color: C.accent4 })
  s.addNotes('Launch focus across the region’s towns and cities. Graduates and local professionals are what make cross-disciplinary teams possible.')

  // 8 — Live now (generated)
  pres.addSection({ title: 'Build' })
  s = content('Live now, built in an afternoon', 'Status from main', 'Build')
  ticket(s, 0.5, 1.45, 4.3, 1.3, 'live url ticket', C.accent1)
  txt(s, 'LIVE DEMO', { x: 0.75, y: 1.6, w: 3.8, h: 0.3, fontSize: 10, bold: true, color: C.text1, charSpacing: 2 })
  txt(s, 'north-east-origins.onrender.com', { x: 0.75, y: 1.95, w: 3.9, h: 0.5, fontSize: 18, bold: true, color: C.text1, fontFace: 'Arial', hyperlink: { url: 'https://north-east-origins.onrender.com/' } })
  ;[[String(status.mergedPrs), 'PRs merged'], [String(status.migrations), 'DB migrations'], [String(status.testFiles), 'test files']].forEach(([n, l], i) => {
    const x = 5.1 + i * 1.5
    txt(s, n, { x, y: 1.45, w: 1.4, h: 0.8, fontSize: 40, bold: true, color: ROUTE_S[i], fontFace: 'Arial' })
    txt(s, l, { x, y: 2.25, w: 1.4, h: 0.4, fontSize: 12, color: C.accent4 })
  })
  const hd = (t) => ({ text: t, options: { bold: true, color: HEX.ink, fill: { color: HEX.band }, fontSize: 11 } })
  const rows = [[hd('Lane'), hd('Area'), hd('PRs merged'), hd('Status from main')]].concat(status.lanes.map((l) => [
    { text: l.id, options: { bold: true } }, { text: l.name }, { text: String(l.mergedPrs) },
    { text: l.status, options: { bold: true, color: l.status === 'Not started' ? HEX.mutedPaper : HEX.green } },
  ]))
  s.addTable(rows, { x: 0.5, y: 2.9, w: 9.0, colW: [0.8, 3.0, 1.4, 3.8], rowH: 0.25, fontSize: 10, margin: 0.03, color: HEX.ink, fill: { color: HEX.paper }, border: { type: 'solid', pt: 0.5, color: HEX.band }, valign: 'middle', objectName: 'lane status table' })
  const when = new Date(status.date).toLocaleString('en-GB', { timeZone: 'Europe/London', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  txt(s, `Generated from main @ ${status.sha}, ${when} UK. Counts what is in the repository; the live demo is the proof that it works.`, { x: 0.5, y: 4.85, w: 9, h: 0.3, fontSize: 10, color: C.accent4 })
  s.addNotes(`Generated from main at ${status.sha}. Five people, each supervising coding agents, merged reviewed PRs one at a time. The app is deployed on Render with hosted Supabase. Hosted acceptance checks are tracked in issue #1; these counts don’t claim tests passed.`)

  // 9 — Stack
  s = content('A simple, secure stack', 'Architecture', 'Build')
  route(s, 1.4, 2.25, 7.2, HEX.blue, 'stack route')
  ;[
    [I.globe, 'Browser', 'React + Vite + TypeScript', 'Network Design Kit styles'],
    [I.server, 'Express API', 'Node.js + TypeScript', 'Checks the user’s token, validates every input'],
    [I.db, 'Supabase', 'PostgreSQL + Auth', 'Row Level Security keeps private data private'],
  ].forEach(([img, h, sub, b], i) => {
    const x = 0.5 + i * 3.07
    station(s, img, x + 0.97, 1.8, 0.9, ROUTE_S[i], h)
    ticket(s, x, 2.95, 2.85, 1.6, h + ' ticket')
    txt(s, h, { x: x + 0.2, y: 3.08, w: 2.45, h: 0.38, fontSize: 17, bold: true, color: C.text1, align: 'center', fontFace: 'Arial' })
    txt(s, sub, { x: x + 0.2, y: 3.46, w: 2.45, h: 0.3, fontSize: 12, bold: true, color: C.accent2, align: 'center' })
    txt(s, b, { x: x + 0.2, y: 3.8, w: 2.45, h: 0.65, fontSize: 12, color: C.accent6, align: 'center' })
  })
  txt(s, 'One Render service serves the API and the compiled site. CI builds, tests and lints every PR.', { x: 0.5, y: 4.72, w: 9, h: 0.3, fontSize: 12, color: C.accent4 })
  s.addNotes('Deliberately boring technology: React, an Express API that verifies Supabase tokens, Postgres with Row Level Security. One Render service; GitHub Actions builds and tests each PR.')

  // 10 — Demo route
  pres.addSection({ title: 'Demo and next steps' })
  s = content('Live demo: the three-minute route', 'Demo', 'Demo and next steps')
  const stops = [
    ['0:00', 'The problem', 'Why complementary skills are hard to find'],
    ['0:20', 'Founder', 'Publishes a project, adds a milestone, opens a need'],
    ['1:10', 'Contributor', 'Filters by skill and place, reads the timeline, applies'],
    ['2:10', 'Review', 'Founder updates the application privately'],
    ['2:40', 'Proof', 'Signed-out refresh: public page persists, private data hidden'],
  ]
  route(s, 0.85, 2.0, 7.4, HEX.yellow, 'demo route')
  stops.forEach(([t, h, b], i) => {
    const x = 0.5 + i * 1.84
    s.addShape(pres.shapes.OVAL, { x: x + 0.15, y: 1.78, w: 0.44, h: 0.44, fill: { color: HEX.paper }, line: { color: HEX.yellow, width: 5 }, objectName: 'demo stop' })
    txt(s, t, { x, y: 1.4, w: 1.7, h: 0.3, fontSize: 12, bold: true, color: C.accent1 })
    txt(s, h, { x, y: 2.45, w: 1.7, h: 0.36, fontSize: 16, bold: true, color: C.background2, fontFace: 'Arial' })
    txt(s, b, { x, y: 2.85, w: 1.65, h: 1.2, fontSize: 13, color: C.accent4 })
  })
  ticket(s, 0.5, 4.2, 9.0, 0.6, 'demo note')
  txt(s, 'Two browser sessions · real Supabase data · fictional demo projects and accounts', { x: 0.75, y: 4.2, w: 8.5, h: 0.6, fontSize: 14, bold: true, color: C.text1, valign: 'middle' })
  s.addNotes('Switch to the live site. Two browser profiles: founder and contributor. Finish with a signed-out refresh to show persistence and privacy.')

  // 11 — Matching
  s = content('Next stop: matching with reasons', 'Planned', 'Demo and next steps')
  s.addChart(pres.charts.BAR, [{ name: 'Weight', labels: ['Required skills', 'Interest / domain', 'Availability', 'Location / work mode', 'Participation type'], values: [40, 20, 20, 10, 10] }], {
    x: 0.4, y: 1.4, w: 5.1, h: 3.4, barDir: 'bar', catAxisOrientation: 'maxMin', chartColors: [HEX.yellow],
    showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '0"%"', dataLabelColor: HEX.onDark, dataLabelFontSize: 12, dataLabelFontFace: '+mn-lt',
    showTitle: true, title: 'Illustrative heuristic fit weights', titleFontSize: 13, titleColor: HEX.onDark, titleFontFace: '+mn-lt',
    catAxisLabelColor: HEX.onDark, catAxisLabelFontSize: 12, catAxisLabelFontFace: '+mn-lt', catAxisLineShow: false,
    valAxisHidden: true, valAxisMaxVal: 50, valGridLine: { style: 'none' }, catGridLine: { style: 'none' }, showLegend: false,
    objectName: 'matching weights chart', altText: 'Weights: required skills 40%, interest 20%, availability 20%, location 10%, participation 10%',
  })
  ticket(s, 5.8, 1.45, 3.7, 2.35, 'explanation ticket')
  txt(s, [
    { text: 'EXAMPLE EXPLANATION', options: { bold: true, fontSize: 10, color: C.accent2, charSpacing: 2, breakLine: true } },
    { text: '“Recommended because this project needs Python API work and your profile shows FastAPI experience. Availability matches. No evidence yet for the preferred AWS skill.”', options: { italic: true, fontSize: 14, color: C.text1 } },
  ], { x: 6.05, y: 1.65, w: 3.2, h: 2.05 })
  txt(s, [{ text: 'A heuristic fit score, never a success probability. ', options: { bold: true, color: C.background2 } }, { text: 'Stretch goal after the core journey.', options: { color: C.accent4 } }], { x: 5.8, y: 4.05, w: 3.7, h: 0.8, fontSize: 13 })
  s.addNotes('Transparent, deterministic matching: every recommendation says why and what evidence is missing. Shown as a heuristic fit score. This is a stretch goal, not in today’s demo unless it ships.')

  // 12 — Roadmap
  s = content('The line ahead', 'Roadmap', 'Demo and next steps')
  route(s, 0.75, 1.85, 8.5, HEX.green, 'roadmap route')
  ;[
    [I.heart, 'Follow projects', 'Save projects, see updates'],
    [I.clock, 'Activity labels', 'Recent, quiet, dormant'],
    [I.users, 'Explainable matching', 'Fit with evidence and gaps'],
    [I.github, 'GitHub import', 'Public repos, with consent'],
    [I.bolt, 'AI skill extraction', 'Users correct the result'],
    [I.seed, 'Investor discovery', 'Relevance, no return predictions'],
  ].forEach(([img, h, b], i) => {
    const x = 0.5 + i * 1.53
    station(s, img, x + 0.15, 1.5, 0.7, i % 2 ? C.accent3 : C.accent1, h)
    txt(s, `S-0${i + 1}`, { x, y: 2.35, w: 1.4, h: 0.3, fontSize: 11, bold: true, color: C.accent4, charSpacing: 2 })
    txt(s, h, { x, y: 2.65, w: 1.4, h: 0.65, fontSize: 14, bold: true, color: C.background2, fontFace: 'Arial' })
    txt(s, b, { x, y: 3.3, w: 1.4, h: 0.9, fontSize: 12, color: C.accent4 })
  })
  txt(s, 'Each stop ships only after the core journey stays green.', { x: 0.5, y: 4.6, w: 9, h: 0.3, fontSize: 12, italic: true, color: C.accent4 })
  s.addNotes('Ordered stretch goals. We finish one before starting the next, and never add investment scores or return predictions.')

  // 13 — Close
  pres.addSection({ title: 'Close' })
  s = pres.addSlide({ masterName: 'COVER', sectionTitle: 'Close' })
  s.addImage({ data: logo, x: 0.6, y: 0.65, w: 2.2, h: 1.344, objectName: 'bridge logo', altText: 'North East Origins bridge logo' })
  s.addText('Join the network', { placeholder: 'title' })
  s.addText('Good things start with people. An idea on your doorstep, a skill someone needs, a little time to make something happen.', { placeholder: 'body' })
  ticket(s, 6.9, 1.6, 2.6, 2.65, 'ask ticket')
  txt(s, [
    { text: 'FOUNDERS', options: { bold: true, fontSize: 10, color: C.accent2, charSpacing: 2, breakLine: true } },
    { text: 'Publish your project', options: { fontSize: 14, color: C.text1, breakLine: true } },
    { text: ' ', options: { fontSize: 6, breakLine: true } },
    { text: 'BUILDERS', options: { bold: true, fontSize: 10, color: C.accent3, charSpacing: 2, breakLine: true } },
    { text: 'Find where your skills count', options: { fontSize: 14, color: C.text1, breakLine: true } },
    { text: ' ', options: { fontSize: 6, breakLine: true } },
    { text: 'PARTNERS', options: { bold: true, fontSize: 10, color: C.accent6, charSpacing: 2, breakLine: true } },
    { text: 'Pilot with local universities and hubs', options: { fontSize: 14, color: C.text1 } },
  ], { x: 7.1, y: 1.8, w: 2.25, h: 2.3 })
  txt(s, 'north-east-origins.onrender.com', { x: 0.6, y: 4.75, w: 5, h: 0.35, fontSize: 14, bold: true, color: C.accent1, hyperlink: { url: 'https://north-east-origins.onrender.com/' } })
  s.addNotes('Close with the ask and the live URL. Thank the judges and take questions.')

  await pres.writeFile({ fileName: out })
  await applyTheme(out, THEME)
  console.log(`Wrote ${out} from main @ ${status.sha}`)
}
main().catch((e) => { console.error(e); process.exit(1) })
