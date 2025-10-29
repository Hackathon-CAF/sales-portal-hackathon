import React from "react";
import { Card, Badge } from "react-bootstrap";

interface Order {
  id: number;
  status: string;
  total: number;
  createdAt: string;
}

interface OrderCardProps {
  order: Order;
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  return (
    <div className="card p-3">
      <h5>Pedido #{order.id}</h5>
      <p>Status: {order.status}</p>
      <p>Total: R$ {order.total.toFixed(2)}</p>
      <p>Data: {new Date(order.createdAt).toLocaleString()}</p>
    </div>
  );
};

export default OrderCard;
