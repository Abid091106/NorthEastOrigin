import { useMemo, useState } from 'react';
import ProjectCard from '../components/ProjectCard';
import { isNewIdea } from '../lib/activity';
import { useProjects } from '../state/ProjectsContext';

type Tab = 'active' | 'new';

export default function ExplorePage() {
  const { projects } = useProjects();
  const [tab, setTab] = useState<Tab>('active');
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('All');
  const [sector, setSector] = useState('All');
  const [skill, setSkill] = useState('All');

  const locations = useMemo(() => ['All', ...new Set(projects.map((p) => p.location))], [projects]);
  const sectors = useMemo(() => ['All', ...new Set(projects.map((p) => p.sector))], [projects]);
  const skills = useMemo(
    () => ['All', ...new Set(projects.flatMap((p) => p.needs.flatMap((n) => n.requiredSkills)))].sort(),
    [projects],
  );

  const filtered = projects.filter((p) => {
    if ((tab === 'new') !== isNewIdea(p)) return false;
    if (location !== 'All' && p.location !== location) return false;
    if (sector !== 'All' && p.sector !== sector) return false;
    if (skill !== 'All' && !p.needs.some((n) => n.status === 'Open' && n.requiredSkills.includes(skill))) return false;
    const q = query.trim().toLowerCase();
    if (q && !`${p.title} ${p.tagline} ${p.problem}`.toLowerCase().includes(q)) return false;
    return true;
  });

  const newCount = projects.filter(isNewIdea).length;

  return (
    <>
      <section className="hero">
        <h1>Discover what the North East is building.</h1>
        <p>Find a project worth joining, or the people who can help build yours.</p>
        <input
          className="search"
          placeholder="Search projects, problems, ideas…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </section>

      <div className="tabs">
        <button className={tab === 'active' ? 'tab active' : 'tab'} onClick={() => setTab('active')}>
          Active projects <span className="count">{projects.length - newCount}</span>
        </button>
        <button className={tab === 'new' ? 'tab active' : 'tab'} onClick={() => setTab('new')}>
          New ideas <span className="count">{newCount}</span>
        </button>
      </div>

      <div className="filters">
        <Select label="Location" value={location} options={locations} onChange={setLocation} />
        <Select label="Sector" value={sector} options={sectors} onChange={setSector} />
        <Select label="Skill needed" value={skill} options={skills} onChange={setSkill} />
      </div>

      {filtered.length === 0 ? (
        <p className="empty">No projects match those filters yet.</p>
      ) : (
        <div className="grid">
          {filtered.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      )}
    </>
  );
}

function Select(props: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <label className="select">
      <span>{props.label}</span>
      <select value={props.value} onChange={(e) => props.onChange(e.target.value)}>
        {props.options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}
