"use client";

import { useCallback, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { applicableQuestions, type Question } from "@/domain/eligibility/questions";
import { assessEligibility } from "@/domain/eligibility/engine";
import type { ApplicantProfile, EligibilityReport } from "@/domain/eligibility/types";
import { EligibilityResult } from "./result";

/**
 * The eligibility wizard.
 *
 * The whole assessment runs client-side against the same pure rules engine the server
 * uses. That is a deliberate product decision, not a technical shortcut: no answer leaves
 * the browser unless the visitor explicitly asks us to save the report, which is what
 * lets us promise a genuine no-phone-number, no-sign-up check. Every competitor in this
 * market routes this exact interaction through a lead-capture form.
 */

const DEFAULTS: Partial<ApplicantProfile> = {
  nationality: "XX",
  yearsExperience: 0,
};

export function EligibilityWizard({ initialService }: { initialService?: string }) {
  const [answers, setAnswers] = useState<Partial<ApplicantProfile>>(DEFAULTS);
  const [index, setIndex] = useState(0);
  const [report, setReport] = useState<EligibilityReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const visible = useMemo(() => applicableQuestions(answers), [answers]);
  const question = visible[index];
  const isLast = index === visible.length - 1;

  const setAnswer = useCallback((id: string, value: unknown) => {
    setError(null);
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }, []);

  const currentValue = question
    ? (answers as Record<string, unknown>)[question.id as string]
    : undefined;

  const answered =
    question?.optional === true ||
    (currentValue !== undefined && currentValue !== "" && currentValue !== null);

  function goNext() {
    if (!question) return;
    if (!answered) {
      setError("Please answer this to continue.");
      return;
    }
    if (isLast) {
      setReport(
        assessEligibility({
          nationality: "XX",
          age: 30,
          purpose: "work",
          currentStatus: "outside-uae",
          education: "none",
          yearsExperience: 0,
          ...answers,
        } as ApplicantProfile),
      );
      return;
    }
    setIndex((i) => i + 1);
  }

  function restart() {
    setAnswers(DEFAULTS);
    setIndex(0);
    setReport(null);
    setError(null);
  }

  if (report) {
    return (
      <EligibilityResult
        report={report}
        onRestart={restart}
        initialService={initialService}
      />
    );
  }

  if (!question) return null;

  const progress = ((index + 1) / visible.length) * 100;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="text-muted-foreground flex items-center justify-between text-sm">
        <span>
          Question {index + 1} of {visible.length}
        </span>
        <button
          type="button"
          onClick={restart}
          className="hover:text-foreground inline-flex items-center gap-1.5"
        >
          <RotateCcw className="size-3.5" />
          Start over
        </button>
      </div>

      <div
        className="rounded-pill bg-border mt-3 h-1.5 overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progress through the eligibility check"
      >
        <div
          className="rounded-pill bg-accent h-full transition-[width] duration-400 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div
        key={question.id as string}
        className="mt-9 motion-safe:animate-[riseIn_0.35s_ease-out]"
      >
        <h2 className="text-h2">{question.title}</h2>
        {question.hint && <p className="text-muted-foreground mt-3">{question.hint}</p>}

        <div className="mt-7">
          <QuestionInput
            question={question}
            value={currentValue}
            onChange={(value) => setAnswer(question.id as string, value)}
            onCommit={goNext}
          />
        </div>

        {error && (
          <p role="alert" className="text-danger-600 dark:text-danger-500 mt-4 text-sm">
            {error}
          </p>
        )}

        <div className="mt-9 flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
          <Button type="button" variant="primary" onClick={goNext}>
            {isLast ? "See my result" : "Continue"}
            <ArrowRight className="size-4" />
          </Button>
          {question.optional && (
            <button
              type="button"
              onClick={goNext}
              className="text-muted-foreground hover:text-foreground text-sm underline underline-offset-4"
            >
              Skip
            </button>
          )}
        </div>
      </div>

      <p className="border-border text-muted-foreground mt-10 border-t pt-5 text-sm">
        Your answers stay in your browser. Nothing is sent to us, and nothing is stored,
        unless you choose to save your report at the end.
      </p>
    </div>
  );
}

function QuestionInput({
  question,
  value,
  onChange,
  onCommit,
}: {
  question: Question;
  value: unknown;
  onChange: (value: unknown) => void;
  onCommit: () => void;
}) {
  if (question.type === "single") {
    return (
      <fieldset>
        <legend className="sr-only">{question.title}</legend>
        <div className="grid gap-2.5">
          {question.options?.map((option) => {
            const selected = value === option.value;
            return (
              <label
                key={option.value}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                  selected
                    ? "border-accent bg-sand-50 dark:bg-sand-900/20"
                    : "border-border hover:bg-surface",
                )}
              >
                <input
                  type="radio"
                  name={question.id as string}
                  value={option.value}
                  checked={selected}
                  onChange={() => onChange(option.value)}
                  className="mt-1 size-4 accent-[var(--accent)]"
                />
                <span>
                  <span className="block font-medium">{option.label}</span>
                  {option.hint && (
                    <span className="text-muted-foreground mt-0.5 block text-sm">
                      {option.hint}
                    </span>
                  )}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
    );
  }

  if (question.type === "boolean") {
    return (
      <fieldset>
        <legend className="sr-only">{question.title}</legend>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {[
            { value: true, label: "Yes" },
            { value: false, label: "No / not sure" },
          ].map((option) => {
            const selected = value === option.value;
            return (
              <label
                key={String(option.value)}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors",
                  selected
                    ? "border-accent bg-sand-50 dark:bg-sand-900/20"
                    : "border-border hover:bg-surface",
                )}
              >
                <input
                  type="radio"
                  name={question.id as string}
                  checked={selected}
                  onChange={() => onChange(option.value)}
                  className="size-4 accent-[var(--accent)]"
                />
                <span className="font-medium">{option.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Input
        type="number"
        inputMode="numeric"
        min={question.min}
        max={question.max}
        value={value === undefined || value === null ? "" : String(value)}
        onChange={(event) => {
          const raw = event.target.value;
          onChange(raw === "" ? undefined : Number(raw));
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            onCommit();
          }
        }}
        aria-label={question.title}
        className="max-w-56 text-lg"
        autoFocus
      />
      {question.unit && <span className="text-muted-foreground">{question.unit}</span>}
    </div>
  );
}
