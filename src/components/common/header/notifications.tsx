"use client";

import { BellIcon, LetterIcon, SettingIcon } from "@/components/common/header/icons";
import { Button } from "@/components/tailgrids/core/button";
import { OverlayWrapper } from "@/components/tailgrids/core/overlay";
import { Popover } from "@/components/tailgrids/core/popover";
import { ScrollArea, ScrollAreaViewport, ScrollBar } from "@/components/tailgrids/core/scroll-area";
import { timeAgo } from "@/lib/format";
import {
  getMyNotificationsAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
  type NotificationItem,
} from "@/server/notification/actions";
import { cn } from "@/utils/cn";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Header, Heading } from "react-aria-components";

export function NotificationsButton() {
  const router = useRouter();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = items.filter((n) => n.isUnread).length;

  const refresh = useCallback(async () => {
    const res = await getMyNotificationsAction();
    setItems(res.items);
  }, []);

  // Load on mount and poll periodically so admins see new quotes without a reload.
  // refresh() only setStates after an awaited fetch (external system sync), not synchronously.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
    const timer = setInterval(() => void refresh(), 60_000);
    return () => clearInterval(timer);
  }, [refresh]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isOpen) void refresh();
  }, [isOpen, refresh]);

  async function handleOpenItem(item: NotificationItem) {
    setIsOpen(false);
    if (item.isUnread) {
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, isUnread: false } : i)));
      await markNotificationReadAction(item.id);
    }
    if (item.linkUrl) router.push(item.linkUrl);
  }

  async function handleMarkAllAsRead() {
    setItems((prev) => prev.map((i) => ({ ...i, isUnread: false })));
    await markAllNotificationsReadAction();
  }

  return (
    <OverlayWrapper isOpen={isOpen} onOpenChange={setIsOpen}>
      <Button
        iconOnly
        appearance="outline"
        className="relative size-10 rounded-lg border border-card-border bg-card-background text-icon-primary shadow-xs focus-visible:border-input-primary-focus-border focus-visible:ring-4 focus-visible:ring-input-primary-focus-border/20 [&>svg]:size-auto"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className={cn("absolute top-2 right-2.75 z-1 size-2 rounded-full bg-red-400")}>
            <span className="absolute inset-0 -z-1 animate-ping rounded-full bg-red-400 opacity-75" />
          </span>
        )}
      </Button>

      <Popover
        placement="bottom end"
        className="w-84.5 overflow-hidden rounded-2xl border border-border-secondary-alt bg-background-white-secondary p-0 shadow-3xl"
      >
        {/* Header */}
        <Header className="flex items-center justify-between border-b border-border-secondary-alt px-5 pt-5 pb-4">
          <Heading level={4} className="leading-6 font-semibold text-text-primary">
            Thông báo
          </Heading>

          <button
            className="p-1 text-icon-secondary transition-colors hover:text-icon-primary disabled:opacity-40"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            aria-label="Đánh dấu tất cả đã đọc"
          >
            <SettingIcon />
          </button>
        </Header>

        <ScrollArea className="h-100 max-h-100">
          <ScrollAreaViewport>
            {items.length === 0 ? (
              <div className="flex h-40 items-center justify-center px-5 text-center text-sm text-text-tertiary">
                Chưa có thông báo.
              </div>
            ) : (
              <ul className="flex-1 overflow-y-auto px-3 py-2">
                {items.map((notification) => (
                  <li key={notification.id}>
                    <button
                      className="group flex w-full cursor-pointer gap-3.5 rounded-lg px-3 py-3 transition-colors duration-300 hover:bg-background-gray-secondary_alt"
                      onClick={() => handleOpenItem(notification)}
                    >
                      {/* Icon */}
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border-secondary bg-background-gray-primary text-icon-secondary transition-all duration-300 group-hover:bg-brand-500 group-hover:text-base-white group-hover:shadow-[0_1px_3px_0.5px_rgba(13,13,18,0.08)]">
                        <LetterIcon />
                      </span>

                      {/* Content */}
                      <div className="min-w-0 flex-1 text-start">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm leading-5 font-semibold text-text-primary">
                            {notification.title}
                          </p>

                          {notification.isUnread && (
                            <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                          )}
                        </div>

                        {notification.body && (
                          <p className="mt-1 line-clamp-2 text-xs leading-4 text-text-secondary">
                            {notification.body}
                          </p>
                        )}
                        <p className="mt-2 text-xs leading-4 text-text-tertiary">
                          {timeAgo(notification.createdAt)}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </ScrollAreaViewport>
          <ScrollBar />
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border-secondary-alt px-5 py-4">
          <button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className="text-xs font-medium text-text-secondary underline transition-colors hover:text-text-primary disabled:opacity-40 disabled:no-underline"
          >
            Đánh dấu đã đọc tất cả
          </button>
        </div>
      </Popover>
    </OverlayWrapper>
  );
}
