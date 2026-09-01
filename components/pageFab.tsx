import Link from "next/link";
import React from "react";
import { FaPlus } from "react-icons/fa6";

type Props = {
  href: string;
  className?: string;
  icon?: React.ReactNode;
  ariaLabel?: string;
};

const PageFab = ({ href, className = "", icon, ariaLabel = "Add item" }: Props) => {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(88px+env(safe-area-inset-bottom,0px)+24px)] z-[2000]">
      <div className="page-frame flex justify-end">
        <Link
          href={href}
          aria-label={ariaLabel}
          className={`pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/20 bg-primary text-white shadow-lg transition-all hover:scale-105 hover:bg-primary-focus ${className}`.trim()}
        >
          {icon ?? <FaPlus className="text-base" />}
        </Link>
      </div>
    </div>
  );
};

export default PageFab;
