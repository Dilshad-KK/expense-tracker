import Link from "next/link";
import React from "react";

type Tone = "neutral" | "success" | "danger";

type BaseProps = {
  label: string;
  icon: React.ReactNode;
  tone?: Tone;
  disabled?: boolean;
  title?: string;
  className?: string;
};

type LinkProps = BaseProps & {
  href: string;
  onClick?: never;
};

type ButtonProps = BaseProps & {
  href?: never;
  onClick: () => void;
};

type Props = LinkProps | ButtonProps;

const joinClasses = (...classes: Array<string | undefined | false>) =>
  classes.filter(Boolean).join(" ");

const toneClasses: Record<Tone, string> = {
  neutral:
    "border-white/16 bg-white/12 text-white hover:bg-white/18 hover:border-white/22",
  success:
    "border-emerald-300/18 bg-emerald-300/14 text-emerald-50 hover:bg-emerald-300/20 hover:border-emerald-300/28",
  danger:
    "border-rose-300/18 bg-rose-400/14 text-rose-50 hover:bg-rose-400/20 hover:border-rose-300/28",
};

const sharedClassName = (tone: Tone, disabled?: boolean, className?: string) =>
  joinClasses(
    "inline-flex h-10 items-center justify-center gap-2 rounded-2xl border px-3",
    "text-xs font-poppinsBold tracking-[0.01em] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]",
    "transition-all duration-200 hover:-translate-y-0.5 active:scale-95",
    "backdrop-blur-md",
    toneClasses[tone],
    disabled && "pointer-events-none opacity-60",
    className
  );

const Content = ({ icon, label }: Pick<BaseProps, "icon" | "label">) => (
  <>
    <span className="text-[15px] leading-none">{icon}</span>
    <span className="hidden sm:inline">{label}</span>
  </>
);

const HeaderAction = (props: Props) => {
  const tone = props.tone ?? "neutral";

  if (typeof (props as LinkProps).href === "string") {
    const href = (props as LinkProps).href;
    return (
      <Link
        href={href}
        aria-label={props.label}
        title={props.title ?? props.label}
        className={sharedClassName(tone, props.disabled, props.className)}
      >
        <Content icon={props.icon} label={props.label} />
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={props.onClick}
      aria-label={props.label}
      title={props.title ?? props.label}
      disabled={props.disabled}
      className={sharedClassName(tone, props.disabled, props.className)}
    >
      <Content icon={props.icon} label={props.label} />
    </button>
  );
};

export default HeaderAction;
