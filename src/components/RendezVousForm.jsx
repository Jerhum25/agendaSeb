'use client';
import { useState, useEffect } from 'react';
import Modal from './Modal';
import FormField, { Input, Select, Textarea } from './FormField';
import { addRendezVous, updateRendezVous } from '../lib/firestore';
import { format } from 'date-fns';

const EMPTY = { clientId: '', date: '', heure: '', duree: 60, prestation: '', montant: '', statut: 'confirmé', notes: '' };

export default function RendezVousForm({ isOpen, onClose, rdv, clients, defaultClientId, onSuccess }) {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(rdv ? { ...EMPTY, ...rdv } : { ...EMPTY, clientId: defaultClientId || '', date: format(new Date(), 'yyyy-MM-dd') });
  }, [rdv, isOpen, defaultClientId]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const client = clients.find((c) => c.id === form.clientId);
      const payload = { ...form, clientNom: client ? `${client.prenom} ${client.nom}` : '', montant: parseFloat(form.montant) || 0, duree: parseInt(form.duree) || 60 };
      rdv?.id ? await updateRendezVous(rdv.id, payload) : await addRendezVous(payload);
      onSuccess?.();
      onClose();
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const btn = { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', border: 'none' };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={rdv ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <FormField label="Client *">
          <Select value={form.clientId} onChange={set('clientId')} required>
            <option value="">— Sélectionner un client —</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>)}
          </Select>
        </FormField>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="form-row">
          <FormField label="Date *"><Input type="date" value={form.date} onChange={set('date')} required /></FormField>
          <FormField label="Heure *"><Input type="time" value={form.heure} onChange={set('heure')} required /></FormField>
        </div>
        <FormField label="Durée">
          <Select value={form.duree} onChange={set('duree')}>
            {[15, 30, 45, 60, 75, 90, 120].map((d) => <option key={d} value={d}>{d} min</option>)}
          </Select>
        </FormField>
        <FormField label="Prestation *">
          <Input value={form.prestation} onChange={set('prestation')} placeholder="Coupe, Soin, Consultation…" required />
        </FormField>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="form-row">
          <FormField label="Montant (€)">
            <Input type="number" min="0" step="0.01" value={form.montant} onChange={set('montant')} placeholder="0.00" />
          </FormField>
          <FormField label="Statut">
            <Select value={form.statut} onChange={set('statut')}>
              <option value="confirmé">Confirmé</option>
              <option value="en attente">En attente</option>
              <option value="annulé">Annulé</option>
              <option value="terminé">Terminé</option>
            </Select>
          </FormField>
        </div>
        <FormField label="Notes">
          <Textarea value={form.notes} onChange={set('notes')} placeholder="Précisions…" rows={2} />
        </FormField>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px' }}>
          <button type="button" onClick={onClose} style={{ ...btn, background: '#f9f4e8', color: '#2c2c2c', border: '1px solid #f0e6cc' }}>Annuler</button>
          <button type="submit" disabled={loading} style={{ ...btn, background: 'linear-gradient(135deg, #4d6b45, #6b8f63)', color: 'white', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Enregistrement…' : rdv ? 'Mettre à jour' : 'Créer le RDV'}
          </button>
        </div>
      </form>
      <style>{`@media (max-width: 480px) { .form-row { grid-template-columns: 1fr !important; } }`}</style>
    </Modal>
  );
}