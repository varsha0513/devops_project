import { MenuIcon, ReportIcon, CheckCircleIcon, AlertCircleIcon } from './Icons';

export default function Navbar({ activePage, setActivePage, onOpenMobileMenu, pendingCount, backendOnline = true }) {
  const getPageInfo = () => {
    switch (activePage) {
      case 'dashboard':
        return {
          title: 'Campus Facilities Dashboard',
          subtitle: 'Real-time overview of active infrastructure complaints and resolution metrics'
        };
      case 'report':
        return {
          title: 'Submit New Campus Issue',
          subtitle: 'Report facility breakdowns, network problems, or safety hazards'
        };
      case 'manage':
        return {
          title: 'Manage & Dispatch Issues',
          subtitle: 'Filter, inspect, transition statuses, and resolve logged complaints'
        };
      default:
        return { title: 'Smart Campus Portal', subtitle: 'Administration Panel' };
    }
  };

  const pageInfo = getPageInfo();
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button 
          type="button" 
          className="mobile-menu-toggle"
          onClick={onOpenMobileMenu}
          aria-label="Toggle navigation drawer"
        >
          <MenuIcon size={22} />
        </button>
        <div className="page-title-group">
          <h1 className="current-page-title">{pageInfo.title}</h1>
          <p className="current-page-subtitle">{pageInfo.subtitle}</p>
        </div>
      </div>

      <div className="navbar-right">
        {backendOnline ? (
          <div className="system-pill" title="Connected to FastAPI SQLite backend">
            <CheckCircleIcon size={14} className="system-pill-icon" />
            <span className="system-pill-text">API Online</span>
          </div>
        ) : (
          <div className="system-pill system-pill-offline" title="FastAPI backend offline">
            <AlertCircleIcon size={14} className="system-pill-icon error" />
            <span className="system-pill-text">API Offline</span>
          </div>
        )}

        {pendingCount > 0 && (
          <div className="system-pill pending-pill" title={`${pendingCount} issues pending review`}>
            <AlertCircleIcon size={14} className="system-pill-icon" style={{ color: '#f59e0b' }} />
            <span className="system-pill-text">{pendingCount} Pending</span>
          </div>
        )}

        <div className="navbar-date-chip">
          <span>{currentDate}</span>
        </div>

        {activePage !== 'report' && (
          <button 
            type="button" 
            className="btn btn-primary btn-sm btn-report-shortcut"
            onClick={() => setActivePage('report')}
          >
            <ReportIcon size={16} />
            <span>Report Issue</span>
          </button>
        )}

        <div className="admin-profile-pill">
          <div className="avatar-circle">AD</div>
          <div className="admin-profile-text">
            <span className="admin-name">Campus Facility Desk</span>
            <span className="admin-role">Administrator</span>
          </div>
        </div>
      </div>
    </header>
  );
}
