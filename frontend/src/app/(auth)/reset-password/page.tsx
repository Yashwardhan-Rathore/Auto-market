"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, KeyRound, LoaderCircle, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { authService } from "@/services/auth.service";
import { parseApiError } from "@/services/api-client";

const schema = z
  .object({
    email: z.email("Enter a valid email address"),
    otp: z.string().regex(/^\d{6}$/, "OTP must be exactly 6 digits"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type FormValues = z.infer<typeof schema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillEmail = searchParams.get("email") ?? "";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resending, setResending] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: prefillEmail },
  });

  const submit = async (values: FormValues) => {
    try {
      await authService.resetPassword(values);
      toast.success("Password updated successfully — please sign in");
      router.replace("/login");
    } catch (err) {
      toast.error(parseApiError(err));
    }
  };

  const resendOtp = async () => {
    const email = getValues("email");
    if (!email) { toast.error("Enter your email first"); return; }
    setResending(true);
    try {
      await authService.forgotPassword(email);
      toast.success("New OTP sent — check your inbox");
    } catch (err) {
      toast.error(parseApiError(err));
    } finally {
      setResending(false);
    }
  };

  return (
    <section className="rounded-3xl bg-white p-8 shadow-xl w-full max-w-md mx-auto">
      <div className="mb-6">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
          <ShieldCheck size={24} className="text-blue-600" />
        </div>
        <h1 className="text-2xl font-black">Choose a new password</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Enter the OTP we sent to your email along with your new password.
        </p>
      </div>

      <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
        {/* Email */}
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Email address</span>
          <div className="flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition">
            <Mail size={18} className="text-zinc-400 shrink-0" />
            <input
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
              {...register("email")}
            />
          </div>
          {errors.email && <small className="text-red-500 text-xs">{errors.email.message}</small>}
        </label>

        {/* OTP */}
        <label className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">6-digit OTP</span>
            <button
              type="button"
              onClick={resendOtp}
              disabled={resending}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50 transition"
            >
              {resending ? <LoaderCircle size={12} className="animate-spin" /> : null}
              Resend OTP
            </button>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition">
            <KeyRound size={18} className="text-zinc-400 shrink-0" />
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400 tracking-widest"
              {...register("otp")}
            />
          </div>
          {errors.otp && <small className="text-red-500 text-xs">{errors.otp.message}</small>}
        </label>

        {/* New password */}
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">New password</span>
          <div className="flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition">
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
              {...register("password")}
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((v) => !v)}
              className="text-zinc-400 hover:text-zinc-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <small className="text-red-500 text-xs">{errors.password.message}</small>
          )}
        </label>

        {/* Confirm password */}
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Confirm new password</span>
          <div className="flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition">
            <input
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Repeat your new password"
              className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
              {...register("confirm_password")}
            />
            <button
              type="button"
              aria-label={showConfirm ? "Hide password" : "Show password"}
              onClick={() => setShowConfirm((v) => !v)}
              className="text-zinc-400 hover:text-zinc-600"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirm_password && (
            <small className="text-red-500 text-xs">{errors.confirm_password.message}</small>
          )}
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition mt-2"
        >
          {isSubmitting ? (
            <>
              <LoaderCircle size={18} className="animate-spin" />
              Updating password…
            </>
          ) : (
            "Reset password"
          )}
        </button>
      </form>

      <Link
        href="/login"
        className="mt-5 block text-center text-sm text-zinc-500 underline underline-offset-2 hover:text-zinc-800 transition"
      >
        Back to sign in
      </Link>
    </section>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
