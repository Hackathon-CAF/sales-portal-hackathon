import React, { useEffect, useState } from "react";
import ProductCard from "../../components/ProductCard";
import { useAuth } from "../../context/AuthContext";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
}

const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/stock", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Erro ao carregar produtos");
        const data = await res.json();
        setProducts(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (!user || user.role !== "admin") return <p>Acesso negado</p>;

  return (
    <div className="container mt-3">
      <h2>Produtos</h2>
      {loading && <p>Carregando...</p>}
      {error && <p className="text-danger">{error}</p>}
      <div className="d-flex flex-wrap gap-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
};

export default AdminProductsPage;
