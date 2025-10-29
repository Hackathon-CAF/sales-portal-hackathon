import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

interface SideBarProps {
  isAdmin?: boolean;
}

const SideBar: React.FC<SideBarProps> = ({ isAdmin = false }) => {
  return (
    <div className="d-flex flex-column bg-light p-3 vh-100">
      <h5>{isAdmin ? "Admin Dashboard" : "Área do Cliente"}</h5>
      <Link to={"/profile"} className="mb-2">Perfil</Link>
      {isAdmin ? (
        <>
          <Link to="/admin/products" className="mb-2">Produtos</Link>
          <Link to="/admin/transactions" className="mb-2">Transações</Link>
          <Link to="/admin/production" className="mb-2">Produção</Link>
          <Link to="/admin/support" className="mb-2">Suporte</Link>
        </>
      ) : (
        <>
          <Link to="/client/orders" className="mb-2">Pedidos</Link>
          <Link to="/client/products" className="mb-2">Produtos</Link>
          <Link to="/client/support" className="mb-2">Suporte</Link>
        </>
      )}
    </div>
  );
};

export default SideBar;
