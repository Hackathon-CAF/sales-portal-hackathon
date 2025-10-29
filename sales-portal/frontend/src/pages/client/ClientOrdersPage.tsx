import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
}

interface Order {
  id: number;
  userId: number;
  productId: number;
  product: Product;
  quantity: number;
  totalPrice: number;
  status: string;
  statusDetail: string;
  city: string;
  state: string;
  createdAt: string;
}

interface SupportTicket {
  id: number;
  productId: number;
  description: string;
  status: string;
  openedAt: string;
  closedAt: string | null;
}

const ClientOrdersPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ticketLoading, setTicketLoading] = useState<number | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [ticketDescription, setTicketDescription] = useState("");

  useEffect(() => {
    fetchOrders();
    fetchSupportTickets();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/order", {
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Erro ao carregar pedidos");
      
      const data = await res.json();
      console.log("Dados COMPLETOS da API de pedidos:", data);
      console.log("Estrutura do primeiro pedido:", data.orders ? data.orders[0] : data[0]);

      if (data.orders) {
        setOrders(data.orders);
      } else if (Array.isArray(data)) {
        setOrders(data);
      } else {
        setOrders([]);
      }
    } catch (err: any) {
      console.error("Erro ao buscar pedidos:", err);
      setError(err.message);
    }
  };

  const fetchSupportTickets = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/support", {
        credentials: "include",
      });
      
      if (res.ok) {
        const data = await res.json();
        setSupportTickets(data.tickets || data);
      }
    } catch (err) {
      console.error("Erro ao carregar chamados:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTicket = (order: Order) => {
    setSelectedOrder(order);
    setTicketDescription("");
    setShowTicketModal(true);
  };

  const handleSubmitTicket = async () => {
    if (!selectedOrder || !ticketDescription.trim()) {
      alert("Por favor, descreva o problema.");
      return;
    }

    setTicketLoading(selectedOrder.id);
    setError(null);

    try {
      const res = await fetch("http://localhost:3000/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          productId: selectedOrder.productId,
          description: ticketDescription.trim()
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao abrir chamado");
      }

      alert("Chamado aberto com sucesso!");
      setShowTicketModal(false);
      fetchSupportTickets(); // Atualiza a lista de chamados
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setTicketLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: string } = {
      pending: "warning",
      paid: "info",
      processing: "primary",
      shipped: "success",
      delivered: "success",
      cancelled: "danger"
    };
    
    return `badge bg-${statusConfig[status] || 'secondary'}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Meus Pedidos</h2>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {orders.length === 0 ? (
        <div className="text-center text-muted mt-5">
          <h4>Nenhum pedido encontrado</h4>
          <p>Faça seu primeiro pedido na página de produtos!</p>
        </div>
      ) : (
        <div className="row">
          {orders.map((order) => (
            <div key={order.id} className="col-md-6 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="card-title">Pedido #{order.id}</h5>
                    <span className={getStatusBadge(order.status)}>
                      {order.status}
                    </span>
                  </div>
                  
                  <p><strong>Produto ID:</strong> {order.productId}</p>
                  <p><strong>Produto:</strong> {order.product.name}</p>
                  <p><strong>Quantidade:</strong> {order.quantity}</p>
                  <p><strong>Total:</strong> R$ {(order.totalPrice).toFixed(2)}</p>
                  <p><strong>Status:</strong> {order.statusDetail}</p>
                  <p><strong>Data:</strong> {formatDate(order.createdAt)}</p>
                  <p><strong>Local:</strong> {order.city} - {order.state}</p>
                </div>
                <div className="card-footer">
                  <button
                    className="btn btn-outline-primary w-100"
                    onClick={() => handleOpenTicket(order)}
                    disabled={ticketLoading === order.id}
                  >
                    {ticketLoading === order.id ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Abrindo...
                      </>
                    ) : (
                      "Abrir Chamado de Assistência"
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para abrir chamado */}
      {showTicketModal && selectedOrder && (
        <div className="modal show d-block bg-dark">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Abrir Chamado - Pedido #{selectedOrder.id}</h5>
                <button
                  aria-label="btn-close" 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowTicketModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p><strong>Produto:</strong> {selectedOrder.product.name || `ID: ${selectedOrder.productId}`}</p>
                <div className="mb-3">
                  <label htmlFor="ticketDescription" className="form-label">
                    Descreva o problema:
                  </label>
                  <textarea
                    id="ticketDescription"
                    className="form-control"
                    rows={4}
                    value={ticketDescription}
                    onChange={(e) => setTicketDescription(e.target.value)}
                    placeholder="Ex: Produto veio com defeito, não liga, faltando peças, etc."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowTicketModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleSubmitTicket}
                  disabled={!ticketDescription.trim() || ticketLoading !== null}
                >
                  {ticketLoading ? "Abrindo..." : "Abrir Chamado"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Chamados Abertos */}
      {supportTickets.length > 0 && (
        <div className="mt-5">
          <h3>Meus Chamados de Assistência</h3>
          <div className="list-group">
            {supportTickets.map((ticket) => (
              <div key={ticket.id} className="list-group-item">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6>Chamado #{ticket.id} - Produto ID: {ticket.productId}</h6>
                    <p className="mb-1">{ticket.description}</p>
                    <small className="text-muted">
                      Aberto em: {formatDate(ticket.openedAt)}
                      {ticket.closedAt && ` • Fechado em: ${formatDate(ticket.closedAt)}`}
                    </small>
                  </div>
                  <span className={`badge ${ticket.status === 'open' ? 'bg-warning' : 'bg-success'}`}>
                    {ticket.status === 'open' ? 'Aberto' : 'Fechado'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientOrdersPage;