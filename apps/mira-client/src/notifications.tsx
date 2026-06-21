import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AlertCircle, Info, TriangleAlert, X } from "lucide-react";

export type NotificationType = "info" | "warning" | "error";

export type AppNotification = {
  id: string;
  message: string;
  title?: string;
  type: NotificationType;
  createdAt: number;
};

type NotificationInput = {
  message: string;
  title?: string;
  type: NotificationType;
};

type NotificationContextValue = {
  clearNotifications: () => void;
  dismissToast: (id: string) => void;
  notifications: AppNotification[];
  notify: (notification: NotificationInput) => string;
  removeNotification: (id: string) => void;
  visibleToasts: AppNotification[];
};

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);
const toastDurationMs = 5_000;

function createNotificationId() {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function NotificationIcon({ type }: { type: NotificationType }) {
  if (type === "error") {
    return <AlertCircle size={18} />;
  }

  if (type === "warning") {
    return <TriangleAlert size={18} />;
  }

  return <Info size={18} />;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [visibleToastIds, setVisibleToastIds] = useState<string[]>([]);
  const toastTimers = useRef<Map<string, number>>(new Map());

  const dismissToast = useCallback((id: string) => {
    const timerId = toastTimers.current.get(id);

    if (timerId) {
      window.clearTimeout(timerId);
      toastTimers.current.delete(id);
    }

    setVisibleToastIds((currentIds) => currentIds.filter((currentId) => currentId !== id));
  }, []);

  const notify = useCallback(
    (notification: NotificationInput) => {
      const id = createNotificationId();
      const nextNotification: AppNotification = {
        ...notification,
        id,
        createdAt: Date.now(),
      };

      setNotifications((currentNotifications) => [
        nextNotification,
        ...currentNotifications,
      ]);
      setVisibleToastIds((currentIds) => [id, ...currentIds]);

      const timerId = window.setTimeout(() => {
        dismissToast(id);
      }, toastDurationMs);

      toastTimers.current.set(id, timerId);

      return id;
    },
    [dismissToast],
  );

  const removeNotification = useCallback(
    (id: string) => {
      dismissToast(id);
      setNotifications((currentNotifications) =>
        currentNotifications.filter((notification) => notification.id !== id),
      );
    },
    [dismissToast],
  );

  const clearNotifications = useCallback(() => {
    for (const timerId of toastTimers.current.values()) {
      window.clearTimeout(timerId);
    }

    toastTimers.current.clear();
    setNotifications([]);
    setVisibleToastIds([]);
  }, []);

  const visibleToasts = useMemo(() => {
    const notificationsById = new Map(
      notifications.map((notification) => [notification.id, notification]),
    );

    return visibleToastIds
      .map((id) => notificationsById.get(id))
      .filter((notification): notification is AppNotification => Boolean(notification));
  }, [notifications, visibleToastIds]);

  const contextValue = useMemo(
    () => ({
      clearNotifications,
      dismissToast,
      notifications,
      notify,
      removeNotification,
      visibleToasts,
    }),
    [
      clearNotifications,
      dismissToast,
      notifications,
      notify,
      removeNotification,
      visibleToasts,
    ],
  );

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <div className="notification-toast-viewport" aria-live="polite">
        {visibleToasts.map((notification) => (
          <div
            className={`notification-toast notification-${notification.type}`}
            key={notification.id}
            role={notification.type === "error" ? "alert" : "status"}
          >
            <span className="notification-toast-icon" aria-hidden="true">
              <NotificationIcon type={notification.type} />
            </span>
            <div className="notification-toast-copy">
              {notification.title ? <strong>{notification.title}</strong> : null}
              <p>{notification.message}</p>
            </div>
            <button
              className="notification-toast-close"
              type="button"
              aria-label="Close notification"
              onClick={() => dismissToast(notification.id)}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error("useNotifications must be used inside NotificationProvider.");
  }

  return context;
}
