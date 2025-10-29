import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Redireciona automaticamente se o usuário já estiver logado
      navigate("/profile");
    }
  }, [user, navigate]);

  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100">
      <div className="card p-5 shadow text-center">
        <h1 className="mb-4">Bem-vindo!</h1>
        <p className="mb-4">Escolha uma das opções abaixo para continuar:</p>
        <div className="d-grid gap-3">
          <button
            className="btn btn-primary btn-lg"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
          <button
            className="btn btn-secondary btn-lg"
            onClick={() => navigate("/register")}
          >
            Cadastrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
