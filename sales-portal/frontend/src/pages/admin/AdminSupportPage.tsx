import React, { useEffect, useState } from "react";
import TicketCard from "../../components/TicketCard";
import TicketMessages from "../../components/TicketMessages";
import { useAuth } from "../../context/AuthContext";

interface Ticket {
  id: number;
  productName: string;
  userName?: string;
  description: string;
  status: string;
  openedAt: string;
  closedAt: string | null;
}

const AdminSupportPage: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/support/admin", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Erro ao carregar chamados");
      const data = await res.json();
      setTickets(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (ticketId: number, currentStatus: string) => {
    try {
      const nextStatus =
        currentStatus === "open"
          ? "in_progress"
          : currentStatus === "in_progress"
          ? "closed"
          : "open";

      const res = await fetch(`http://localhost:3000/api/support/${ticketId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) throw new Error("Erro ao atualizar status");
      const updated = await res.json();

      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status: updated.status } : t))
      );
    } catch (err) {
      console.error(err);
      alert("Falha ao atualizar status do chamado.");
    }
  };

  if (!user || user.role !== "admin") return <p>Acesso negado</p>;

  return (
    <div className="container">
      <h2 className="mb-4">Suporte</h2>
      {loading && <p>Carregando...</p>}
      {error && <p className="text-danger">{error}</p>}

      <div className="d-flex flex-wrap gap-4">
        {tickets.map((t) => (
          <div key={t.id} className="ticket-card rounded-3">
            <TicketCard ticket={t} />
            <div className="d-flex gap-2 mt-3">
              <button
                className="btn btn-sm btn-primary mx-3 mb-3"
                onClick={() => setSelectedTicketId(t.id)}
              >
                Ver mensagens
              </button>

              <button
                className="btn btn-sm btn-success mb-3"
                onClick={() => handleUpdateStatus(t.id, t.status)}
              >
                Atualizar status ({t.status})
              </button>

            </div>
          </div>
        ))}
      </div>

      {selectedTicketId && (
        <TicketMessages
          ticketId={selectedTicketId}
          onClose={() => setSelectedTicketId(null)}
        />
      )}
    </div>
  );
};

export default AdminSupportPage;
