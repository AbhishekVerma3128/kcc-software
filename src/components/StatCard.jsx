export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
}) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <div>
          <div className="stat-label">
            {title}
          </div>

          <div className="stat-value">
            {value}
          </div>

          <div className="stat-subtitle">
            {subtitle}
          </div>
        </div>

        <div className="stat-icon">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}