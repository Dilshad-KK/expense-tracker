import React from "react";

type Props = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
};

const joinClasses = (...classes: Array<string | undefined>) =>
  classes.filter(Boolean).join(" ");

const PageEmptyState = ({ title, description, icon, action, className }: Props) => {
  return (
    <div
      className={joinClasses(
        "rounded-[28px] border border-base-content/10 bg-base-100/95 px-6 py-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur-sm dark:bg-base-200/80 dark:shadow-[0_22px_64px_rgba(2,6,23,0.45)]",
        className
      )}
    >
      {icon ? (
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[22px] bg-primary/10 text-primary">
          {icon}
        </div>
      ) : null}
      <h3 className="text-base font-poppinsBold text-base-content">{title}</h3>
      {description ? (
        <p className="mt-2 text-sm text-base-content/65">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
};

export default PageEmptyState;
