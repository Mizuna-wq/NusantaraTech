// tone: primary | amber | violet | green
export default function StatCard({ icon: Icon, value, label, tone = 'primary' }) {
  return (
    <div className="stat">
      <span className={`stat-icon tone-${tone}`}>
        <Icon size={20} aria-hidden="true" />
      </span>
      <div className="stat-text">
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}
