import { 
  DashboardIcon, 
  ReportIcon, 
  ManageIcon, 
  BuildingIcon, 
  CloseIcon,
  ResetIcon
} from './Icons';

export default function Sidebar({ 
  activePage, 
  setActivePage, 
  isOpen, 
  setIsOpen, 
  issuesCount, 
  pendingCount,
  onResetDemo 
}) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: DashboardIcon,
      badge: null
    },
    {
      id: 'report',
      label: 'Report an Issue',
      icon: ReportIcon,
      badge: 'New'
    },
    {
      id: 'manage',
      label: 'Manage Issues',
      icon: ManageIcon,
      badge: issuesCount
    }
  ];

  const handleNavClick = (pageId) => {
    setActivePage(pageId);
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setIsOpen(false)} 
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-badge">
            <BuildingIcon size={24} className="brand-icon" />
            <div className="brand-text">
              <span className="brand-name">SmartCampus</span>
              <span className="brand-sub">Ops & Facilities</span>
            </div>
          </div>
          <button 
            type="button" 
            className="mobile-close-sidebar-btn" 
            onClick={() => setIsOpen(false)}
            aria-label="Close navigation menu"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        <div className="sidebar-body">
          <div className="sidebar-nav-section">
            <span className="sidebar-section-title">ADMIN & STUDENT PORTAL</span>
            <nav className="sidebar-nav" aria-label="Main Navigation">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`nav-link ${isActive ? 'active' : ''}`}
                    onClick={() => handleNavClick(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className="nav-icon-container">
                      <IconComponent size={20} />
                    </span>
                    <span className="nav-label">{item.label}</span>
                    {item.badge !== null && (
                      <span className={`nav-badge ${item.id === 'report' ? 'badge-new' : ''}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="sidebar-summary-card">
            <div className="summary-status-header">
              <span className="summary-status-dot" />
              <span className="summary-status-title">Live Campus Status</span>
            </div>
            <p className="summary-status-desc">
              <strong>{pendingCount}</strong> open {pendingCount === 1 ? 'issue' : 'issues'} awaiting maintenance dispatch.
            </p>
            <button 
              type="button"
              className="quick-jump-btn"
              onClick={() => handleNavClick('manage')}
            >
              Review Queue →
            </button>
          </div>
        </div>

        <div className="sidebar-footer">
          {import.meta.env.DEV && (
            <button 
              type="button" 
              className="reset-demo-btn"
              onClick={onResetDemo}
              title="Development only: Reseed database with sample campus complaints"
            >
              <ResetIcon size={15} />
              <span>Dev: Reseed SQLite</span>
            </button>
          )}
          <div className="campus-version-tag">
            <span>Institutional Edition v2.4</span>
          </div>
        </div>
      </aside>
    </>
  );
}
