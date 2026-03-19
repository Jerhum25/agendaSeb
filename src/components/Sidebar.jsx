'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, Users, LayoutGrid, Sparkles, Menu, X } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Tableau de bord', icon: LayoutGrid },
  { href: '/agenda', label: 'Agenda', icon: CalendarDays },
  { href: '/clients', label: 'Clients', icon: Users },
];

// ── Contenu nav extrait en dehors du composant Sidebar ──
function NavContent({ pathname, onClose }) {
  return (
    <>
      <div style={{ padding: '28px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #6b8f63, #8fad88)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Sparkles size={16} color="white" />
          </div>
          <div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600, color: 'white', fontSize: '18px', margin: 0, lineHeight: 1 }}>Agenda Pro</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', margin: '3px 0 0' }}>Gestion client</p>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '20px 12px' }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} onClick={onClose} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 16px', borderRadius: '12px', marginBottom: '4px',
                background: active ? 'linear-gradient(135deg, rgba(107,143,99,0.3), rgba(143,173,136,0.15))' : 'transparent',
                borderLeft: active ? '3px solid #6b8f63' : '3px solid transparent',
                color: active ? 'white' : 'rgba(255,255,255,0.5)',
                fontSize: '14px', fontWeight: 500, transition: 'all 0.2s',
              }}>
                <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
                {label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: '20px 24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px', margin: 0 }}>© 2025 Agenda Pro</p>
      </div>
    </>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ── DESKTOP : sidebar fixe ── */}
      <aside
        className="sidebar-desktop"
        style={{
          position: 'relative', left: 0, top: 0, height: '100vh', width: '256px',
          background: 'linear-gradient(160deg, #1a1a1a 0%, #2c2c2c 100%)',
          display: 'flex', flexDirection: 'column', zIndex: 100,
        }}
      >
        <NavContent pathname={pathname} onClose={() => {}} />
      </aside>

      {/* ── MOBILE : topbar ── */}
      <div
        className="sidebar-mobile-bar"
        style={{
          display: 'none', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          background: 'linear-gradient(160deg, #1a1a1a 0%, #2c2c2c 100%)',
          padding: '14px 20px', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'linear-gradient(135deg, #6b8f63, #8fad88)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={14} color="white" />
          </div>
          <span style={{ fontFamily: 'Playfair Display, serif', color: 'white', fontWeight: 600, fontSize: '16px' }}>Agenda Pro</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', padding: '4px' }}
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, backdropFilter: 'blur(2px)' }}
        />
      )}

      {/* ── MOBILE : Drawer ── */}
      <div
        className="sidebar-drawer"
        style={{
          position: 'fixed', top: 0, left: 0, height: '100vh', width: '280px',
          background: 'linear-gradient(160deg, #1a1a1a 0%, #2c2c2c 100%)',
          zIndex: 300, display: 'flex', flexDirection: 'column',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease',
          boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 16px 0' }}>
          <button
            onClick={() => setOpen(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>
        <NavContent pathname={pathname} onClose={() => setOpen(false)} />
      </div>

      <style>{`
        @media (max-width: 768px) {
          .sidebar-desktop { display: none !important; }
          .sidebar-mobile-bar { display: flex !important; }
          .sidebar-drawer { display: flex !important; }
        }
        @media (min-width: 769px) {
          .sidebar-mobile-bar { display: none !important; }
          .sidebar-drawer { display: none !important; }
        }
      `}</style>
    </>
  );
}