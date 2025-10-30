import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import TicketCard from "../../components/TicketCard";
import TicketMessages from "../../components/TicketMessages";

interface Ticket {
  id: number;
  productName: string;
  description: string;
  status: string;
  openedAt: string;
  closedAt: string | null;
}

const ClientSupportPage: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/support", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Erro ao carregar chamados");

        const data = await res.json();

        // Mapeia para trazer o nome do produto
        const mappedTickets = data.map((t: any) => ({
          ...t,
          productName: t.product.name,
        }));

        setTickets(mappedTickets);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  if (!user) return <p>Acesso negado</p>;

  return (
    <div className="container">
      <h2 className="mb-4">Meus Chamados</h2>

      {loading && <p>Carregando...</p>}
      {error && <p className="text-danger">{error}</p>}

      <div className="d-flex flex-wrap gap-4 justify-content-center">
        {tickets.map((t) => (
          <div key={t.id} className="ticket-card rounded-3">
            <TicketCard ticket={t} />
            <div className="d-flex gap-2 mt-3 mb-3 justify-content-center">
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => setSelectedTicketId(t.id)}
              >
                Ver mensagens
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de mensagens */}
      {selectedTicketId && (
        <TicketMessages
          ticketId={selectedTicketId}
          onClose={() => setSelectedTicketId(null)}
        />
      )}
    </div>
  );
};

export default ClientSupportPage;
