export default function PriorityBadge({ priority }) {
  const norm = (priority || 'Medium').toLowerCase();
  
  return (
    <span className={`priority-badge priority-${norm}`}>
      <span className="priority-indicator" />
      <span>{priority || 'Medium'}</span>
    </span>
  );
}
