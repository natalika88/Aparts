import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { defaultAdminHome } from "@/lib/auth/roles";
import { Suspense } from "react";
import { AdminLoginForm } from "./AdminLoginForm";

export default async function AdminLoginPage() {
  const session = await auth();
  if (session?.user?.role) {
    redirect(defaultAdminHome(session.user.role));
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-white p-8 shadow-lg">
        <p className="text-xs uppercase tracking-widest text-[var(--muted)]">Пушкин сон</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-2xl text-[var(--text)]">
          Вход в админ-панель
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          После входа вы попадёте в панель по своей роли: цены и бронирования или контент.
        </p>
        <Suspense fallback={<p className="mt-6 text-sm text-[var(--muted)]">Загрузка…</p>}>
          <AdminLoginForm />
        </Suspense>
        <p className="mt-6 text-xs text-[var(--muted)]">
          Демо: super@pushkinson.local / price@ / content@ — пароль из seed (ChangeMe!123)
        </p>
      </div>
    </div>
  );
}
