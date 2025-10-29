import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo-CAF.png";

const Navbar: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <img
              src={logo}
              alt="Logo"
            />
          Sales Portal
        </Link>
        
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
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
          <span className="navbar-text text-light me-3">{user?.name}</span>
          <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>Sair</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
