
import React, { useState, useRef, useEffect } from 'react';
import { Mic, X, Send, Bot, User, Globe } from 'lucide-react';
import { askYojanaMitra } from '../services/geminiService';

const VoiceAssistant: React.FC<{ userContext?: any }> = ({ userContext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string, sources?: any[] }[]>([
    { role: 'bot', text: 'Namaste! I am YojanaMitra AI. How can I help you discover government benefits today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    const result = await askYojanaMitra(userMsg, userContext);
    setMessages(prev => [...prev, { role: 'bot', text: result.text, sources: result.groundingChunks }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#FF9933] hover:bg-[#e68a2e] text-white p-4 rounded-full shadow-2xl transition-transform hover:scale-110 flex items-center justify-center"
        >
          <Mic className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl w-[320px] md:w-[400px] h-[500px] flex flex-col border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-[#003366] p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <span className="font-semibold">YojanaMitra AI</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl flex gap-2 ${
                  m.role === 'user' 
                  ? 'bg-[#003366] text-white rounded-tr-none' 
                  : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-none'
                }`}>
                  {m.role === 'bot' && <Bot className="w-4 h-4 mt-1 flex-shrink-0" />}
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm whitespace-pre-wrap">{m.text}</p>
                    {m.role === 'bot' && m.sources && m.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Sources</p>
                        <div className="flex flex-wrap gap-2">
                          {m.sources.map((chunk: any, idx: number) => (
                            chunk.web ? (
                              <a 
                                key={idx} 
                                href={chunk.web.uri} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-[10px] text-[#003366] hover:underline flex items-center gap-1 bg-gray-100 px-2 py-1 rounded"
                              >
                                <Globe className="w-2 h-2" />
                                {chunk.web.title || 'Source'}
                              </a>
                            ) : null
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 rounded-tl-none">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your question..."
              className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366] text-black placeholder:text-gray-400"
            />
            <button 
              onClick={handleSend}
              className="bg-[#003366] text-white p-2 rounded-full hover:bg-[#002244]"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceAssistant;
