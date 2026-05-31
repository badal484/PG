"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import { PhoneInput } from "@/components/ui";
import { OTPInput } from "@/components/auth/OTPInput";
import { useSendOtp, useVerifyOtp } from "@/lib/api/auth";
import { useUser } from "@/app/providers";

type Phase = "phone" | "otp" | "verifying" | "done";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") ?? "/";
  const { setUser } = useUser();

  const [phase, setPhase] = useState<Phase>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [phoneError, setPhoneError] = useState("");
  const [otpError, setOtpError] = useState("");

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sendOtp = useSendOtp();
  const verifyOtp = useVerifyOtp();

  function startCountdown(seconds = 60) {
    setCountdown(seconds);
    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }

  useEffect(() => () => { if (countdownRef.current) clearInterval(countdownRef.current); }, []);

  async function handleSendOtp() {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length !== 10) { setPhoneError("Enter a valid 10-digit phone number"); return; }
    setPhoneError("");
    try {
      await sendOtp.mutateAsync(cleaned);      // API expects bare 10-digit number
      setPhase("otp");
      startCountdown(60);
    } catch {
      setPhoneError("Failed to send OTP. Try again.");
    }
  }

  async function handleVerifyOtp() {
    if (otp.length !== 6) { setOtpError("Enter all 6 digits"); return; }
    setOtpError("");
    setPhase("verifying");
    try {
      const res = await verifyOtp.mutateAsync({ phone: phone.replace(/\D/g, ""), otp });
      const u = res.user as any;
      setUser({
        id: u.id,
        name: [u.firstName, u.lastName].filter(Boolean).join(" ") || "",
        phone: u.phone,
        role: u.role,
        avatarUrl: u.profilePhoto ?? undefined,
        unreadNotifications: 0,
      });
      setPhase("done");
      router.replace(res.isNewUser ? "/auth/onboarding" : redirect);
    } catch {
      setOtpError("Incorrect OTP. Please try again.");
      setPhase("otp");
      setOtp("");
    }
  }

  const resend = useCallback(async () => {
    if (countdown > 0) return;
    setOtp("");
    setOtpError("");
    await sendOtp.mutateAsync(phone.replace(/\D/g, ""));
    startCountdown(60);
  }, [countdown, phone, sendOtp]);

  return (
    <div className="rounded-2xl border border-border bg-white p-8 shadow-xl">
      {phase === "phone" || phase === "otp" || phase === "verifying" ? (
        <>
          <h1 className="text-2xl font-black">
            {phase === "phone" ? "Welcome to ROOMLY" : "Verify your number"}
          </h1>
          <p className="mt-1.5 text-sm text-text-secondary">
            {phase === "phone"
              ? "Enter your mobile number to get started"
              : `We sent a 6-digit OTP to +91 ${phone}`}
          </p>
        </>
      ) : null}

      <div className="mt-7 grid gap-5">
        {phase === "phone" && (
          <>
            <PhoneInput
              label="Mobile number"
              placeholder="9876543210"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setPhoneError(""); }}
              error={phoneError}
              onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
              autoFocus
            />
            <Button
              size="lg"
              className="w-full"
              onClick={handleSendOtp}
              disabled={sendOtp.isPending}
            >
              {sendOtp.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Get OTP <ChevronRight className="h-5 w-5" /></>}
            </Button>
          </>
        )}

        {(phase === "otp" || phase === "verifying") && (
          <>
            <div className="grid gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">Enter OTP</p>
              <OTPInput
                value={otp}
                onChange={(v) => { setOtp(v); setOtpError(""); }}
                disabled={phase === "verifying"}
                className="justify-center"
              />
              {otpError && <p className="text-center text-xs text-error">{otpError}</p>}
            </div>

            <div className="text-center text-sm text-text-secondary">
              {countdown > 0 ? (
                <span>Resend OTP in <span className="font-bold text-primary">{countdown}s</span></span>
              ) : (
                <button
                  type="button"
                  onClick={resend}
                  className="font-semibold text-accent hover:underline"
                  disabled={sendOtp.isPending}
                >
                  Resend OTP
                </button>
              )}
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={handleVerifyOtp}
              disabled={otp.length !== 6 || phase === "verifying"}
            >
              {phase === "verifying" ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Verifying…</>
              ) : (
                <>Verify &amp; Continue <ChevronRight className="h-5 w-5" /></>
              )}
            </Button>

            <button
              type="button"
              onClick={() => { setPhase("phone"); setOtp(""); setOtpError(""); }}
              className="text-center text-sm text-text-secondary hover:text-primary"
            >
              Change phone number
            </button>
          </>
        )}
      </div>

      {phase === "phone" && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {["Secure login", "No password needed", "OTP expires in 10 min"].map((item) => (
            <span key={item} className="text-xs text-text-tertiary">✓ {item}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="rounded-2xl border border-border bg-white p-8 shadow-xl animate-pulse h-64" />}>
      <LoginForm />
    </Suspense>
  );
}
