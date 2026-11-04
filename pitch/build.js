// Builds the North East Origins pitch deck. The "What we've built" slide is
// generated from the repository's origin/main, so rerunning this script after
// `git fetch` refreshes the deck with whatever the team has merged.
//
// Usage: node build.js <repo-path> <output.pptx>
const path = require('path')
const pptxgen = require('pptxgenjs')
const React = require('react')
const ReactDOMServer = require('react-dom/server')
const sharp = require('sharp')
const fa = require('react-icons/fa')
const { collect } = require('./status')

const SKILL = process.env.PPTX_SKILL_DIR
const { applyTheme } = require(path.join(SKILL, 'scripts/apply_theme.js'))

const repo = process.argv[2] || '.'
const out = process.argv[3] || 'North-East-Origins-pitch.pptx'
const status = collect(repo)

// Palette taken from the app's own CSS so the deck matches the product.
const HEX = {
  navy: '1D3B53', navyDeep: '15293A', ink: '1C2430', orange: 'D9822B',
  green: '2F7D4F', muted: '667085', light: 'F2F4F7', white: 'FFFFFF', line: 'D9DEE5',
}
const THEME = {
  name: 'North East Origins',
  headFontFace: 'Cambria',
  bodyFontFace: 'Calibri',
  colors: {
    dk1: HEX.ink, lt1: HEX.white, dk2: HEX.navy, lt2: HEX.light,
    accent1: HEX.orange, accent2: HEX.navy, accent3: HEX.green, accent4: '7A8CA0',
    accent5: 'B7791F', accent6: '9AA5B1', hlink: HEX.navy, folHlink: '5B6B7C',
  },
}

async function icon(Comp, color = '#FFFFFF') {
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Comp, { color, size: 256 }))
  const buf = await sharp(Buffer.from(svg)).png().toBuffer()
  return 'image/png;base64,' + buf.toString('base64')
}

async function main() {
  const pres = new pptxgen()
  pres.layout = 'LAYOUT_16x9' // 10 x 5.625 in
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace }
  pres.title = 'North East Origins — pitch'
  pres.author = 'North East Origins team'
  const C = pres.SchemeColor

  const footer = (dark) => ({
    text: { text: 'North East Origins  ·  demo projects are fictional', options: {
      x: 0.5, y: 5.2, w: 6, h: 0.3, fontSize: 10, color: dark ? C.background2 : C.text2, margin: 0 } },
  })

  pres.defineSlideMaster({
    title: 'TITLE_DARK',
    background: { color: HEX.navy },
    objects: [
      { placeholder: { options: { name: 'title', type: 'title', x: 0.6, y: 0.9, w: 6.0, h: 1.7, fontSize: 40, bold: true, color: C.background1, fontFace: 'Cambria', valign: 'bottom', align: 'left', margin: 0 }, text: '' } },
      { placeholder: { options: { name: 'body', type: 'body', x: 0.6, y: 2.75, w: 5.6, h: 1.2, fontSize: 18, color: C.background2, valign: 'top', margin: 0 }, text: '' } },
    ],
  })
  pres.defineSlideMaster({
    title: 'CONTENT',
    background: { color: HEX.white },
    margin: [0.5, 0.5, 0.5, 0.5],
    slideNumber: { x: 9.0, y: 5.2, w: 0.5, h: 0.3, fontSize: 10, color: HEX.muted, align: 'right' },
    objects: [
      footer(false),
      { placeholder: { options: { name: 'title', type: 'title', x: 0.5, y: 0.3, w: 9, h: 0.75, fontSize: 32, bold: true, color: C.text2, fontFace: 'Cambria', valign: 'middle', align: 'left', margin: 0 }, text: '' } },
    ],
  })

  const I = {
    users: await icon(fa.FaUserFriends), clock: await icon(fa.FaHourglassHalf), search: await icon(fa.FaSearchLocation),
    rocket: await icon(fa.FaRocket), filter: await icon(fa.FaFilter), check: await icon(fa.FaClipboardCheck),
    chart: await icon(fa.FaChartLine), lock: await icon(fa.FaLock), db: await icon(fa.FaDatabase), shield: await icon(fa.FaShieldAlt),
    map: await icon(fa.FaMapMarkerAlt), code: await icon(fa.FaCode), server: await icon(fa.FaServer), globe: await icon(fa.FaGlobeEurope),
    heart: await icon(fa.FaHeart), bolt: await icon(fa.FaBolt), github: await icon(fa.FaGithub), invest: await icon(fa.FaSeedling),
    tag: await icon(fa.FaTags), handshake: await icon(fa.FaHandshake), tri: await icon(fa.FaPlay),
  }

  // Motif: white icon in an orange circle.
  const badge = (slide, img, x, y, d = 0.55, fill = C.accent1, name = 'icon') => {
    slide.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill }, line: { type: 'none' }, objectName: name + ' circle' })
    const p = d * 0.24
    slide.addImage({ data: img, x: x + p, y: y + p, w: d - 2 * p, h: d - 2 * p, objectName: name, altText: name })
  }
  const card = (slide, x, y, w, h, fill = C.background2, name = 'card') =>
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.12, fill: { color: fill }, line: { type: 'none' }, objectName: name })
  const txt = (slide, text, opts) => slide.addText(text, { isTextBox: true, margin: 0, valign: 'top', ...opts })

  // 1 — Title
  pres.addSection({ title: 'Opening' })
  let s = pres.addSlide({ masterName: 'TITLE_DARK', sectionTitle: 'Opening' })
  s.addText('North East Origins', { placeholder: 'title' })
  s.addText('Discover what the North East is building. Find a project worth joining, or the people who can help build yours.', { placeholder: 'body' })
  s.addShape(pres.shapes.ISOSCELES_TRIANGLE, { x: 6.9, y: 1.2, w: 2.6, h: 2.3, fill: { color: C.accent1 }, line: { type: 'none' }, objectName: 'brand triangle' })
  s.addShape(pres.shapes.ISOSCELES_TRIANGLE, { x: 7.75, y: 2.4, w: 1.6, h: 1.4, fill: { color: C.background1 }, line: { type: 'none' }, transparency: 80, objectName: 'brand triangle small' })
  txt(s, 'Hackathon pitch  ·  a project-first collaboration platform for North East England', { x: 0.6, y: 4.75, w: 8.8, h: 0.35, fontSize: 12, color: C.background2 })
  s.addNotes('Open with the one-liner. North East Origins helps people across the region find a project worth joining, or the people who can help build theirs. The key word is project-first: we organise everything around what people are building, not around CVs.')

  // 2 — Problem
  pres.addSection({ title: 'Problem and idea' })
  s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'Problem and idea' })
  s.addText('Good ideas stall without the right people', { placeholder: 'title' })
  const problems = [
    [I.users, 'Same circle, same skills', 'Course-mates and friends often share skills instead of complementing them.'],
    [I.clock, 'Listings go stale', 'A directory entry says nothing about whether a project is still moving.'],
    [I.search, 'Hard to see where you fit', 'Contributors can’t easily find where their skills would make an immediate difference.'],
  ]
  problems.forEach(([img, head, body], i) => {
    const y = 1.35 + i * 1.2
    badge(s, img, 0.5, y, 0.6, C.accent1, head + ' icon')
    txt(s, head, { x: 1.3, y: y - 0.02, w: 4.2, h: 0.36, fontSize: 18, bold: true, color: C.text1 })
    txt(s, body, { x: 1.3, y: y + 0.36, w: 4.2, h: 0.6, fontSize: 14, color: C.text2 })
  })
  card(s, 6.0, 1.35, 3.5, 3.4, C.text2, 'question card')
  txt(s, [
    { text: 'Most networking tools ask', options: { fontSize: 16, color: C.background2, breakLine: true } },
    { text: '“Who are you?”', options: { fontSize: 22, bold: true, color: C.background1, fontFace: 'Cambria', breakLine: true } },
    { text: ' ', options: { fontSize: 10, breakLine: true } },
    { text: 'We ask', options: { fontSize: 16, color: C.background2, breakLine: true } },
    { text: '“What are you building, and what does it need?”', options: { fontSize: 22, bold: true, color: C.accent1, fontFace: 'Cambria' } },
  ], { x: 6.3, y: 1.65, w: 2.9, h: 2.9, valign: 'middle' })
  s.addNotes('A student in Newcastle has an idea but everyone around them studies the same thing. Meanwhile project listings never tell you if anything is actually happening. Contributors who want to help have no way to see where their skills count. Treat this as a hypothesis we want to validate, not a proven market fact.')

  // 3 — Projects first comparison
  s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'Problem and idea' })
  s.addText('Projects first, not profiles', { placeholder: 'title' })
  const rows = [
    ['What you discover', 'People and CVs', 'Projects and their open needs'],
    ['What signals momentum', 'Claims and follower counts', 'Dated progress and milestones'],
    ['What you’re asked for', '“Let’s connect”', '“React developer, 5 hours/week”'],
    ['How claims are shown', 'Implied as fact', 'Labelled self-reported'],
  ]
  card(s, 3.35, 1.25, 2.95, 3.65, C.background2, 'typical column')
  card(s, 6.55, 1.25, 2.95, 3.65, C.text2, 'neo column')
  txt(s, 'Typical networking', { x: 3.55, y: 1.4, w: 2.6, h: 0.4, fontSize: 16, bold: true, color: C.text2 })
  txt(s, 'North East Origins', { x: 6.75, y: 1.4, w: 2.6, h: 0.4, fontSize: 16, bold: true, color: C.accent1 })
  rows.forEach(([label, a, b], i) => {
    const y = 1.95 + i * 0.72
    txt(s, label, { x: 0.5, y, w: 2.7, h: 0.6, fontSize: 14, bold: true, color: C.text1, valign: 'middle' })
    txt(s, a, { x: 3.55, y, w: 2.6, h: 0.6, fontSize: 14, color: C.text2, valign: 'middle' })
    txt(s, b, { x: 6.75, y, w: 2.6, h: 0.6, fontSize: 14, color: C.background1, valign: 'middle' })
  })
  s.addNotes('The project, not the founder’s profile, is the unit of discovery. Momentum is shown through dated updates, asks are specific, and anything a founder says about themselves is labelled self-reported.')

  // 4 — How it works
  pres.addSection({ title: 'Product' })
  s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'Product' })
  s.addText('How it works', { placeholder: 'title' })
  const steps = [
    [I.rocket, 'Founder publishes', 'Creates a project page with pitch, stage and location, posts progress and opens a specific need.'],
    [I.filter, 'Contributor discovers', 'Filters by skill and location, reads the dated timeline and applies to the exact need.'],
    [I.check, 'Founder reviews', 'Sees the application privately with a minimal applicant summary and makes a decision.'],
  ]
  steps.forEach(([img, head, body], i) => {
    const x = 0.5 + i * 3.1
    card(s, x, 1.3, 2.8, 3.5, C.background2, head + ' card')
    badge(s, img, x + 0.3, 1.6, 0.7, C.accent1, head + ' icon')
    txt(s, String(i + 1), { x: x + 2.0, y: 1.55, w: 0.5, h: 0.6, fontSize: 32, bold: true, color: C.text2, fontFace: 'Cambria', align: 'right' })
    txt(s, head, { x: x + 0.3, y: 2.55, w: 2.3, h: 0.4, fontSize: 18, bold: true, color: C.text1 })
    txt(s, body, { x: x + 0.3, y: 3.0, w: 2.25, h: 1.6, fontSize: 14, color: C.text2 })
    if (i < 2) s.addShape(pres.shapes.RIGHT_ARROW, { x: x + 2.83, y: 2.9, w: 0.24, h: 0.3, fill: { color: C.accent1 }, line: { type: 'none' }, objectName: 'flow arrow' })
  })
  s.addNotes('This is the core journey we are demoing today: founder publishes, contributor discovers and applies, founder reviews. Everything persists in a real database.')

  // 5 — Project page mock
  s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'Product' })
  s.addText('Every project gets a living public page', { placeholder: 'title' })
  card(s, 0.5, 1.25, 4.9, 3.75, C.background2, 'project page mock')
  txt(s, 'TyneFlow AI', { x: 0.75, y: 1.42, w: 3.0, h: 0.4, fontSize: 20, bold: true, color: C.text2, fontFace: 'Cambria' })
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 3.75, y: 1.47, w: 1.4, h: 0.32, rectRadius: 0.16, fill: { color: C.accent1 }, line: { type: 'none' }, objectName: 'stage chip' })
  txt(s, 'Prototype · Newcastle', { x: 3.75, y: 1.47, w: 1.4, h: 0.32, fontSize: 10, bold: true, color: C.background1, align: 'center', valign: 'middle' })
  txt(s, 'Low-cost sensors to monitor river quality and urban run-off on the Tyne.', { x: 0.75, y: 1.9, w: 4.4, h: 0.5, fontSize: 12, color: C.text1 })
  txt(s, 'Last progress update  ·  dated on the page', { x: 0.75, y: 2.45, w: 4.4, h: 0.3, fontSize: 11, italic: true, color: C.text2 })
  const feed = [['Milestone · self-reported', 'First sensor node logging readings'], ['Progress', 'Ingestion API design agreed']]
  feed.forEach(([k, v], i) => {
    const y = 2.85 + i * 0.5
    s.addShape(pres.shapes.OVAL, { x: 0.8, y: y + 0.1, w: 0.16, h: 0.16, fill: { color: C.accent1 }, line: { type: 'none' }, objectName: 'timeline dot' })
    txt(s, [{ text: k + '  ', options: { bold: true, color: C.text2 } }, { text: v, options: { color: C.text1 } }], { x: 1.1, y, w: 4.1, h: 0.36, fontSize: 11, valign: 'middle' })
  })
  card(s, 0.75, 3.95, 4.4, 0.85, C.background1, 'need card')
  txt(s, [
    { text: 'Open need: FastAPI developer', options: { bold: true, color: C.text1, breakLine: true } },
    { text: '6 h/week · remote · voluntary', options: { color: C.text2 } },
  ], { x: 0.95, y: 4.05, w: 3.0, h: 0.65, fontSize: 12, valign: 'middle' })
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 4.15, y: 4.2, w: 0.85, h: 0.36, rectRadius: 0.1, fill: { color: C.text2 }, line: { type: 'none' }, objectName: 'apply button' })
  txt(s, 'Apply', { x: 4.15, y: 4.2, w: 0.85, h: 0.36, fontSize: 12, bold: true, color: C.background1, align: 'center', valign: 'middle' })
  const pageFeatures = [
    [I.tag, 'Pitch, sector, stage and location', 'A shareable URL anyone can read once published.'],
    [I.chart, 'Dated timeline', 'Progress, milestones and roadblocks, newest first.'],
    [I.handshake, 'Specific open needs', 'Skills, hours, work mode and compensation up front.'],
  ]
  pageFeatures.forEach(([img, head, body], i) => {
    const y = 1.3 + i * 1.2
    badge(s, img, 5.8, y, 0.5, C.accent1, head + ' icon')
    txt(s, head, { x: 6.45, y: y - 0.04, w: 3.05, h: 0.34, fontSize: 15, bold: true, color: C.text1 })
    txt(s, body, { x: 6.45, y: y + 0.32, w: 3.05, h: 0.6, fontSize: 14, color: C.text2 })
  })
  s.addNotes('TyneFlow AI is one of our fictional demo projects. The page shows what the project is, a dated timeline so you can see if it is moving, and specific needs you can apply to. Milestones are always labelled self-reported. Drafts stay private until the founder publishes.')

  // 6 — Matching (stretch)
  s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'Product' })
  s.addText('Matching people to needs, with reasons', { placeholder: 'title' })
  s.addChart(pres.charts.BAR, [{ name: 'Weight', labels: ['Required skills', 'Interest / domain', 'Availability', 'Location / work mode', 'Participation type'], values: [40, 20, 20, 10, 10] }], {
    x: 0.4, y: 1.2, w: 5.2, h: 3.6, barDir: 'bar', catAxisOrientation: 'maxMin',
    chartColors: [HEX.navy], showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '0"%"', dataLabelColor: HEX.ink,
    dataLabelFontSize: 12, dataLabelFontFace: '+mn-lt',
    showTitle: true, title: 'Illustrative heuristic fit weights', titleFontSize: 14, titleColor: HEX.ink, titleFontFace: '+mn-lt',
    catAxisLabelColor: HEX.ink, catAxisLabelFontSize: 12, catAxisLabelFontFace: '+mn-lt',
    valAxisHidden: true, valAxisMaxVal: 50, valGridLine: { style: 'none' }, catGridLine: { style: 'none' }, showLegend: false,
    objectName: 'matching weights chart', altText: 'Bar chart: required skills 40%, interest 20%, availability 20%, location 10%, participation 10%',
  })
  card(s, 5.9, 1.25, 3.6, 2.45, C.background2, 'explanation card')
  txt(s, [
    { text: 'Example explanation', options: { bold: true, fontSize: 14, color: C.text2, breakLine: true } },
    { text: '“Recommended because this project needs Python API work and your profile shows FastAPI experience. Availability matches. No evidence yet for the preferred AWS skill.”', options: { italic: true, fontSize: 14, color: C.text1 } },
  ], { x: 6.1, y: 1.4, w: 3.2, h: 2.2 })
  txt(s, [
    { text: 'A heuristic fit score, never a success probability. ', options: { bold: true, color: C.text1 } },
    { text: 'Planned after the core journey ships (stretch goal).', options: { color: C.text2 } },
  ], { x: 5.9, y: 3.9, w: 3.6, h: 0.9, fontSize: 14 })
  s.addNotes('Next layer: transparent, deterministic matching against declared skills. Every recommendation says why, and what evidence is missing. We will show it as a heuristic fit score, not a probability of success. Be clear this is a stretch goal, not part of today’s core demo unless it has shipped.')

  // 7 — Trust
  s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'Product' })
  s.addText('Trust is designed in, not bolted on', { placeholder: 'title' })
  const trust = [
    [I.chart, 'Progress over promises', 'Posting frequency is never a quality score. Milestones are labelled self-reported.'],
    [I.lock, 'Private by default', 'Applications are visible only to the applicant and the project owner. Drafts stay hidden.'],
    [I.db, 'Enforced in the database', 'Supabase Auth tokens, validated API inputs and Row Level Security on every table.'],
    [I.shield, 'No overclaiming', 'Imported text is treated as data, equity is never implied as guaranteed, no investment scores.'],
  ]
  trust.forEach(([img, head, body], i) => {
    const x = 0.5 + (i % 2) * 4.6, y = 1.25 + Math.floor(i / 2) * 1.85
    card(s, x, y, 4.4, 1.65, C.background2, head + ' card')
    badge(s, img, x + 0.25, y + 0.25, 0.55, C.accent1, head + ' icon')
    txt(s, head, { x: x + 1.0, y: y + 0.22, w: 3.2, h: 0.36, fontSize: 16, bold: true, color: C.text1 })
    txt(s, body, { x: x + 1.0, y: y + 0.62, w: 3.2, h: 0.95, fontSize: 14, color: C.text2 })
  })
  s.addNotes('Trust matters more than features for a community platform. We never rank by how often people post, we keep applications private and enforce that in the database itself, and we avoid overclaiming anything about traction, equity or investment.')

  // 8 — Region & audience
  s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'Product' })
  s.addText('Built for the North East', { placeholder: 'title' })
  const places = ['Newcastle', 'Durham', 'Sunderland', 'Teesside']
  places.forEach((p, i) => {
    const x = 0.5 + (i % 2) * 2.2, y = 1.3 + Math.floor(i / 2) * 1.3
    card(s, x, y, 2.0, 1.1, C.text2, p + ' card')
    badge(s, I.map, x + 0.2, y + 0.28, 0.5, C.accent1, p + ' icon')
    txt(s, p, { x: x + 0.8, y: y + 0.28, w: 1.15, h: 0.5, fontSize: 15, bold: true, color: C.background1, valign: 'middle' })
  })
  txt(s, 'Launch focus — the rest of the region and remote contributors are welcome.', { x: 0.5, y: 3.95, w: 4.2, h: 0.8, fontSize: 14, color: C.text2 })
  const audiences = [
    [I.rocket, 'Founders', 'Publish projects, share progress, open needs and review applicants.'],
    [I.code, 'Contributors', 'Students, graduates and local professionals who want to build.'],
    [I.heart, 'Followers', 'Follow a project without committing to join (planned).'],
  ]
  audiences.forEach(([img, head, body], i) => {
    const y = 1.3 + i * 1.15
    badge(s, img, 5.2, y, 0.5, C.accent1, head + ' icon')
    txt(s, head, { x: 5.85, y: y - 0.04, w: 3.65, h: 0.34, fontSize: 16, bold: true, color: C.text1 })
    txt(s, body, { x: 5.85, y: y + 0.3, w: 3.65, h: 0.6, fontSize: 14, color: C.text2 })
  })
  txt(s, 'University students are an early channel, not an eligibility requirement.', { x: 5.2, y: 4.75, w: 4.3, h: 0.35, fontSize: 12, italic: true, color: C.text2 })
  s.addNotes('We start in Newcastle, Durham, Sunderland and Teesside. Students are the easiest first channel, but graduates and local professionals are what make cross-disciplinary teams possible.')

  // 9 — Build status (generated)
  pres.addSection({ title: 'Build' })
  s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'Build' })
  s.addText('What we’ve built today', { placeholder: 'title' })
  const stats = [
    [String(status.mergedPrs), 'pull requests merged'],
    [`${status.featureAreasLive}/5`, 'feature areas with code'],
    [String(status.migrations), 'database migrations'],
    [String(status.testFiles), 'automated test files'],
  ]
  stats.forEach(([n, label], i) => {
    const x = 0.5 + i * 2.3
    card(s, x, 1.2, 2.1, 1.35, C.text2, label + ' stat')
    txt(s, n, { x: x + 0.2, y: 1.3, w: 1.7, h: 0.75, fontSize: 40, bold: true, color: C.accent1, fontFace: 'Cambria' })
    txt(s, label, { x: x + 0.2, y: 2.05, w: 1.7, h: 0.4, fontSize: 12, color: C.background1 })
  })
  const head = (t) => ({ text: t, options: { bold: true, color: HEX.white, fill: { color: HEX.navy }, fontSize: 12 } })
  const tableRows = [[head('Lane'), head('Area'), head('Status from main')]].concat(
    status.lanes.map((l) => [
      { text: l.id, options: { bold: true, fontSize: 12 } },
      { text: l.name, options: { fontSize: 12 } },
      { text: l.status, options: { fontSize: 12, color: l.status === 'Not started' ? HEX.muted : HEX.green, bold: l.status !== 'Not started' } },
    ]))
  s.addTable(tableRows, { x: 0.5, y: 2.75, w: 9.0, colW: [0.9, 3.4, 4.7], rowH: 0.3, color: HEX.ink, border: { type: 'solid', pt: 0.5, color: HEX.line }, fontFace: 'Calibri', valign: 'middle', objectName: 'lane status table' })
  const when = new Date(status.date).toLocaleString('en-GB', { timeZone: 'Europe/London', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  txt(s, `Generated from main @ ${status.sha} (last change ${when} UK). Counts what is in the repository; the live demo is the proof that it works.`, { x: 0.5, y: 4.75, w: 9.0, h: 0.35, fontSize: 10, color: C.text2 })
  s.addNotes(`Auto-generated from the repository’s main branch at commit ${status.sha}. Five lanes built in parallel, each person supervising coding agents, merged through reviewed pull requests one at a time. These numbers count what has landed in the code; they do not claim tests passed. Use the live demo as the proof.`)

  // 10 — Architecture
  s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'Build' })
  s.addText('A simple, secure stack', { placeholder: 'title' })
  const arch = [
    [I.globe, 'Browser', 'React + Vite + TypeScript', 'Feature-scoped pages per lane'],
    [I.server, 'Express API', 'Node.js + TypeScript, /api', 'Verifies the user’s token and validates every input'],
    [I.db, 'Supabase', 'PostgreSQL + Auth', 'Row Level Security keeps private data private'],
  ]
  arch.forEach(([img, head, sub, body], i) => {
    const x = 0.5 + i * 3.1
    card(s, x, 1.3, 2.8, 2.6, i === 1 ? C.text2 : C.background2, head + ' card')
    badge(s, img, x + 1.05, 1.5, 0.7, C.accent1, head + ' icon')
    const dark = i === 1
    txt(s, head, { x: x + 0.2, y: 2.3, w: 2.4, h: 0.4, fontSize: 18, bold: true, color: dark ? C.background1 : C.text1, align: 'center' })
    txt(s, sub, { x: x + 0.2, y: 2.7, w: 2.4, h: 0.35, fontSize: 12, bold: true, color: C.accent1, align: 'center' })
    txt(s, body, { x: x + 0.2, y: 3.1, w: 2.4, h: 0.7, fontSize: 12, color: dark ? C.background2 : C.text2, align: 'center' })
    if (i < 2) s.addShape(pres.shapes.RIGHT_ARROW, { x: x + 2.83, y: 2.45, w: 0.24, h: 0.3, fill: { color: C.accent1 }, line: { type: 'none' }, objectName: 'arch arrow' })
  })
  card(s, 0.5, 4.15, 9.0, 0.7, C.background2, 'hosting card')
  badge(s, I.bolt, 0.7, 4.24, 0.5, C.text2, 'hosting icon')
  txt(s, 'One Render service serves the API and the compiled frontend — a single URL for the demo.', { x: 1.4, y: 4.2, w: 7.9, h: 0.6, fontSize: 14, color: C.text1, valign: 'middle' })
  s.addNotes('Deliberately boring technology. React frontend, Express API that checks the user’s Supabase token, and Postgres with Row Level Security so permissions are enforced in the database, not just the UI.')

  // 11 — Demo flow
  pres.addSection({ title: 'Demo and next steps' })
  s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'Demo and next steps' })
  s.addText('Live demo: the three-minute journey', { placeholder: 'title' })
  const demo = [
    ['0:00', 'The problem', 'Why complementary skills are hard to find'],
    ['0:20', 'Founder', 'Publishes a project, adds a milestone, opens a need'],
    ['1:10', 'Contributor', 'Filters by skill and location, reads the timeline, applies'],
    ['2:10', 'Review', 'Founder updates the application status privately'],
    ['2:40', 'Proof', 'Refresh signed out: public page persists, private data hidden'],
  ]
  s.addShape(pres.shapes.LINE, { x: 0.9, y: 2.05, w: 8.2, h: 0, line: { color: HEX.line, width: 2 }, objectName: 'timeline line' })
  demo.forEach(([t, head, body], i) => {
    const x = 0.5 + i * 1.82
    s.addShape(pres.shapes.OVAL, { x: x + 0.2, y: 1.8, w: 0.5, h: 0.5, fill: { color: C.accent1 }, line: { type: 'none' }, objectName: 'timeline marker' })
    txt(s, String(i + 1), { x: x + 0.2, y: 1.8, w: 0.5, h: 0.5, fontSize: 16, bold: true, color: C.background1, align: 'center', valign: 'middle' })
    txt(s, t, { x, y: 1.3, w: 1.65, h: 0.35, fontSize: 12, bold: true, color: C.text2 })
    txt(s, head, { x, y: 2.5, w: 1.65, h: 0.36, fontSize: 16, bold: true, color: C.text1 })
    txt(s, body, { x, y: 2.9, w: 1.65, h: 1.3, fontSize: 13, color: C.text2 })
  })
  card(s, 0.5, 4.3, 9.0, 0.55, C.background2, 'demo note')
  txt(s, 'Two browser sessions, real Supabase data, fictional demo projects and accounts.', { x: 0.7, y: 4.3, w: 8.6, h: 0.55, fontSize: 14, color: C.text1, valign: 'middle' })
  s.addNotes('Switch to the live app. Use two browser profiles: founder and contributor. End with a signed-out refresh to show data persists and the private application is not visible.')

  // 12 — Next
  s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'Demo and next steps' })
  s.addText('What comes next', { placeholder: 'title' })
  const next = [
    [I.heart, 'Follow projects', 'Save projects and see their updates.'],
    [I.clock, 'Activity labels', 'Recent, quiet, dormant — new ideas never penalised.'],
    [I.users, 'Explainable matching', 'Skill-based fit with evidence and gaps.'],
    [I.github, 'GitHub import', 'Up to five public repos, with consent; code never executed.'],
    [I.bolt, 'AI skill extraction', 'Structured skills with evidence; users correct them.'],
    [I.invest, 'Investor discovery', 'Relevance by sector and stage; no return predictions.'],
  ]
  next.forEach(([img, head, body], i) => {
    const x = 0.5 + (i % 3) * 3.07, y = 1.25 + Math.floor(i / 3) * 1.85
    card(s, x, y, 2.86, 1.65, C.background2, head + ' card')
    badge(s, img, x + 0.2, y + 0.22, 0.5, C.accent1, head + ' icon')
    txt(s, head, { x: x + 0.85, y: y + 0.27, w: 1.9, h: 0.4, fontSize: 15, bold: true, color: C.text1, valign: 'middle' })
    txt(s, body, { x: x + 0.2, y: y + 0.85, w: 2.5, h: 0.75, fontSize: 13, color: C.text2 })
  })
  s.addNotes('Our ordered roadmap after the core journey: follow, activity labels, explainable matching, consent-based GitHub import, AI skill extraction with user correction, and later investor discovery — always without investment scores or return predictions.')

  // 13 — Close
  pres.addSection({ title: 'Close' })
  s = pres.addSlide({ masterName: 'TITLE_DARK', sectionTitle: 'Close' })
  s.addText('Find a project worth joining', { placeholder: 'title' })
  s.addText('Or the people who can help build yours.', { placeholder: 'body' })
  s.addShape(pres.shapes.ISOSCELES_TRIANGLE, { x: 6.9, y: 1.2, w: 2.6, h: 2.3, fill: { color: C.accent1 }, line: { type: 'none' }, objectName: 'brand triangle' })
  const asks = [['Founders', 'publish your project'], ['Builders', 'find where your skills count'], ['Partners', 'help us pilot with local universities and hubs']]
  asks.forEach(([h, b], i) => {
    txt(s, [{ text: h + ': ', options: { bold: true, color: C.accent1 } }, { text: b, options: { color: C.background1 } }], { x: 0.6, y: 3.75 + i * 0.4, w: 8.8, h: 0.36, fontSize: 15 })
  })
  s.addNotes('Close with the ask. Founders: publish. Builders: find where your skills count. Partners: help us validate the idea with North East universities and innovation hubs. Thank the judges and take questions.')

  await pres.writeFile({ fileName: out })
  await applyTheme(out, THEME)
  console.log(`Wrote ${out} from main @ ${status.sha}`)
}

main().catch((e) => { console.error(e); process.exit(1) })
