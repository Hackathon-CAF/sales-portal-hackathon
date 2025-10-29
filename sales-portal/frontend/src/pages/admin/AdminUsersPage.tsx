import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
  segment?: string;
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
    <div className="container mt-3">
      <h2>Usuários</h2>
      {loading && <p>Carregando...</p>}
      {error && <p className="text-danger">{error}</p>}
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Email</th>
            <th>Role</th>
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
              <td>{u.role}</td>
              <td>{u.segment}</td>
              <td>R$ {u.totalSpent?.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsersPage;
