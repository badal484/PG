import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <p className="text-8xl font-black text-slate-200">403</p>
        <h1 className="mt-2 text-2xl font-black text-text-primary">Access denied</h1>
        <p className="mt-2 text-text-secondary">You don&apos;t have permission to view this page.</p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-light"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
