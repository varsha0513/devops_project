import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import DashboardView from './pages/DashboardView';
import ReportIssueView from './pages/ReportIssueView';
import ManageIssuesView from './pages/ManageIssuesView';
import IssueDetailModal from './components/IssueDetailModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import { 
  getIssues, 
  createIssue, 
  updateIssue, 
  deleteIssue, 
  getDashboardStats,
  devResetSeed 
} from './utils/api';
import { CheckCircleIcon, CloseIcon, AlertCircleIcon, ResetIcon } from './components/Icons';

export default function App() {
  const [issues, setIssues] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Modals state
  const [detailIssue, setDetailIssue] = useState(null);
  const [issueToDelete, setIssueToDelete] = useState(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = useCallback((msg, type = 'info') => {
    setToastMessage({ text: msg, type, id: Date.now() });
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Load complaints and dashboard statistics from FastAPI backend
  const loadAllData = useCallback(async () => {
    try {
      const [issuesRes, statsRes] = await Promise.all([
        getIssues({ pageSize: 100 }),
        getDashboardStats(),
      ]);
      setIssues(issuesRes.items || []);
      setDashboardStats(statsRes);
      setError(null);
    } catch (err) {
      console.error('Failed to load campus issues from backend:', err);
      setError(err.message || 'Unable to connect to campus backend API.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const [issuesRes, statsRes] = await Promise.all([
          getIssues({ pageSize: 100 }),
          getDashboardStats(),
        ]);
        if (!ignore) {
          setIssues(issuesRes.items || []);
          setDashboardStats(statsRes);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          console.error('Failed to load campus issues from backend:', err);
          setError(err.message || 'Unable to connect to campus backend API.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    init();
    return () => {
      ignore = true;
    };
  }, []);

  // Create new complaint via API
  const handleAddIssue = useCallback(async (issueData) => {
    try {
      const created = await createIssue(issueData);
      await loadAllData();
      showToast(`Complaint ${created.ticket_id || created.id} recorded in campus database!`, 'success');
      return created;
    } catch (err) {
      showToast(`Failed to submit complaint: ${err.message}`, 'warning');
      throw err;
    }
  }, [loadAllData, showToast]);

  // Update status via API
  const handleUpdateStatus = useCallback(async (identifier, newStatus) => {
    try {
      const updated = await updateIssue(identifier, { status: newStatus });
      await loadAllData();
      // Keep detail modal updated if open
      setDetailIssue((prev) =>
        prev && (prev.id === identifier || prev.ticket_id === identifier) ? updated : prev
      );
      showToast(`Status updated to "${newStatus}" for ${updated.ticket_id || identifier}`, 'info');
    } catch (err) {
      showToast(`Failed to update status: ${err.message}`, 'warning');
    }
  }, [loadAllData, showToast]);

  // Request deletion (opens confirmation modal)
  const handleRequestDelete = useCallback((issue) => {
    setIssueToDelete(issue);
  }, []);

  // Confirm delete via API
  const handleConfirmDelete = useCallback(async (identifier) => {
    try {
      await deleteIssue(identifier);
      await loadAllData();
      setIssueToDelete(null);
      if (detailIssue && (detailIssue.id === identifier || detailIssue.ticket_id === identifier)) {
        setDetailIssue(null);
      }
      showToast(`Complaint ${identifier} has been permanently deleted.`, 'warning');
    } catch (err) {
      showToast(`Failed to delete complaint: ${err.message}`, 'warning');
    }
  }, [detailIssue, loadAllData, showToast]);

  // Development-only reset to demo dataset
  const handleResetDemo = useCallback(async () => {
    try {
      const res = await devResetSeed();
      await loadAllData();
      setDetailIssue(null);
      setIssueToDelete(null);
      showToast(`Development database reseeded: ${res.count || 'records'} populated.`, 'info');
    } catch (err) {
      showToast(`Dev seed failed: ${err.message}`, 'warning');
    }
  }, [loadAllData, showToast]);

  const pendingCount = dashboardStats?.pending ?? issues.filter((i) => i.status === 'Pending').length;

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        isOpen={mobileMenuOpen}
        setIsOpen={setMobileMenuOpen}
        issuesCount={dashboardStats?.total ?? issues.length}
        pendingCount={pendingCount}
        onResetDemo={handleResetDemo}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Navbar
          activePage={activePage}
          setActivePage={setActivePage}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          pendingCount={pendingCount}
          backendOnline={!error}
        />

        <main className="content-area">
          {/* Backend Connection Error Banner */}
          {error && (
            <div className="backend-error-banner" role="alert">
              <div className="backend-error-content">
                <AlertCircleIcon size={24} className="backend-error-icon" />
                <div>
                  <h2 className="backend-error-title">Backend API Offline or Unreachable</h2>
                  <p className="backend-error-msg">{error}</p>
                  <p className="backend-error-note">
                    Ensure FastAPI is running on <code>http://localhost:8000</code>. Offline changes are not cached to prevent database inconsistencies.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => loadAllData(true)}
              >
                <ResetIcon size={14} />
                <span>Retry Connection</span>
              </button>
            </div>
          )}

          {/* Loading indicator */}
          {loading && (
            <div className="loading-state-wrapper">
              <div className="spinner-loader" />
              <p>Synchronizing campus complaints from FastAPI backend...</p>
            </div>
          )}

          {/* Views */}
          {!loading && activePage === 'dashboard' && (
            <DashboardView
              issues={issues}
              dashboardStats={dashboardStats}
              setActivePage={setActivePage}
              onSelectIssue={setDetailIssue}
              onUpdateStatus={handleUpdateStatus}
            />
          )}

          {!loading && activePage === 'report' && (
            <ReportIssueView
              existingIssues={issues}
              onAddIssue={handleAddIssue}
              setActivePage={setActivePage}
              onSelectIssue={setDetailIssue}
            />
          )}

          {!loading && activePage === 'manage' && (
            <ManageIssuesView
              issues={issues}
              onUpdateStatus={handleUpdateStatus}
              onDeleteRequest={handleRequestDelete}
              onSelectIssue={setDetailIssue}
              setActivePage={setActivePage}
              onRefresh={() => loadAllData(false)}
            />
          )}
        </main>
      </div>

      {/* Issue Detail Modal */}
      <IssueDetailModal
        isOpen={Boolean(detailIssue)}
        issue={detailIssue}
        onClose={() => setDetailIssue(null)}
        onUpdateStatus={handleUpdateStatus}
        onDeleteRequest={handleRequestDelete}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(issueToDelete)}
        issue={issueToDelete}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIssueToDelete(null)}
      />

      {/* Notification Toast */}
      {toastMessage && (
        <aside 
          className={`app-toast toast-${toastMessage.type}`} 
          role="status" 
          aria-live="polite"
        >
          <div className="toast-content">
            <CheckCircleIcon size={18} className="toast-icon" />
            <span className="toast-text">{toastMessage.text}</span>
          </div>
          <button 
            type="button" 
            className="toast-close-btn"
            onClick={() => setToastMessage(null)}
            aria-label="Close notification"
          >
            <CloseIcon size={14} />
          </button>
        </aside>
      )}
    <footer className="app-footer">Deployed automatically via Jenkins CI/CD on Azure - version 2</footer>
    </div>
  );
}
