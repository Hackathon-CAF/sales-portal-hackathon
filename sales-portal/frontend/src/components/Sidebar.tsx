import React from "react";
import { Link } from "react-router-dom";
import "./componentsStyles.css"

interface SideBarProps {
  isAdmin?: boolean;
}

const SideBar: React.FC<SideBarProps> = ({ isAdmin = false }) => {
  return (
    <div className="sidebar-container d-flex flex-column bg-light px-4 vh-100">
      <h5 className="sidebar-title mb-3 mt-2">{isAdmin ? "Admin Dashboard" : "Área do Cliente"}</h5>
      <Link to={"/profile"} className="sidebar-link mb-2">Perfil</Link>
      {isAdmin ? (
        <>
          <Link to="/admin/products" className="sidebar-link mb-2">Produtos</Link>
          <Link to="/admin/users" className="sidebar-link mb-2">Usuários</Link>
          <Link to="/admin/orders" className="sidebar-link mb-2">Pedidos</Link>
          <Link to="/admin/transactions" className="sidebar-link mb-2">Transações</Link>
          <Link to="/admin/production" className="sidebar-link mb-2">Produção</Link>
          <Link to="/admin/support" className="sidebar-link mb-2">Suporte</Link>
        </>
      ) : (
        <>
          <Link to="/client/orders" className="sidebar-link mb-2">Pedidos</Link>
          <Link to="/client/products" className="sidebar-link mb-2">Produtos</Link>
          <Link to="/client/support" className="sidebar-link mb-2">Suporte</Link>
        </>
      )}
    </div>
  );
};

export default SideBar;
