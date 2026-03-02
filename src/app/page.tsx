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

  // 自动滚动到底部
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
    <div className="flex flex-col h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 max-w-4xl">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg">
              <span className="text-white text-2xl">❤️</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Casey - 情感咨询师
              </h1>
              <p className="text-sm text-gray-500">你的情感陪伴者</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-3 w-3 items-center justify-center rounded-full bg-green-500">
              <div className="h-1.5 w-1.5 animate-ping rounded-full bg-green-500" />
            </div>
            <span className="text-xs text-gray-500">在线</span>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div 
        className="flex-1 overflow-y-auto p-4"
        ref={scrollRef}
      >
        <div className="container mx-auto max-w-4xl">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 mb-6 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-600 shadow-md">
                  <span className="text-white text-lg">❤️</span>
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-5 py-4 shadow-md ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white'
                    : 'bg-white text-gray-900'
                }`}
              >
                {message.content}
              </div>
              {message.role === 'user' && (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-300 shadow-md">
                  <span className="text-white text-lg">👤</span>
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 mb-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-600 shadow-md">
                <span className="text-white text-lg">❤️</span>
              </div>
              <div className="bg-white rounded-2xl px-5 py-4 shadow-md">
                <div className="flex gap-1.5">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-purple-500" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-purple-500" style={{ animationDelay: '0.1s' }} />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-purple-500" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t bg-white/80 backdrop-blur-sm sticky bottom-0">
        <div className="container mx-auto px-4 py-6">
          <div className="mx-auto max-w-4xl">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
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
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg disabled:opacity-50 transition-all"
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="px-8 py-4 bg-gradient-to-br from-pink-500 to-purple-600 text-white font-bold rounded-2xl hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl text-lg"
              >
                发送
              </button>
            </div>
            <p className="text-center text-xs text-gray-400 mt-3">
              按 Enter 发送消息，Shift + Enter 换行
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}