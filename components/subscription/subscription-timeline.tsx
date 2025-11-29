"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/providers/i18n-provider";
import {
  CheckCircle,
  RefreshCw,
  TrendingUp,
  Clock,
  XCircle,
  Pause,
  Play,
  AlertCircle,
  Calendar,
  Zap,
} from "lucide-react";

interface TimelineEvent {
  date: Date;
  type: "created" | "renewed" | "upgraded" | "suspended" | "resumed" | "cancelled" | "paused" | "unpaused" | "extended" | "trial_stopped";
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

interface SubscriptionTimelineProps {
  history: any[];
}

export function SubscriptionTimeline({ history }: SubscriptionTimelineProps) {
  const { t } = useI18n();
  const [events, setEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    if (!history || history.length === 0) return;

    const timelineEvents: TimelineEvent[] = history.map((item) => {
      const event = mapHistoryToEvent(item);
      return event;
    });

    setEvents(timelineEvents);
  }, [history]);

  const mapHistoryToEvent = (item: any): TimelineEvent => {
    const type = item.action?.toLowerCase() || "created";
    
    const eventMap: Record<string, { icon: React.ReactNode; color: string; bgColor: string }> = {
      created: { icon: <Zap className="h-4 w-4" />, color: "#10b981", bgColor: "bg-green-50" },
      renewed: { icon: <RefreshCw className="h-4 w-4" />, color: "#3b82f6", bgColor: "bg-blue-50" },
      upgraded: { icon: <TrendingUp className="h-4 w-4" />, color: "#8b5cf6", bgColor: "bg-purple-50" },
      suspended: { icon: <Pause className="h-4 w-4" />, color: "#f59e0b", bgColor: "bg-orange-50" },
      resumed: { icon: <Play className="h-4 w-4" />, color: "#10b981", bgColor: "bg-green-50" },
      cancelled: { icon: <XCircle className="h-4 w-4" />, color: "#ef4444", bgColor: "bg-red-50" },
      paused: { icon: <Clock className="h-4 w-4" />, color: "#f59e0b", bgColor: "bg-orange-50" },
      unpaused: { icon: <Play className="h-4 w-4" />, color: "#10b981", bgColor: "bg-green-50" },
      extended: { icon: <Calendar className="h-4 w-4" />, color: "#3b82f6", bgColor: "bg-blue-50" },
      trial_stopped: { icon: <CheckCircle className="h-4 w-4" />, color: "#10b981", bgColor: "bg-green-50" },
    };

    const config = eventMap[type] || eventMap.created;

    return {
      date: new Date(item.timestamp || item.createdAt),
      type: type as any,
      title: item.title || t(`subscription.history.${type}`),
      description: item.description || item.notes || "",
      icon: config.icon,
      color: config.color,
      bgColor: config.bgColor,
    };
  };

  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("subscription.timeline")}</CardTitle>
          <CardDescription>{t("subscription.timelineDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
            <p className="text-muted-foreground">{t("subscription.noHistory")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("subscription.timeline")}</CardTitle>
        <CardDescription>{t("subscription.timelineDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
          
          {/* Events */}
          <div className="space-y-6">
            {events.map((event, index) => (
              <div key={index} className="relative flex items-start gap-4">
                {/* Icon */}
                <div 
                  className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 ${event.bgColor}`}
                  style={{ borderColor: event.color }}
                >
                  <div style={{ color: event.color }}>
                    {event.icon}
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 pt-0.5 pb-6">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{event.title}</p>
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                        style={{ borderColor: event.color, color: event.color }}
                      >
                        {t(`subscription.statuses.${event.type}`)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(event.date)}
                    </p>
                  </div>
                  {event.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
