'use client'

import { useState } from 'react'
import { login } from './actions'
import Image from 'next/image'
import { Mail, Lock, ArrowRight, ShieldCheck, Users, Lightbulb, TrendingUp } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen relative overflow-hidden bg-gray-100 dark:bg-[#03060a]">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      {/* Full screen background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 opacity-100 dark:opacity-30 mix-blend-multiply dark:mix-blend-normal"
        style={{ backgroundImage: "url('/college-gate.jpg')" }}
      />
      
      {/* AIMERS Watermark */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] dark:opacity-[0.08] z-0 mix-blend-multiply dark:mix-blend-screen">
        <div className="relative w-[800px] h-[800px] motion-safe:animate-[spin_20s_linear_infinite]">
          <Image src="/aimers-logo.jpeg" alt="" fill className="object-contain rounded-full" priority />
        </div>
      </div>
      
      {/* Right side light overlay (visible on mobile and desktop right side) */}
      <div className="absolute inset-0 lg:left-[40%] bg-white dark:bg-[#080d1a]/70 backdrop-blur-md z-0"></div>
      
      {/* Left side dark diagonal overlay (desktop only) */}
      <div 
        className="hidden lg:block absolute top-0 bottom-0 left-0 w-[60%] bg-gradient-to-br from-[#0a1122]/95 via-[#0f172a]/95 to-[#1e293b]/95 z-0 shadow-2xl"
        style={{ clipPath: 'polygon(0 0, 100% 0, 80% 100%, 0 100%)' }}
      >
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent"></div>
        {/* Subtle accent line on the edge */}
        <div className="absolute top-0 bottom-0 right-0 w-1 bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)] transform -skew-x-[11deg] origin-bottom translate-x-[-120px]"></div>
      </div>

      <div className="flex w-full min-h-screen relative z-10">
        
        {/* LEFT SIDE - BRANDING */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-10 xl:p-16">
          
          {/* Top Header */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-px bg-cyan-400"></div>
            <span className="text-gray-300 font-medium tracking-widest text-sm uppercase">MVSR Engineering College</span>
          </div>

          {/* Center Content */}
          <div className="flex flex-col items-start max-w-lg mt-[-5vh] relative">
            <div className="absolute top-0 right-0 transform translate-x-20 -translate-y-10 opacity-20 pointer-events-none">
               <span className="font-['Dancing_Script',cursive] text-6xl text-white transform -rotate-12 block">Innovate</span>
               <span className="font-['Dancing_Script',cursive] text-6xl text-white transform -rotate-12 block ml-8">Research</span>
               <span className="font-['Dancing_Script',cursive] text-6xl text-white transform -rotate-12 block ml-16">Impact</span>
            </div>
            
            <div className="bg-white dark:bg-[#080d1a] p-3 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.1)] mb-8 flex items-center justify-center relative z-10">
              <Image 
                src="/aimers-logo.jpeg" 
                alt="AIMERS Logo" 
                width={140} 
                height={140}
                className="rounded-full"
                priority
              />
            </div>
            <h1 className="text-white text-5xl font-extrabold tracking-tight mb-2 drop-shadow-md">MVSR</h1>
            <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 text-6xl font-black tracking-tight mb-4 drop-shadow-md">AIMERS</h2>
            <h3 className="text-gray-300 text-xl tracking-widest font-semibold uppercase mb-6">Event Management System</h3>
            
            <p className="text-gray-300 text-lg leading-relaxed max-w-md">
              A community of innovators, researchers, and problem solvers building the future at MVSR.
            </p>
          </div>

          {/* Bottom Features */}
          <div className="flex gap-10">
            <div className="flex flex-col gap-2">
              <Users className="text-cyan-400 w-6 h-6" />
              <span className="text-white font-bold text-sm tracking-wide">CONNECT</span>
              <span className="text-gray-400 text-xs">with your community</span>
            </div>
            <div className="flex flex-col gap-2">
              <Lightbulb className="text-cyan-400 w-6 h-6" />
              <span className="text-white font-bold text-sm tracking-wide">LEARN</span>
              <span className="text-gray-400 text-xs">through experiences</span>
            </div>
            <div className="flex flex-col gap-2">
              <TrendingUp className="text-cyan-400 w-6 h-6" />
              <span className="text-white font-bold text-sm tracking-wide">GROW</span>
              <span className="text-gray-400 text-xs">together</span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - LOGIN FORM */}
        <div className="w-full lg:w-1/2 flex flex-col p-6 relative h-screen overflow-y-auto">
          
          {/* Mobile header (if needed) */}
          <div className="lg:hidden w-full flex flex-col items-center justify-center mt-8 mb-8">
            <div className="bg-white dark:bg-[#080d1a] p-2 rounded-full mb-4 shadow-lg">
              <Image 
                src="/aimers-logo.jpeg" 
                alt="AIMERS Logo" 
                width={80} 
                height={80}
                className="rounded-full"
              />
            </div>
            <h2 className="text-[#0a1122] text-3xl font-black tracking-tight">AIMERS</h2>
            <span className="text-gray-700 font-bold tracking-widest uppercase mt-1 text-center">Event Management System</span>
          </div>

          {/* Desktop Right Header */}
          <div className="hidden lg:flex w-full justify-end items-center gap-4 text-xs font-bold tracking-widest text-slate-800 dark:text-slate-100 pt-4 pr-4">
            <span>LEARN</span>
            <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
            <span>BUILD</span>
            <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
            <span>BELONG</span>
            <div className="w-8 h-px bg-slate-400 ml-2"></div>
          </div>

          {/* Form Wrapper */}
          <div className="flex-1 flex items-center justify-center w-full min-h-[500px]">
            <div className="w-full max-w-md bg-white dark:bg-[#080d1a]/95 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-8 sm:p-10 border border-white/50">
              <div className="w-12 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mb-8"></div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 font-serif tracking-tight">Welcome Back</h1>
              <p className="text-gray-500 text-sm mb-8">Sign in to access your AIMERS account</p>
            
            <form action={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-bold text-gray-700">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    id="email" 
                    name="email" 
                    type="email" 
                    placeholder="Enter your email"
                    required 
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-colors placeholder:text-gray-400"
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="text-sm font-bold text-gray-700">Password</label>
                  <button type="button" className="text-xs font-bold text-cyan-600 hover:text-cyan-700 transition-colors">Forgot password?</button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    id="password" 
                    name="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Enter your password"
                    required 
                    className="w-full pl-11 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-colors placeholder:text-gray-400"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      {showPassword ? (
                        <>
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </>
                      ) : (
                        <>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </>
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2">
                  <div className="text-red-500 w-4 h-4 shrink-0 flex items-center justify-center rounded-full border-2 border-red-500 font-bold text-[10px]">!</div>
                  <div className="text-red-700 text-xs font-medium pt-0.5">{error}</div>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-[#0a1122] text-white px-4 py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-slate-900/20 hover:bg-[#152345] hover:shadow-slate-900/40 disabled:opacity-70 disabled:cursor-not-allowed transition-all mt-4 flex items-center justify-center gap-2 group"
              >
                {isLoading ? 'Authenticating...' : (
                  <>
                    Log In
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="relative mt-6 mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative flex justify-center text-[10px] font-bold tracking-widest">
                  <span className="bg-white dark:bg-[#080d1a] px-3 text-gray-400 uppercase">OR</span>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-cyan-950/20 rounded-2xl p-4 flex items-start gap-3 border border-slate-100 dark:border-cyan-900/20">
                <ShieldCheck className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">Secure access</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">Your data is protected with enterprise-grade security.</p>
                </div>
              </div>

              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  Don&apos;t have an account?{' '}
                  <a href="/signup" className="font-bold text-cyan-600 hover:text-cyan-700 transition-colors">
                    Sign up
                  </a>
                </p>
              </div>
            </form>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}
