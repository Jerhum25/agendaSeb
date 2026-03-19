'use client';
// app/clients/page.js
import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import ClientForm from '../../components/ClientForm';
import Button from '../../components/Button';
import { getClients, deleteClient } from '../../lib/firestore';
import { Plus, Search, Pencil, Trash2, Phone, Mail, MapPin, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editClient, setEditClient] = useState(null);

  const load = async () => {
    try {
      const data = await getClients();
      setClients(data);
      setFiltered(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      clients.filter((c) =>
        `${c.prenom} ${c.nom} ${c.email} ${c.telephone} ${c.ville}`.toLowerCase().includes(q)
      )
    );
  }, [search, clients]);

  const handleEdit = (client) => { setEditClient(client); setShowForm(true); };
  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce client et toutes ses données ?')) return;
    await deleteClient(id);
    load();
  };
  const closeForm = () => { setShowForm(false); setEditClient(null); };

  return (
    <div className="flex min-h-screen mt-8 md:mt-0">
      <Sidebar />
      <main className="flex-1 p-10 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl font-semibold text-charcoal-900">Clients</h1>
            <p className="text-charcoal-800/50 mt-1">{clients.length} client{clients.length !== 1 ? 's' : ''}</p>
          </div>
          <Button className="self-start" onClick={() => { setEditClient(null); setShowForm(true); }}>
            <Plus size={16} /> Nouveau client
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-800/30" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un client…"
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-cream-200 text-sm text-charcoal-900 placeholder:text-charcoal-800/30 focus:border-sage-500 focus:ring-2 focus:ring-sage-500/20 transition-all"
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="py-20 text-center text-charcoal-800/40">Chargement…</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-charcoal-800/40">Aucun client trouvé</p>
            {search && <button onClick={() => setSearch('')} className="mt-2 text-sage-600 text-sm underline">Effacer la recherche</button>}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((client) => (
              <div
                key={client.id}
                className="bg-white rounded-2xl border border-cream-200 p-6 hover:shadow-md transition-all group"
              >
                {/* Avatar + name */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center font-display text-lg font-semibold text-white shrink-0"
                      style={{ background: `hsl(${((client.nom?.charCodeAt(0) || 65) * 7) % 360}, 45%, 55%)` }}>
                      {(client.prenom?.[0] || '?').toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-charcoal-900">{client.prenom} {client.nom}</p>
                      {client.ville && <p className="text-xs text-charcoal-800/50">{client.ville}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(client)} className="p-1.5 rounded-lg hover:bg-cream-100 text-charcoal-800/50 hover:text-charcoal-900">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(client.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-charcoal-800/50 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Coordonnées */}
                <div className="space-y-2 mb-4">
                  {client.email && (
                    <a href={`mailto:${client.email}`} className="flex items-center gap-2 text-xs text-charcoal-800/60 hover:text-sage-600 transition-colors">
                      <Mail size={12} className="shrink-0" />{client.email}
                    </a>
                  )}
                  {client.telephone && (
                    <a href={`tel:${client.telephone}`} className="flex items-center gap-2 text-xs text-charcoal-800/60 hover:text-sage-600 transition-colors">
                      <Phone size={12} className="shrink-0" />{client.telephone}
                    </a>
                  )}
                  {(client.adresse || client.codePostal) && (
                    <p className="flex items-center gap-2 text-xs text-charcoal-800/60">
                      <MapPin size={12} className="shrink-0" />
                      {[client.adresse, client.codePostal, client.ville].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>

                {/* CTA fiche */}
                <Link href={`/clients/${client.id}`}>
                  <div className="flex items-center justify-between pt-4 border-t border-cream-200 text-sm font-medium text-sage-600 hover:text-sage-700 transition-colors cursor-pointer">
                    Voir la fiche <ChevronRight size={16} />
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>

      <ClientForm
        isOpen={showForm}
        onClose={closeForm}
        client={editClient}
        onSuccess={load}
      />
    </div>
  );
}