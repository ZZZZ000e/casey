'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Send,
  Heart,
  User,
  Mic,
  Camera as CameraIcon,
  Paperclip,
  Volume2,
  X,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import {
  Preferences,
} from '@capacitor/preferences';
import {
  SpeechRecognition,
} from '@capacitor-community/speech-recognition';
import {
  Camera,
  CameraResultType,
  CameraSource,
} from '@capacitor/camera';
import {
  Filesystem,
  Directory,
  Encoding,
} from '@capacitor/filesystem';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'image' | 'audio';
  imageUrl?: string;
  audioUrl?: string;
}

// Constants
const STORAGE_KEY = 'chat_history';

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load messages from local storage on mount
  useEffect(() => {
    loadMessages();
  }, []);

  // Save messages to local storage whenever they change
  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Load messages from local storage
  const loadMessages = async () => {
    try {
      const { value } = await Preferences.get({ key: STORAGE_KEY });
      if (value) {
        const savedMessages = JSON.parse(value);
        if (savedMessages.length > 0) {
          setMessages(savedMessages);
        } else {
          // Set default welcome message
          setMessages([
            {
              id: '1',
              role: 'assistant',
              content:
                '你好，这里是Casey，很高兴你愿意在这个时刻来找我，我将尽我所能来帮助你，不用担心，今天在这里的一切都将保密，你将得到充分的尊重。你今天想从哪里开始聊起呢？',
              timestamp: new Date(),
            },
          ]);
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  // Save messages to local storage
  const saveMessages = async (msgs: Message[]) => {
    try {
      await Preferences.set({
        key: STORAGE_KEY,
        value: JSON.stringify(msgs),
      });
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  };

  // Handle send message
  const handleSend = async (messageContent?: string, attachmentUrl?: string) => {
    const content = messageContent || input;
    if (!content.trim() && !attachmentUrl) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content,
      timestamp: new Date(),
      type: attachmentUrl ? 'image' : 'text',
      imageUrl: attachmentUrl,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // 生成本地回复
    const response = generateLocalResponse(content);

    // 模拟流式输出
    const assistantId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      },
    ]);

    let currentContent = '';
    const words = response.split('');

    for (let i = 0; i < words.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 30)); // 模拟打字速度
      currentContent += words[i];
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? { ...msg, content: currentContent }
            : msg
        )
      );
    }

    setIsTyping(false);
  };

  // 本地回复生成函数
  const generateLocalResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('你好') || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return `你好呀，很高兴你愿意在这个时刻来找我，

我是Casey，你的情感咨询师，

今天想跟我聊聊什么呢？`;
    }

    if (lowerMessage.includes('挽回') || lowerMessage.includes('分手')) {
      return `我能感觉到你现在心里肯定很难受，

特别想赶紧做点什么把关系挽回对吧？

先别急着去求对方，

跟我说说，你们是因为什么闹到这一步的？`;
    }

    if (lowerMessage.includes('出轨') || lowerMessage.includes('背叛') || lowerMessage.includes('第三者')) {
      return `这事儿换谁心里都得堵得慌，

你现在的感受我能理解，

跟我说说，是什么时候发现这件事的？`;
    }

    if (lowerMessage.includes('结婚') || lowerMessage.includes('婚姻') || lowerMessage.includes('老公') || lowerMessage.includes('老婆') || lowerMessage.includes('离婚')) {
      return `婚姻里的那些事儿，确实很折磨人，

别急，慢慢跟我说，

你们之间具体发生了什么？`;
    }

    if (lowerMessage.includes('累') || lowerMessage.includes('痛苦') || lowerMessage.includes('难过') || lowerMessage.includes('难受') || lowerMessage.includes('抑郁')) {
      return `我知道这段时间你过得很不容易，

心里那些委屈，我都懂，

想哭就哭出来吧，这里没人会笑话你，

跟我说说，是什么让你觉得最难受？`;
    }

    if (lowerMessage.includes('喜欢') || lowerMessage.includes('爱') || lowerMessage.includes('暗恋')) {
      return `感情这事儿，确实挺让人纠结的，

那种心动又不敢靠近的感觉，

我能理解，

跟我说说，你们是怎么认识的呢？`;
    }

    if (lowerMessage.includes('吵架') || lowerMessage.includes('争执') || lowerMessage.includes('冷战')) {
      return `吵架确实挺伤感情的，

特别是冷战，最折磨人，

跟我说说，这次是因为什么吵架的？`;
    }

    if (lowerMessage.includes('谢谢') || lowerMessage.includes('感谢')) {
      return `不用客气，

能帮到你，我很开心，

如果还有其他想聊的，随时找我。`;
    }

    // 默认回复
    return `嗯，我听到你说的了，

能跟我说说更多细节吗？

比如当时具体发生了什么？`;
  };

  // Handle speech recognition (voice input)
  const handleVoiceInput = async () => {
    if (isRecording) {
      // Stop recording
      await SpeechRecognition.stop();
      setIsRecording(false);
    } else {
      // Start recording
      try {
        const { available } = await SpeechRecognition.available();

        if (!available) {
          alert('语音识别功能不可用');
          return;
        }

        const language = 'zh-CN';
        await SpeechRecognition.start({ language, partialResults: true });
        setIsRecording(true);

        // Listen for results (partial and final)
        const listener = await SpeechRecognition.addListener('partialResults', (data: any) => {
          if (data.matches && data.matches.length > 0) {
            setInput(data.matches[0]);
          }
        });

        // Auto-stop after a period of silence or when user stops manually
        setTimeout(() => {
          if (isRecording) {
            setIsRecording(false);
            listener.remove();
          }
        }, 30000); // 30 seconds timeout
      } catch (error) {
        console.error('Speech recognition error:', error);
        setIsRecording(false);
      }
    }
  };

  // Handle camera capture
  const handleCameraCapture = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
      });

      if (image.webPath) {
        handleSend('', image.webPath);
      }
    } catch (error) {
      console.error('Camera error:', error);
    }
  };

  // Handle file upload
  const handleFileUpload = async () => {
    try {
      const inputElement = document.createElement('input');
      inputElement.type = 'file';
      inputElement.accept = 'image/*,audio/*';
      inputElement.onchange = async (e: any) => {
        const file = e.target.files[0];
        if (file) {
          // Convert file to base64
          const reader = new FileReader();
          reader.onload = (event: any) => {
            handleSend('', event.target.result);
          };
          reader.readAsDataURL(file);
        }
      };
      inputElement.click();
    } catch (error) {
      console.error('File upload error:', error);
    }
  };

  // Handle voice to text conversion (long press on message)
  const handleVoiceToText = async (message: Message) => {
    if (message.type === 'audio' || message.audioUrl) {
      // Convert audio to text
      // This would need to be implemented with a speech-to-text service
      alert('语音转文字功能即将推出');
    }
  };

  // Handle delete message
  const handleDeleteMessage = (messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
  };

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Clear all messages
  const clearMessages = () => {
    if (confirm('确定要清空所有聊天记录吗？')) {
      setMessages([]);
      Preferences.remove({ key: STORAGE_KEY });
    }
  };

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-950 dark:to-blue-950">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-950/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-600">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Casey - 情感咨询师
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                你的情感陪伴者
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={clearMessages}
              className="h-8 w-8"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <div className="flex h-2 w-2 items-center justify-center rounded-full bg-green-500">
              <div className="h-1 w-1 animate-ping rounded-full bg-green-500" />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">在线</span>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full px-4 py-6">
          <div ref={scrollRef} className="mx-auto max-w-3xl space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
                onContextMenu={() => handleDeleteMessage(message.id)}
              >
                <div
                  className={`flex gap-3 max-w-[80%] ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-600 dark:to-blue-800">
                    {message.role === 'user' ? (
                      <User className="h-5 w-5 text-white" />
                    ) : (
                      <Heart className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <Card
                    className={`px-4 py-3 shadow-sm relative ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white dark:from-blue-600 dark:to-purple-700'
                        : 'bg-white dark:bg-gray-800'
                    }`}
                  >
                    {message.imageUrl && (
                      <img
                        src={message.imageUrl}
                        alt="Attachment"
                        className="mb-2 rounded-lg max-w-full"
                      />
                    )}
                    <p
                      className={`whitespace-pre-wrap text-sm leading-relaxed ${
                        message.role === 'user'
                          ? 'text-white'
                          : 'text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      {message.content}
                    </p>
                    {message.type === 'audio' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleVoiceToText(message)}
                        className="mt-2 h-6 w-6"
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    )}
                  </Card>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-[80%]">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-600">
                    <Heart className="h-5 w-5 text-white" />
                  </div>
                  <Card className="px-4 py-3 shadow-sm bg-white dark:bg-gray-800">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="border-t bg-white/80 backdrop-blur-sm dark:bg-gray-950/80">
        <div className="container mx-auto px-4 py-4">
          <div className="mx-auto max-w-3xl">
            <div className="flex gap-2">
              {/* Camera button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCameraCapture}
                className="h-[60px] w-[60px] shrink-0 rounded-2xl"
              >
                <CameraIcon className="h-5 w-5" />
              </Button>

              {/* File upload button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleFileUpload}
                className="h-[60px] w-[60px] shrink-0 rounded-2xl"
              >
                <Paperclip className="h-5 w-5" />
              </Button>

              {/* Text input */}
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="分享你的故事，我在这里倾听..."
                className="min-h-[60px] flex-1 resize-none rounded-2xl border-0 bg-gray-100 px-4 py-3 text-sm focus-visible:ring-2 focus-visible:ring-purple-500 dark:bg-gray-800 dark:text-white"
                disabled={isTyping}
              />

              {/* Voice input button */}
              <Button
                variant={isRecording ? 'default' : 'ghost'}
                size="icon"
                onClick={handleVoiceInput}
                className={`h-[60px] w-[60px] shrink-0 rounded-2xl ${
                  isRecording
                    ? 'bg-gradient-to-br from-pink-500 to-purple-600'
                    : ''
                }`}
                disabled={isTyping}
              >
                {isRecording ? (
                  <X className="h-5 w-5 text-white" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </Button>

              {/* Send button */}
              <Button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                size="icon"
                className="h-[60px] w-[60px] shrink-0 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              >
                <Send className="h-5 w-5 text-white" />
              </Button>
            </div>
            <p className="mt-2 text-center text-xs text-gray-400 dark:text-gray-500">
              按 Enter 发送，Shift + Enter 换行 | 长按消息语音转文字
            </p>

            {/* Mobile Install Banner */}
            <div className="mt-3 p-3 bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 dark:from-pink-900/20 dark:via-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-100 dark:border-purple-700">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0 text-purple-600 dark:text-purple-400"
                  >
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                    <line x1="12" y1="18" x2="12.01" y2="18" />
                  </svg>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                    安装到手机获得更好体验
                  </span>
                </div>
                <a
                  href="/qr-code"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                >
                  扫码安装 →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}