import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import TicketCard from "../../components/TicketCard";

interface Ticket {
  id: number;
  productId: number;
  description: string;
  status: string;
  openedAt: string;
  closedAt: string | null;
}

const ClientSupportPage: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
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
        setTickets(data);
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
    <div className="container mt-3">
      <h2>Suporte</h2>
      {loading && <p>Carregando...</p>}
      {error && <p className="text-danger">{error}</p>}
      <div className="d-flex flex-wrap gap-3">
        {tickets.map((t) => (
          <TicketCard key={t.id} ticket={t} />
        ))}
      </div>
    </div>
  );
};

export default ClientSupportPage;
