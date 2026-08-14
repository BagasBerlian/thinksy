"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface RealtimeEvent {
  type:
    | "NEW_ESSAY_SUBMISSION"
    | "ESSAY_GRADED"
    | "SOAL_PUBLISHED"
    | "ATTENDANCE_CHECKIN"
    | "TEACHER_ADDED"
    | "STUDENT_ADDED"
    | "CLASS_CREATED";
  payload?: any;
  timestamp: string;
}

export function useRealtimeDashboard(onEventReceived?: (event: RealtimeEvent) => void) {
  const [latestEvent, setLatestEvent] = useState<RealtimeEvent | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // Subscribe to a shared Supabase Realtime Channel
    const channel = supabase.channel("realtime-dashboard-global", {
      config: {
        broadcast: { self: true },
      },
    });

    channel
      .on("broadcast", { event: "dashboard_action" }, ({ payload }) => {
        const eventData = payload as RealtimeEvent;
        setLatestEvent(eventData);
        if (onEventReceived) {
          onEventReceived(eventData);
        }
      })
      .on("postgres_changes", { event: "*", schema: "public" }, (payload) => {
        const eventData: RealtimeEvent = {
          type: "NEW_ESSAY_SUBMISSION",
          payload: payload.new,
          timestamp: new Date().toISOString(),
        };
        setLatestEvent(eventData);
        if (onEventReceived) {
          onEventReceived(eventData);
        }
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setIsConnected(true);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const broadcastEvent = async (type: RealtimeEvent["type"], payload?: any) => {
    const supabase = createClient();
    const channel = supabase.channel("realtime-dashboard-global");

    await channel.send({
      type: "broadcast",
      event: "dashboard_action",
      payload: {
        type,
        payload,
        timestamp: new Date().toISOString(),
      },
    });
  };

  return {
    latestEvent,
    isConnected,
    broadcastEvent,
  };
}
