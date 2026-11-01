import { VIEWS, type ViewId } from "../routes";

interface HeaderProps {
  currentView: ViewId;
}

export const Header = ({ currentView }: HeaderProps) => (
  <header className="app-header">
    <h1>Project ReMotion Investigation Portal</h1>
    <nav className="app-nav">
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
  </header>
);
