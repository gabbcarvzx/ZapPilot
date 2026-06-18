import type { ComponentPropsWithoutRef } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;

export function SelectTrigger(props: ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      className="flex h-11 w-full items-center justify-between rounded-2xl border bg-white/85 px-4 py-2 text-sm"
      {...props}
    >
      {props.children}
      <SelectPrimitive.Icon>
        <ChevronDown className="h-4 w-4" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectContent(props: ComponentPropsWithoutRef<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content className="z-50 overflow-hidden rounded-2xl border bg-white shadow-lg" {...props}>
        <SelectPrimitive.Viewport className="p-1">{props.children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem(props: ComponentPropsWithoutRef<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item className="cursor-pointer rounded-xl px-3 py-2 text-sm outline-none hover:bg-slate-50" {...props}>
      <SelectPrimitive.ItemText>{props.children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}
