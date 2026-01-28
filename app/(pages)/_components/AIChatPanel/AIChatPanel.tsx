'use client';

import { useChat } from '@ai-sdk/react';
import { useEffect, useRef } from 'react';
import { Trip, Activity } from '@utils/typeDefs';
import { AiOutlineClose, AiOutlineSend } from 'react-icons/ai';

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

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: '/api/ai/chat',
      body: {
        tripContext: {
          city: trip.city,
          country: trip.country,
          activities: activities.map((a) => ({
            activityName: a.activityName,
          })),
        },
      },
    });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const location = trip.city ? `${trip.city}, ${trip.country}` : trip.country;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-96 max-w-full bg-white shadow-elevated z-50 flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-surface-200">
          <div>
            <h3 className="font-semibold text-surface-900">Trip Assistant</h3>
            <p className="text-xs text-surface-500">{location}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-btn text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors"
          >
            <AiOutlineClose className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-surface-500">
                Ask me anything about your trip to {location}!
              </p>
              <div className="mt-4 flex flex-col gap-2">
                {[
                  'What should I know before visiting?',
                  'Best restaurants nearby?',
                  'Transportation tips?',
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      const nativeInputValueSetter =
                        Object.getOwnPropertyDescriptor(
                          window.HTMLInputElement.prototype,
                          'value',
                        )?.set;
                      const inputEl = document.getElementById(
                        'chat-input',
                      ) as HTMLInputElement;
                      if (inputEl && nativeInputValueSetter) {
                        nativeInputValueSetter.call(inputEl, q);
                        inputEl.dispatchEvent(
                          new Event('input', { bubbles: true }),
                        );
                        inputEl.form?.requestSubmit();
                      }
                    }}
                    className="text-xs text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-btn px-3 py-2 transition-colors text-left"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-card px-3 py-2 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary-500 text-white'
                    : 'bg-surface-100 text-surface-800'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
            <div className="flex justify-start">
              <div className="bg-surface-100 rounded-card px-3 py-2 text-sm text-surface-500">
                Thinking...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="p-3 border-t border-surface-200 flex gap-2"
        >
          <input
            id="chat-input"
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about your trip..."
            className="flex-1 px-3 py-2 text-sm border border-surface-200 rounded-btn outline-none focus:border-primary-400 transition-colors"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-2 bg-primary-500 hover:bg-primary-600 disabled:bg-surface-200 text-white disabled:text-surface-400 rounded-btn transition-colors"
          >
            <AiOutlineSend className="w-4 h-4" />
          </button>
        </form>
      </div>
    </>
  );
}
