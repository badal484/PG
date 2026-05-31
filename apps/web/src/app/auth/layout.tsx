import Link from "next/link";
import { Building2 } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-white to-accent/5 px-4 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <Building2 className="h-8 w-8 text-primary" />
        <span className="text-2xl font-black text-primary">ROOMLY</span>
      </Link>
      <div className="w-full max-w-md">{children}</div>
      <p className="mt-8 text-center text-xs text-text-tertiary">
        By continuing, you agree to our{" "}
        <Link href="/terms" className="underline hover:text-primary">Terms</Link>
        {" "}and{" "}
        <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link>
      </p>
    </div>
  );
}
