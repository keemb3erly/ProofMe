import React from "react";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  clean?: boolean;
}

export function Container({ className = "", children, clean = false, ...props }: ContainerProps) {
  return (
    <div
      className={`${clean ? "" : "w-full max-w-6xl mx-auto px-4 py-8"} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
