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
    const fetchProduction = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/production", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Erro ao carregar produções");
        const data = await res.json();
        setProductions(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduction();
  }, []);

  if (!user || user.role !== "admin") return <p>Acesso negado</p>;

  return (
    <div className="container mt-3">
      <h2>Produção</h2>
      {loading && <p>Carregando...</p>}
      {error && <p className="text-danger">{error}</p>}
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Produto</th>
            <th>Planejado</th>
            <th>Produzido</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {productions.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.product.name}</td>
              <td>{p.quantityPlanned}</td>
              <td>{p.quantityProduced}</td>
              <td>{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminProductionPage;
