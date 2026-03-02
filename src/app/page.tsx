'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'image';
  imageUrl?: string;
}

const STORAGE_KEY = 'chat_history';

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const loadMessages = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        setMessages([{
          id: '1',
          role: 'assistant',
          content: '你好，这里是Casey，很高兴你愿意在这个时刻来找我，我将尽我所能来帮助你，不用担心，今天在这里的一切都将保密，你将得到充分的尊重。你今天想从哪里开始聊起呢？',
          timestamp: new Date(),
        }]);
      }
    } catch (e) {
      console.error('Failed to load messages', e);
    }
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const generateLocalResponse = (message: string): string => {
    const lower = message.toLowerCase();
    if (lower.includes('你好') || lower.includes('hello') || lower.includes('hi')) {
      return `你好呀，很高兴你愿意在这个时刻来找我，

我是Casey，你的情感咨询师，

今天想跟我聊聊什么呢？`;
    }
    if (lower.includes('挽回') || lower.includes('分手')) {
      return `我能感觉到你现在心里肯定很难受，

特别想赶紧做点什么把关系挽回对吧？

先别急着去求对方，

跟我说说，你们是因为什么闹到这一步的？`;
    }
    if (lower.includes('出轨') || lower.includes('背叛') || lower.includes('第三者')) {
      return `这事儿换谁心里都得堵得慌，

你现在的感受我能理解，

跟我说说，是什么时候发现这件事的？`;
    }
    if (lower.includes('结婚') || lower.includes('婚姻') || lower.includes('老公') || lower.includes('老婆') || lower.includes('离婚')) {
      return `婚姻里的那些事儿，确实很折磨人，

别急，慢慢跟我说，

你们之间具体发生了什么？`;
    }
    if (lower.includes('累') || lower.includes('痛苦') || lower.includes('难过') || lower.includes('难受') || lower.includes('抑郁')) {
      return `我知道这段时间你过得很不容易，

心里那些委屈，我都懂，

想哭就哭出来吧，这里没人会笑话你，

跟我说说，是什么让你觉得最难受？`;
    }
    if (lower.includes('喜欢') || lower.includes('爱') || lower.includes('暗恋')) {
      return `感情这事儿，确实挺让人纠结的，

那种心动又不敢靠近的感觉，

我能理解，

跟我说说，你们是怎么认识的呢？`;
    }
    if (lower.includes('吵架') || lower.includes('争执') || lower.includes('冷战')) {
      return `吵架确实挺伤感情的，

特别是冷战，最折磨人，

跟我说说，这次是因为什么吵架的？`;
    }
    if (lower.includes('谢谢') || lower.includes('感谢')) {
      return `不用客气，

能帮到你，我很开心，

如果还有其他想聊的，随时找我。`;
    }
    return `嗯，我听到你说的了，

能跟我说说更多细节吗？

比如当时具体发生了什么？`;
  };

  const handleSend = async (messageContent?: string, attachmentUrl?: string) => {
    const content = messageContent || input;
    if (!content.trim() && !attachmentUrl) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
      type: attachmentUrl ? 'image' : 'text',
      imageUrl: attachmentUrl,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const response = generateLocalResponse(content);
    const assistantId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    }]);

    let currentContent = '';
    const words = response.split('');
    for (let i = 0; i < words.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 30));
      currentContent += words[i];
      setMessages(prev => prev.map(msg =>
        msg.id === assistantId ? { ...msg, content: currentContent } : msg
      ));
    }
    setIsTyping(false);
  };

  const clearMessages = () => {
    if (confirm('确定要清空所有聊天记录吗？')) {
      setMessages([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: 'linear-gradient(135deg, #fdf2f8, #f3e8ff, #e0e7ff)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid #e5e7eb',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        padding: '0 16px',
      }}>
        <div style={{
          maxWidth: '896px',
          margin: '0 auto',
          display: 'flex',
          height: '64px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              display: 'flex',
              height: '40px',
              width: '40px',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
            }}>
              <span style={{ fontSize: '20px' }}>❤️</span>
            </div>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                Casey - 情感咨询师
              </h1>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>你的情感陪伴者</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={clearMessages} style={{
              padding: '6px 10px',
              fontSize: '12px',
              border: 'none',
              background: '#f3f4f6',
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#4b5563',
            }}>
              清空
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></div>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>在线</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }} ref={scrollRef}>
        <div style={{ maxWidth: '896px', margin: '0 auto' }}>
          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '20px',
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              {message.role === 'assistant' && (
                <div style={{
                  display: 'flex',
                  height: '36px',
                  width: '36px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                  flexShrink: 0,
                }}>
                  <span style={{ fontSize: '16px' }}>❤️</span>
                </div>
              )}
              <div style={{
                maxWidth: '80%',
                padding: '12px 16px',
                borderRadius: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                background: message.role === 'user'
                  ? 'linear-gradient(135deg, #ec4899, #8b5cf6)'
                  : 'white',
                color: message.role === 'user' ? 'white' : '#111827',
                wordBreak: 'break-word',
                whiteSpace: 'pre-wrap',
                lineHeight: '1.6',
                fontSize: '15px',
              }}>
                {message.content}
              </div>
              {message.role === 'user' && (
                <div style={{
                  display: 'flex',
                  height: '36px',
                  width: '36px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  background: '#d1d5db',
                  flexShrink: 0,
                }}>
                  <span style={{ fontSize: '16px' }}>👤</span>
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <div style={{
                display: 'flex',
                height: '36px',
                width: '36px',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                flexShrink: 0,
              }}>
                <span style={{ fontSize: '16px' }}>❤️</span>
              </div>
              <div style={{
                padding: '12px 16px',
                borderRadius: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                background: 'white',
                display: 'flex',
                gap: '4px',
                alignItems: 'center',
              }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#8b5cf6', animation: 'bounce 0.6s infinite' }}></div>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#8b5cf6', animation: 'bounce 0.6s 0.1s infinite' }}></div>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#8b5cf6', animation: 'bounce 0.6s 0.2s infinite' }}></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div style={{
        borderTop: '1px solid #e5e7eb',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        padding: '16px',
      }}>
        <div style={{ maxWidth: '896px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="分享你的故事，我在这里倾听..."
                disabled={isTyping}
                style={{
                  width: '100%',
                  minHeight: '50px',
                  maxHeight: '150px',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '16px',
                  outline: 'none',
                  fontSize: '15px',
                  resize: 'none',
                  opacity: isTyping ? 0.5 : 1,
                  fontFamily: 'inherit',
                }}
              />
            </div>
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              style={{
                padding: '0 24px',
                background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                color: 'white',
                fontWeight: 'bold',
                borderRadius: '16px',
                border: 'none',
                fontSize: '15px',
                cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed',
                opacity: (input.trim() && !isTyping) ? 1 : 0.5,
                height: '50px',
                alignSelf: 'flex-end',
              }}
            >
              发送
            </button>
          </div>
          <p style={{
            textAlign: 'center',
            fontSize: '12px',
            color: '#9ca3af',
            marginTop: '8px',
            margin: '8px 0 0 0',
          }}>
            按 Enter 发送，Shift + Enter 换行
          </p>
        </div>
      </div>
    </div>
  );
}