"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { authService } from "@/services/auth.service";
import { parseApiError } from "@/services/api-client";

const schema = z.object({
  email: z.email("Enter a valid email address"),
});
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const submit = async ({ email }: FormValues) => {
    try {
      await authService.forgotPassword(email);
      toast.success("OTP sent — check your inbox");
      // Carry the email forward so the user doesn't have to retype it
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err) {
      toast.error(parseApiError(err));
    }
  };

  return (
    <section className="rounded-3xl bg-white p-8 shadow-xl w-full max-w-md mx-auto">
      <h1 className="text-2xl font-black">Reset your password</h1>
      <p className="mt-2 mb-6 text-sm text-zinc-500">
        Enter the email address linked to your account. We'll send a 6-digit OTP to reset your password.
      </p>

      <form onSubmit={handleSubmit(submit)} className="space-y-5" noValidate>
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
          {errors.email && (
            <small className="text-red-500 text-xs">{errors.email.message}</small>
          )}
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition"
        >
          {isSubmitting ? (
            <>
              <LoaderCircle size={18} className="animate-spin" />
              Sending OTP…
            </>
          ) : (
            "Send OTP"
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
