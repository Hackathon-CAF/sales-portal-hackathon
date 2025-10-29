import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

interface Message {
  id: number;
  ticketId: number;
  sender: "user" | "admin";
  content: string;
  createdAt: string;
}

interface TicketMessagesProps {
  ticketId: number;
  onClose: () => void;
}

const TicketMessages: React.FC<TicketMessagesProps> = ({ ticketId, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/support/${ticketId}/message`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Erro ao carregar mensagens");
      const data = await res.json();
      setMessages(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const res = await fetch(`http://localhost:3000/api/support/${ticketId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: newMessage }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao enviar mensagem");

      setMessages((prev) => [...prev, data.message]);
      setNewMessage("");
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="modal show d-block bg-dark bg-opacity-75">
      <div className="modal-dialog modal-lg">
        <div className="modal-content p-3">
          <div className="d-flex justify-content-between align-items-center">
            <h5>Mensagens do Chamado #{ticketId}</h5>
            <button aria-label="close" className="btn-close" onClick={onClose}></button>
          </div>

          {loading ? (
            <p>Carregando mensagens...</p>
          ) : error ? (
            <p className="text-danger">{error}</p>
          ) : (
            <div className="messages-container my-3">
              {messages.length === 0 ? (
                <p className="text-muted">Nenhuma mensagem ainda.</p>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`p-3 rounded mb-2 ${
                      m.sender === "admin" ? "bg-primary text-white ms-auto w-75" : "bg-body-secondary w-75"
                    }`}
                  >
                    <p className="mb-1">
                      <strong>{m.sender === "admin" ? "Suporte" : "Cliente"}:</strong>
                    </p>
                    <p className="mb-0 mt-2">{m.content}</p>
                    <small className={`${
                        m.sender === "admin" ? "text-white-50 ms-auto w-75" : "bg-body-secondary w-75"
                      }`}>
                      {m.createdAt ? new Date(m.createdAt).toLocaleString() : "—"}
                    </small>
                  </div>
                ))
              )}
            </div>
          )}

          <div className="d-flex mt-3">
            <input
              type="text"
              className="form-control me-2"
              placeholder="Digite sua mensagem..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button className="btn btn-success" onClick={handleSendMessage}>
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketMessages;
