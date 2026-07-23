"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
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

  return <form onSubmit={handleSubmit(submit)} className="neon-login-form" noValidate>
    <label><span>Email</span><div className="neon-input"><Mail size={20}/><input autoComplete="email" type="email" placeholder="Enter your email" {...register("email")}/></div>{errors.email&&<small>{errors.email.message}</small>}</label>
    <label><span>Password</span><div className="neon-input"><LockKeyhole size={20}/><input autoComplete="current-password" type={visible?"text":"password"} placeholder="Enter your password" {...register("password")}/><button aria-label={visible?"Hide password":"Show password"} type="button" onClick={()=>setVisible(value=>!value)}>{visible?<EyeOff size={19}/>:<Eye size={19}/>}</button></div>{errors.password&&<small>{errors.password.message}</small>}</label>
    <div className="login-form-options"><label className="login-remember"><input type="checkbox"/><span>Remember me</span></label><Link href="/forgot-password">Forgot password?</Link></div>
    <button className="neon-login-button" disabled={isSubmitting} type="submit">{isSubmitting?<><LoaderCircle className="animate-spin" size={20}/>Signing in...</>:"Login"}</button>
  </form>;
}
