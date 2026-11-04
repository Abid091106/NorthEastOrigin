import { NavLink, Outlet } from 'react-router-dom';

export default function Layout() {
  const linkClass = ({ isActive }: { isActive: boolean }) => (isActive ? 'nav-link active' : 'nav-link');

  return (
    <div className="app">
      <header className="topbar">
        <div className="container topbar-inner">
          <NavLink to="/" className="brand">
            <span className="brand-mark">▲</span> Built in the North
          </NavLink>
          <nav className="nav">
            <NavLink to="/" end className={linkClass}>Explore</NavLink>
            <NavLink to="/matches" className={linkClass}>For you</NavLink>
            <NavLink to="/projects/new" className="btn btn-primary btn-sm">Start a project</NavLink>
          </nav>
        </div>
      </header>
      <main className="container main">
        <Outlet />
      </main>
      <footer className="footer container">
        Demo data only · all people and projects are fictional
      </footer>
    </div>
  );
}
