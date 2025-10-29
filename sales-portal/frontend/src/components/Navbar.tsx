import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

const Navbar: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand" to="/">Sales Portal</Link>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto">
            {user?.role === "admin" ? (
              <>
                <li className="nav-item"><Link className="nav-link" to="/admin/users">Usuários</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/admin/products">Produtos</Link></li>
              </>
            ) : (
              <>
                <li className="nav-item"><Link className="nav-link" to="/client/orders">Pedidos</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/client/products">Produtos</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/client/support">Suporte</Link></li>
              </>
            )}
          </ul>
          <span className="navbar-text me-3">{user?.name}</span>
          <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>Sair</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
