'use client';

import { useState, useRef, useEffect } from 'react';

const API_BASE_URL = 'http://9.129.248.155:5000';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        '你好，这里是Casey，很高兴你愿意在这个时刻来找我，我将尽我所能来帮助你，不用担心，今天在这里的一切都将保密，你将得到充分的尊重。你今天想从哪里开始聊起呢？',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          history: messages,
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let assistantMessage = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                assistantMessage += parsed.content;

                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage && lastMessage.role === 'assistant') {
                    lastMessage.content = assistantMessage;
                  }
                  return newMessages;
                });
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '抱歉，我现在无法连接到服务器。请检查网络连接或稍后再试。',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'linear-gradient(135deg, #fdf2f8, #f3e8ff, #e0e7ff)' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid #e5e7eb', background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: '896px', margin: '0 auto', display: 'flex', height: '64px', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', height: '48px', width: '48px', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
              <span style={{ fontSize: '24px' }}>❤️</span>
            </div>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                Casey - 情感咨询师
              </h1>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>你的情感陪伴者</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', height: '12px', width: '12px', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: '#22c55e' }}>
              <div style={{ height: '6px', width: '6px', borderRadius: '50%', background: '#22c55e', animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite' }}></div>
            </div>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>在线</span>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }} ref={scrollRef}>
        <div style={{ maxWidth: '896px', margin: '0 auto' }}>
          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '24px',
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              {message.role === 'assistant' && (
                <div style={{ display: 'flex', height: '40px', width: '40px', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                  <span style={{ fontSize: '18px' }}>❤️</span>
                </div>
              )}
              <div
                style={{
                  maxWidth: '80%',
                  borderRadius: '16px',
                  padding: '20px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  background: message.role === 'user'
                    ? 'linear-gradient(135deg, #ec4899, #8b5cf6)'
                    : 'white',
                  color: message.role === 'user' ? 'white' : '#111827'
                }}
              >
                {message.content}
              </div>
              {message.role === 'user' && (
                <div style={{ display: 'flex', height: '40px', width: '40px', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: '#d1d5db', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                  <span style={{ fontSize: '18px' }}>👤</span>
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', height: '40px', width: '40px', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <span style={{ fontSize: '18px' }}>❤️</span>
              </div>
              <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <div style={{ height: '8px', width: '8px', borderRadius: '50%', background: '#8b5cf6', animation: 'bounce 0.5s infinite' }}></div>
                  <div style={{ height: '8px', width: '8px', borderRadius: '50%', background: '#8b5cf6', animation: 'bounce 0.5s 0.1s infinite' }}></div>
                  <div style={{ height: '8px', width: '8px', borderRadius: '50%', background: '#8b5cf6', animation: 'bounce 0.5s 0.2s infinite' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div style={{ borderTop: '1px solid #e5e7eb', background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', position: 'sticky', bottom: 0 }}>
        <div style={{ maxWidth: '896px', margin: '0 auto', padding: '24px 16px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="分享你的故事，我在这里倾听..."
                disabled={isTyping}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '16px',
                  outline: 'none',
                  fontSize: '18px',
                  opacity: isTyping ? 0.5 : 1
                }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              style={{
                padding: '16px 32px',
                background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                color: 'white',
                fontWeight: 'bold',
                borderRadius: '16px',
                border: 'none',
                fontSize: '18px',
                cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed',
                opacity: (input.trim() && !isTyping) ? 1 : 0.5
              }}
            >
              发送
            </button>
          </div>
          <p style={{ textAlign: 'center', fontSize: '12px', color: '#9ca3af', marginTop: '12px', margin: '12px 0 0 0' }}>
            按 Enter 发送消息，Shift + Enter 换行
          </p>
        </div>
      </div>
    </div>
  );
}
