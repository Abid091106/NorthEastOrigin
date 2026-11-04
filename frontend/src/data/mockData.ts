export interface ProjectNeed {
  id: string;
  title: string;
  roleType: 'cofounder' | 'contributor' | 'task';
  requiredSkills: string[];
  hoursPerWeek: number;
}

export interface Project {
  id: string;
  title: string;
  location: string;
  sector: string;
  stage: string;
  pitch: string;
  statusLabel: string;
  needs: ProjectNeed[];
}

export const SEEDED_PROJECTS: Project[] = [
  {
    id: "tyne-flow",
    title: "TyneFlow AI",
    location: "Newcastle Helix",
    sector: "CleanTech & IoT",
    stage: "Prototype",
    statusLabel: "Recently Active",
    pitch: "Building low-cost hardware and micro-services to monitor river quality and urban run-off in Newcastle and Gateshead.",
    needs: [
      { id: "n1", title: "FastAPI Developer", roleType: "contributor", requiredSkills: ["Python", "FastAPI"], hoursPerWeek: 6 },
      { id: "n2", title: "Hardware Specialist", roleType: "cofounder", requiredSkills: ["C++", "ESP32", "IoT"], hoursPerWeek: 10 }
    ]
  },
  {
    id: "durham-health",
    title: "Vanguard Patient Portal",
    location: "Durham",
    sector: "HealthTech",
    stage: "Active Beta",
    statusLabel: "Recently Active",
    pitch: "Connecting NHS regional research datasets with university researchers while maintaining strict consent controls.",
    needs: [
      { id: "n3", title: "Frontend Engineer", roleType: "contributor", requiredSkills: ["React", "TypeScript", "Tailwind"], hoursPerWeek: 8 }
    ]
  }
];