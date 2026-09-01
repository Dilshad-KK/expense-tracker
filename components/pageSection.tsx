import React from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
};

const joinClasses = (...classes: Array<string | undefined>) =>
  classes.filter(Boolean).join(" ");

const PageSection = ({ children, className, contentClassName }: Props) => {
  return (
    <div className={joinClasses("page-body px-4 pt-2", className)}>
        <div
        className={joinClasses(
          "page-shell rounded-[28px] border border-base-content/10 bg-base-100/95 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur-sm dark:bg-base-200/80 dark:shadow-[0_22px_64px_rgba(2,6,23,0.45)] sm:p-5",
          contentClassName
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default PageSection;
