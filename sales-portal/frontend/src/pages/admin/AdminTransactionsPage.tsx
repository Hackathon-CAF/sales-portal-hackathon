import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { chave_api_gpt } from "./arquivoParaGuardarAChave";

interface Transaction {
  transactionId: number;
  orderId: number;
  date: string;
  status: string;
  totalPrice: number;
  customer: { id: number; name: string; segment: string };
  product: { id: number; name: string; category: string; quantity: number };
  city: string;
  state: string;
}

const AdminTransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Filtros
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [region, setRegion] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [clientSegment, setClientSegment] = useState("");

  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState<string>("");

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (region) params.append("region", region);
      if (productCategory) params.append("productCategory", productCategory);
      if (clientSegment) params.append("clientSegment", clientSegment);

      const res = await fetch(`http://localhost:3000/api/transactions/admin?${params.toString()}`, {
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

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleOpenDashboard = () => {
    window.open("http://localhost:8501", "_blank");
  };

  const handleAIRequest = async () => {
    try {
      setModalContent("Carregando resposta da IA...");
      setModalVisible(true);

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${chave_api_gpt}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "Você é um assistente útil para o administrador da plataforma." },
            { role: "user", content: `Gere insights desses dados: ${JSON.stringify(transactions)}` },
          ],
        }),
      });

      if (!res.ok) throw new Error("Erro ao se comunicar com o AI");

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || "Sem resposta do modelo.";
      setModalContent(content);
    } catch (err: any) {
      setModalContent("Erro: " + err.message);
    }
  };

  if (!user || user.role !== "admin") return <p>Acesso negado</p>;

  return (
    <div className="content-container p-2">
      <h2 className="mt-2 mb-4 page-title">Transações</h2>
      <div className="d-flex gap-2 mb-4">
        <button className="btn btn-primary" onClick={handleOpenDashboard}>
          📊 Abrir Dashboard
        </button>
        <button className="btn btn-secondary" onClick={handleAIRequest}>
          💬 Análise com IA
        </button>
      </div>

      {/* FILTROS */}
      <div className="card p-3 mb-4 shadow-lg">
        <div className="row g-2">
          <div className="col-md-2">
            <label>Data Inicial:</label>
            <input
              aria-label="startDate"
              type="date"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="col-md-2">
            <label>Data Final:</label>
            <input
              aria-label="endDate"
              type="date"
              className="form-control"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="col-md-2">
            <label>Região:</label>
            <select aria-label="region" className="form-select" value={region} onChange={(e) => setRegion(e.target.value)}>
              <option value="">Todas</option>
              <option value="norte">Norte</option>
              <option value="nordeste">Nordeste</option>
              <option value="centrooeste">Centro-Oeste</option>
              <option value="sudeste">Sudeste</option>
              <option value="sul">Sul</option>
            </select>
          </div>
          <div className="col-md-3">
            <label>Categoria do Produto:</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ex: Moedores"
              value={productCategory}
              onChange={(e) => setProductCategory(e.target.value)}
            />
          </div>
          <div className="col-md-2">
            <label>Segmento do Cliente:</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ex: Gold"
              value={clientSegment}
              onChange={(e) => setClientSegment(e.target.value)}
            />
          </div>
          <div className="col-md-1 d-flex align-items-end">
            <button className="btn btn-primary w-100" onClick={fetchTransactions}>
              Filtrar
            </button>
          </div>
        </div>
      </div>

      {/* TABELA */}
      {loading && <p>Carregando...</p>}
      {error && <p className="text-danger">{error}</p>}

      <div className="card shadow-sm p-3 bg-light rounded table-card">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-header">
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Segmento</th>
                <th>Produto</th>
                <th>Categoria</th>
                <th>Status</th>
                <th>Estado</th>
                <th>Data</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.transactionId}>
                  <td>{t.transactionId}</td>
                  <td>{t.customer.name}</td>
                  <td>
                    {t.customer.segment ? (
                      <span className={`segment-badge ${t.customer.segment.toLowerCase()}`}>
                        {t.customer.segment.charAt(0).toUpperCase() + t.customer.segment.slice(1)}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>{t.product.name}</td>
                  <td>{t.product.category}</td>
                  <td>
                    <span
                      className={`badge ${
                        t.status === "completed"
                          ? "bg-success"
                          : t.status === "in_progress"
                          ? "bg-warning text-dark"
                          : "bg-secondary"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td>{t.state || "-"}</td>
                  <td>{new Date(t.date).toLocaleString()}</td>
                  <td>R$ {t.totalPrice.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {modalVisible && (
  <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
    <div className="modal-dialog modal-dialog-centered modal-xl"> {/* ← maior e centralizado */}
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title fs-4">💬 Resposta da IA</h5>
          <button type="button" className="btn-close" onClick={() => setModalVisible(false)}></button>
        </div>
        <div className="modal-body" style={{ whiteSpace: "pre-wrap", fontSize: "1.1rem", lineHeight: "1.6" }}>
          <p>{modalContent}</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setModalVisible(false)}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default AdminTransactionsPage;
