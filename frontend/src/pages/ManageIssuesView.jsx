import { useState, useMemo } from 'react';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import CategoryBadge from '../components/CategoryBadge';
import { 
  SearchIcon, 
  FilterIcon, 
  TrashIcon, 
  EyeIcon, 
  ReportIcon, 
  ResetIcon
} from '../components/Icons';
import { formatDate } from '../utils/storage';
import { CATEGORIES, PRIORITIES, STATUSES } from '../constants/issueConstants';

export default function ManageIssuesView({ 
  issues, 
  onUpdateStatus, 
  onDeleteRequest, 
  onSelectIssue, 
  setActivePage 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'priority'

  // Filter & Search Logic
  const filteredIssues = useMemo(() => {
    let result = [...issues];

    // Search query: complaint ID, ticket ID, title, student name, or location
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter((issue) => {
        const ticketId = (issue.ticket_id || issue.ticketId || '').toLowerCase();
        const idStr = String(issue.id || '').toLowerCase();
        const title = (issue.title || '').toLowerCase();
        const reporter = (issue.student_name || issue.studentName || '').toLowerCase();
        const loc = (issue.location || '').toLowerCase();
        const desc = (issue.description || '').toLowerCase();
        return (
          ticketId.includes(q) ||
          idStr.includes(q) ||
          title.includes(q) ||
          reporter.includes(q) ||
          loc.includes(q) ||
          desc.includes(q)
        );
      });
    }

    // Status filter
    if (selectedStatus !== 'All') {
      result = result.filter((issue) => issue.status === selectedStatus);
    }

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter((issue) => issue.category === selectedCategory);
    }

    // Priority filter
    if (selectedPriority !== 'All') {
      result = result.filter((issue) => issue.priority === selectedPriority);
    }

    // Sorting
    result.sort((a, b) => {
      const dateA = new Date(a.created_at || a.createdAt);
      const dateB = new Date(b.created_at || b.createdAt);
      if (sortBy === 'newest') {
        return dateB - dateA;
      }
      if (sortBy === 'oldest') {
        return dateA - dateB;
      }
      if (sortBy === 'priority') {
        const priorityScore = { High: 3, Medium: 2, Low: 1 };
        return (priorityScore[b.priority] || 0) - (priorityScore[a.priority] || 0);
      }
      return 0;
    });

    return result;
  }, [issues, searchTerm, selectedStatus, selectedCategory, selectedPriority, sortBy]);

  const hasActiveFilters = 
    searchTerm.trim() !== '' || 
    selectedStatus !== 'All' || 
    selectedCategory !== 'All' || 
    selectedPriority !== 'All';

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('All');
    setSelectedCategory('All');
    setSelectedPriority('All');
    setSortBy('newest');
  };

  return (
    <div className="manage-container">
      {/* Search & Filter Bar */}
      <div className="filter-panel panel-card">
        <div className="filter-grid">
          {/* Search Input */}
          <div className="search-field-container">
            <SearchIcon size={18} className="search-field-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by ID (e.g. SCI-2026), title, or student name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search complaints"
            />
            {searchTerm && (
              <button 
                type="button" 
                className="clear-search-btn"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search input"
              >
                ×
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="filter-select-container">
            <label htmlFor="status-filter" className="filter-label">Status</label>
            <select
              id="status-filter"
              className="filter-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              {STATUSES.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="filter-select-container">
            <label htmlFor="category-filter" className="filter-label">Category</label>
            <select
              id="category-filter"
              className="filter-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="filter-select-container">
            <label htmlFor="priority-filter" className="filter-label">Priority</label>
            <select
              id="priority-filter"
              className="filter-select"
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
            >
              <option value="All">All Priorities</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Sort Selector */}
          <div className="filter-select-container">
            <label htmlFor="sort-by" className="filter-label">Sort</label>
            <select
              id="sort-by"
              className="filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">Priority: High → Low</option>
            </select>
          </div>
        </div>

        {/* Filter Results & Quick Reset */}
        <div className="filter-footer">
          <div className="filter-count-text">
            Showing <strong>{filteredIssues.length}</strong> of <strong>{issues.length}</strong> registered complaints
          </div>
          {hasActiveFilters && (
            <button 
              type="button" 
              className="btn btn-text btn-sm"
              onClick={handleResetFilters}
            >
              <ResetIcon size={14} />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Complaints List Table / Empty State */}
      <div className="panel-card table-panel">
        {filteredIssues.length === 0 ? (
          <div className="empty-state-container">
            <div className="empty-state-icon-box">
              <FilterIcon size={32} />
            </div>
            <h2 className="empty-state-title">
              {issues.length === 0 ? 'No Complaints in System' : 'No Matching Complaints Found'}
            </h2>
            <p className="empty-state-desc">
              {issues.length === 0 
                ? 'The campus complaint registry is currently empty. You can submit a new issue or restore the default demo records.'
                : 'No issues match your current search criteria or active filters. Try clearing your filters or altering search keywords.'}
            </p>
            <div className="empty-state-actions">
              {issues.length === 0 ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setActivePage('report')}
                >
                  <ReportIcon size={18} />
                  <span>Report an Issue</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleResetFilters}
                >
                  <ResetIcon size={16} />
                  <span>Clear All Filters</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table manage-data-table">
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Complaint Details</th>
                  <th scope="col">Reporter</th>
                  <th scope="col">Category</th>
                  <th scope="col">Location</th>
                  <th scope="col">Priority</th>
                  <th scope="col">Date Logged</th>
                  <th scope="col">Resolution Status</th>
                  <th scope="col" className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredIssues.map((issue) => {
                  const displayId = issue.ticket_id || issue.ticketId || issue.id;
                  const reporter = issue.student_name || issue.studentName;
                  const dateLogged = issue.created_at || issue.createdAt;
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
                      <td className="cell-details">
                        <p className="issue-main-title">{issue.title}</p>
                        <p className="issue-snippet-desc">
                          {issue.description && issue.description.length > 70 
                            ? `${issue.description.substring(0, 70)}...` 
                            : issue.description}
                        </p>
                      </td>
                      <td className="cell-reporter">
                        <span className="reporter-name">{reporter}</span>
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
                        {formatDate(dateLogged)}
                      </td>
                      <td className="cell-status">
                        <div className="status-selector-wrapper">
                          <select
                            className="status-dropdown-manage"
                            value={issue.status}
                            onChange={(e) => onUpdateStatus(issue.id, e.target.value)}
                            aria-label={`Update status for ${displayId}`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                          </select>
                          <StatusBadge status={issue.status} />
                        </div>
                      </td>
                      <td className="text-right cell-actions">
                        <div className="action-button-group">
                          <button
                            type="button"
                            className="btn-icon-action"
                            onClick={() => onSelectIssue(issue)}
                            title="View Full Details"
                            aria-label={`View details for ${displayId}`}
                          >
                            <EyeIcon size={16} />
                          </button>
                          <button
                            type="button"
                            className="btn-icon-action btn-icon-delete"
                            onClick={() => onDeleteRequest(issue)}
                            title="Delete Complaint"
                            aria-label={`Delete complaint ${displayId}`}
                          >
                            <TrashIcon size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
