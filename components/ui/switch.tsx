import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={`relative inline-flex h-6 w-11 items-center rounded-full bg-slate-300 data-[state=checked]:bg-teal-600 ${className ?? ""}`}
    {...props}
  >
    <SwitchPrimitive.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white transition-transform data-[state=checked]:translate-x-[1.3rem]" />
  </SwitchPrimitive.Root>
));
Switch.displayName = SwitchPrimitive.Root.displayName;
