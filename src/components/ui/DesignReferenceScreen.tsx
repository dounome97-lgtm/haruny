import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

type ReferenceHotspot = {
  ariaLabel: string;
  height: number;
  href: string;
  left: number;
  top: number;
  width: number;
};

export function DesignReferenceScreen({
  alt,
  hotspots = [],
  src,
}: {
  alt: string;
  hotspots?: ReferenceHotspot[];
  src: string;
}) {
  return (
    <main className="min-h-dvh bg-[#f8f7f4]">
      <div className="relative mx-auto min-h-dvh w-full max-w-[430px] bg-white">
        <Image
          alt={alt}
          className="h-auto w-full"
          height={1844}
          priority
          src={src}
          width={853}
        />
        {hotspots.map((hotspot) => (
          <Link
            aria-label={hotspot.ariaLabel}
            className="absolute rounded-[18px] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#10a7a7]"
            href={hotspot.href}
            key={`${hotspot.href}-${hotspot.ariaLabel}`}
            style={toHotspotStyle(hotspot)}
          />
        ))}
      </div>
    </main>
  );
}

function toHotspotStyle(hotspot: ReferenceHotspot): CSSProperties {
  return {
    height: `${hotspot.height}%`,
    left: `${hotspot.left}%`,
    top: `${hotspot.top}%`,
    width: `${hotspot.width}%`,
  };
}
