interface MessageAlertProps {
  message: string;
  type: "error" | "success";
}

export function MessageAlert({ message, type }: MessageAlertProps) {
  if (!message) return null;

  const classes =
    type === "error"
      ? "bg-red-50 border border-red-200 text-red-700 dark:bg-red-950 dark:border-red-800 dark:text-red-300"
      : "bg-green-50 border border-green-200 text-green-700 dark:bg-green-950 dark:border-green-800 dark:text-green-300";

  return (
    <p className={`mt-4 rounded-lg px-4 py-3 text-sm ${classes}`}>{message}</p>
  );
}

