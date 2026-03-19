'use client';
import { useState, useEffect } from 'react';
import Modal from './Modal';
import FormField, { Input, Textarea } from './FormField';
import { addClient, updateClient } from '../lib/firestore';

const EMPTY = { nom: '', prenom: '', email: '', telephone: '', adresse: '', codePostal: '', ville: '', notes: '' };

export default function ClientForm({ isOpen, onClose, client, onSuccess }) {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);

  useEffect(() => { setForm(client ? { ...EMPTY, ...client } : EMPTY); }, [client, isOpen]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      client?.id ? await updateClient(client.id, form) : await addClient(form);
      onSuccess?.();
      onClose();
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const btn = { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', border: 'none' };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={client ? 'Modifier le client' : 'Nouveau client'}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="form-row">
          <FormField label="Prénom *"><Input value={form.prenom} onChange={set('prenom')} placeholder="Jean" required /></FormField>
          <FormField label="Nom *"><Input value={form.nom} onChange={set('nom')} placeholder="Dupont" required /></FormField>
        </div>
        <FormField label="Email"><Input type="email" value={form.email} onChange={set('email')} placeholder="jean@exemple.fr" /></FormField>
        <FormField label="Téléphone"><Input type="tel" value={form.telephone} onChange={set('telephone')} placeholder="06 12 34 56 78" /></FormField>
        <FormField label="Adresse"><Input value={form.adresse} onChange={set('adresse')} placeholder="12 rue de la Paix" /></FormField>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }} className="form-row">
          <FormField label="Code postal"><Input value={form.codePostal} onChange={set('codePostal')} placeholder="25000" /></FormField>
          <FormField label="Ville"><Input value={form.ville} onChange={set('ville')} placeholder="Besançon" /></FormField>
        </div>
        <FormField label="Notes"><Textarea value={form.notes} onChange={set('notes')} placeholder="Informations particulières…" rows={3} /></FormField>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px' }}>
          <button type="button" onClick={onClose} style={{ ...btn, background: '#f9f4e8', color: '#2c2c2c', border: '1px solid #f0e6cc' }}>Annuler</button>
          <button type="submit" disabled={loading} style={{ ...btn, background: 'linear-gradient(135deg, #4d6b45, #6b8f63)', color: 'white', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Enregistrement…' : client ? 'Mettre à jour' : 'Créer le client'}
          </button>
        </div>
      </form>
      <style>{`@media (max-width: 480px) { .form-row { grid-template-columns: 1fr !important; } }`}</style>
    </Modal>
  );
}