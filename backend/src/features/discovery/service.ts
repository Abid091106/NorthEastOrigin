// Discovery query logic. Filtering, ordering and pagination run in the database
// function `discover_projects_page`, so Supabase's row cap cannot hide projects.
// Summaries are built here so skill names stay canonical in one place.
// `applyDiscovery` remains the executable spec for those semantics.
import { canonicalSkill, SKILL_ALIASES } from './skills.ts';
import type { DiscoveryFilters, DiscoveryProjectRow, Page, ProjectSummary } from './types.ts';

/** Post types that count as substantive progress (announcements/opportunities do not). */
export const SUBSTANTIVE_POST_TYPES = new Set(['progress', 'milestone', 'roadblock']);

const fold = (s: string) => s.trim().toLocaleLowerCase('en-GB');

function latest(dates: string[]): string | null {
  let best: string | null = null;
  let bestTime = -Infinity;
  for (const d of dates) {
    const t = Date.parse(d);
    if (Number.isFinite(t) && t > bestTime) {
      bestTime = t;
      best = d;
    }
  }
  return best;
}

export function summariseRow(row: DiscoveryProjectRow): ProjectSummary {
  const openNeeds = (row.project_needs ?? []).filter((n) => n.status === 'open');
  const seen = new Map<string, string>();
  for (const need of openNeeds) {
    for (const raw of need.required_skills ?? []) {
      // Canonical names, so "ReactJS" on a need and "React" in a search are the same skill.
      const skill = canonicalSkill(raw);
      const key = fold(skill);
      if (key && !seen.has(key)) seen.set(key, skill);
    }
  }
  const updateDates = [
    ...(row.project_posts ?? []).filter((p) => SUBSTANTIVE_POST_TYPES.has(p.type)).map((p) => p.created_at),
    ...(row.milestones ?? []).map((m) => m.achieved_at),
  ];

  return {
    id: row.id,
    title: row.title,
    pitch: row.pitch,
    sector: row.sector,
    location: row.location,
    stage: row.stage,
    status: row.status,
    ownerDisplayName: row.owner_display_name,
    requiredSkills: [...seen.values()],
    openNeedsCount: openNeeds.length,
    lastSubstantiveUpdateAt: latest(updateDates),
    createdAt: row.created_at,
  };
}

export function matchesFilters(summary: ProjectSummary, filters: DiscoveryFilters): boolean {
  if (filters.q) {
    const q = fold(filters.q);
    if (!fold(summary.title).includes(q) && !fold(summary.pitch).includes(q)) return false;
  }
  if (filters.location && fold(summary.location) !== fold(filters.location)) return false;
  if (filters.sector && fold(summary.sector) !== fold(filters.sector)) return false;
  if (filters.stage && summary.stage !== filters.stage) return false;
  if (filters.skill) {
    const skill = fold(canonicalSkill(filters.skill));
    if (!summary.requiredSkills.some((s) => fold(canonicalSkill(s)) === skill)) return false;
  }
  return true;
}

/** Newest project first, then ID ascending for stable pagination. */
export function compareSummaries(a: ProjectSummary, b: ProjectSummary): number {
  const diff = Date.parse(b.createdAt) - Date.parse(a.createdAt);
  if (diff !== 0 && Number.isFinite(diff)) return diff;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

/** Applies the full discovery contract to rows: excludes drafts, filters (AND), sorts, paginates. */
export function applyDiscovery(rows: DiscoveryProjectRow[], filters: DiscoveryFilters): Page<ProjectSummary> {
  const matching = rows
    .filter((row) => row.visibility === 'public')
    .map(summariseRow)
    .filter((s) => matchesFilters(s, filters))
    .sort(compareSummaries);

  return {
    data: matching.slice(filters.offset, filters.offset + filters.limit),
    pagination: { limit: filters.limit, offset: filters.offset, total: matching.length },
  };
}

/** Every stored spelling that means this skill, lower-cased for the database match. */
export function skillSpellings(skill: string): string[] {
  const canonical = fold(canonicalSkill(skill));
  const aliases = Object.entries(SKILL_ALIASES)
    .filter(([, name]) => fold(name) === canonical)
    .map(([alias]) => fold(alias));
  return [...new Set([canonical, fold(skill), ...aliases])];
}

/**
 * Minimal structural type for the public (anon/publishable-key) Supabase client,
 * so this feature does not depend on how P1 constructs it.
 */
export interface PublicDb {
  rpc(fn: 'discover_projects_page', args: Record<string, unknown>): PromiseLike<{ data: unknown; error: unknown }>;
}

interface DiscoveryPageResult {
  total: number;
  rows: DiscoveryProjectRow[];
}

function isPageResult(data: unknown): data is DiscoveryPageResult {
  const page = data as DiscoveryPageResult | null;
  return typeof page?.total === 'number' && Array.isArray(page.rows);
}

export class DiscoveryUnavailableError extends Error {}

export async function listDiscoveryProjects(db: PublicDb, filters: DiscoveryFilters): Promise<Page<ProjectSummary>> {
  const { data, error } = await db.rpc('discover_projects_page', {
    filter_q: filters.q ?? null,
    filter_location: filters.location ?? null,
    filter_sector: filters.sector ?? null,
    filter_stage: filters.stage ?? null,
    filter_skills: filters.skill ? skillSpellings(filters.skill) : null,
    page_limit: filters.limit,
    page_offset: filters.offset,
  });
  if (error || !isPageResult(data)) throw new DiscoveryUnavailableError('Discovery query failed');
  return {
    data: data.rows.map(summariseRow),
    pagination: { limit: filters.limit, offset: filters.offset, total: data.total },
  };
}
