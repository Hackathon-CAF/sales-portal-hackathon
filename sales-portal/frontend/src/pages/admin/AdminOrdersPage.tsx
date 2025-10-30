import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  imageUrl?: string | null;
}

interface Order {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  totalPrice: number;
  status: "pending" | "completed" | "cancelled";
  statusDetail?: string;
  city?: string;
  state?: string;
  createdAt: string;
  product: Product;
}

const AdminOrdersPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [userIdFilter, setUserIdFilter] = useState<string>("");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (userIdFilter) params.append("userId", userIdFilter);

      const res = await fetch(
        `http://localhost:3000/api/order/admin?${params.toString()}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("Erro ao carregar pedidos");
      const data = await res.json();
      setOrders(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, userIdFilter]);

  const handleUpdateStatus = async (orderId: number, newStatus: "completed" | "cancelled") => {
    try {
      const res = await fetch(`http://localhost:3000/api/order/${orderId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, statusDetail: newStatus === "completed" ? "Concluído" : "Cancelado" }),
      });

      if (!res.ok) throw new Error("Erro ao atualizar status");
      fetchOrders(); // Recarrega a lista
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  };

  if (!user || user.role !== "admin") return <p>Acesso negado</p>;

  return (
    <div className="content-container p-2">
      <h2 className="page-title mb-4">Pedidos</h2>

      <div className="filters mb-3 d-flex gap-2">
        <select aria-label="status" className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">Todos os status</option>
          <option value="pending">Pendente</option>
          <option value="completed">Concluído</option>
          <option value="cancelled">Cancelado</option>
        </select>
        <input
          type="number"
          className="form-control"
          placeholder="Filtrar por User ID"
          value={userIdFilter}
          onChange={e => setUserIdFilter(e.target.value)}
        />
      </div>

      {loading && <p>Carregando...</p>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card shadow-sm p-3 bg-light rounded table-card">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuário ID</th>
                <th>Produto</th>
                <th>Quantidade</th>
                <th>Total</th>
                <th>Status</th>
                <th>Status Detalhe</th>
                <th>Endereço</th>
                <th>Data</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.userId}</td>
                  <td>{order.product.name}</td>
                  <td>{order.quantity}</td>
                  <td>R$ {order.totalPrice.toFixed(2)}</td>
                  <td>
                    <span
                      className={`badge ${
                        order.status === "completed"
                          ? "bg-success"
                          : order.status === "pending"
                          ? "bg-warning text-dark"
                          : "bg-secondary"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td>{order.statusDetail || "-"}</td>
                  <td>{order.city && order.state ? `${order.city} (${order.state})` : "-"}</td>
                  <td>{new Date(order.createdAt).toLocaleString()}</td>
                  <td>
                    {order.status === "pending" && (
                      <div className="d-flex gap-1">
                        <button className="btn btn-success btn-sm" onClick={() => handleUpdateStatus(order.id, "completed")}>
                          Concluir
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleUpdateStatus(order.id, "cancelled")}>
                          Cancelar
                        </button>
                      </div>
                    )}
                    {order.status !== "pending" && <span>-</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {orders.length === 0 && !loading && <p className="text-muted text-center mt-4">Nenhum pedido encontrado.</p>}
    </div>
  );
};

export default AdminOrdersPage;
