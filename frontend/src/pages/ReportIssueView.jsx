import { useState } from 'react';
import { CATEGORIES, PRIORITIES, CAMPUS_LOCATIONS } from '../constants/issueConstants';
import { formatDate } from '../utils/storage';
import { 
  CheckCircleIcon, 
  ReportIcon, 
  ManageIcon, 
  AlertCircleIcon,
  CheckIcon
} from '../components/Icons';

export default function ReportIssueView({ 
  onAddIssue, 
  setActivePage,
  onSelectIssue 
}) {
  const initialFormState = {
    studentName: '',
    title: '',
    category: '',
    location: '',
    customLocation: '',
    priority: 'Medium',
    description: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [submittedIssue, setSubmittedIssue] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.studentName.trim()) {
      errs.studentName = 'Student name is required.';
    } else if (formData.studentName.trim().length < 2) {
      errs.studentName = 'Please enter a valid student name.';
    }

    if (!formData.title.trim()) {
      errs.title = 'Issue title is required.';
    } else if (formData.title.trim().length < 5) {
      errs.title = 'Title must be at least 5 characters long.';
    }

    if (!formData.category) {
      errs.category = 'Please select a facility category.';
    }

    if (!formData.location) {
      errs.location = 'Please specify the campus location.';
    } else if (formData.location === 'Other / Campus Grounds' && !formData.customLocation.trim()) {
      errs.customLocation = 'Please provide details for the custom location.';
    }

    if (!formData.priority) {
      errs.priority = 'Please select an urgency priority level.';
    }

    if (!formData.description.trim()) {
      errs.description = 'A detailed description is required to help our team respond.';
    } else if (formData.description.trim().length < 10) {
      errs.description = 'Please provide at least 10 characters describing the issue.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-level error on typing
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const finalLocation = formData.location === 'Other / Campus Grounds' && formData.customLocation.trim()
      ? `Other: ${formData.customLocation.trim()}`
      : formData.location;

    try {
      const created = await onAddIssue({
        studentName: formData.studentName.trim(),
        title: formData.title.trim(),
        category: formData.category,
        location: finalLocation,
        priority: formData.priority,
        description: formData.description.trim(),
      });
      setSubmittedIssue(created);
      setFormData(initialFormState);
      setErrors({});
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit complaint to backend.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormData(initialFormState);
    setErrors({});
    setSubmittedIssue(null);
    setSubmitError(null);
  };

  const submittedDisplayId = submittedIssue 
    ? (submittedIssue.ticket_id || submittedIssue.ticketId || submittedIssue.id) 
    : '';
  const submittedDate = submittedIssue 
    ? (submittedIssue.created_at || submittedIssue.createdAt) 
    : '';

  return (
    <div className="report-container">
      {/* Error notification if API failed */}
      {submitError && (
        <div className="backend-error-banner" role="alert">
          <div className="backend-error-content">
            <AlertCircleIcon size={22} className="backend-error-icon" />
            <div>
              <h2 className="backend-error-title">Submission Failed</h2>
              <p className="backend-error-msg">{submitError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification Box */}
      {submittedIssue && (
        <div className="success-banner" role="status" aria-live="polite">
          <div className="success-banner-top">
            <div className="success-banner-icon">
              <CheckCircleIcon size={28} />
            </div>
            <div className="success-banner-content">
              <h2 className="success-banner-title">Complaint Successfully Logged!</h2>
              <p className="success-banner-desc">
                Your ticket has been recorded with tracking ID <strong>{submittedDisplayId}</strong> on{' '}
                {formatDate(submittedDate)}. Campus facilities staff have been notified.
              </p>
            </div>
          </div>

          <div className="success-banner-card">
            <div className="success-card-meta">
              <span><strong>Category:</strong> {submittedIssue.category}</span>
              <span><strong>Location:</strong> {submittedIssue.location}</span>
              <span><strong>Priority:</strong> {submittedIssue.priority}</span>
              <span><strong>Status:</strong> {submittedIssue.status}</span>
            </div>
            <div className="success-card-actions">
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={handleResetForm}
              >
                <ReportIcon size={16} />
                <span>Report Another Issue</span>
              </button>
              <button 
                type="button" 
                className="btn btn-primary btn-sm"
                onClick={() => {
                  onSelectIssue(submittedIssue);
                  setActivePage('manage');
                }}
              >
                <ManageIcon size={16} />
                <span>Track in Manage Registry</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Form Card */}
      <div className="panel-card form-panel">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Campus Issue Incident Form</h2>
            <p className="panel-subtitle">
              All submissions are routed to the central campus administration helpdesk.
            </p>
          </div>
          <span className="required-indicator-note">* Indicates required field</span>
        </div>

        <form onSubmit={handleSubmit} className="issue-form" noValidate>
          <div className="form-row-2">
            {/* Student Name */}
            <div className="form-group">
              <label htmlFor="studentName" className="form-label">
                Student / Staff Name <span className="req">*</span>
              </label>
              <input
                type="text"
                id="studentName"
                name="studentName"
                value={formData.studentName}
                onChange={handleChange}
                placeholder="e.g. John Doe or Roll Number"
                className={`form-input ${errors.studentName ? 'input-error' : ''}`}
                aria-invalid={errors.studentName ? 'true' : 'false'}
                aria-describedby={errors.studentName ? 'studentName-error' : undefined}
                required
              />
              {errors.studentName && (
                <p id="studentName-error" className="field-error-msg">
                  <AlertCircleIcon size={14} />
                  <span>{errors.studentName}</span>
                </p>
              )}
            </div>

            {/* Category */}
            <div className="form-group">
              <label htmlFor="category" className="form-label">
                Issue Category <span className="req">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`form-select ${errors.category ? 'input-error' : ''}`}
                aria-invalid={errors.category ? 'true' : 'false'}
                aria-describedby={errors.category ? 'category-error' : undefined}
                required
              >
                <option value="">-- Choose Category --</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p id="category-error" className="field-error-msg">
                  <AlertCircleIcon size={14} />
                  <span>{errors.category}</span>
                </p>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Issue Title / Brief Summary <span className="req">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Wi-Fi router connectivity drop in Room 204"
              className={`form-input ${errors.title ? 'input-error' : ''}`}
              aria-invalid={errors.title ? 'true' : 'false'}
              aria-describedby={errors.title ? 'title-error' : undefined}
              required
            />
            {errors.title && (
              <p id="title-error" className="field-error-msg">
                <AlertCircleIcon size={14} />
                <span>{errors.title}</span>
              </p>
            )}
          </div>

          <div className="form-row-2">
            {/* Campus Location */}
            <div className="form-group">
              <label htmlFor="location" className="form-label">
                Campus Location / Building Block <span className="req">*</span>
              </label>
              <select
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={`form-select ${errors.location ? 'input-error' : ''}`}
                aria-invalid={errors.location ? 'true' : 'false'}
                aria-describedby={errors.location ? 'location-error' : undefined}
                required
              >
                <option value="">-- Select Campus Building / Zone --</option>
                {CAMPUS_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
              {errors.location && (
                <p id="location-error" className="field-error-msg">
                  <AlertCircleIcon size={14} />
                  <span>{errors.location}</span>
                </p>
              )}

              {formData.location === 'Other / Campus Grounds' && (
                <div className="custom-location-subgroup">
                  <input
                    type="text"
                    name="customLocation"
                    value={formData.customLocation}
                    onChange={handleChange}
                    placeholder="Specify exact location or landmark..."
                    className={`form-input ${errors.customLocation ? 'input-error' : ''}`}
                  />
                  {errors.customLocation && (
                    <p className="field-error-msg">
                      <AlertCircleIcon size={14} />
                      <span>{errors.customLocation}</span>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Priority Selection */}
            <div className="form-group">
              <label className="form-label">
                Urgency Priority <span className="req">*</span>
              </label>
              <div className="priority-radio-group" role="radiogroup" aria-label="Priority level">
                {PRIORITIES.map((p) => {
                  const isChecked = formData.priority === p;
                  return (
                    <label 
                      key={p} 
                      className={`priority-radio-card ${isChecked ? 'selected' : ''} ${p.toLowerCase()}`}
                    >
                      <input
                        type="radio"
                        name="priority"
                        value={p}
                        checked={isChecked}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="radio-card-content">
                        <span className="priority-radio-label">{p}</span>
                        <span className="priority-radio-sub">
                          {p === 'High' ? 'Safety/Outage' : p === 'Medium' ? 'Disruptive' : 'Routine'}
                        </span>
                      </div>
                      {isChecked && <CheckIcon size={16} className="radio-check-icon" />}
                    </label>
                  );
                })}
              </div>
              {errors.priority && (
                <p className="field-error-msg">
                  <AlertCircleIcon size={14} />
                  <span>{errors.priority}</span>
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <div className="label-with-hint">
              <label htmlFor="description" className="form-label">
                Detailed Problem Description <span className="req">*</span>
              </label>
              <span className="char-count-hint">
                {formData.description.length} characters (min 15)
              </span>
            </div>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide specific details such as room number, floor, equipment ID, observed symptoms, or how long this has occurred..."
              className={`form-textarea ${errors.description ? 'input-error' : ''}`}
              aria-invalid={errors.description ? 'true' : 'false'}
              aria-describedby={errors.description ? 'description-error' : undefined}
              required
            />
            {errors.description && (
              <p id="description-error" className="field-error-msg">
                <AlertCircleIcon size={14} />
                <span>{errors.description}</span>
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="form-actions-bar">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleResetForm}
              disabled={isSubmitting}
            >
              Clear Form
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-submit"
              disabled={isSubmitting}
            >
              <ReportIcon size={18} />
              <span>{isSubmitting ? 'Submitting Issue...' : 'Submit Campus Complaint'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
