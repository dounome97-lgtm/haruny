import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type AssetImageProps = {
  alt?: string;
  className?: string;
  height: number;
  priority?: boolean;
  src: string;
  width: number;
};

export function AssetImage({
  alt = "",
  className,
  height,
  priority,
  src,
  width,
}: AssetImageProps) {
  return (
    <Image
      alt={alt}
      aria-hidden={alt === "" ? true : undefined}
      className={className}
      height={height}
      priority={priority}
      src={src}
      width={width}
    />
  );
}

export function AppFrame({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-dvh bg-[var(--background)] px-5 py-7 min-[420px]:px-6">
      <div className="mx-auto flex min-h-[calc(100dvh-56px)] w-full max-w-[430px] flex-col gap-[22px]">
        {children}
      </div>
    </main>
  );
}

export function ScreenHeader({
  action,
  title,
}: {
  action?: ReactNode;
  title: string;
}) {
  return (
    <header className="flex items-center justify-between">
      <h1 className="text-[44px] font-black leading-tight tracking-normal text-[#202932] min-[420px]:text-[48px]">
        {title}
      </h1>
      {action}
    </header>
  );
}

export function IconCircleLink({
  href,
  src,
}: {
  href: string;
  src: string;
}) {
  return (
    <Link
      className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-2 ring-black/10"
      href={href}
    >
      <AssetImage height={34} src={src} width={34} />
    </Link>
  );
}

export function HeroMessageCard({
  body,
  icon,
  illustration,
  title,
}: {
  body: string;
  icon?: ReactNode;
  illustration?: ReactNode;
  title: string;
}) {
  return (
    <section className="relative min-h-[128px] overflow-hidden rounded-[24px] bg-[var(--surface-soft)] px-6 py-6 shadow-sm ring-1 ring-[#dfeadc]">
      <div className="relative z-10 flex max-w-[72%] items-center gap-4">
        {icon}
        <div>
          <h2 className="text-[26px] font-black leading-tight text-accent">{title}</h2>
          <p className="mt-3 text-[21px] font-medium leading-8 text-[#27313b]">{body}</p>
        </div>
      </div>
      {illustration ? <div className="absolute bottom-0 right-3">{illustration}</div> : null}
    </section>
  );
}

export function PrimaryActionButton({
  children,
  icon,
  onClick,
}: {
  children: ReactNode;
  icon?: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      className="flex min-h-[112px] items-center justify-center gap-3 rounded-[22px] bg-[var(--action)] px-3 text-white shadow-[0_14px_28px_rgba(255,90,79,0.22)] min-[420px]:gap-4 min-[420px]:px-4"
      onClick={onClick}
      type="button"
    >
      {icon}
      <span className="text-left">{children}</span>
    </button>
  );
}

export function SecondaryActionButton({
  children,
  icon,
}: {
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <button
      className="flex min-h-[112px] items-center justify-center gap-3 rounded-[22px] bg-[#eefafa] px-3 text-[var(--rest)] shadow-sm ring-1 ring-[#d3eceb] min-[420px]:gap-4 min-[420px]:px-4"
      type="button"
    >
      {icon}
      <span className="text-left">{children}</span>
    </button>
  );
}

export function ButtonText({
  body,
  title,
}: {
  body: string;
  title: string;
}) {
  return (
    <>
      <span className="block text-[24px] font-black leading-tight min-[420px]:text-[28px]">
        {title}
      </span>
      <span className="mt-2 block text-base font-semibold opacity-90">{body}</span>
    </>
  );
}

export function SummaryMetricCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[22px] bg-white shadow-sm ring-1 ring-black/10 ${className}`}
    >
      {children}
    </section>
  );
}
