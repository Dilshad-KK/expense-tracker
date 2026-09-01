import React from "react";

type Props = {
  tone?: "success" | "error";
  children: React.ReactNode;
  className?: string;
};

const joinClasses = (...classes: Array<string | undefined>) =>
  classes.filter(Boolean).join(" ");

const toneClasses = {
  success: "border-success/20 bg-success/15 text-success-content",
  error: "border-error/20 bg-error/15 text-error-content",
};

const PageAlert = ({ tone = "success", children, className }: Props) => {
  return (
    <div
      role="alert"
      className={joinClasses(
        "rounded-2xl border px-4 py-3 text-sm shadow-sm",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </div>
  );
};

export default PageAlert;
