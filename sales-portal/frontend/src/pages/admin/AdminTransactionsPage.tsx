import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

interface Transaction {
  transactionId: number;
  orderId: number;
  date: string;
  status: string;
  totalPrice: number;
  customer: { id: number; name: string };
  product: { id: number; name: string; quantity: number };
}

const AdminTransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/transactions/admin", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Erro ao carregar transações");
        const data = await res.json();
        setTransactions(data.data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  if (!user || user.role !== "admin") return <p>Acesso negado</p>;

  return (
    <div className="content-container p-2">
      <h2 className="mt-2 mb-4 page-title">Transações</h2>

      {loading && <p>Carregando...</p>}
      {error && <p className="text-danger">{error}</p>}

      <div className="card shadow-sm p-3 bg-light rounded table-card">
        <div className="table-responsive">
          <table className="table table-hover align-middle ">
            <thead className="table-header">
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Produto</th>
                <th>Status</th>
                <th>Data</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.transactionId}>
                  <td>{t.transactionId}</td>
                  <td>{t.customer.name}</td>
                  <td>{t.product.name}</td>
                  <td>
                    <span className={`badge ${
                      t.status === "Concluído"
                        ? "bg-success"
                        : t.status === "Pendente"
                        ? "bg-warning text-dark"
                        : "bg-secondary"
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td>{new Date(t.date).toLocaleString()}</td>
                  <td>R$ {t.totalPrice.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminTransactionsPage;
