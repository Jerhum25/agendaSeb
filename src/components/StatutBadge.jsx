const config = {
  'confirmé':   { background: 'rgba(107,143,99,0.12)', color: '#4d6b45',  dot: '#6b8f63' },
  'en attente': { background: '#fffbeb',                color: '#b45309',  dot: '#f59e0b' },
  'annulé':     { background: '#fff0f0',                color: '#dc2626',  dot: '#ef4444' },
  'terminé':    { background: 'rgba(44,44,44,0.06)',    color: '#2c2c2c99',dot: '#2c2c2c60' },
};

export default function StatutBadge({ statut }) {
  const s = config[statut] || config['en attente'];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 500, background: s.background, color: s.color, whiteSpace: 'nowrap' }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {statut}
    </span>
  );
}