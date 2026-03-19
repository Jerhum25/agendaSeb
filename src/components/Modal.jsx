'use client';
import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(26,26,26,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: '#fdfbf7', borderRadius: '20px', boxShadow: '0 24px 60px rgba(0,0,0,0.2)', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflow: 'auto', border: '1px solid rgba(107,143,99,0.2)', animation: 'slideUp 0.3s ease-out' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px', borderBottom: '1px solid #f0e6cc', position: 'sticky', top: 0, background: '#fdfbf7', zIndex: 1 }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', fontWeight: 600, color: '#1a1a1a', margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0e6cc', border: 'none', cursor: 'pointer', color: '#2c2c2c80' }}>
            <X size={15} />
          </button>
        </div>
        <div style={{ padding: '24px 28px' }}>{children}</div>
      </div>
      <style>{`@keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}