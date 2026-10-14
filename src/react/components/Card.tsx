import type { ReactNode } from "react";

interface CardProps {
  className: string;
  children: ReactNode;
}

export const Card = ({ className, children }: CardProps) => (
  <div className={className}>{children}</div>
);
