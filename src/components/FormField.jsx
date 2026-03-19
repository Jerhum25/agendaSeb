export default function FormField({ label, error, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && <label style={{ fontSize: '13px', fontWeight: 500, color: '#2c2c2cbb' }}>{label}</label>}
      {children}
      {error && <p style={{ fontSize: '12px', color: '#dc2626', margin: 0 }}>{error}</p>}
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '14px',
  background: 'white', border: '1px solid #f0e6cc', color: '#1a1a1a',
  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  transition: 'border-color 0.2s',
};

export function Input({ className, style, ...props }) {
  return <input style={{ ...inputStyle, ...style }} {...props} />;
}

export function Select({ className, style, children, ...props }) {
  return (
    <select style={{ ...inputStyle, ...style }} {...props}>
      {children}
    </select>
  );
}

export function Textarea({ className, style, ...props }) {
  return <textarea style={{ ...inputStyle, resize: 'none', ...style }} {...props} />;
}