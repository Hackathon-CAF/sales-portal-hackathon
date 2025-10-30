import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import Navbar from "../components/Navbar";
import SideBar from "../components/Sidebar";

import RegisterPage from "../pages/RegisterPage";
import LoginPage from "../pages/LoginPage";
import ProfilePage from "../pages/ProfilePage";

// Admin
import AdminUsersPage from "../pages/admin/AdminUsersPage";
import AdminProductsPage from "../pages/admin/AdminProductsPage";
import AdminTransactionsPage from "../pages/admin/AdminTransactionsPage";
import AdminProductionPage from "../pages/admin/AdminProductionPage";
import AdminSupportPage from "../pages/admin/AdminSupportPage";

// Client
import ClientOrdersPage from "../pages/client/ClientOrdersPage";
import ClientProductsPage from "../pages/client/ClientProductsPage";
import ClientSupportPage from "../pages/client/ClientSupportPage";
import LandingPage from "../pages/LandingPage";
import AdminOrdersPage from "../pages/admin/AdminOrdersPage";

const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    // Usuário não logado
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  }

  // Usuário logado
  return (
    <div className="d-flex min-vh-100">
      <SideBar isAdmin={user.role === "admin"} />
      <div className="flex-grow-1">
        <Navbar />
        <div className="p-4">
          <Routes>
            <Route path="/" element={<Navigate to="/profile" />} />
            <Route path="/profile" element={<ProfilePage />} />

            {user.role === "admin" && (
              <>
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/products" element={<AdminProductsPage />} />
                <Route path="/admin/orders" element={<AdminOrdersPage />} />
                <Route path="/admin/transactions" element={<AdminTransactionsPage />} />
                <Route path="/admin/production" element={<AdminProductionPage />} />
                <Route path="/admin/support" element={<AdminSupportPage />} />
              </>
            )}

            {user.role !== "admin" && (
              <>
                <Route path="/client/orders" element={<ClientOrdersPage />} />
                <Route path="/client/products" element={<ClientProductsPage />} />
                <Route path="/client/support" element={<ClientSupportPage />} />
              </>
            )}

            <Route path="*" element={<Navigate to="/profile" />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AppRoutes;
