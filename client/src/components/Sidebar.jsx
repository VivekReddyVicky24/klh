import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const NAV_ITEMS = [
  { path: "/dashboard",   icon: "📊", label: "Dashboard"   },
  { path: "/mygroup",     icon: "👥", label: "My Group"    },
  { path: "/courses",     icon: "📚", label: "Courses"     },
  { path: "/leaderboard", icon: "🏆", label: "Leaderboard" },
];

function Sidebar({ collapsed, onSignOut }) {
  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>

      {/* Logo */}
      <div className="sidebar-logo">
        <span className="sidebar-logo-icon">⚡</span>
        <span className="sidebar-logo-text">SyncStudy</span>
      </div>

      {/* Nav */}
      <p className="sidebar-nav-label">Navigation</p>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? "active" : ""}`
            }
          >
            <span className="sidebar-nav-icon">{item.icon}</span>
            <span className="sidebar-nav-text">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user-card">
          <div className="sidebar-user-av">AS</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">Arjun S.</div>
            <div className="sidebar-user-role">ML · Medium level</div>
          </div>
        </div>
        <button className="sidebar-signout" onClick={onSignOut}>
          ↩ Sign out
        </button>
      </div>

    </aside>
  );
}

export default Sidebar;