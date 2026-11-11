import type { ReactNode } from "react";

type ArcadeShellProps = {
  children: ReactNode;
};

export function ArcadeShell({ children }: ArcadeShellProps) {
  return (
    <div className="relative min-h-screen font-body text-slate-100">
      <div className="synthwave-bg" aria-hidden="true" />
      <div className="scanlines" aria-hidden="true" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
