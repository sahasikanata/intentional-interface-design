import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-ink",
        ink: "bg-ink text-ink-foreground hover:bg-primary",
        outline: "border border-foreground/80 text-foreground hover:bg-foreground hover:text-background",
        onInk: "bg-ink-foreground text-ink hover:bg-sand",
        ghost: "text-foreground hover:bg-secondary",
        link: "link-quiet px-0 text-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-accent",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        default: "h-11 rounded-sm px-5 text-[0.95rem]",
        sm: "h-9 rounded-sm px-3.5 text-sm",
        lg: "h-13 rounded-sm px-7 text-base",
        inline: "h-auto p-0 text-[0.95rem]",
        icon: "size-10 rounded-sm",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
