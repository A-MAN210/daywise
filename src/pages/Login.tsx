import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const { signInWithGoogle } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      setErrorMsg(null);
      await signInWithGoogle();
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Failed to sign in with Google. Please try again.";
      setErrorMsg(errorMessage);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8FC] flex flex-col justify-between text-[#26243A]">
      {/* Top minimal header */}
      <header className="border-b border-[#E9E8F2] bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#6D5DFB] shadow-[0_8px_18px_rgba(109,93,251,0.25)]">
              <Sparkles className="h-5 w-5 text-white" strokeWidth={2.4} />
              <span className="absolute bottom-[7px] right-[7px] h-[5px] w-[5px] rounded-full bg-[#FFC857]" />
            </div>
            <div>
              <span className="font-display text-xl font-extrabold tracking-[-0.04em] text-[#26243A]">DayWise</span>
              <span className="ml-2 rounded-full bg-[#F1EFFF] px-2 py-0.5 text-[10px] font-extrabold tracking-[0.12em] text-[#6D5DFB] uppercase">Daily OS</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#8E8B9E]">
            <ShieldCheck className="h-4 w-4 text-[#2F9B72]" /> Secure Google Authentication
          </div>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[480px]">
          <div className="rounded-[28px] border border-[#E9E8F2] bg-white p-8 sm:p-10 shadow-[0_16px_36px_rgba(48,44,88,0.06)]">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#EFEDFF] px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-[0.14em] text-[#6D5DFB]">
              <Sparkles className="h-3.5 w-3.5" /> Welcome Aman
            </div>
            
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-[-0.05em] text-[#26243A] leading-tight">
              Sign in to your DayWise workspace
            </h1>
            
            <p className="mt-3 text-sm leading-6 text-[#7E7A94]">
              Welcome, <strong className="text-[#26243A]">Aman</strong>. Your workspace starts with a pristine, clean slate — all old mock progress and habits have been completely reset for your account.
            </p>

            {errorMsg && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                {errorMsg}
              </div>
            )}

            <div className="mt-8 space-y-4">
              <Button
                id="google-signin-btn"
                onClick={handleSignIn}
                disabled={isSigningIn}
                className="w-full h-14 rounded-2xl bg-white border-2 border-[#E9E8F2] hover:bg-[#FAF9FF] hover:border-[#6D5DFB] text-[#26243A] font-extrabold text-sm flex items-center justify-center gap-3 transition shadow-sm hover:shadow-md cursor-pointer"
              >
                {/* Official Google 'G' icon */}
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                {isSigningIn ? "Signing in with Google..." : "Continue with Google Account"}
                <ArrowRight className="h-4 w-4 ml-auto text-[#AAA7B7]" />
              </Button>
            </div>

            {/* Clean slate guarantees */}
            <div className="mt-8 rounded-2xl bg-[#F8F7FD] p-4 border border-[#ECEAF6]">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#6D5DFB]">
                <RotateCcw className="h-3.5 w-3.5" /> Clean Slate Active
              </div>
              <ul className="mt-2.5 space-y-1.5 text-xs text-[#726E86]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#2F9B72] shrink-0" />
                  No old tasks, mock streaks, or legacy records
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#2F9B72] shrink-0" />
                  Personalized specifically for Aman
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#2F9B72] shrink-0" />
                  Secure sync to your cloud database
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-5 text-center text-xs font-semibold text-[#A8A5B9]">
        DayWise · Daily tracker for habits, tasks, reflections, and routine
      </footer>
    </div>
  );
}
