import React from "react";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  imageUrl?: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="card p-3 shadow">
      <h5>{product.name}</h5>
      <p>Categoria: {product.category}</p>
      <p>Preço: R$ {product.price.toFixed(2)}</p>
      <p>Estoque: {product.stock}</p>
    </div>
  );
};

export default ProductCard;
