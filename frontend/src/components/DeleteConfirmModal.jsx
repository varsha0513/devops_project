import { useEffect } from 'react';
import { TrashIcon, CloseIcon, AlertCircleIcon } from './Icons';

export default function DeleteConfirmModal({ isOpen, issue, onConfirm, onCancel }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen || !issue) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel} role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title">
      <div className="modal-box delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-icon danger">
            <TrashIcon size={20} />
          </div>
          <div className="modal-header-text">
            <h2 id="delete-dialog-title" className="modal-title">Delete Complaint</h2>
            <p className="modal-subtitle">Confirm removal from system records</p>
          </div>
          <button 
            type="button" 
            className="modal-close-btn" 
            onClick={onCancel}
            aria-label="Close dialog"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-message">
            Are you sure you want to permanently delete complaint <strong>{issue.ticket_id || issue.ticketId || issue.id}</strong>?
          </p>
          <div className="delete-issue-preview">
            <p className="delete-preview-title">{issue.title}</p>
            <div className="delete-preview-meta">
              <span>Reported by: <strong>{issue.student_name || issue.studentName}</strong></span>
              <span>•</span>
              <span>Location: <strong>{issue.location}</strong></span>
            </div>
          </div>
          <div className="delete-warning-note">
            <AlertCircleIcon size={16} />
            <span>This action cannot be undone. All audit history for this record will be cleared.</span>
          </div>
        </div>

        <div className="modal-actions">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onCancel}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className="btn btn-danger" 
            onClick={() => onConfirm(issue.id)}
          >
            <TrashIcon size={16} />
            <span>Delete Complaint</span>
          </button>
        </div>
      </div>
    </div>
  );
}
