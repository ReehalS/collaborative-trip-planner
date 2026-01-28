'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Trip, Activity } from '@utils/typeDefs';
import { AiOutlineClose, AiOutlineSend } from 'react-icons/ai';
import { CircularProgress } from '@mui/material';

interface AISuggestion {
  activityName: string;
  notes: string;
  estimatedDuration: string;
  categories: string[];
  suggestedTimeOfDay: string;
}

interface AISuggestionsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  activities: Activity[];
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestions?: AISuggestion[];
}

const timeOfDayLabels: Record<string, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
  any: 'Any time',
};

export default function AISuggestionsPanel({
  isOpen,
  onClose,
  trip,
  activities,
}: AISuggestionsPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const hasLoadedInitial = useRef(false);

  const location = trip.city ? `${trip.city}, ${trip.country}` : trip.country;

  const fetchSuggestions = async (userMessage?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/suggest-activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: trip.city,
          country: trip.country,
          existingActivities: activities.map((a) => a.activityName),
          numberOfDays: 3,
          userPreferences: userMessage || '',
        }),
      });
      const data = await res.json();
      return data.suggestions || [];
    } catch (err) {
      console.error('AI suggest error:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !hasLoadedInitial.current) {
      hasLoadedInitial.current = true;
      (async () => {
        const suggestions = await fetchSuggestions();
        setMessages([
          {
            id: '1',
            role: 'assistant',
            content: `Here are some activity suggestions for ${location}:`,
            suggestions,
          },
        ]);
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    const suggestions = await fetchSuggestions(input);
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: `Here are suggestions based on your request:`,
      suggestions,
    };
    setMessages((prev) => [...prev, assistantMessage]);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-[500px] max-w-full bg-white shadow-elevated z-50 flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-surface-200">
          <div>
            <h3 className="font-semibold text-surface-900">
              Activity Suggestions
            </h3>
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
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && isLoading && (
            <div className="flex items-center gap-3 justify-center py-8">
              <CircularProgress size={24} />
              <span className="text-sm text-surface-500">
                Finding great activities for you...
              </span>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className="space-y-3">
              {msg.role === 'user' ? (
                <div className="flex justify-end">
                  <div className="max-w-[85%] bg-primary-500 text-white rounded-card px-3 py-2 text-sm">
                    {msg.content}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-sm text-surface-700 font-medium">
                    {msg.content}
                  </div>
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="space-y-2">
                      {msg.suggestions.map((s, i) => (
                        <div
                          key={i}
                          className="bg-surface-50 rounded-card border border-surface-200 p-3"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="font-semibold text-surface-900 text-sm">
                              {s.activityName}
                            </h4>
                            <span className="text-xs text-surface-400 whitespace-nowrap flex-shrink-0">
                              {s.estimatedDuration}
                            </span>
                          </div>
                          <p className="text-xs text-surface-600 leading-relaxed mb-2">
                            {s.notes}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 mb-2">
                            {s.categories.map((cat) => (
                              <span
                                key={cat}
                                className="text-xs font-medium bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full"
                              >
                                {cat}
                              </span>
                            ))}
                            <span className="text-xs text-surface-400">
                              {timeOfDayLabels[s.suggestedTimeOfDay] ||
                                s.suggestedTimeOfDay}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              router.push(
                                `/trips/${
                                  trip.id
                                }/create-activity?name=${encodeURIComponent(
                                  s.activityName
                                )}`
                              );
                              onClose();
                            }}
                            className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                          >
                            + Add to Trip
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {isLoading && messages.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-surface-500">
              <CircularProgress size={16} />
              <span>Finding activities...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-surface-200 bg-surface-50">
          <p className="text-xs text-surface-500 mb-2">
            Refine suggestions (e.g., "outdoor activities" or "family-friendly")
          </p>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What are you looking for?"
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
      </div>
    </>
  );
}
