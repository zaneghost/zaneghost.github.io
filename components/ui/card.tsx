import React from "react";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className = "", ...props }: CardProps) {
  return <div className={`rounded-lg border border-white/15 bg-black/20 ${className}`.trim()} {...props} />;
}
