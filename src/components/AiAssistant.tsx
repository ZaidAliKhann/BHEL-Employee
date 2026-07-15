import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquareCode, Send, Sparkles, X, Minimize2, Maximize2, 
  HelpCircle, ShieldCheck, RefreshCw, Bot, User
} from 'lucide-react';
import { ChatMessage } from '../types';

const CopilotLogo = ({ className = "h-8 w-8" }: { className?: string }) => (
  <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/25 border border-blue-400/20 shrink-0 ${className}`}>
    <Bot className="h-1/2 w-1/2" />
    <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
    </span>
  </div>
);

interface AiAssistantProps {
  chatHistory: ChatMessage[];
  onSendMessage: (msg: string) => Promise<any>;
  isFullscreen?: boolean;
}

export default function AiAssistant({
  chatHistory,
  onSendMessage,
  isFullscreen = false
}: AiAssistantProps) {
  const [isOpen, setIsOpen] = useState(isFullscreen);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    "What is my casual leave balance?",
    "Explain BHEL HR Leave Policy",
    "How is my attendance rate calculated?",
    "Download my June Payslip PDF",
    "List my pending tasks"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen || isFullscreen) {
      scrollToBottom();
    }
  }, [chatHistory, isOpen, isFullscreen]);

  const handleSend = async (e?: React.FormEvent, customMsg?: string) => {
    if (e) e.preventDefault();
    const message = customMsg || inputMsg;
    if (!message.trim() || loading) return;

    if (!customMsg) setInputMsg('');
    setLoading(true);

    try {
      await onSendMessage(message);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  // If used as a fullscreen page tab
  if (isFullscreen) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm h-[calc(100vh-140px)] flex flex-col justify-between animate-fade-in">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div>
            <h3 className="font-display text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/b/b8/BHEL_logo.svg" 
                alt="BHEL" 
                className="h-5 w-auto shrink-0"
              />
              <div className="h-4 w-px bg-slate-200"></div>
              <CopilotLogo className="h-5 w-5 rounded-md" />
              <span>BHEL Intelligent ERP Assistant</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-semibold">Ask questions about leaves, payroll, shift timings, or company regulations.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-full">
            <Sparkles className="h-3 w-3" /> Gemini 2.5 Flash
          </span>
        </div>

        {/* Messages container */}
        <div className="flex-1 overflow-y-auto mb-4 p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-4 custom-scrollbar">
          {chatHistory.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-4 py-8">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center border border-slate-250 shadow-sm p-1.5">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/b/b8/BHEL_logo.svg" 
                    alt="BHEL" 
                    className="h-full w-auto"
                  />
                </div>
                <div className="h-4 w-px bg-slate-200"></div>
                <CopilotLogo className="h-12 w-12 rounded-xl" />
              </div>
              <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                Welcome. I am BHEL's internal AI Agent. I can assist you with your leave applications, show your attendance records, analyze tasks, and explain HR regulations.
              </p>
              <div className="w-full flex flex-col gap-2">
                {suggestedPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(undefined, p)}
                    className="text-left text-xs bg-white border border-slate-200 rounded-xl p-3 text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-all cursor-pointer font-bold shadow-sm"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {chatHistory.map((chat) => (
            <div 
              key={chat.id} 
              className={`flex gap-3 max-w-xl ${chat.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              {chat.sender === 'user' ? (
                <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0 border bg-blue-50 text-blue-600 border-blue-100 shadow-sm">
                  <User className="h-4 w-4" />
                </div>
              ) : (
                <CopilotLogo className="h-8 w-8 rounded-xl" />
              )}
              <div className={`p-3.5 rounded-2xl text-xs leading-relaxed font-semibold shadow-sm ${
                chat.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-white text-slate-800 rounded-tl-none border border-slate-200/60'
              }`}>
                {chat.message}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 max-w-xl">
              <CopilotLogo className="h-8 w-8 rounded-xl" />
              <div className="p-3 rounded-2xl text-xs bg-white text-slate-500 rounded-tl-none border border-slate-200 flex items-center gap-2 animate-pulse font-semibold shadow-sm">
                <span>AI Agent is analyzing</span>
                <span className="flex gap-0.5 mt-0.5">
                  <span className="h-1 w-1 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="h-1 w-1 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                  <span className="h-1 w-1 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input box */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ask AI Support e.g. What is my casual leave balance?..."
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={loading}
            className="flex-1 rounded-lg border border-slate-200 bg-slate-50/50 py-3 px-4 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-medium"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !inputMsg.trim()}
            className="rounded-lg bg-blue-600 hover:bg-blue-700 px-5 text-xs font-semibold text-white transition-colors flex items-center gap-1.5 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed shadow-md shadow-blue-600/10 cursor-pointer"
          >
            <Send className="h-3.5 w-3.5 shrink-0" /> Send
          </button>
        </div>
      </div>
    );
  }

  // Floating docked state (docked bottom-right)
  return (
    <>
      {/* Floating Trigger Bubble */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 hover:scale-105 active:scale-95 text-white shadow-xl shadow-blue-600/40 border border-blue-500/20 transition-all duration-200 cursor-pointer p-3.5 group animate-fade-in"
          title="BHEL Copilot Assistant"
        >
          <Bot className="h-full w-full transition-transform group-hover:rotate-12 duration-300" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-md">1</span>
          {/* Small BHEL logo badge */}
          <span className="absolute -bottom-1 -left-1 bg-white border border-slate-200 rounded-lg p-0.5 h-6 w-6 flex items-center justify-center shadow-sm">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/b/b8/BHEL_logo.svg" 
              alt="BHEL" 
              className="h-full w-auto"
            />
          </span>
        </button>
      )}

      {/* Floating Dialog Box */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm rounded-2xl border border-slate-200 bg-white shadow-2xl flex flex-col h-[460px] overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/b/b8/BHEL_logo.svg" 
                alt="BHEL" 
                className="h-5 w-auto shrink-0"
              />
              <div className="h-4 w-px bg-slate-200"></div>
              <CopilotLogo className="h-5 w-5 rounded-md" />
              <div>
                <span className="text-xs font-bold text-slate-900 block">BHEL ERP Copilot</span>
                <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Enterprise Agent</span>
              </div>
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 flex items-center justify-center rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-50/50">
            {chatHistory.length === 0 && (
              <div className="text-center py-6 px-3 space-y-4">
                <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
                  Greetings. Ask me about your attendance rate, check task items, or inquire about current leave levels!
                </p>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {suggestedPrompts.slice(0, 3).map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(undefined, p)}
                      className="text-[10px] text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 border border-slate-200 px-2.5 py-1.5 rounded-lg font-bold shadow-sm cursor-pointer transition-all"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {chatHistory.map((chat) => (
              <div key={chat.id} className={`flex gap-2 max-w-[90%] ${chat.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                {chat.sender === 'user' ? (
                  <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 border bg-blue-50 text-blue-600 border-blue-100 shadow-xs">
                    <User className="h-3.5 w-3.5" />
                  </div>
                ) : (
                  <CopilotLogo className="h-7 w-7 rounded-lg" />
                )}
                <div className={`p-3 rounded-2xl text-xs leading-relaxed font-semibold shadow-sm ${
                  chat.sender === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                }`}>
                  {chat.message}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 max-w-[90%]">
                <CopilotLogo className="h-7 w-7 rounded-lg" />
                <div className="p-3 rounded-2xl text-xs bg-white text-slate-400 border border-slate-100 rounded-tl-none animate-pulse flex items-center gap-1 font-semibold shadow-sm">
                  <span>Thinking</span>
                  <span className="flex gap-0.5 mt-1">
                    <span className="h-0.5 w-0.5 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="h-0.5 w-0.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                    <span className="h-0.5 w-0.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form Input */}
          <div className="p-3 border-t border-slate-100 bg-white flex gap-2">
            <input
              type="text"
              placeholder="Ask support..."
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={loading}
              className="flex-1 rounded-lg border border-slate-200 bg-slate-50/50 py-1.5 px-3 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !inputMsg.trim()}
              className="rounded-lg bg-blue-600 hover:bg-blue-700 px-3 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
