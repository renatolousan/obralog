interface MessageAlertProps {
  message: string;
  type?: "success" | "error";
}

export function MessageAlert({ message, type = "success" }: MessageAlertProps) {
  if (!message) return null;

  const classes =
    type === "error"
      ? "bg-slate-950 border border-red-800 text-red-300"
      : "bg-slate-950 border border-slate-700 text-slate-100";

  return (
    <div className={`sm:col-span-2 mt-2 px-3 py-2.5 rounded-lg text-sm ${classes}`}>
      {message}
    </div>
  );
}

