import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
}

interface EditableProduct {
  id: number;
  name: string;
  description: string;
  priceInput: string;
  stockInput: string;
  category: string;
}

const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<EditableProduct | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/stock", { credentials: "include" });
      if (!res.ok) throw new Error("Erro ao carregar produtos");
      const data = await res.json();
      setProducts(data.products || data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct({
      id: product.id,
      name: product.name,
      description: product.description || "",
      priceInput: product.price.toString(),
      stockInput: product.stock.toString(),
      category: product.category,
    });
  };

  const handleEditSubmit = async () => {
    if (!editingProduct) return;

    const updatedData = {
      name: editingProduct.name,
      description: editingProduct.description,
      price: Number(editingProduct.priceInput),
      stock: Number(editingProduct.stockInput),
      category: editingProduct.category,
    };

    try {
      const res = await fetch(`http://localhost:3000/api/stock/${editingProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updatedData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao atualizar produto");

      setProducts(products.map(p => (p.id === editingProduct.id ? data.updatedProduct : p)));
      setEditingProduct(null);
      alert("Produto atualizado com sucesso!");
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!user || user.role !== "admin") {
    return <div className="alert alert-danger mt-4 text-center">Acesso negado — apenas administradores podem visualizar esta página.</div>;
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2 className="mt-2 mb-4">Gerenciamento de Produtos</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        {products.map(product => (
          <div key={product.id} className="col-xxl-3 col-xl-4 col-md-6 mb-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <div className="product-img bg-secondary p-5 mb-3 rounded-2"></div>
                <h5 className="card-title">{product.name}</h5>
                {product.description && <p className="card-text">{product.description}</p>}
                <p className="card-text"><strong>Preço:</strong> R$ {product.price.toFixed(2)}</p>
                <p className="card-text"><strong>Estoque:</strong> {product.stock} unidades</p>
                <p className="card-text"><small className="text-muted">{product.category}</small></p>
              </div>
              <div className="card-footer d-flex justify-content-end">
                <button className="btn btn-outline-danger my-2 btn-sm" onClick={() => openEditModal(product)}>Editar</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingProduct && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content p-3">
              <h5>Editar Produto #{editingProduct.id}</h5>

              <div className="mb-2">
                <label>Nome:</label>
                <input
                  aria-label="name"
                  className="form-control"
                  value={editingProduct.name}
                  onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                />
              </div>

              <div className="mb-2">
                <label>Descrição:</label>
                <input
                  aria-label="description"
                  className="form-control"
                  value={editingProduct.description}
                  onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                />
              </div>

              <div className="mb-2">
                <label>Preço:</label>
                <input
                  type="number"
                  className="form-control"
                  value={editingProduct.priceInput}
                  onChange={e => setEditingProduct({ ...editingProduct, priceInput: e.target.value })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="mb-2">
                <label>Estoque:</label>
                <input
                  type="number"
                  className="form-control"
                  value={editingProduct.stockInput}
                  onChange={e => setEditingProduct({ ...editingProduct, stockInput: e.target.value })}
                  placeholder="0"
                  min="0"
                  step="1"
                />
              </div>

              <div className="mb-2">
                <label>Categoria:</label>
                <input
                  aria-label="category"
                  className="form-control"
                  value={editingProduct.category}
                  onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}
                />
              </div>

              <div className="d-flex justify-content-between mt-3">
                <button className="btn btn-primary" onClick={handleEditSubmit}>Salvar</button>
                <button className="btn btn-secondary" onClick={() => setEditingProduct(null)}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {products.length === 0 && !loading && (
        <div className="text-center text-muted mt-5">
          <h4>Nenhum produto cadastrado</h4>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
