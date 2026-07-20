import Link from "next/link";
export default function NotFound() { return <div className="grid min-h-screen place-items-center bg-black text-white"><div className="text-center"><p className="text-7xl font-black">404</p><p className="mt-3 text-zinc-400">This page does not exist.</p><Link className="mt-6 inline-block underline" href="/">Return home</Link></div></div>; }
