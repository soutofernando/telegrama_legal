import type { FeedbackStatus, FeedbackType } from "@/types/database";

export const FEEDBACK_TYPE_LABELS: Record<FeedbackType, string> = {
  feedback: "Feedback",
  complaint: "Reclamação",
  suggestion: "Sugestão",
};

export const FEEDBACK_STATUS_LABELS: Record<FeedbackStatus, string> = {
  new: "Novo",
  in_progress: "Em análise",
  resolved: "Resolvido",
};

export const FEEDBACK_STATUS_BADGE: Record<
  FeedbackStatus,
  "default" | "warning" | "success"
> = {
  new: "default",
  in_progress: "warning",
  resolved: "success",
};
