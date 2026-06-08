'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useEffect, useRef } from 'react';
import { Trip, Activity } from '@utils/typeDefs';
import { LuX, LuSendHorizonal } from 'react-icons/lu';

interface AIChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  activities: Activity[];
}

export default function AIChatPanel({
  isOpen,
  onClose,
  trip,
  activities,
}: AIChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');

  const chatOptions = {
    transport: {
      body: {
        tripContext: {
          city: trip.city,
          country: trip.country,
          activities: activities.map((a) => ({
            activityName: a.activityName,
          })),
        },
      },
    },
  };

  const { messages, sendMessage, status } = useChat(
    chatOptions as unknown as Parameters<typeof useChat>[0]
  );

  const isLoading = status === 'streaming' || status === 'submitted';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const location = trip.city ? `${trip.city}, ${trip.country}` : trip.country;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput('');
  };

  const handleQuickQuestion = (q: string) => {
    sendMessage({ text: q });
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-96 max-w-full bg-white shadow-elevated z-50 flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-200 bg-primary-50/50">
          <div>
            <h3 className="font-display font-semibold text-surface-900">
              Trip Assistant
            </h3>
            <p className="text-xs text-surface-500">{location}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-btn text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors"
          >
            <LuX className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-surface-500 mb-4">
                Ask me anything about your trip to {location}!
              </p>
              <div className="flex flex-col gap-2">
                {[
                  'What should I know before visiting?',
                  'Best restaurants nearby?',
                  'Transportation tips?',
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => handleQuickQuestion(q)}
                    className="text-xs text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-100 rounded-btn px-3 py-2 transition-colors text-left"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => {
            const textPart = msg.parts?.find((p) => p.type === 'text');
            const text = textPart && 'text' in textPart ? textPart.text : '';
            return (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-card px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary-500 text-white'
                      : 'bg-stone-100 text-surface-800 border border-stone-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{text}</p>
                </div>
              </div>
            );
          })}

          {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
            <div className="flex justify-start">
              <div className="bg-stone-100 border border-stone-200 rounded-card px-3.5 py-2.5 text-sm text-surface-500">
                Thinking...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="p-3 border-t border-stone-200 bg-stone-50 flex gap-2"
        >
          <input
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your trip..."
            className="flex-1 px-3 py-2 text-sm border border-stone-200 rounded-btn outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-200 transition-all bg-white"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-2 bg-primary-500 hover:bg-primary-600 disabled:bg-surface-200 text-white disabled:text-surface-400 rounded-btn transition-colors"
          >
            <LuSendHorizonal className="w-4 h-4" />
          </button>
        </form>
      </div>
    </>
  );
}
