'use client';
import { useEffect, useState, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import StatutBadge from '../components/StatutBadge';
import Button from '../components/Button';
import RendezVousForm from '../components/RendezVousForm';
import { getClients, getRendezVous } from '../lib/firestore';
import { format, isToday, isTomorrow, parseISO, isThisWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarDays, Users, TrendingUp, Clock, Plus } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const [pageData, setPageData] = useState({ clients: [], rdvList: [] });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    try {
      const [c, r] = await Promise.all([getClients(), getRendezVous()]);
      setPageData({ clients: c, rdvList: r });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const { clients, rdvList } = pageData;
  const rdvAujourdhui = rdvList.filter((r) => isToday(parseISO(r.date)));
  const rdvSemaine = rdvList.filter((r) => isThisWeek(parseISO(r.date), { locale: fr }));
  const caTotal = rdvList.filter(r => r.statut === 'terminé').reduce((sum, r) => sum + (r.montant || 0), 0);
  const prochains = rdvList
    .filter((r) => new Date(`${r.date}T${r.heure || '00:00'}`) >= new Date())
    .slice(0, 5);

  const formatDate = (dateStr) => {
    const d = parseISO(dateStr);
    if (isToday(d)) return "Aujourd'hui";
    if (isTomorrow(d)) return 'Demain';
    return format(d, 'EEE d MMM', { locale: fr });
  };

  const stats = [
    { label: "RDV aujourd'hui", value: rdvAujourdhui.length, icon: Clock, color: '#4d6b45', bg: 'rgba(107,143,99,0.1)' },
    { label: 'Cette semaine', value: rdvSemaine.length, icon: CalendarDays, color: '#d97706', bg: '#fffbeb' },
    { label: 'Clients', value: clients.length, icon: Users, color: '#2563eb', bg: '#eff6ff' },
    { label: 'CA terminé', value: `${caTotal.toFixed(0)} €`, icon: TrendingUp, color: '#059669', bg: '#ecfdf5' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#fdfbf7' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '40px' }} className="main-content">

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <p style={{ color: '#4d6b45', fontSize: '13px', fontWeight: 500, margin: '0 0 4px', textTransform: 'capitalize' }}>
              {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}
            </p>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '36px', fontWeight: 600, color: '#1a1a1a', margin: 0 }}>
              Tableau de bord
            </h1>
          </div>
          <button
            onClick={() => setShowForm(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #4d6b45, #6b8f63)', color: 'white', border: 'none', borderRadius: '12px', padding: '10px 20px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', boxShadow: '0 2px 8px rgba(77,107,69,0.3)', whiteSpace: 'nowrap' }}
          >
            <Plus size={16} /> Nouveau RDV
          </button>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '40px' }}>
          {stats.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #f0e6cc', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Icon size={20} color={color} />
              </div>
              <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', fontWeight: 600, color: '#1a1a1a', margin: 0 }}>{value}</p>
              <p style={{ fontSize: '13px', color: '#2c2c2c80', margin: '4px 0 0' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Prochains RDV */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #f0e6cc', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px', borderBottom: '1px solid #f0e6cc', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', fontWeight: 600, color: '#1a1a1a', margin: 0 }}>
              Prochains rendez-vous
            </h2>
            <Link href="/agenda" style={{ textDecoration: 'none', color: '#4d6b45', fontSize: '14px', fontWeight: 500 }}>
              Voir l'agenda →
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#2c2c2c60' }}>Chargement…</div>
          ) : prochains.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#2c2c2c60' }}>Aucun rendez-vous à venir</div>
          ) : (
            <div>
              {prochains.map((rdv, i) => (
                <div key={rdv.id} style={{ display: 'flex', alignItems: 'center', padding: '16px 28px', borderBottom: i < prochains.length - 1 ? '1px solid #f0e6cc' : 'none', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ minWidth: '110px' }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', margin: 0 }}>{formatDate(rdv.date)}</p>
                    <p style={{ fontSize: '12px', color: '#2c2c2c80', margin: '2px 0 0' }}>{rdv.heure}</p>
                  </div>
                  <div style={{ flex: 1, minWidth: '120px' }}>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: '#1a1a1a', margin: 0 }}>{rdv.clientNom}</p>
                    <p style={{ fontSize: '12px', color: '#2c2c2c80', margin: '2px 0 0' }}>{rdv.prestation}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    {rdv.montant > 0 && (
                      <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '16px', fontWeight: 600, color: '#1a1a1a' }}>
                        {Number(rdv.montant).toFixed(2)} €
                      </span>
                    )}
                    <StatutBadge statut={rdv.statut} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <RendezVousForm isOpen={showForm} onClose={() => setShowForm(false)} clients={pageData.clients} onSuccess={load} />

      <style>{`
        @media (max-width: 768px) {
          .main-content { margin-left: 0 !important; padding: 80px 16px 24px !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}