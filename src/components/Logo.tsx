import React from "react";

export function Logo({
  collapsed = false,
  inverted = false,
}: {
  collapsed?: boolean;
  inverted?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      {/* Eye / Vision Symbol */}
      <div
        className={`relative flex items-center justify-center w-10 h-10 rounded-xl shadow-sm transition-all duration-300 ${
          inverted
            ? "bg-gradient-to-tr from-sky-400 to-cyan-300 text-navy-950 shadow-cyan-500/20"
            : "bg-gradient-to-tr from-navy-900 to-brand-700 text-white shadow-brand-500/20"
        }`}
      >
        <svg
          className="w-6 h-6 stroke-current fill-none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Eye Outline */}
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
          {/* Eyeball / Iris */}
          <circle cx="12" cy="12" r="3.5" />
          {/* Optical lens refraction ring */}
          <circle
            cx="12"
            cy="12"
            r="1.2"
            className={inverted ? "fill-navy-950" : "fill-sky-300"}
          />
        </svg>
      </div>

      {!collapsed && (
        <div className="flex flex-col">
          <span
            className={`font-black tracking-tight text-base leading-none font-sans ${
              inverted ? "text-white" : "text-navy-900"
            }`}
          >
            SATGURU
          </span>
          <span
            className={`font-bold tracking-widest text-[11px] leading-tight ${
              inverted ? "text-sky-300" : "text-brand-600"
            }`}
          >
            VISION CARE
          </span>
          <span
            className={`text-[9px] font-medium tracking-wider uppercase ${
              inverted ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Optical ERP & Clinic
          </span>
        </div>
      )}
    </div>
  );
}

