interface MessageAlertProps {
  type: "error" | "success";
  message: string;
}

export function MessageAlert({ type, message }: MessageAlertProps) {
  if (!message) return null;

  const styles =
    type === "error"
      ? "bg-red-50 border border-red-200 text-red-800"
      : "bg-green-50 border border-green-200 text-green-800";

  const icon = type === "error" ? "⚠️" : "✅";

  return (
    <div
      className={`${styles} p-4 rounded-lg mb-6 flex items-center gap-3 text-sm sm:text-base animate-fade-in`}
    >
      <span className="text-xl flex-shrink-0">{icon}</span>
      {message}
    </div>
  );
}

