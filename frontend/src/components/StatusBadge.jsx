export default function StatusBadge({ status }) {
  const normalized = (status || 'Pending').toLowerCase().replace(/\s+/g, '-');
  
  let label = status;
  let dotClass = 'badge-dot-pending';
  
  if (status === 'In Progress') {
    dotClass = 'badge-dot-inprogress';
  } else if (status === 'Resolved') {
    dotClass = 'badge-dot-resolved';
  }

  return (
    <span className={`status-badge status-${normalized}`}>
      <span className={`status-dot ${dotClass}`} />
      <span>{label}</span>
    </span>
  );
}
