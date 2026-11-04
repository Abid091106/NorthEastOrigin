import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ExplorePage from './pages/ExplorePage';
import MatchesPage from './pages/MatchesPage';
import NewProjectPage from './pages/NewProjectPage';
import ProjectPage from './pages/ProjectPage';
import { ProjectsProvider } from './state/ProjectsContext';

export default function App() {
  return (
    <ProjectsProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<ExplorePage />} />
            <Route path="/projects/new" element={<NewProjectPage />} />
            <Route path="/projects/:slug" element={<ProjectPage />} />
            <Route path="/matches" element={<MatchesPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ProjectsProvider>
  );
}
