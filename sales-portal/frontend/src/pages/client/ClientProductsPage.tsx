import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
}

const ClientProductsPage: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderLoading, setOrderLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/stock", {
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Erro ao carregar produtos");
      
      const data = await res.json();
      setProducts(data.products || data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMakeOrder = async (productId: number) => {
    setOrderLoading(productId);
    setError(null);

    try {
      const quantity = prompt("Quantidade desejada:");
      if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
        alert("Por favor, insira uma quantidade válida.");
        return;
      }

      const res = await fetch("http://localhost:3000/api/order/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          productId,
          quantity: parseInt(quantity)
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao fazer pedido");
      }

      alert(`Pedido realizado com sucesso!
        Produto: ${data.order.productName}
        Quantidade: ${data.order.quantity}
        Total: R$ ${(data.order.totalPrice).toFixed(2)}`);

      fetchProducts();
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setOrderLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2>Produtos Disponíveis</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="row">
        {products.map((product) => (
          <div key={product.id} className="col-md-4 mb-4">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">{product.name}</h5>
                <p className="card-text">{product.description}</p>
                <p className="card-text">
                  <strong>Preço:</strong> R$ {(product.price).toFixed(2)}
                </p>
                <p className="card-text">
                  <strong>Estoque:</strong> {product.stock} unidades
                </p>
                <p className="card-text">
                  <small className="text-muted">{product.category}</small>
                </p>
              </div>
              <div className="card-footer">
                <button
                  className="btn btn-primary w-100"
                  onClick={() => handleMakeOrder(product.id)}
                  disabled={product.stock === 0 || orderLoading === product.id}
                >
                  {orderLoading === product.id ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Processando...
                    </>
                  ) : product.stock === 0 ? (
                    "Fora de Estoque"
                  ) : (
                    "Fazer Pedido"
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && !loading && (
        <div className="text-center text-muted mt-5">
          <h4>Nenhum produto disponível no momento</h4>
        </div>
      )}
    </div>
  );
};

export default ClientProductsPage;