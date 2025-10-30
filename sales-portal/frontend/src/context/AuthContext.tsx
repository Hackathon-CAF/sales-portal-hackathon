import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
}

interface AuthContextType {
  user: User | null;
  loading: boolean; 
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); 

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:3000/api/profile", {
        method: "GET",
        credentials: "include", 
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || { id: data.id, name: data.name, email: data.email, role: data.role });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Erro ao refresh user:", error);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      await refreshUser();
      setLoading(false); 
    };
    checkAuth();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Falha ao logar");
      }
      
      await refreshUser();
    } catch (error) {
      console.error("Erro no login:", error);
      throw error; // Re-throw para ser tratado no componente
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("http://localhost:3000/api/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Erro no logout:", error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};