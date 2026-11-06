import React from "react";

export function Logo({
  collapsed = false,
  inverted = false,
  className = "",
  size = "md",
}: {
  collapsed?: boolean;
  inverted?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const pixelSizes = {
    sm: 32,
    md: 40,
    lg: 56,
  };

  const px = pixelSizes[size] || 40;

  if (collapsed) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div
          style={{ width: `${px}px`, height: `${px}px` }}
          className="rounded-xl overflow-hidden shadow-sm bg-[#002942] border border-sky-400/20 flex items-center justify-center p-0.5 shrink-0"
          title="Satguru Vision Care"
        >
          <img
            src="/logo.png"
            alt="Satguru Vision Care"
            width={px}
            height={px}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Official Emblem / Logo Badge */}
      <div
        style={{ width: `${px}px`, height: `${px}px` }}
        className="rounded-xl overflow-hidden shadow-sm bg-[#002942] border border-sky-400/25 shrink-0 flex items-center justify-center p-0.5"
      >
        <img
          src="/logo.png"
          alt="Satguru Vision Care"
          width={px}
          height={px}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
          className="w-full h-full object-contain"
        />
      </div>

      <div className="flex flex-col">
        <span
          className={`font-black tracking-tight text-base leading-none font-sans ${
            inverted ? "text-white" : "text-navy-950"
          }`}
        >
          SATGURU
        </span>
        <span
          className={`font-bold tracking-widest text-[11px] leading-tight ${
            inverted ? "text-sky-400" : "text-brand-600"
          }`}
        >
          VISION CARE
        </span>
        <span
          className={`text-[8.5px] font-semibold tracking-wider uppercase ${
            inverted ? "text-slate-400" : "text-slate-500"
          }`}
        >
          Eye Care • Eye Wear • Better Vision
        </span>
      </div>
    </div>
  );
}

export function FullLogoBadge({
  className = "h-16 w-auto",
}: {
  className?: string;
}) {
  return (
    <img
      src="/logo.png"
      alt="Satguru Vision Care Logo"
      width={64}
      height={64}
      style={{ maxWidth: "64px", maxHeight: "64px", objectFit: "contain" }}
      className={`object-contain rounded-2xl shadow-md border border-sky-500/20 ${className}`}
    />
  );
}
