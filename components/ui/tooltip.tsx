import React from "react";

import { Label } from "@/components/ui/label";

interface TooltipProps {
  label: string;
  content: string;
  htmlFor?: string;
}

export function Tooltip({ label, content, htmlFor }: TooltipProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Label htmlFor={htmlFor}>{label}</Label>
        <span
          aria-label={`Ajuda: ${label}`}
          className="relative inline-flex h-5 w-5 cursor-help items-center justify-center rounded-full border border-slate-300 bg-white text-[11px] font-semibold text-slate-600"
          title={content}
        >
          ?
        </span>
      </div>
      <p className="text-xs leading-5 text-slate-500">{content}</p>
    </div>
  );
}
