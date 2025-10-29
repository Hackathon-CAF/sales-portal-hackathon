import React from "react";
import "./componentsStyles.css"

interface Ticket {
  id: number;
  userName?: string;       
  productName: string;   
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
    <div className="card ticket-card p-3">
      <h5 className="ticket-title mb-3">Chamado #{ticket.id}</h5>
      <p><strong>Usuário:</strong> {ticket.userName}</p>
      <p><strong>Produto:</strong> {ticket.productName}</p>
      <p><strong>Status:</strong> {ticket.status}</p>
      <p><strong>Descrição:</strong> {ticket.description}</p>
      <p><strong>Aberto em:</strong> {new Date(ticket.openedAt).toLocaleString()}</p>
      {ticket.closedAt && (
        <p><strong>Fechado em:</strong> {new Date(ticket.closedAt).toLocaleString()}</p>
      )}
    </div>
  );
};

export default TicketCard;
