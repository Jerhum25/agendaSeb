'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '../../../components/Sidebar';
import ClientForm from '../../../components/ClientForm';
import RendezVousForm from '../../../components/RendezVousForm';
import StatutBadge from '../../../components/StatutBadge';
import { getClients, getRendezVousParClient, deleteClient, deleteRendezVous } from '../../../lib/firestore';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowLeft, Phone, Mail, MapPin, Pencil, Trash2, Plus, Calendar, TrendingUp, CheckCircle, Clock, FileText } from 'lucide-react';
import Link from 'next/link';

export default function ClientDetail() {
  const { id } = useParams();
  const router = useRouter();

  const [pageData, setPageData] = useState({ client: null, allClients: [], rdvList: [] });
  const [loading, setLoading] = useState(true);
  const [showClientForm, setShowClientForm] = useState(false);
  const [showRdvForm, setShowRdvForm] = useState(false);
  const [editRdv, setEditRdv] = useState(null);

  const load = useCallback(async () => {
    try {
      const [clients, rdvs] = await Promise.all([getClients(), getRendezVousParClient(id)]);
      const found = clients.find((c) => c.id === id) || null;
      setPageData({ client: found, allClients: clients, rdvList: rdvs });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const { client, allClients, rdvList } = pageData;

  const handleDeleteClient = async () => {
    if (!confirm(`Supprimer définitivement ${client?.prenom} ${client?.nom} ?`)) return;
    await deleteClient(id);
    router.push('/clients');
  };

  const handleDeleteRdv = async (rdvId) => {
    if (!confirm('Supprimer ce rendez-vous ?')) return;
    await deleteRendezVous(rdvId);
    load();
  };

  const handleEditRdv = (rdv) => { setEditRdv(rdv); setShowRdvForm(true); };
  const closeRdvForm = () => { setShowRdvForm(false); setEditRdv(null); };

  const rdvTermines = rdvList.filter((r) => r.statut === 'terminé');
  const rdvAVenir = rdvList.filter((r) =>
    new Date(`${r.date}T${r.heure || '00:00'}`) >= new Date() && r.statut !== 'annulé'
  );
  const caTotal = rdvTermines.reduce((sum, r) => sum + (r.montant || 0), 0);
  const prochainRdv = rdvAVenir[0];

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#fdfbf7' }}>
        <Sidebar />
        <main className="main-content" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid #6b8f63', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </main>
        <style>{`
          .main-content { margin-left: 256px; }
          @media (max-width: 768px) { .main-content { margin-left: 0 !important; padding-top: 64px; } }
        `}</style>
      </div>
    );
  }

  if (!client) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#fdfbf7' }}>
        <Sidebar />
        <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          <p style={{ color: '#2c2c2c60' }}>Client introuvable</p>
          <Link href="/clients">
            <button style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#f9f4e8', color: '#2c2c2c', border: '1px solid #f0e6cc', borderRadius: '12px', padding: '10px 20px', fontSize: '14px', cursor: 'pointer' }}>
              <ArrowLeft size={15} /> Retour aux clients
            </button>
          </Link>
        </main>
        <style>{`
          .main-content { margin-left: 256px; }
          @media (max-width: 768px) { .main-content { margin-left: 0 !important; padding-top: 64px; } }
        `}</style>
      </div>
    );
  }

  const initials = `${client.prenom?.[0] || ''}${client.nom?.[0] || ''}`.toUpperCase();
  const avatarHue = ((client.nom?.charCodeAt(0) || 65) * 7) % 360;

  const statCards = [
    { label: 'RDV total',    value: rdvList.length,           color: '#4d6b45', bg: 'rgba(107,143,99,0.1)', icon: Calendar     },
    { label: 'Terminés',     value: rdvTermines.length,        color: '#059669', bg: '#ecfdf5',              icon: CheckCircle  },
    { label: 'CA total',     value: `${caTotal.toFixed(2)} €`, color: '#d97706', bg: '#fffbeb',              icon: TrendingUp   },
    { label: 'Prochain RDV', value: prochainRdv ? format(parseISO(prochainRdv.date), 'd MMM', { locale: fr }) : '—', color: '#2563eb', bg: '#eff6ff', icon: Clock },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#fdfbf7' }}>
      <Sidebar />

      <main className="main-content" style={{ flex: 1, padding: '40px', minWidth: 0 }}>

        {/* Retour */}
        <Link href="/clients" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#2c2c2c80', textDecoration: 'none', marginBottom: '28px' }}>
          <ArrowLeft size={15} /> Retour aux clients
        </Link>

        {/* Layout principal : colonne sur mobile, 2 colonnes sur desktop */}
        <div className="detail-grid">

          {/* ── COLONNE GAUCHE : Identité + Stats ── */}
          <div className="col-left">

            {/* Carte identité */}
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #f0e6cc', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '14px', background: `hsl(${avatarHue}, 42%, 54%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Playfair Display, serif', fontSize: '22px', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                  {initials}
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={() => setShowClientForm(true)} style={{ padding: '8px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#2c2c2c60' }} title="Modifier">
                    <Pencil size={15} />
                  </button>
                  <button onClick={handleDeleteClient} style={{ padding: '8px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#2c2c2c60' }} title="Supprimer">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '22px', fontWeight: 600, color: '#1a1a1a', margin: '0 0 16px' }}>
                {client.prenom} {client.nom}
              </h1>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {client.email && (
                  <a href={`mailto:${client.email}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#2c2c2cbb', textDecoration: 'none' }}>
                    <span style={{ width: '28px', height: '28px', borderRadius: '7px', background: '#f9f4e8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Mail size={13} /></span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{client.email}</span>
                  </a>
                )}
                {client.telephone && (
                  <a href={`tel:${client.telephone}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#2c2c2cbb', textDecoration: 'none' }}>
                    <span style={{ width: '28px', height: '28px', borderRadius: '7px', background: '#f9f4e8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Phone size={13} /></span>
                    {client.telephone}
                  </a>
                )}
                {(client.adresse || client.ville) && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', color: '#2c2c2cbb' }}>
                    <span style={{ width: '28px', height: '28px', borderRadius: '7px', background: '#f9f4e8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}><MapPin size={13} /></span>
                    <span>
                      {client.adresse && <span style={{ display: 'block' }}>{client.adresse}</span>}
                      {(client.codePostal || client.ville) && <span style={{ display: 'block' }}>{[client.codePostal, client.ville].filter(Boolean).join(' ')}</span>}
                    </span>
                  </div>
                )}
              </div>

              {client.notes && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f0e6cc' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <FileText size={12} color="#2c2c2c60" />
                    <p style={{ fontSize: '11px', fontWeight: 500, color: '#2c2c2c60', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Notes</p>
                  </div>
                  <p style={{ fontSize: '14px', color: '#2c2c2cbb', lineHeight: 1.6, margin: 0 }}>{client.notes}</p>
                </div>
              )}
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {statCards.map(({ label, value, color, bg, icon: Icon }) => (
                <div key={label} style={{ background: 'white', borderRadius: '12px', border: '1px solid #f0e6cc', padding: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                    <Icon size={14} color={color} />
                  </div>
                  <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', fontWeight: 600, color: '#1a1a1a', margin: 0 }}>{value}</p>
                  <p style={{ fontSize: '12px', color: '#2c2c2c80', margin: '2px 0 0' }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── COLONNE DROITE : RDV ── */}
          <div className="col-right">
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #f0e6cc', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #f0e6cc', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', fontWeight: 600, color: '#1a1a1a', margin: 0 }}>Rendez-vous</h2>
                  {rdvAVenir.length > 0 && <p style={{ fontSize: '12px', color: '#4d6b45', margin: '2px 0 0' }}>{rdvAVenir.length} à venir</p>}
                </div>
                <button
                  onClick={() => { setEditRdv(null); setShowRdvForm(true); }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #4d6b45, #6b8f63)', color: 'white', border: 'none', borderRadius: '10px', padding: '9px 16px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}
                >
                  <Plus size={15} /> Nouveau RDV
                </button>
              </div>

              {rdvList.length === 0 ? (
                <div style={{ padding: '60px 24px', textAlign: 'center' }}>
                  <Calendar size={28} color="#2c2c2c30" style={{ margin: '0 auto 10px' }} />
                  <p style={{ color: '#2c2c2c60', fontSize: '14px', margin: '0 0 8px' }}>Aucun rendez-vous pour ce client</p>
                  <button onClick={() => setShowRdvForm(true)} style={{ background: 'none', border: 'none', color: '#4d6b45', fontSize: '14px', cursor: 'pointer', textDecoration: 'underline' }}>
                    Créer le premier rendez-vous
                  </button>
                </div>
              ) : (
                <div>
                  {rdvList.map((rdv, i) => {
                    const isPast = new Date(`${rdv.date}T${rdv.heure || '00:00'}`) < new Date();
                    return <RdvRow key={rdv.id} rdv={rdv} isPast={isPast} isLast={i === rdvList.length - 1} onEdit={handleEditRdv} onDelete={handleDeleteRdv} />;
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <ClientForm isOpen={showClientForm} onClose={() => setShowClientForm(false)} client={client} onSuccess={load} />
      <RendezVousForm isOpen={showRdvForm} onClose={closeRdvForm} rdv={editRdv} clients={allClients} defaultClientId={id} onSuccess={load} />

      <style>{`
        .main-content {
          margin-left: 0;
        }
        .detail-grid {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 24px;
          align-items: start;
        }
        .col-left {
          position: sticky;
          top: 24px;
        }
        @media (max-width: 768px) {
          .main-content {
            margin-left: 0 !important;
            padding: 72px 16px 24px !important;
          }
          .detail-grid {
            grid-template-columns: 1fr !important;
          }
          .col-left {
            position: static !important;
          }
        }
        @media (max-width: 1024px) and (min-width: 769px) {
          .detail-grid {
            grid-template-columns: 260px 1fr;
          }
        }
      `}</style>
    </div>
  );
}

function RdvRow({ rdv, isPast, isLast, onEdit, onDelete }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '18px 24px',
        borderBottom: isLast ? 'none' : '1px solid #f0e6cc',
        background: hovered ? (isPast ? '#fdfbf7' : 'rgba(107,143,99,0.04)') : 'transparent',
        transition: 'background 0.15s', flexWrap: 'wrap',
      }}
    >
      {/* Bloc date */}
      <div style={{ width: '50px', flexShrink: 0, textAlign: 'center', borderRadius: '10px', padding: '8px 4px', background: isPast ? '#f9f4e8' : 'rgba(107,143,99,0.1)' }}>
        <p style={{ fontSize: '10px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: isPast ? '#2c2c2c60' : '#4d6b45', margin: 0 }}>
          {format(parseISO(rdv.date), 'MMM', { locale: fr })}
        </p>
        <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', fontWeight: 600, color: '#1a1a1a', lineHeight: 1, margin: '2px 0' }}>
          {format(parseISO(rdv.date), 'd')}
        </p>
        <p style={{ fontSize: '10px', color: '#2c2c2c60', margin: 0 }}>
          {format(parseISO(rdv.date), 'yyyy')}
        </p>
      </div>

      {/* Séparateur */}
      <div style={{ width: '1px', alignSelf: 'stretch', background: '#f0e6cc', flexShrink: 0 }} className="rdv-separator" />

      {/* Contenu */}
      <div style={{ flex: 1, minWidth: '140px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontWeight: 600, color: '#1a1a1a', margin: 0 }}>{rdv.prestation}</p>
            <p style={{ fontSize: '13px', color: '#2c2c2c80', margin: '3px 0 0' }}>
              {rdv.heure}{rdv.duree ? ` · ${rdv.duree} h` : ''}
            </p>
            {rdv.notes && <p style={{ fontSize: '12px', color: '#2c2c2c60', fontStyle: 'italic', margin: '6px 0 0', lineHeight: 1.5 }}>{rdv.notes}</p>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
            {rdv.montant > 0 && (
              <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '17px', fontWeight: 600, color: '#1a1a1a' }}>
                {Number(rdv.montant).toFixed(2)} €
              </span>
            )}
            <StatutBadge statut={rdv.statut} />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '4px', opacity: hovered ? 1 : 0, transition: 'opacity 0.2s', flexShrink: 0, alignSelf: 'center' }}>
        <button onClick={() => onEdit(rdv)} style={{ padding: '6px', borderRadius: '7px', background: 'none', border: 'none', cursor: 'pointer', color: '#2c2c2c60' }} title="Modifier">
          <Pencil size={14} />
        </button>
        <button onClick={() => onDelete(rdv.id)} style={{ padding: '6px', borderRadius: '7px', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }} title="Supprimer">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}