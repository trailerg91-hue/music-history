const shimmerStyle = {
  background: 'linear-gradient(90deg, #1a1a1a 25%, #252525 50%, #1a1a1a 75%)',
  backgroundSize: '400% 100%',
  animation: 'skeletonShimmer 1.6s ease infinite',
  borderRadius: 18,
  border: '1px solid rgba(245,158,11,0.12)',
};

export function SkeletonCard({ aspect = '4/3', metaLines = 2 }) {
  return (
    <div style={{ ...shimmerStyle, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ width: '100%', aspectRatio: aspect, background: 'rgba(255,255,255,0.03)' }} />
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Array.from({ length: metaLines }, (_, i) => (
          <div key={i} style={{
            height: i === 0 ? 12 : 10,
            width: i === 0 ? '40%' : '70%',
            borderRadius: 6,
            background: 'rgba(255,255,255,0.06)',
          }} />
        ))}
      </div>
      <style>{`@keyframes skeletonShimmer { 0% { background-position:200% 0; } 100% { background-position:-200% 0; } }`}</style>
    </div>
  );
}

export function SkeletonGrid({ count = 6, columns, aspect, metaLines }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: columns || 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '1.25rem',
    }}>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} aspect={aspect} metaLines={metaLines} />
      ))}
    </div>
  );
}
