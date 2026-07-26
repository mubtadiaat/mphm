"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/shared/ToastContext";

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOnline(navigator.onLine);

    const updateSyncCount = () => {
      try {
        const queue = JSON.parse(localStorage.getItem("offline_sync_queue") || "[]");
        setPendingSyncCount(queue.length);
      } catch {
        setPendingSyncCount(0);
      }
    };

    const handleOnline = async () => {
      setIsOnline(true);
      toast("Koneksi terhubung kembali (Online)! Menyinkronkan data luring...", "info", "Sistem Online");

      try {
        const queue = JSON.parse(localStorage.getItem("offline_sync_queue") || "[]");
        if (queue.length > 0) {
          let syncedCount = 0;
          for (const item of queue) {
            try {
              await fetch(item.url, {
                method: item.method || "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${localStorage.getItem("token") || ""}`,
                },
                body: JSON.stringify(item.body),
              });
              syncedCount++;
            } catch (e) {
              console.error("Failed to sync offline item:", item, e);
            }
          }
          localStorage.removeItem("offline_sync_queue");
          setPendingSyncCount(0);
          toast(`${syncedCount} data perubahan luring berhasil disinkronkan ke database!`, "success", "Sinkronisasi Berhasil");
        }
      } catch (err) {
        console.error("Error flushing offline queue:", err);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast("Koneksi terputus (Offline)! Perubahan akan disimpan sementara di memori luring (Cache).", "warning", "Mode Luring");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    updateSyncCount();

    const interval = setInterval(updateSyncCount, 3000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);

  return { isOnline, pendingSyncCount };
}

export function saveToOfflineQueue(url: string, method: string, body: any) {
  try {
    const queue = JSON.parse(localStorage.getItem("offline_sync_queue") || "[]");
    queue.push({ url, method, body, timestamp: Date.now() });
    localStorage.setItem("offline_sync_queue", JSON.stringify(queue));
  } catch (err) {
    console.error("Failed to save to offline queue:", err);
  }
}
