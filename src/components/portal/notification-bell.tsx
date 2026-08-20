import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { markNotificationsRead } from "@/server/actions/portal";
import type { Notification } from "@/server/repositories/types";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

/**
 * Notification bell.
 *
 * Native <details> again — no client JavaScript, keyboard accessible, works before
 * hydration. The unread count is rendered server-side so it is correct on first paint.
 */
export function NotificationBell({
  notifications,
  unreadCount,
}: {
  notifications: Notification[];
  unreadCount: number;
}) {
  return (
    <details className="relative [&_summary::-webkit-details-marker]:hidden">
      <summary
        className="hover:bg-surface relative flex cursor-pointer list-none items-center rounded-full p-2 transition-colors"
        aria-label={
          unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"
        }
      >
        <Bell className="text-muted-foreground size-5" />
        {unreadCount > 0 && (
          <span className="bg-accent text-accent-foreground absolute top-0.5 right-0.5 flex size-4.5 items-center justify-center rounded-full text-[10px] font-semibold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </summary>

      <div className="border-border bg-surface-raised absolute right-0 z-50 mt-2 w-80 rounded-xl border shadow-lg">
        <div className="border-border flex items-center justify-between gap-3 border-b px-4 py-3">
          <h2 className="text-sm font-semibold">Notifications</h2>
          {unreadCount > 0 && (
            <form action={markNotificationsRead}>
              <button
                type="submit"
                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs"
              >
                <CheckCheck className="size-3.5" />
                Mark all read
              </button>
            </form>
          )}
        </div>

        {notifications.length === 0 ? (
          <p className="text-muted-foreground px-4 py-8 text-center text-sm">
            Nothing yet. We&apos;ll tell you the moment anything moves.
          </p>
        ) : (
          <ul className="max-h-96 divide-y divide-[var(--border)] overflow-y-auto">
            {notifications.map((notification) => {
              const content = (
                <div
                  className={cn(
                    "px-4 py-3",
                    !notification.read && "bg-ink-50/60 dark:bg-ink-950/40",
                  )}
                >
                  <p className="text-sm font-medium">{notification.title}</p>
                  <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs">
                    {notification.body}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {formatDate(notification.at)}
                  </p>
                </div>
              );

              return (
                <li key={notification.id}>
                  {notification.href ? (
                    <Link href={notification.href} className="hover:bg-surface block">
                      {content}
                    </Link>
                  ) : (
                    content
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </details>
  );
}
