"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "@/providers/auth-provider";
import { parseApiError } from "@/services/api-client";

export const loginSchema = z.object({ email: z.email("Enter a valid email address"), password: z.string().min(8, "Password must be at least 8 characters") });
type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [visible, setVisible] = useState(false);
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });
  const submit = async (values: LoginValues) => { try { await login(values.email, values.password); toast.success("Signed in"); } catch (error) { toast.error(parseApiError(error)); } };
  return <form onSubmit={handleSubmit(submit)} className="space-y-5" noValidate>
    <label className="field"><span>Email address</span><input autoComplete="email" type="email" placeholder="you@company.com" {...register("email")} />{errors.email && <small>{errors.email.message}</small>}</label>
    <label className="field"><span>Password</span><div className="relative"><input className="pr-12" autoComplete="current-password" type={visible ? "text" : "password"} {...register("password")} /><button aria-label={visible ? "Hide password" : "Show password"} className="icon-button absolute right-2 top-2" type="button" onClick={() => setVisible((v) => !v)}>{visible ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div>{errors.password && <small>{errors.password.message}</small>}</label>
    <div className="flex justify-end"><Link className="text-sm underline underline-offset-4" href="/forgot-password">Forgot password?</Link></div>
    <button className="primary-button w-full" disabled={isSubmitting} type="submit">{isSubmitting && <LoaderCircle className="animate-spin" size={18}/>}Sign in</button>
  </form>;
}
