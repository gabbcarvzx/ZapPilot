import type { ComponentPropsWithoutRef } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

export const Tabs = TabsPrimitive.Root;
export const TabsContent = TabsPrimitive.Content;

export function TabsList(props: ComponentPropsWithoutRef<typeof TabsPrimitive.List>) {
  return <TabsPrimitive.List className="inline-flex rounded-2xl bg-white/80 p-1" {...props} />;
}

export function TabsTrigger(props: ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>) {
  return <TabsPrimitive.Trigger className="rounded-xl px-4 py-2 text-sm data-[state=active]:bg-[var(--primary)] data-[state=active]:text-white" {...props} />;
}
