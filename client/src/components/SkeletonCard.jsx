export default function SkeletonCard() {
  return (
    <div className="card listing-card skeleton-card">
      <div className="skeleton-image skeleton-shimmer" />
      <div className="card-body">
        <div className="row-between">
          <div className="skeleton-badge skeleton-shimmer" />
          <div className="skeleton-text skeleton-text-sm skeleton-shimmer" />
        </div>
        <div className="skeleton-text skeleton-text-lg skeleton-shimmer" />
        <div className="skeleton-text skeleton-text-md skeleton-shimmer" />
        <div className="skeleton-text skeleton-text-sm skeleton-shimmer" />
      </div>
    </div>
  );
}
