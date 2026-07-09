

// app/page.tsx
import Link from 'next/link';
import React from 'react';

const routes = [
  {
    href: '/EA1',
    title: 'EA bot backtest',
    summary:
      `KHỞI TẠO EA BACKTEST
*✳️ Khởi tạo các interface.
- 🔸lib: src/lib/ai/...
- 🔸path: /EA1`,
    status: 'demo',
  },
  {
    href: '/candles-feed',
    title: 'Kiểm tra logic: lấy dữ liệu từ csv',
    summary:
      `Sprint 1: Lấy dữ liệu từ csv.
*✳️ Khởi tạo các interface.
- 🔸lib: src/trading/core/...
- 🔸path: /candles-feed`,
    status: 'demo',
  },
  {
    href: '/bufferHistory',
    title: 'Kiểm tra logic: chạy BufferHistory',
    summary:
      `Sprint 1: BufferHistory.
*✳️ Khởi tạo BufferHistory.
- 🔸lib: src/trading/core/...
- 🔸path: /bufferHistory`,
    status: 'demo',
  },
  {
    href: '/buffer',
    title: 'Kiểm tra logic: chạy BufferHistory',
    summary:
      `Sprint 1: BufferHistory.
*✳️ Khởi tạo BufferHistory.
- 🔸lib: src/trading/core/...
- 🔸path: /buffer`,
    status: 'demo',
  },
  {
    href: '/indecators',
    title: 'Kiểm tra logic: Tisnh toán các chỉ số',
    summary:
      `Sprint 1: Kiểm tra tính toán các chỉ số.
*✳️ Khởi tạo indecators: EMA RSI.
- 🔸lib: src/trading/core/...
- 🔸path: /indecators`,
    status: 'demo',
  },
];


export default function HomePage() {
  return (
    <div style={containerStyle}>
      <h1 style={headingStyle}>AI Playground</h1>

      <div style={listStyle}>
        {routes.map((route) => (
          <Link key={route.href} href={route.href} style={cardStyle}>
            <div style={cardHeaderStyle}>
              <span>{route.title}</span>
              <span style={badgeStyle(route.status)}>
                {route.status}
              </span>
            </div>

            <p style={summaryStyle}>{route.summary}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  padding: '40px',
  minHeight: '100vh',
  background: '#f7f8fa',
};

const headingStyle: React.CSSProperties = {
  fontSize: '2rem',
  marginBottom: '30px',
};

const listStyle: React.CSSProperties = {
  display: 'grid',
  gap: '16px',
  maxWidth: '900px',
};

const cardStyle: React.CSSProperties = {
  display: 'block',
  padding: '20px',
  border: '1px solid #ddd',
  borderRadius: '12px',
  background: '#fff',
  textDecoration: 'none',
  color: '#111',
};

const cardHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '8px',
  fontWeight: 'bold',
};

const summaryStyle: React.CSSProperties = {
  margin: 0,
  color: '#666',
  lineHeight: 1.5,
  whiteSpace: "pre-line",
};

const badgeStyle = (status: string): React.CSSProperties => ({
  padding: '4px 8px',
  borderRadius: '6px',
  fontSize: '12px',
  border: '1px solid #ccc',
});