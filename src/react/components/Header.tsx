import { VIEWS, type ViewId } from "../routes";

interface HeaderProps {
  currentView: ViewId;
}

export const Header = ({ currentView }: HeaderProps) => (
  <header className="app-header">
    <div className="header-inner">
      <div className="brand">
        <img src="assets/logo/logo.svg" alt="Project ReMotion logo" className="brand-logo" />
        <div>
          <h1>Project ReMotion</h1>
          <p className="subtitle">
            Investigate the failure of an AI-assisted rehabilitation robot.
          </p>
        </div>
      </div>
      <nav className="main-nav" aria-label="Main navigation">
        {VIEWS.map((view) => (
          <button
            key={view.id}
            type="button"
            className={view.id === currentView ? "nav-btn active" : "nav-btn"}
            onClick={() => {
              window.location.hash = view.id;
            }}
          >
            {view.label}
          </button>
        ))}
      </nav>
    </div>
  </header>
);
