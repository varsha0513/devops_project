export default function StatsCard({ title, count, total, subtitle, icon: Icon, tone = 'blue', onClick }) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div 
      className={`stats-card tone-${tone} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="stats-card-header">
        <div>
          <p className="stats-card-title">{title}</p>
          <div className="stats-card-number-row">
            <span className="stats-card-number">{count}</span>
            {total !== undefined && (
              <span className="stats-card-pill">
                {percentage}% of total
              </span>
            )}
          </div>
        </div>
        <div className="stats-card-icon-wrapper">
          <Icon size={24} />
        </div>
      </div>
      <div className="stats-card-footer">
        <span className="stats-card-subtitle">{subtitle}</span>
      </div>
    </div>
  );
}
