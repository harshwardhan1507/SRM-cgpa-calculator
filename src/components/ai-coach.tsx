'use client';

import { useState, useRef, useEffect } from 'react';
import { AcademicProfile } from '@/lib/academic-dna';
import { useFirebase } from '@/components/firebase-provider';
import { Button } from '@/components/ui/button';
import { Send, Sparkles, User, BrainCircuit, CornerDownLeft } from 'lucide-react';

interface AICoachProps {
  profile: AcademicProfile;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

const SUGGESTED_PROMPTS = [
  'How can I improve my CGPA?',
  'Which subjects should I focus on?',
  'How can I reach 9.5 SGPA?',
  'What are my weak areas?'
];

export default function AICoach({ profile }: AICoachProps) {
  const { user } = useFirebase();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Hello! I am your AI Academic Coach. Based on your current CGPA of **${profile.overallCGPA.toFixed(2)}**, I'm ready to help you plan your studies, target next semester's grades, or strengthen your weak domains. What would you like to ask?`
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    // Format chat history for Gemini API
    const chatHistory = messages.map((m) => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    try {
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'ai_coach_chat',
          profile,
          chatHistory,
          userQuestion: text.trim(),
          uid: user?.uid
        })
      });

      const data = await response.json();
      
      const replyMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: data.response || 'I was unable to retrieve a response from the coach.'
      };

      setMessages((prev) => [...prev, replyMsg]);
    } catch (e) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: 'Sorry, I failed to connect to the AI insights coach. Please check your network connection.'
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#090909] border border-border rounded-xl flex flex-col h-[500px]">
      {/* Header */}
      <div className="border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-white" />
          <h3 className="text-sm font-semibold text-white">Ask your AI Academic Coach</h3>
        </div>
        <div className="font-mono text-[9px] bg-neutral-900 border border-border px-2 py-0.5 rounded text-muted-foreground uppercase flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-white animate-pulse" />
          Context Aware
        </div>
      </div>

      {/* Messages */}
      <div className="flex-grow p-4 overflow-y-auto space-y-4 font-sans text-xs">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse text-right' : 'mr-auto text-left'}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center border shrink-0 ${
                  isUser ? 'bg-white border-white text-black' : 'bg-neutral-900 border-border text-white'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <BrainCircuit className="w-3.5 h-3.5" />}
              </div>
              <div
                className={`p-3 rounded-xl border leading-relaxed ${
                  isUser
                    ? 'bg-neutral-950 border-neutral-800 text-white rounded-tr-none'
                    : 'bg-neutral-900/40 border-border/50 text-neutral-200 rounded-tl-none prose prose-invert prose-xs'
                }`}
              >
                {/* Parse simple double astersks into bold */}
                {m.text.split('\n').map((paragraph, pIdx) => {
                  // Replace **text** with strong
                  const parts = paragraph.split('**');
                  return (
                    <p key={pIdx} className="mb-1 last:mb-0">
                      {parts.map((part, partIdx) => 
                        partIdx % 2 === 1 ? <strong key={partIdx} className="text-white font-semibold">{part}</strong> : part
                      )}
                    </p>
                  );
                })}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 max-w-[85%] mr-auto text-left">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center border bg-neutral-900 border-border text-white animate-pulse">
              <BrainCircuit className="w-3.5 h-3.5" />
            </div>
            <div className="p-3.5 rounded-xl border border-border/50 bg-neutral-900/40 rounded-tl-none flex items-center gap-1 text-[10px] text-muted-foreground font-mono animate-pulse">
              <span>Thinking...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Suggested prompts list */}
      <div className="px-4 py-2 border-t border-border/40 flex flex-wrap gap-1.5 bg-black/20">
        {SUGGESTED_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            disabled={loading}
            className="text-[10px] bg-neutral-900 hover:bg-neutral-800 border border-border text-muted-foreground hover:text-white px-2.5 py-1 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputValue);
        }}
        className="p-3 border-t border-border flex gap-2 bg-black/40"
      >
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Ask a question about your academic standing..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={loading}
            className="w-full text-xs bg-black border border-border rounded-xl px-4 py-3 pr-10 text-white placeholder-muted-foreground focus:outline-none focus:border-white transition-colors"
          />
          <div className="absolute right-3 top-3.5 flex items-center gap-1 font-mono text-[8px] text-muted-foreground hidden sm:flex border border-border rounded px-1.5 py-0.5">
            <span>Enter</span>
            <CornerDownLeft className="w-2 h-2" />
          </div>
        </div>
        <Button
          type="submit"
          disabled={loading || !inputValue.trim()}
          className="bg-white hover:bg-neutral-200 text-black p-3.5 rounded-xl shrink-0 cursor-pointer disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
