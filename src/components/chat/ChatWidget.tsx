import { useEffect, useRef, useState } from 'react';

type ChatRole = 'user' | 'assistant';

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
}

interface ChatWidgetProps {
  userName: string;
}

const CHAT_API_URL = 'https://siemens-agent-api.azurewebsites.net/api/chat';
const CHAT_STORAGE_KEY_PREFIX = 'se-treasury-chat-session';

function createMessageId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeStoredMessages(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry) => {
    if (!entry || typeof entry !== 'object') {
      return [];
    }

    const candidate = entry as Partial<ChatMessage>;
    if (
      (candidate.role === 'user' || candidate.role === 'assistant')
      && typeof candidate.content === 'string'
      && candidate.content.trim()
    ) {
      return [{
        id: typeof candidate.id === 'string' && candidate.id ? candidate.id : createMessageId(),
        role: candidate.role,
        content: candidate.content,
      }];
    }

    return [];
  });
}

function loadStoredMessages(storageKey: string) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return [];
    }

    return normalizeStoredMessages(JSON.parse(raw));
  } catch {
    return [];
  }
}

function extractAssistantText(payload: unknown): string {
  if (typeof payload === 'string') {
    return payload.trim();
  }

  if (Array.isArray(payload)) {
    return payload
      .map((item) => extractAssistantText(item))
      .filter(Boolean)
      .join('\n')
      .trim();
  }

  if (!payload || typeof payload !== 'object') {
    return '';
  }

  const record = payload as Record<string, unknown>;

  for (const key of ['answer', 'response', 'reply', 'message', 'content', 'output']) {
    const candidate = record[key];
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim();
    }
  }

  if (Array.isArray(record.messages)) {
    const assistantMessage = [...record.messages]
      .reverse()
      .find((entry) => (
        entry
        && typeof entry === 'object'
        && 'role' in entry
        && 'content' in entry
        && (entry as { role?: unknown }).role === 'assistant'
        && typeof (entry as { content?: unknown }).content === 'string'
      ));

    if (assistantMessage && typeof (assistantMessage as { content?: unknown }).content === 'string') {
      return ((assistantMessage as { content: string }).content).trim();
    }
  }

  if (Array.isArray(record.choices)) {
    for (const choice of record.choices) {
      if (!choice || typeof choice !== 'object') {
        continue;
      }

      const choiceRecord = choice as Record<string, unknown>;
      if (typeof choiceRecord.text === 'string' && choiceRecord.text.trim()) {
        return choiceRecord.text.trim();
      }

      const nestedMessage = choiceRecord.message;
      if (nestedMessage && typeof nestedMessage === 'object') {
        const content = (nestedMessage as Record<string, unknown>).content;
        if (typeof content === 'string' && content.trim()) {
          return content.trim();
        }
      }
    }
  }

  if ('data' in record) {
    return extractAssistantText(record.data);
  }

  return '';
}

export function ChatWidget({ userName }: ChatWidgetProps) {
  const storageKey = `${CHAT_STORAGE_KEY_PREFIX}:${userName || 'guest'}`;
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadStoredMessages(storageKey));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setMessages(loadStoredMessages(storageKey));
    setInputValue('');
    setError('');
    setIsOpen(false);
    setIsLoading(false);
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
  }, [storageKey]);

  useEffect(() => {
    if (messages.length === 0) {
      localStorage.removeItem(storageKey);
      return;
    }

    localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, storageKey]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    textareaRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const container = messagesContainerRef.current;
    if (!container) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth',
    });
  }, [isLoading, isOpen, messages]);

  useEffect(() => () => {
    abortControllerRef.current?.abort();
  }, []);

  const clearSession = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsLoading(false);
    setIsOpen(false);
    setInputValue('');
    setError('');
    setMessages([]);
    localStorage.removeItem(storageKey);
  };

  const handleSubmit = async () => {
    const message = inputValue.trim();
    if (!message || isLoading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: 'user',
      content: message,
    };

    const conversationHistory = messages.map((entry) => ({
      role: entry.role,
      content: entry.content,
    }));

    const controller = new AbortController();

    abortControllerRef.current = controller;
    setError('');
    setInputValue('');
    setMessages((current) => [...current, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          ...(conversationHistory.length > 0 ? { conversation_history: conversationHistory } : {}),
        }),
        signal: controller.signal,
      });

      const rawText = await response.text();
      let payload: unknown = rawText;

      if (rawText) {
        try {
          payload = JSON.parse(rawText);
        } catch {
          payload = rawText;
        }
      }

      if (!response.ok) {
        const responseError = extractAssistantText(payload) || `Request failed with status ${response.status}.`;
        throw new Error(responseError);
      }

      const assistantText = extractAssistantText(payload);
      if (!assistantText) {
        throw new Error('The chatbot returned an empty response.');
      }

      setMessages((current) => [
        ...current,
        {
          id: createMessageId(),
          role: 'assistant',
          content: assistantText,
        },
      ]);
    } catch (submitError) {
      if ((submitError as Error).name === 'AbortError') {
        return;
      }

      setMessages((current) => current.filter((entry) => entry.id !== userMessage.id));
      setInputValue(message);
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Unable to reach the chatbot right now. Please try again.',
      );
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`chat-widget-root${isOpen ? ' chat-widget-open' : ''}`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 220,
        pointerEvents: 'none',
      }}
    >
      {isOpen ? (
        <button
          type="button"
          className="chat-widget-backdrop"
          onClick={clearSession}
          aria-label="Close chatbot"
          style={{
            position: 'absolute',
            inset: 0,
            border: 'none',
            background: 'rgba(6, 8, 17, 0.42)',
            backdropFilter: 'blur(4px)',
            pointerEvents: 'auto',
          }}
        />
      ) : null}

      <div
        className="chat-widget-shell"
        style={{
          position: 'absolute',
          right: 24,
          bottom: 40,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'flex-end',
          pointerEvents: 'none',
        }}
      >
      {isOpen ? (
        <div
          className="chat-widget-panel"
          style={{
            width: 'min(390px, calc(100vw - 24px))',
            height: 'min(560px, calc(100vh - 120px))',
            minWidth: 0,
            minHeight: 0,
            borderRadius: 28,
            border: '1px solid var(--color-border-2)',
            background:
              'linear-gradient(180deg, rgba(49, 38, 86, 0.98) 0%, rgba(27, 21, 52, 0.98) 100%)',
            boxShadow: '0 30px 80px rgba(5, 4, 18, 0.45)',
            backdropFilter: 'blur(18px)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            pointerEvents: 'auto',
          }}
        >
          <div
            className="chat-widget-header"
            style={{
              padding: '18px 18px 16px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              background:
                'linear-gradient(135deg, rgba(0, 153, 153, 0.18), rgba(138, 0, 229, 0.2))',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div className="chat-widget-header-copy">
              <div
                className="chat-widget-kicker"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 1.2,
                  textTransform: 'uppercase',
                  color: 'rgba(244, 243, 251, 0.72)',
                }}
              >
                Treasury Assistant
              </div>
              <div
                className="chat-widget-title"
                style={{
                  marginTop: 8,
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#ffffff',
                }}
              >
                Ask treasury questions in context
              </div>
              <div
                className="chat-widget-subtitle"
                style={{
                  marginTop: 6,
                  fontSize: 12,
                  lineHeight: 1.6,
                  color: 'rgba(244, 243, 251, 0.74)',
                }}
              >
                Conversation history stays in this local session and resets when you close the window.
              </div>
            </div>

            <button
              type="button"
              onClick={clearSession}
              className="chat-widget-close"
              aria-label="Close chatbot"
              style={{
                width: 36,
                height: 36,
                borderRadius: 9999,
                border: '1px solid rgba(255, 255, 255, 0.12)',
                background: 'rgba(16, 12, 34, 0.5)',
                color: '#ffffff',
                fontSize: 20,
                lineHeight: 1,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              &times;
            </button>
          </div>

          <div
            ref={messagesContainerRef}
            aria-live="polite"
            className="chat-widget-messages"
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              padding: 18,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              background:
                'radial-gradient(circle at top right, rgba(0, 153, 153, 0.09), transparent 28%), radial-gradient(circle at bottom left, rgba(138, 0, 229, 0.12), transparent 30%)',
            }}
          >
            {messages.length === 0 ? (
              <div
                className="chat-widget-empty"
                style={{
                  marginTop: 'auto',
                  marginBottom: 'auto',
                  padding: 18,
                  borderRadius: 22,
                  border: '1px dashed rgba(255, 255, 255, 0.12)',
                  background: 'rgba(36, 28, 68, 0.55)',
                  color: 'rgba(244, 243, 251, 0.72)',
                  fontSize: 13,
                  lineHeight: 1.7,
                }}
              >
                Start a new conversation to query the Siemens agent. Follow-up questions automatically send the
                earlier chat history for context.
              </div>
            ) : null}

            {messages.map((entry) => (
              <div
                key={entry.id}
                className={`chat-widget-message chat-widget-message-${entry.role}`}
                style={{
                  alignSelf: entry.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '86%',
                  padding: '12px 14px',
                  borderRadius: entry.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background:
                    entry.role === 'user'
                      ? 'linear-gradient(135deg, rgba(0, 153, 153, 0.88), rgba(138, 0, 229, 0.88))'
                      : 'rgba(36, 28, 68, 0.9)',
                  border:
                    entry.role === 'user'
                      ? '1px solid rgba(0, 153, 153, 0.22)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#ffffff',
                  boxShadow:
                    entry.role === 'user'
                      ? '0 14px 28px rgba(0, 153, 153, 0.16)'
                      : '0 14px 28px rgba(5, 4, 18, 0.18)',
                }}
              >
                <div
                  style={{
                    marginBottom: 6,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    opacity: 0.74,
                  }}
                >
                  {entry.role === 'user' ? 'You' : 'Assistant'}
                </div>
                <div
                  style={{
                    whiteSpace: 'pre-wrap',
                    fontSize: 13,
                    lineHeight: 1.7,
                  }}
                >
                  {entry.content}
                </div>
              </div>
            ))}

            {isLoading ? (
              <div
                className="chat-widget-message chat-widget-message-assistant"
                style={{
                  alignSelf: 'flex-start',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 14px',
                  borderRadius: '18px 18px 18px 4px',
                  background: 'rgba(36, 28, 68, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: 'rgba(244, 243, 251, 0.84)',
                  fontSize: 12,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 9999,
                    background: 'var(--color-accent)',
                    animation: 'pulse-dot 1.2s ease-in-out infinite',
                  }}
                />
                Thinking through your request...
              </div>
            ) : null}
          </div>

          <div
            className="chat-widget-composer"
            style={{
              flexShrink: 0,
              padding: 18,
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(20, 15, 39, 0.88)',
            }}
          >
            {error ? (
              <div
                role="alert"
                className="chat-widget-error"
                style={{
                  marginBottom: 12,
                  borderRadius: 14,
                  border: '1px solid rgba(255, 122, 122, 0.24)',
                  background: 'rgba(127, 29, 29, 0.18)',
                  padding: '10px 12px',
                  color: '#ffd1d1',
                  fontSize: 12,
                  lineHeight: 1.6,
                }}
              >
                {error}
              </div>
            ) : null}

            <div
              className="chat-widget-composer-inner"
              style={{
                display: 'grid',
                gap: 12,
              }}
            >
              <textarea
                ref={textareaRef}
                className="chat-widget-textarea"
                value={inputValue}
                onChange={(event) => {
                  setInputValue(event.target.value);
                  if (error) {
                    setError('');
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    void handleSubmit();
                  }
                }}
                rows={3}
                placeholder="Ask about liquidity, entities, accounts, funding, or summary data..."
                disabled={isLoading}
                style={{
                  width: '100%',
                  resize: 'none',
                  borderRadius: 18,
                  border: '1px solid rgba(0, 153, 153, 0.26)',
                  background: 'rgba(16, 12, 34, 0.9)',
                  color: '#ffffff',
                  padding: '14px 16px',
                  outline: 'none',
                  fontSize: 13,
                  lineHeight: 1.6,
                  minHeight: 96,
                }}
              />

              <div
                className="chat-widget-composer-actions"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div
                  className="chat-widget-composer-hint"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    color: 'var(--color-muted)',
                  }}
                >
                  `Enter` to send, `Shift + Enter` for a new line
                </div>

                <button
                  type="button"
                  onClick={() => {
                    void handleSubmit();
                  }}
                  className="chat-widget-send"
                  disabled={isLoading || !inputValue.trim()}
                  style={{
                    border: 'none',
                    borderRadius: 16,
                    background:
                      isLoading || !inputValue.trim()
                        ? 'rgba(180, 175, 207, 0.24)'
                        : 'linear-gradient(135deg, #009999, #8a00e5)',
                    color: '#ffffff',
                    padding: '12px 18px',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: isLoading || !inputValue.trim() ? 'not-allowed' : 'pointer',
                    boxShadow: isLoading || !inputValue.trim() ? 'none' : '0 18px 32px rgba(0, 153, 153, 0.22)',
                  }}
                >
                  {isLoading ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="chat-widget-launcher"
          aria-label="Open chatbot"
          style={{
            width: 64,
            height: 64,
            marginLeft: 'auto',
            border: 'none',
            borderRadius: 9999,
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #009999, #8a00e5)',
            color: '#ffffff',
            boxShadow: '0 24px 42px rgba(0, 153, 153, 0.28)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'auto',
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M7 10.25h10M7 14.25h6.5M12 3.75c4.97 0 9 3.525 9 7.875 0 2.107-.945 4.021-2.48 5.432-.421.387-.702.904-.784 1.47l-.236 1.618c-.09.616-.75.968-1.307.697l-2.198-1.069a2.145 2.145 0 0 0-1.347-.17c-.54.124-1.095.187-1.648.187-4.97 0-9-3.525-9-7.875S7.03 3.75 12 3.75Z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ) : null}
      </div>
    </div>
  );
}
