import { useMemo } from 'react';
import StatsCard from '../components/StatsCard';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import CategoryBadge from '../components/CategoryBadge';
import { 
  TotalIssuesIcon, 
  AlertCircleIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  ReportIcon, 
  ManageIcon,
  EyeIcon,
  ChevronRightIcon
} from '../components/Icons';
import { formatDate } from '../utils/storage';
import { CATEGORIES } from '../constants/issueConstants';

export default function DashboardView({ 
  issues = [], 
  dashboardStats = null,
  setActivePage, 
  onSelectIssue, 
  onUpdateStatus 
}) {
  // Statistics loaded from backend stats or calculated from active issue list
  const stats = useMemo(() => {
    if (dashboardStats) {
      const categoryCounts = CATEGORIES.map((cat) => ({
        category: cat,
        count: dashboardStats.categories?.[cat] || 0
      })).filter((item) => item.count > 0);

      const highPriority = dashboardStats.priorities?.High || 0;
      const mediumPriority = dashboardStats.priorities?.Medium || 0;
      const lowPriority = dashboardStats.priorities?.Low || 0;

      return {
        total: dashboardStats.total,
        pending: dashboardStats.pending,
        inProgress: dashboardStats.in_progress ?? dashboardStats.inProgress ?? 0,
        resolved: dashboardStats.resolved,
        categoryCounts,
        highPriority,
        mediumPriority,
        lowPriority
      };
    }

    const total = issues.length;
    const pending = issues.filter((i) => i.status === 'Pending').length;
    const inProgress = issues.filter((i) => i.status === 'In Progress').length;
    const resolved = issues.filter((i) => i.status === 'Resolved').length;

    // Category distribution
    const categoryCounts = CATEGORIES.map((cat) => ({
      category: cat,
      count: issues.filter((i) => i.category === cat).length
    })).filter((item) => item.count > 0);

    // Priority counts
    const highPriority = issues.filter((i) => i.priority === 'High' && i.status !== 'Resolved').length;
    const mediumPriority = issues.filter((i) => i.priority === 'Medium' && i.status !== 'Resolved').length;
    const lowPriority = issues.filter((i) => i.priority === 'Low' && i.status !== 'Resolved').length;

    return {
      total,
      pending,
      inProgress,
      resolved,
      categoryCounts,
      highPriority,
      mediumPriority,
      lowPriority
    };
  }, [issues, dashboardStats]);

  // Recent complaints loaded from backend dashboard stats or sorted from issues
  const recentComplaints = useMemo(() => {
    if (dashboardStats?.recent && dashboardStats.recent.length > 0) {
      return dashboardStats.recent;
    }
    return [...issues]
      .sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt))
      .slice(0, 6);
  }, [issues, dashboardStats]);

  return (
    <div className="dashboard-container">
      {/* Dynamic Summary Cards */}
      <section className="stats-grid" aria-label="Campus Issue Metrics">
        <StatsCard
          title="Total Issues Logged"
          count={stats.total}
          subtitle="All campus tickets in repository"
          icon={TotalIssuesIcon}
          tone="blue"
          onClick={() => setActivePage('manage')}
        />
        <StatsCard
          title="Pending Attention"
          count={stats.pending}
          total={stats.total}
          subtitle="Needs initial assessment"
          icon={AlertCircleIcon}
          tone="amber"
          onClick={() => setActivePage('manage')}
        />
        <StatsCard
          title="In Progress"
          count={stats.inProgress}
          total={stats.total}
          subtitle="Assigned to maintenance teams"
          icon={ClockIcon}
          tone="indigo"
          onClick={() => setActivePage('manage')}
        />
        <StatsCard
          title="Resolved"
          count={stats.resolved}
          total={stats.total}
          subtitle="Repairs verified & closed"
          icon={CheckCircleIcon}
          tone="emerald"
          onClick={() => setActivePage('manage')}
        />
      </section>

      {/* Analytics & Distribution Row */}
      <div className="dashboard-distribution-grid">
        {/* Category Breakdown */}
        <div className="panel-card">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">Issues by Facility Domain</h2>
              <p className="panel-subtitle">Distribution across campus service categories</p>
            </div>
          </div>
          <div className="panel-body">
            {stats.categoryCounts.length === 0 ? (
              <p className="empty-subtext">No complaint category data recorded yet.</p>
            ) : (
              <div className="category-bars-list">
                {stats.categoryCounts.map(({ category, count }) => {
                  const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                  return (
                    <div key={category} className="cat-bar-item">
                      <div className="cat-bar-header">
                        <span className="cat-bar-label">{category}</span>
                        <span className="cat-bar-count">
                          <strong>{count}</strong> ({pct}%)
                        </span>
                      </div>
                      <div className="cat-bar-track">
                        <div 
                          className="cat-bar-fill" 
                          style={{ width: `${pct}%` }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Priority & Quick Actions */}
        <div className="panel-card">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">Urgency & Fast Actions</h2>
              <p className="panel-subtitle">Active unresolved tickets by severity</p>
            </div>
          </div>
          <div className="panel-body">
            <div className="priority-summary-box">
              <div className="priority-chip high">
                <span className="priority-chip-num">{stats.highPriority}</span>
                <span className="priority-chip-title">High Priority</span>
                <span className="priority-chip-note">Immediate hazard/outage</span>
              </div>
              <div className="priority-chip medium">
                <span className="priority-chip-num">{stats.mediumPriority}</span>
                <span className="priority-chip-title">Medium Priority</span>
                <span className="priority-chip-note">Elevated inconvenience</span>
              </div>
              <div className="priority-chip low">
                <span className="priority-chip-num">{stats.lowPriority}</span>
                <span className="priority-chip-title">Low Priority</span>
                <span className="priority-chip-note">Minor maintenance</span>
              </div>
            </div>

            <div className="quick-actions-box">
              <h3 className="quick-actions-title">Administrative Shortcuts</h3>
              <div className="quick-actions-btns">
                <button 
                  type="button" 
                  className="btn btn-primary btn-block"
                  onClick={() => setActivePage('report')}
                >
                  <ReportIcon size={18} />
                  <span>File Student Complaint</span>
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-block"
                  onClick={() => setActivePage('manage')}
                >
                  <ManageIcon size={18} />
                  <span>Go to Complaint Registry</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Complaints Table */}
      <section className="panel-card" aria-label="Recent Issues Table">
        <div className="panel-header flex-header">
          <div>
            <h2 className="panel-title">Recent Complaints</h2>
            <p className="panel-subtitle">Latest incoming requests requiring tracking or dispatch</p>
          </div>
          <button 
            type="button" 
            className="btn btn-outline btn-sm"
            onClick={() => setActivePage('manage')}
          >
            <span>View All ({stats.total})</span>
            <ChevronRightIcon size={16} />
          </button>
        </div>

        <div className="panel-body no-padding">
          {recentComplaints.length === 0 ? (
            <div className="table-empty-notice">
              <p>No complaints reported yet.</p>
              <button 
                type="button" 
                className="btn btn-primary btn-sm"
                onClick={() => setActivePage('report')}
              >
                Log the First Complaint
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">Complaint ID</th>
                    <th scope="col">Title</th>
                    <th scope="col">Category</th>
                    <th scope="col">Campus Location</th>
                    <th scope="col">Priority</th>
                    <th scope="col">Submission Date</th>
                    <th scope="col">Status</th>
                    <th scope="col" className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentComplaints.map((issue) => {
                    const displayId = issue.ticket_id || issue.ticketId || issue.id;
                    const reporter = issue.student_name || issue.studentName;
                    const submittedDate = issue.created_at || issue.createdAt;
                    return (
                      <tr key={issue.id || issue.ticket_id} className="table-row-hover">
                        <td className="cell-id">
                          <button
                            type="button"
                            className="link-btn-id"
                            onClick={() => onSelectIssue(issue)}
                            title="Click to view details"
                          >
                            {displayId}
                          </button>
                        </td>
                        <td className="cell-title">
                          <span className="issue-table-title" title={issue.title}>
                            {issue.title}
                          </span>
                          <span className="issue-table-student">
                            Reported by {reporter}
                          </span>
                        </td>
                        <td>
                          <CategoryBadge category={issue.category} />
                        </td>
                        <td className="cell-location">
                          <span title={issue.location}>{issue.location}</span>
                        </td>
                        <td>
                          <PriorityBadge priority={issue.priority} />
                        </td>
                        <td className="cell-date">
                          {formatDate(submittedDate)}
                        </td>
                        <td>
                          <div className="status-selector-wrapper">
                            <StatusBadge status={issue.status} />
                            <select
                              className="status-dropdown-inline"
                              value={issue.status}
                              onChange={(e) => onUpdateStatus(issue.id, e.target.value)}
                              aria-label={`Update status for ${displayId}`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Resolved">Resolved</option>
                            </select>
                          </div>
                        </td>
                        <td className="text-right">
                          <button
                            type="button"
                            className="btn-icon-action"
                            onClick={() => onSelectIssue(issue)}
                            title="View Full Details"
                            aria-label={`View details for ${displayId}`}
                          >
                            <EyeIcon size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
