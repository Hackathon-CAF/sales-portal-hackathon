import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  role: "admin" | "user";
  segment: string;
}

const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth(); // usa refreshUser para atualizar dados
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    street: "",
    number: "",
    complement: "",
    district: "",
    city: "",
    state: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:3000/api/profile", {
          credentials: "include", // envia cookies HttpOnly
        });
        if (!res.ok) throw new Error("Erro ao carregar perfil");
        const data: UserProfile = await res.json();
        setProfile(data);
        setForm({
          name: data.name,
          phone: data.phone,
          street: data.street,
          number: data.number,
          complement: data.complement || "",
          district: data.district,
          city: data.city,
          state: data.state,
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:3000/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // cookies HttpOnly
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao atualizar perfil");
      } else {
        setProfile(data.updatedUser);
        await refreshUser(); // atualiza context
        alert("Perfil atualizado com sucesso!");
      }
    } catch (err: any) {
      setError(err.message || "Erro de conexão");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <p>Carregando perfil...</p>;
  if (!profile) return <p>Usuário não encontrado.</p>;

  return (
    <div className="card p-4 shadow mt-3">
      <h2 className="mb-3">Meu Perfil</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleUpdate}>
        {[
          { label: "Nome", name: "name", required: true },
          { label: "Telefone", name: "phone", required: true },
          { label: "Rua", name: "street", required: true },
          { label: "Número", name: "number", required: true },
          { label: "Complemento", name: "complement", required: false },
          { label: "Bairro", name: "district", required: true },
          { label: "Cidade", name: "city", required: true },
          { label: "Estado", name: "state", required: true },
        ].map((field) => (
          <div className="mb-3" key={field.name}>
            <label>{field.label}</label>
            <input
              type="text"
              className="form-control"
              name={field.name}
              value={form[field.name as keyof typeof form]}
              onChange={handleChange}
              required={field.required}
              aria-label={field.label.toLowerCase()}
            />
          </div>
        ))}

        <div className="mb-3">
          <label>Segmento</label>
          <input
            aria-label="segment"
            type="text"
            className="form-control"
            value={profile.segment}
            disabled
          />
        </div>

        <div className="mb-3">
          <label>Papel</label>
          <input aria-label="role" type="text" className="form-control" value={profile.role} disabled />
        </div>

        <button type="submit" className="btn btn-primary" disabled={updating}>
          {updating ? "Atualizando..." : "Atualizar Perfil"}
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;
