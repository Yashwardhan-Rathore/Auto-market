"use client";
import { motion } from "framer-motion";
import { LoginForm } from "@/components/auth/login-form";
export default function LoginPage() { return <motion.section className="rounded-3xl border border-zinc-800 bg-white p-7 shadow-2xl sm:p-9" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:.28}}><p className="text-xs font-bold tracking-[.3em] text-zinc-500">AUTO MARKET</p><h1 className="mt-3 text-3xl font-black tracking-tight">Welcome back</h1><p className="mb-8 mt-2 text-sm text-zinc-500">Sign in with your organization account. Your backend profile determines access.</p><LoginForm/></motion.section>; }
