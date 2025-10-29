import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
  segment?: "gold" | "silver" | "bronze" | string;
  totalSpent?: number;
}

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/users", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Erro ao carregar usuários");
        const data = await res.json();
        setUsers(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (!user || user.role !== "admin") return <p>Acesso negado</p>;

  return (
    <div className="content-container p-2">
      <h2 className="mb-4 page-title">Usuários</h2>
      {loading && <p>Carregando...</p>}
      {error && <div className="alert alert-danger">{error}</div>}

    <div className="card shadow-sm p-3 bg-light rounded table-card">
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-header">
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Email</th>
              <th>Função</th>
              <th>Segmento</th>
              <th>Total Gasto</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <span
                    className={`badge ${
                      u.role === "admin" ? "bg-danger" : "bg-secondary"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td>
                  {u.segment ? (
                    <span className={`segment-badge ${u.segment.toLowerCase()}`}>
                      {u.segment.charAt(0).toUpperCase() + u.segment.slice(1)}
                    </span>
                  ) : (
                    "-"
                  )}
                </td>
                <td>{u.totalSpent ? `R$ ${u.totalSpent.toFixed(2)}` : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

      {users.length === 0 && !loading && (
        <p className="text-muted text-center mt-4">
          Nenhum usuário encontrado.
        </p>
      )}
    </div>
  );
};

export default AdminUsersPage;
