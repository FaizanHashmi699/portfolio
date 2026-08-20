"use client";

import { useActionState, useRef } from "react";
import { MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/field";
import { sendMessage, type PortalState } from "@/server/actions/portal";
import type { Message } from "@/server/repositories/types";
import { cn, formatDate } from "@/lib/utils";

const INITIAL: PortalState = { status: "idle" };

export function MessageThread({
  applicationId,
  messages,
  viewerRole,
}: {
  applicationId: string;
  messages: Message[];
  viewerRole: "customer" | "staff";
}) {
  const [state, action, pending] = useActionState(sendMessage, INITIAL);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="font-display text-h3 flex items-center gap-2.5">
          <MessageCircle className="text-primary size-5" />
          Messages
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">
          {viewerRole === "customer"
            ? "Anything you send here goes to the person handling your file, and stays attached to it."
            : "Written to the customer's portal immediately."}
        </p>

        {messages.length === 0 ? (
          <p className="text-muted-foreground mt-6 text-sm">No messages yet.</p>
        ) : (
          <ol className="mt-6 space-y-4">
            {messages.map((message) => {
              const mine = message.authorRole === viewerRole;
              return (
                <li
                  key={message.id}
                  className={cn("flex", mine ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3",
                      mine
                        ? "bg-ink-600 text-primary-foreground"
                        : "bg-surface border-border border",
                    )}
                  >
                    <p
                      className={cn(
                        "text-xs font-medium",
                        mine ? "text-primary-foreground/75" : "text-muted-foreground",
                      )}
                    >
                      {message.authorName} · {formatDate(message.at)}
                    </p>
                    <p className="mt-1.5 text-sm whitespace-pre-wrap">{message.body}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        <form
          ref={formRef}
          action={async (formData) => {
            await action(formData);
            formRef.current?.reset();
          }}
          className="mt-6"
        >
          <input type="hidden" name="applicationId" value={applicationId} />
          <label htmlFor="message-body" className="sr-only">
            Write a message
          </label>
          <Textarea
            id="message-body"
            name="body"
            rows={3}
            required
            minLength={2}
            placeholder={
              viewerRole === "customer"
                ? "Ask anything about this application…"
                : "Reply to the customer…"
            }
          />

          {state.status === "error" && state.message && (
            <p
              role="alert"
              className="text-danger-600 dark:text-danger-500 mt-2 text-sm"
            >
              {state.message}
            </p>
          )}

          <Button type="submit" variant="primary" className="mt-3" disabled={pending}>
            <Send className="size-4" />
            {pending ? "Sending…" : "Send"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
