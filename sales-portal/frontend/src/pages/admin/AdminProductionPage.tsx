import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

interface Production {
  id: number;
  productId: number;
  quantityPlanned: number;
  quantityProduced: number;
  status: string;
  product: { name: string };
}

const AdminProductionPage: React.FC = () => {
  const [productions, setProductions] = useState<Production[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchProduction();
  }, []);

  const fetchProduction = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/production", { credentials: "include" });
      if (!res.ok) throw new Error("Erro ao carregar produções");
      const data = await res.json();
      setProductions(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduction = async (p: Production) => {
    const newStatus = prompt("Novo status:", p.status);
    const newQty = prompt("Quantidade produzida:", String(p.quantityProduced));
    if (!newStatus || !newQty) return;

    try {
      const res = await fetch(`http://localhost:3000/api/production/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus, quantityProduced: Number(newQty) }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao atualizar produção");

      setProductions(prods =>
        prods.map(prod => prod.id === p.id
          ? { ...prod, status: newStatus, quantityProduced: Number(newQty) }
          : prod
        )
      );
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!user || user.role !== "admin") return <p>Acesso negado</p>;

  return (
    <div className="content-container p-2">
      <h2 className="mt-2 mb-4 page-title">Produção</h2>
      {loading && <p>Carregando...</p>}
      {error && <p className="text-danger">{error}</p>}

      <div className="card shadow-sm p-3 bg-light rounded table-card">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-header">
              <tr>
                <th>ID</th>
                <th>Produto</th>
                <th>Planejado</th>
                <th>Produzido</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {productions.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.product.name}</td>
                  <td>{p.quantityPlanned}</td>
                  <td>{p.quantityProduced}</td>
                  <td>
                    <span className={`badge ${
                      p.status === "closed" ? "bg-success text-light fw-medium" :
                      p.status === "in_progress" ? "bg-primary text-light fw-medium" : "bg-secondary"
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-primary" onClick={() => handleUpdateProduction(p)}>
                      Atualizar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminProductionPage;
