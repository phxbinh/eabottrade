

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
  
];

export default function HomePage() {
  return (
    <div style={containerStyle}>
      <h1 style={headingStyle}>EA Trade TS - MT5</h1>

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
};

const badgeStyle = (status: string): React.CSSProperties => ({
  padding: '4px 8px',
  borderRadius: '6px',
  fontSize: '12px',
  border: '1px solid #ccc',
});













/*
// app/page.tsx -> 🟢Gemini thiết kế
import Link from 'next/link';
import React from 'react';

const routes = [
  {
    href: '/ai-agent',
    title: 'AI Agent',
    summary:
      'Flow agent cơ bản với tool calling, multi-step reasoning và stop conditions.',
    status: 'done',
  },
  {
    href: '/chat-tool',
    title: 'AI Agent with Chat Tool',
    summary:
      'Demo tool invocation trong chat, render tool result trực tiếp lên UI.',
    status: 'done',
  },
  {
    href: '/ai-hybrid-chat',
    title: 'AI Hybrid Agent',
    summary:
      'Kết hợp deterministic flow + AI intent parsing để giảm token và tăng kiểm soát.',
    status: 'testing',
  },
  {
    href: '/vercel-guides',
    title: 'Vercel AI SDK Guide',
    summary:
      'Playground để test các pattern từ Vercel AI SDK v6 (streamText, generateText, tools).',
    status: 'done',
  },
  {
    href: '/langchain-sdk',
    title: 'LangChain SDK',
    summary:
      'Thử nghiệm agent/tool orchestration bằng LangChain với custom tools.',
    status: 'testing',
  },
  {
    href: '/use-gemini-in-langchain',
    title: 'Gemini + LangChain',
    summary:
      'Tích hợp Gemini model vào LangChain để test reasoning + tool execution.',
    status: 'draft',
  },
];

export default function HomePage() {
  return (
    <div style={containerStyle}>
      <div style={wrapperStyle}>
        <header style={headerStyle}>
          <h1 style={headingStyle}>AI Playground</h1>
          <p style={subheadingStyle}>
            Nơi thử nghiệm và build các mô hình AI Agents thế hệ mới.
          </p>
        </header>

        <div style={listStyle}>
          {routes.map((route) => (
            <Link key={route.href} href={route.href} style={cardStyle} className="playground-card">
              <div style={cardHeaderStyle}>
                <span style={cardTitleStyle}>{route.title}</span>
                <span style={badgeStyle(route.status)}>
                  {route.status}
                </span>
              </div>
              <p style={summaryStyle}>{route.summary}</p>
              
              <div style={cardFooterStyle}>
                <span>Khám phá ngay</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>

      
      <style dangerouslySetInnerHTML={{__html: `
        .playground-card {
          transition: all 0.2s ease-in-out !important;
        }
        .playground-card:hover {
          border-color: #000 !important;
          transform: translateY(-4px);
          box-shadow: 0 12px 20px rgba(0, 0, 0, 0.04) !important;
        }
        .playground-card:hover svg {
          transform: translateX(4px);
          transition: transform 0.2s ease;
        }
      `}} />
    </div>
  );
}

// Styles

const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: '#fafafa', 
  color: '#171717',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  padding: '60px 20px',
  
  // Thêm 2 dòng này để sửa triệt để lỗi kẹt cuộn:
  overflowY: 'auto',       
  height: '100%',          
};



const wrapperStyle: React.CSSProperties = {
  maxWidth: '1000px',
  margin: '0 auto',
};

const headerStyle: React.CSSProperties = {
  marginBottom: '40px',
  borderBottom: '1px solid #eaeaea',
  paddingBottom: '20px',
};

const headingStyle: React.CSSProperties = {
  fontSize: '2.5rem',
  fontWeight: 800,
  letterSpacing: '-0.05em',
  margin: '0 0 8px 0',
};

const subheadingStyle: React.CSSProperties = {
  color: '#666',
  fontSize: '1.1rem',
  margin: 0,
};

const listStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', // Tự động chia cột tùy màn hình
  gap: '20px',
};

const cardStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: '24px',
  border: '1px solid #e5e7eb',
  borderRadius: '14px',
  background: '#ffffff',
  textDecoration: 'none',
  color: 'inherit',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.01)',
};

const cardHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '12px',
  marginBottom: '12px',
};

const cardTitleStyle: React.CSSProperties = {
  fontSize: '1.2rem',
  fontWeight: 600,
  letterSpacing: '-0.02em',
};

const summaryStyle: React.CSSProperties = {
  margin: '0 0 24px 0',
  color: '#4a5568',
  fontSize: '0.95rem',
  lineHeight: 1.6,
  flexGrow: 1, // Đẩy footer xuống đáy card nếu text ngắn ngắn dài dài khác nhau
};

const cardFooterStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '0.85rem',
  fontWeight: 500,
  color: '#0070f3', // Màu xanh tạo điểm nhấn action
};

// Định nghĩa màu cho từng loại trạng thái
const getStatusColors = (status: string) => {
  switch (status) {
    case 'done':
      return { bg: '#e6f4ea', text: '#137333', border: '#ceead6' };
    case 'testing':
      return { bg: '#fef7e0', text: '#b06000', border: '#feecb8' };
    case 'draft':
    default:
      return { bg: '#f1f3f4', text: '#5f6368', border: '#e8eaed' };
  }
};

const badgeStyle = (status: string): React.CSSProperties => {
  const colors = getStatusColors(status);
  return {
    padding: '4px 10px',
    borderRadius: '99px', // Dạng dẹt viên thuốc (pill badge) nhìn hiện đại hơn
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    backgroundColor: colors.bg,
    color: colors.text,
    border: `1px solid ${colors.border}`,
    whiteSpace: 'nowrap',
  };
};

*/





