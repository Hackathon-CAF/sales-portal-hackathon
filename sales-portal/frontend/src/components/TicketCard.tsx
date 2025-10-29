import React from "react";

interface Ticket {
  id: number;
  productId: number;
  description: string;
  status: string;
  openedAt: string;
  closedAt: string | null;
}

interface TicketCardProps {
  ticket: Ticket;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {
  return (
    <div className="card p-3">
      <h5>Chamado #{ticket.id}</h5>
      <p>Produto ID: {ticket.productId}</p>
      <p>Status: {ticket.status}</p>
      <p>Descrição: {ticket.description}</p>
      <p>Data: {new Date(ticket.openedAt).toLocaleString()}</p>
    </div>
  );
};

export default TicketCard;
