import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    clientType: "PJ",
    name: "",
    email: "",
    password: "",
    phone: "",
    street: "",
    number: "",
    complement: "",
    district: "",
    city: "",
    state: "",
    cpf: "",
    cnpj: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Fazer cadastro
      const res = await fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao cadastrar usuário");
      }

      // 2. Login automático com as mesmas credenciais
      await login(form.email, form.password);
      
      // 3. Redirecionar para o perfil
      navigate("/profile");
    } catch (err: any) {
      setError(err.message || "Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { label: "Nome", name: "name", type: "text", required: true },
    { label: "Email", name: "email", type: "email", required: true },
    { label: "Senha", name: "password", type: "password", required: true },
    { label: "Telefone", name: "phone", type: "text", required: true },
    { label: "Rua", name: "street", type: "text", required: true },
    { label: "Número", name: "number", type: "text", required: true },
    { label: "Complemento", name: "complement", type: "text", required: false },
    { label: "Bairro", name: "district", type: "text", required: true },
    { label: "Cidade", name: "city", type: "text", required: true },
    { label: "Estado", name: "state", type: "text", required: true },
  ];

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card p-4 shadow">
            <h2 className="mb-4 text-center">Cadastro</h2>
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="clientType" className="form-label">Tipo de Cliente</label>
                <select
                  className="form-select"
                  name="clientType"
                  value={form.clientType}
                  onChange={handleChange}
                  disabled={loading}
                  aria-label="clientType"
                >
                  <option value="PF">Pessoa Física</option>
                  <option value="PJ">Pessoa Jurídica</option>
                </select>
              </div>

              {form.clientType === "PF" && (
                <div className="mb-3">
                  <label className="form-label">CPF</label>
                  <input
                    aria-label="cpf"
                    type="text"
                    className="form-control"
                    name="cpf"
                    value={form.cpf}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
              )}
              
              {form.clientType === "PJ" && (
                <div className="mb-3">
                  <label className="form-label">CNPJ</label>
                  <input
                    aria-label="cnpj"
                    type="text"
                    className="form-control"
                    name="cnpj"
                    value={form.cnpj}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
              )}

              {fields.map((field) => (
                <div className="mb-3" key={field.name}>
                  <label className="form-label">{field.label}</label>
                  <input
                    aria-label={field.name}
                    type={field.type}
                    className="form-control"
                    name={field.name}
                    value={form[field.name as keyof typeof form]}
                    onChange={handleChange}
                    required={field.required}
                    disabled={loading}
                  />
                </div>
              ))}

              <div className="d-grid gap-2">
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={loading}
                >
                  {loading ? "Cadastrando..." : "Cadastrar"}
                </button>
                <button 
                  type="button"
                  className="btn btn-link"
                  onClick={() => navigate("/login")}
                  disabled={loading}
                >
                  Já tem conta? Faça login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;