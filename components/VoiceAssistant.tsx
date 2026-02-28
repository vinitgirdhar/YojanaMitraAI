
import React, { useState, useRef, useEffect } from 'react';
import { Mic, X, Send, Bot, User, Globe, MicOff, Loader } from 'lucide-react';
import { sendChatMessage, getChatHistory } from '../services/bedrockService';
import { askYojanaMitra, searchForSchemeUpdates } from '../services/geminiService';

interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
  sources?: any[];
  aiModel?: string;
}

const VoiceAssistant: React.FC<{ userContext?: any }> = ({ userContext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'bot', text: 'Namaste! I am YojanaMitra AI, powered by AWS Bedrock and Gemini. How can I help you discover government benefits today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [conversationId, setConversationId] = useState(`conv-${Date.now()}`);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Get current user ID (from Cognito or localStorage)
  const getUserId = (): string => {
    try {
      const userStr = sessionStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.userId || 'anonymous';
      }
    } catch (e) {
      console.error('Error getting user ID:', e);
    }
    return 'anonymous-' + Math.random().toString(36).substr(2, 9);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Start voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Please enable microphone access to use voice input');
    }
  };

  // Stop voice recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Process audio blob (convert to text via Transcribe)
  const processAudio = async (audioBlob: Blob) => {
    try {
      setIsLoading(true);
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsArrayBuffer(audioBlob);
      reader.onload = async () => {
        const audioBuffer = reader.result as ArrayBuffer;
        const audioBase64 = btoa(
          String.fromCharCode.apply(null, Array.from(new Uint8Array(audioBuffer)) as any)
        );

        // For MVP, show transcription would happen here
        // const transcription = await transcribeAudio(audioBase64);
        // setInput(transcription.text);
        
        // Fallback: visual feedback that audio was received
        setInput('[Audio received - Transcription would process here via AWS Transcribe]');
      };
    } catch (error) {
      console.error('Error processing audio:', error);
      alert('Error processing audio. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    const userId = getUserId();
    
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      // Try primary AI (Bedrock via Lambda API)
      let botResponse: ChatMessage = { role: 'bot', text: '', aiModel: 'Unknown' };
      
      try {
        const apiEndpoint = process.env.VITE_API_ENDPOINT || process.env.VITE_API_GATEWAY_URL;
        if (apiEndpoint) {
          // Call backend Lambda function for dual-AI processing
          const response = await sendChatMessage(
            userId,
            userMsg,
            conversationId,
            false, // useGemini fallback only if Bedrock fails
            userContext
          );
          botResponse = {
            role: 'bot',
            text: response.message,
            aiModel: response.aiModel
          };
        } else {
          // Fallback to Gemini if no backend API configured
          throw new Error('No API endpoint configured');
        }
      } catch (bedrockError) {
        console.warn('Bedrock API call failed, using Gemini fallback:', bedrockError);
        
        // Use Gemini as fallback
        const geminiResult = await askYojanaMitra(userMsg, userContext);
        botResponse = {
          role: 'bot',
          text: geminiResult.text,
          sources: geminiResult.groundingChunks,
          aiModel: 'Gemini 3 Flash (Fallback)'
        };
      }

      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'bot',
        text: 'Sorry, I encountered an error. Please try again.',
        aiModel: 'Error'
      }]);
    } finally {
      setIsLoading(false);
    }
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
              <div>
                <span className="font-semibold text-sm">YojanaMitra AI</span>
                <p className="text-[10px] text-blue-200">Powered by AWS Bedrock</p>
              </div>
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
                    {m.aiModel && (
                      <p className="text-[9px] text-gray-400 mt-1">via {m.aiModel}</p>
                    )}
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

          <div className="p-4 bg-white border-t border-gray-100 space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type or record your question..."
                className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366] text-gray-800 placeholder:text-gray-400"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading}
                className="bg-[#003366] text-white p-2 rounded-full hover:bg-[#002244] disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <div className="flex gap-2">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  title="Record voice input"
                  className="flex-1 bg-orange-100 text-[#FF9933] border border-[#FF9933] p-2 rounded-full hover:bg-orange-200 text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Mic className="w-4 h-4" />
                  Record
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  title="Stop recording"
                  className="flex-1 bg-red-100 text-red-600 border border-red-600 p-2 rounded-full hover:bg-red-200 text-sm font-medium flex items-center justify-center gap-2 animate-pulse"
                >
                  <MicOff className="w-4 h-4" />
                  Stop Rec
                </button>
              )}
              <span className="text-[10px] text-gray-400 flex items-center px-2">
                AWS Bedrock + Transcribe
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceAssistant;
