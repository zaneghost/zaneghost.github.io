import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline";
};

export function Button({ className = "", variant = "default", ...props }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60";
  const variantClass =
    variant === "outline" ? "border border-white/30 bg-transparent hover:bg-white/10" : "bg-white text-black hover:bg-white/85";

  return <button className={`${base} ${variantClass} ${className}`.trim()} {...props} />;
}
