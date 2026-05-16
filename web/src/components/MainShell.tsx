"use client";

import { type ReactNode } from "react";

export function MainShell({ children }: { children: ReactNode }) {
  return <main className="page-enter mx-auto w-full max-w-6xl flex-1 px-4 py-10">{children}</main>;
}
