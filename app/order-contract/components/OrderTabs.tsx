"use client";

import { OrderData } from "../../contexts/OrderDataContext";

interface OrderTabsProps {
  orders: OrderData[];
  currentOrderIndex: number;
  setCurrentOrderIndex: (idx: number) => void;
  onAddOrder: () => void;
  onRemoveOrder: (idx: number, e: React.MouseEvent) => void;
}

export default function OrderTabs({
  orders,
  currentOrderIndex,
  setCurrentOrderIndex,
  onAddOrder,
  onRemoveOrder,
}: OrderTabsProps) {
  return (
    <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #dde5f4', padding: '0.5rem 0' }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {orders.map((_, idx) => (
          <div
            key={idx}
            onClick={() => setCurrentOrderIndex(idx)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.375rem 0.5rem 0.375rem 0.75rem',
              fontSize: '0.8rem',
              fontWeight: 500,
              backgroundColor: idx === currentOrderIndex ? '#0d56c9' : '#f0f2f7',
              color: idx === currentOrderIndex ? '#fff' : '#686e78',
              borderRadius: '0.25rem',
              cursor: 'pointer',
            }}
          >
            <span>外注発注({idx + 1})</span>
            <button
              onClick={(e) => onRemoveOrder(idx, e)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '16px',
                height: '16px',
                padding: 0,
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: idx === currentOrderIndex ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                color: idx === currentOrderIndex ? '#fff' : '#686e78',
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer',
                lineHeight: 1,
              }}
              title="削除"
            >
              ×
            </button>
          </div>
        ))}
        <button
          onClick={onAddOrder}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.375rem 0.75rem',
            fontSize: '0.8rem',
            fontWeight: 500,
            backgroundColor: '#fff',
            color: '#0d56c9',
            border: '1px dashed #0d56c9',
            borderRadius: '0.25rem',
            cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: '1rem', lineHeight: 1 }}>+</span>
          <span>新規登録</span>
        </button>
      </div>
    </div>
  );
}
