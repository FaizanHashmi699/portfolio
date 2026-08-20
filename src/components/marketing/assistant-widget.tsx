"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Bot, Loader2, Send, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";

interface Answer {
  question: string;
  answer: string;
  sources: { title: string; href: string }[];
  source: "model" | "retrieval";
}

const SUGGESTIONS = [
  "What does a Golden Visa actually cost?",
  "How do I attest an Indian degree for the UAE?",
  "Which free zone is cheapest with one visa?",
  "Why do UAE tourist visas get rejected?",
];

/**
 * The assistant.
 *
 * Answers strictly from our published catalog, and says which page each answer came from
 * so the reader can check it rather than take our word for it. It is a shortcut to the
 * pages, not a replacement for them.
 */
export function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Answer[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  async function ask(text: string) {
    const trimmed = text.trim();
    if (trimmed.length < 2 || pending) return;

    setPending(true);
    setError(null);
    setQuestion("");

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setHistory((previous) => [
        ...previous,
        {
          question: trimmed,
          answer: data.answer,
          sources: data.sources ?? [],
          source: data.source,
        },
      ]);
    } catch {
      setError("Couldn't reach the assistant. Please try again.");
    } finally {
      setPending(false);
      inputRef.current?.focus();
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="border-border bg-surface-raised hover:bg-surface fixed end-20 bottom-4 z-40 flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-medium shadow-lg transition-colors"
        aria-label="Ask about UAE visas"
      >
        <Sparkles className="text-accent-text size-4" />
        <span className="hidden sm:inline">Ask a question</span>
      </button>
    );
  }

  return (
    <div
      className="border-border bg-surface-raised rounded-card fixed inset-x-3 bottom-3 z-50 flex max-h-[80dvh] flex-col border shadow-2xl sm:inset-x-auto sm:end-4 sm:bottom-4 sm:w-[26rem]"
      role="dialog"
      aria-label="Assistant"
    >
      <div className="border-border flex items-center justify-between gap-3 border-b px-4 py-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Bot className="text-primary size-4" />
          Ask about UAE visas
        </h2>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close assistant"
          className="hover:bg-surface rounded-full p-1.5"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {history.length === 0 && (
          <>
            <p className="text-muted-foreground text-sm">
              I answer from what this site publishes — real prices, real requirements —
              and I tell you which page each answer came from. I can&apos;t decide your
              eligibility; the{" "}
              <Link
                href="/eligibility"
                className="text-primary underline underline-offset-4"
              >
                eligibility check
              </Link>{" "}
              does that.
            </p>
            <ul className="mt-4 space-y-2">
              {SUGGESTIONS.map((suggestion) => (
                <li key={suggestion}>
                  <button
                    type="button"
                    onClick={() => ask(suggestion)}
                    className="border-border hover:bg-surface w-full rounded-xl border px-3 py-2.5 text-start text-sm"
                  >
                    {suggestion}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        <ol className="space-y-5">
          {history.map((item, index) => (
            <li key={index}>
              <p className="bg-ink-600 text-primary-foreground ms-auto w-fit max-w-[85%] rounded-2xl px-3.5 py-2 text-sm">
                {item.question}
              </p>
              <div className="bg-surface border-border mt-2.5 rounded-2xl border p-3.5">
                <p className="text-sm whitespace-pre-wrap">{item.answer}</p>

                {item.sources.length > 0 && (
                  <ul className="border-border mt-3 flex flex-wrap gap-2 border-t pt-3">
                    {item.sources.map((source) => (
                      <li key={source.href}>
                        <Link
                          href={source.href}
                          className="border-border hover:bg-surface-raised rounded-pill border px-2.5 py-1 text-xs"
                        >
                          {source.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}

                {item.source === "retrieval" && (
                  <p className="text-muted-foreground mt-2.5 text-xs">
                    Answered directly from our catalog.
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>

        {pending && (
          <p className="text-muted-foreground mt-4 flex items-center gap-2 text-sm">
            <Loader2 className="size-4 animate-spin" />
            Looking that up…
          </p>
        )}

        {error && (
          <p role="alert" className="text-danger-600 dark:text-danger-500 mt-4 text-sm">
            {error}
          </p>
        )}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void ask(question);
        }}
        className="border-border flex items-center gap-2 border-t p-3"
      >
        <label htmlFor="assistant-question" className="sr-only">
          Your question
        </label>
        <Input
          ref={inputRef}
          id="assistant-question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask about a visa, a cost, a country…"
          maxLength={500}
          disabled={pending}
          className="h-10"
        />
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={pending || question.trim().length < 2}
          aria-label="Send question"
        >
          <Send className="size-4" />
        </Button>
      </form>

      <p className="text-muted-foreground border-border border-t px-4 py-2.5 text-xs">
        Information, not advice. No visa outcome can be guaranteed.
      </p>
    </div>
  );
}
