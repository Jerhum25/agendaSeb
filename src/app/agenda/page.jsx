/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import {
  addDays,
  addWeeks,
  format,
  isSameDay,
  isToday,
  parseISO,
  startOfWeek,
  subWeeks,
} from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import RendezVousForm from "../../components/RendezVousForm";
import Sidebar from "../../components/Sidebar";
import StatutBadge from "../../components/StatutBadge";
import {
  deleteRendezVous,
  getClients,
  getRendezVous,
} from "../../lib/firestore";

export default function AgendaPage() {
  const [pageData, setPageData] = useState({ clients: [], rdvList: [] });
  const [weekStart, setWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );
  const [showForm, setShowForm] = useState(false);
  const [selectedRdv, setSelectedRdv] = useState(null);
  const [view, setView] = useState("liste"); // défaut liste sur mobile

  const { clients, rdvList } = pageData;
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const load = useCallback(async () => {
    const [c, r] = await Promise.all([getClients(), getRendezVous()]);
    setPageData({ clients: c, rdvList: r });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const getRdvForDay = (day) =>
    rdvList
      .filter((r) => r.date && isSameDay(parseISO(r.date), day))
      .sort((a, b) => (a.heure || "").localeCompare(b.heure || ""));

  const handleEdit = (rdv) => {
    setSelectedRdv(rdv);
    setShowForm(true);
  };
  const handleDelete = async (id) => {
    if (!confirm("Supprimer ce rendez-vous ?")) return;
    await deleteRendezVous(id);
    load();
  };
  const closeForm = () => {
    setShowForm(false);
    setSelectedRdv(null);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#fdfbf7" }}>
      <Sidebar />
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
        className="main-content"
      >
        {/* Topbar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 32px",
            borderBottom: "1px solid #f0e6cc",
            background: "#fdfbf7",
            flexWrap: "wrap",
            gap: "12px",
          }}
          className="agenda-topbar"
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <h1
              style={{
                fontFamily: "Playfair Display, serif",
                fontSize: "24px",
                fontWeight: 600,
                color: "#1a1a1a",
                margin: 0,
              }}
            >
              Agenda
            </h1>
            <div
              style={{
                display: "flex",
                background: "white",
                border: "1px solid #f0e6cc",
                borderRadius: "10px",
                padding: "4px",
                gap: "2px",
              }}
            >
              {["semaine", "liste"].map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "7px",
                    border: "none",
                    fontSize: "13px",
                    fontWeight: 500,
                    cursor: "pointer",
                    background: view === v ? "#4d6b45" : "transparent",
                    color: view === v ? "white" : "#2c2c2c99",
                    transition: "all 0.2s",
                  }}
                >
                  {v === "semaine" ? "Semaine" : "Liste"}
                </button>
              ))}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                onClick={() => setWeekStart((w) => subWeeks(w, 1))}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  border: "1px solid #f0e6cc",
                  background: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <ChevronLeft size={16} />
              </button>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#1a1a1a",
                  minWidth: "140px",
                  textAlign: "center",
                }}
              >
                {format(weekStart, "d MMM", { locale: fr })} –{" "}
                {format(addDays(weekStart, 6), "d MMM yyyy", { locale: fr })}
              </span>
              <button
                onClick={() => setWeekStart((w) => addWeeks(w, 1))}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  border: "1px solid #f0e6cc",
                  background: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <button
              onClick={() => {
                setSelectedRdv(null);
                setShowForm(true);
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "linear-gradient(135deg, #4d6b45, #6b8f63)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                padding: "10px 18px",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              <Plus size={16} /> <span className="btn-label">Nouveau RDV</span>
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div style={{ flex: 1, overflow: "auto" }}>
          {view === "semaine" ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                minHeight: "500px",
              }}
              className="week-grid"
            >
              {days.map((day) => {
                const rdvs = getRdvForDay(day);
                const today = isToday(day);
                return (
                  <div
                    key={day.toISOString()}
                    style={{ borderRight: "1px solid #f0e6cc" }}
                  >
                    <div
                      style={{
                        padding: "12px 8px",
                        borderBottom: "1px solid #f0e6cc",
                        textAlign: "center",
                        background: today ? "rgba(107,143,99,0.08)" : "#fdfbf7",
                        position: "sticky",
                        top: 0,
                        zIndex: 1,
                      }}
                    >
                      <p
                        style={{
                          fontSize: "10px",
                          fontWeight: 500,
                          color: "#2c2c2c80",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          margin: 0,
                        }}
                      >
                        {format(day, "EEE", { locale: fr })}
                      </p>
                      <p
                        style={{
                          fontFamily: "Playfair Display, serif",
                          fontSize: "20px",
                          fontWeight: 600,
                          color: today ? "#4d6b45" : "#1a1a1a",
                          margin: "2px 0 0",
                          lineHeight: 1,
                        }}
                      >
                        {format(day, "d")}
                      </p>
                    </div>
                    <div
                      style={{
                        padding: "8px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}
                    >
                      {rdvs.map((rdv) => (
                        <RdvCard
                          key={rdv.id}
                          rdv={rdv}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          compact
                        />
                      ))}
                      {rdvs.length === 0 && (
                        <p
                          style={{
                            textAlign: "center",
                            fontSize: "11px",
                            color: "#2c2c2c20",
                            padding: "12px 0",
                          }}
                        >
                          —
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                padding: "24px 32px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
              className="liste-content"
            >
              {rdvList.length === 0 ? (
                <p
                  style={{
                    textAlign: "center",
                    padding: "60px 0",
                    color: "#2c2c2c60",
                  }}
                >
                  Aucun rendez-vous
                </p>
              ) : (
                [...rdvList]
                  .sort((a, b) =>
                    `${a.date}${a.heure}`.localeCompare(`${b.date}${b.heure}`),
                  )
                  .map((rdv) => (
                    <RdvCard
                      key={rdv.id}
                      rdv={rdv}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))
              )}
            </div>
          )}
        </div>
      </main>

      <RendezVousForm
        isOpen={showForm}
        onClose={closeForm}
        rdv={selectedRdv}
        clients={clients}
        onSuccess={load}
      />

      <style>{`
        @media (max-width: 768px) {
          .main-content { margin-left: 0 !important; }
          .agenda-topbar { padding: 72px 16px 16px !important; }
          .liste-content { padding: 16px !important; }
          .week-grid { grid-template-columns: repeat(7, minmax(80px, 1fr)) !important; }
          .btn-label { display: none; }
        }
      `}</style>
    </div>
  );
}

function RdvCard({ rdv, onEdit, onDelete, compact }) {
  const [hovered, setHovered] = useState(false);

  if (compact) {
    return (
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          borderRadius: "8px",
          padding: "8px",
          background:
            rdv.statut === "annulé"
              ? "rgba(239,68,68,0.06)"
              : rdv.statut === "terminé"
                ? "rgba(44,44,44,0.05)"
                : "linear-gradient(135deg, rgba(107,143,99,0.12), rgba(143,173,136,0.06))",
          border: "1px solid rgba(107,143,99,0.2)",
          position: "relative",
        }}
      >
        <p
          style={{
            fontSize: "11px",
            fontWeight: 600,
            color: "#1a1a1a",
            margin: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {rdv.clientNom}
        </p>
        <p
          style={{
            fontSize: "11px",
            color: "#2c2c2c80",
            margin: "2px 0 0",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {rdv.prestation}
        </p>
        <p
          style={{
            fontSize: "11px",
            color: "#4d6b45",
            fontWeight: 500,
            margin: "2px 0 0",
          }}
        >
          {rdv.heure}
        </p>
        {hovered && (
          <div
            style={{
              position: "absolute",
              top: "4px",
              right: "4px",
              display: "flex",
              gap: "2px",
              background: "white",
              borderRadius: "6px",
              padding: "2px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <button
              onClick={() => onEdit(rdv)}
              style={{
                padding: "3px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#2c2c2c80",
              }}
            >
              <Pencil size={10} />
            </button>
            <button
              onClick={() => onDelete(rdv.id)}
              style={{
                padding: "3px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#ef4444",
              }}
            >
              <Trash2 size={10} />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "white",
        borderRadius: "16px",
        border: "1px solid #f0e6cc",
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        boxShadow: hovered
          ? "0 4px 12px rgba(0,0,0,0.06)"
          : "0 1px 4px rgba(0,0,0,0.04)",
        transition: "box-shadow 0.2s",
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          width: "80px",
          flexShrink: 0,
          textAlign: "center",
          background: "#f9f4e8",
          borderRadius: "10px",
          padding: "10px 8px",
        }}
      >
        <p
          style={{
            fontSize: "11px",
            color: "#2c2c2c80",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          {format(parseISO(rdv.date), "MMM", { locale: fr })}
        </p>
        <p
          style={{
            fontFamily: "Playfair Display, serif",
            fontSize: "22px",
            fontWeight: 600,
            color: "#1a1a1a",
            margin: "2px 0",
            lineHeight: 1,
          }}
        >
          {format(parseISO(rdv.date), "d")}
        </p>
        <p
          style={{
            fontSize: "12px",
            color: "#4d6b45",
            fontWeight: 500,
            margin: 0,
          }}
        >
          {rdv.heure}
        </p>
      </div>
      <div style={{ flex: 1, minWidth: "120px" }}>
        <p style={{ fontWeight: 600, color: "#1a1a1a", margin: 0 }}>
          {rdv.clientNom}
        </p>
        <p style={{ fontSize: "13px", color: "#2c2c2c80", margin: "4px 0 0" }}>
          {rdv.prestation}
        </p>
        {rdv.notes && (
          <p
            style={{
              fontSize: "12px",
              color: "#2c2c2c60",
              fontStyle: "italic",
              margin: "4px 0 0",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {rdv.notes}
          </p>
        )}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        {rdv.montant > 0 && (
          <span
            style={{
              fontFamily: "Playfair Display, serif",
              fontSize: "18px",
              fontWeight: 600,
              color: "#1a1a1a",
            }}
          >
            {Number(rdv.montant).toFixed(2)} €
          </span>
        )}
        <StatutBadge statut={rdv.statut} />
        <div
          style={{
            display: "flex",
            gap: "4px",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.2s",
          }}
        >
          <button
            onClick={() => onEdit(rdv)}
            style={{
              padding: "6px",
              borderRadius: "8px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#2c2c2c80",
            }}
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(rdv.id)}
            style={{
              padding: "6px",
              borderRadius: "8px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#ef4444",
            }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
