'use client'

import { useState } from 'react';
import Navbar from '@/components/landing/Navbar';


export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden font-sans selection:bg-blue-500 selection:text-white">
      {/* GLOBAL ANIMATED BACKGROUND GLOW 
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/15 blur-[120px] animate-pulse" />
        <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/15 blur-[140px] animate-pulse delay-1000" />
        <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-violet-600/15 blur-[130px] animate-pulse delay-700" />
      </div>
      
      /* SECTIONS */}
      <div className="relative z-10 space-y-24 md:space-y-32">
        <Navbar />
      </div>

      {/* FLOATING SOCIAL PROOF */}
    </main>
  );
}
