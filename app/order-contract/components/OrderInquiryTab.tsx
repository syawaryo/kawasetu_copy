"use client";

import { OrderData } from "../../contexts/OrderDataContext";

interface OrderInquiryTabProps {
  orders: OrderData[];
  inquiryIndex: number;
  setInquiryIndex: (idx: number) => void;
}

export default function OrderInquiryTab({
  orders,
  inquiryIndex,
  setInquiryIndex,
}: OrderInquiryTabProps) {
  return (
    <div style={{ textAlign: 'left' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <p style={{ fontSize: '1rem', fontWeight: 600, color: '#1a1c20', margin: 0 }}>注文伺書</p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {orders.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setInquiryIndex(idx)}
              style={{
                padding: '0.375rem 0.75rem',
                fontSize: '0.8rem',
                fontWeight: 500,
                backgroundColor: idx === inquiryIndex ? '#0d56c9' : '#f0f2f7',
                color: idx === inquiryIndex ? '#fff' : '#686e78',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: 'pointer',
              }}
            >
              注文伺書({idx + 1})
            </button>
          ))}
        </div>
      </div>
      <div style={{ backgroundColor: '#f0f2f7', borderRadius: '0.5rem', height: '600px' }}>
        <iframe
          src="/注文伺書（データ消し・サンプルデータ）.pdf"
          style={{ width: '100%', height: '100%', border: 'none', borderRadius: '0.5rem' }}
          title={`注文伺書(${inquiryIndex + 1})`}
        />
      </div>
    </div>
  );
}
