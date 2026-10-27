import { useEffect } from 'react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import CategoryBadge from './CategoryBadge';
import { CloseIcon, UserIcon, MapPinIcon, ClockIcon, TrashIcon } from './Icons';
import { formatDate } from '../utils/storage';
import { STATUSES } from '../constants/issueConstants';

export default function IssueDetailModal({ isOpen, issue, onClose, onUpdateStatus, onDeleteRequest }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !issue) return null;

  const displayId = issue.ticket_id || issue.ticketId || issue.id;
  const reporter = issue.student_name || issue.studentName;
  const createdDate = issue.created_at || issue.createdAt;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="issue-detail-title">
      <div className="modal-box issue-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-text">
            <div className="detail-header-top">
              <span className="issue-id-badge">{displayId}</span>
              <StatusBadge status={issue.status} />
              <PriorityBadge priority={issue.priority} />
            </div>
            <h2 id="issue-detail-title" className="modal-title detail-title">
              {issue.title}
            </h2>
          </div>
          <button 
            type="button" 
            className="modal-close-btn" 
            onClick={onClose}
            aria-label="Close details"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        <div className="modal-body detail-modal-body">
          <div className="detail-meta-grid">
            <div className="detail-meta-item">
              <span className="detail-meta-label">Category</span>
              <CategoryBadge category={issue.category} />
            </div>
            <div className="detail-meta-item">
              <span className="detail-meta-label">Reported By</span>
              <div className="detail-meta-val">
                <UserIcon size={15} />
                <span>{reporter}</span>
              </div>
            </div>
            <div className="detail-meta-item">
              <span className="detail-meta-label">Campus Location</span>
              <div className="detail-meta-val">
                <MapPinIcon size={15} />
                <span>{issue.location}</span>
              </div>
            </div>
            <div className="detail-meta-item">
              <span className="detail-meta-label">Date Submitted</span>
              <div className="detail-meta-val">
                <ClockIcon size={15} />
                <span>{formatDate(createdDate)}</span>
              </div>
            </div>
          </div>

          <div className="detail-description-section">
            <h3 className="detail-section-heading">Detailed Description</h3>
            <div className="detail-description-box">
              <p>{issue.description}</p>
            </div>
          </div>

          <div className="detail-status-change-section">
            <h3 className="detail-section-heading">Update Resolution Status</h3>
            <div className="status-selector-row">
              {STATUSES.map((statusOption) => (
                <button
                  key={statusOption}
                  type="button"
                  className={`status-select-btn ${issue.status === statusOption ? 'active' : ''} ${statusOption.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => onUpdateStatus(issue.id, statusOption)}
                >
                  <span className="status-check-circle" />
                  <span>{statusOption}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-actions space-between">
          <button 
            type="button" 
            className="btn btn-outline-danger"
            onClick={() => {
              onClose();
              onDeleteRequest(issue);
            }}
          >
            <TrashIcon size={15} />
            <span>Delete Complaint</span>
          </button>
          
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
