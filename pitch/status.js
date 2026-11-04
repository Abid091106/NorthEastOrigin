// Collects build facts from the repository's origin/main so the pitch deck
// reflects what has actually landed. Only reports what git shows; it never
// claims a check passed or a feature works.
const { execFileSync } = require('child_process')

function git(repo, args) {
  return execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8' }).trim()
}

const LANES = {
  p1: { name: 'Platform & identity', feature: 'auth', backend: 'identity' },
  p2: { name: 'Projects', feature: 'projects', backend: 'projects' },
  p3: { name: 'Progress timeline', feature: 'activity', backend: 'activity' },
  p4: { name: 'Opportunities', feature: 'opportunities', backend: 'opportunities' },
  p5: { name: 'Discovery', feature: 'discovery', backend: 'discovery' },
}

function collect(repo, ref = 'origin/main') {
  const sha = git(repo, ['rev-parse', '--short', ref])
  const date = git(repo, ['log', '-1', '--format=%cI', ref])
  const files = git(repo, ['ls-tree', '-r', '--name-only', ref]).split('\n')

  const merges = git(repo, ['log', '--merges', '--format=%s', ref])
    .split('\n')
    .map((s) => s.match(/^Merge pull request #(\d+) from [^/]+\/(.+)$/))
    .filter(Boolean)
    .map((m) => ({ number: Number(m[1]), branch: m[2] }))

  let remoteBranches = []
  try {
    remoteBranches = git(repo, ['for-each-ref', '--format=%(refname:short)', 'refs/remotes/origin/'])
      .split('\n').filter(Boolean)
  } catch { /* none */ }

  const lanes = Object.entries(LANES).map(([id, lane]) => {
    const fe = files.filter((f) => f.startsWith(`frontend/src/features/${lane.feature}/`)).length
    const be = files.filter((f) => f.startsWith(`backend/src/features/${lane.backend}/`)).length
    const merged = merges.filter((m) => m.branch.startsWith(`${id}/`)).length
    const openBranches = remoteBranches.filter((b) => {
      if (!b.startsWith(`origin/${id}/`)) return false
      try { return git(repo, ['rev-list', '--count', `${ref}..${b}`]) !== '0' } catch { return false }
    }).length
    let status = 'Not started'
    if (fe + be > 0) status = 'Code on main'
    if (openBranches > 0) status = fe + be > 0 ? 'On main + work in progress' : 'Work in progress'
    return { id: id.toUpperCase(), name: lane.name, frontendFiles: fe, backendFiles: be, mergedPrs: merged, openBranches, status }
  })

  return {
    sha,
    date,
    mergedPrs: merges.length,
    migrations: files.filter((f) => /^supabase\/migrations\/.+\.sql$/.test(f)).length,
    testFiles: files.filter((f) => /\.test\.(m?[jt]sx?)$/.test(f) || f.startsWith('tests/e2e/')).length,
    featureAreasLive: lanes.filter((l) => l.frontendFiles + l.backendFiles > 0).length,
    lanes,
  }
}

module.exports = { collect }

if (require.main === module) console.log(JSON.stringify(collect(process.argv[2] || '.'), null, 2))
