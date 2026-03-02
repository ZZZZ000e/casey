export default function Home() {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      background: 'linear-gradient(135deg, #fdf2f8, #f3e8ff, #e0e7ff)',
      minHeight: '100vh'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>
        Casey - 情感咨询师
      </h1>
      <p style={{ textAlign: 'center', color: '#666' }}>
        你好，这里是Casey，很高兴你愿意在这个时刻来找我。
      </p>
      <div style={{ 
        maxWidth: '500px', 
        margin: '0 auto',
        background: 'white',
        padding: '20px',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <input 
          type="text" 
          placeholder="分享你的故事，我在这里倾听..."
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            marginBottom: '10px',
            fontSize: '16px'
          }}
        />
        <button style={{
          width: '100%',
          padding: '12px',
          background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}>
          发送消息
        </button>
      </div>
    </div>
  );
}