"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { authApi } from "@/lib/api/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Truck, Lock, Mail, Loader2 } from "lucide-react"

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await authApi.login({ email, password })
      login(response.user, response.accessToken)
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-amber-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-950 dark:to-black">
      <div className="absolute inset-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>
      
      <Card className="w-full max-w-md border-border/50 shadow-2xl backdrop-blur-sm bg-white/80 dark:bg-black/80 rounded-3xl overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="h-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600"></div>
        
        <CardHeader className="space-y-4 pt-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-2">
            <Truck className="w-8 h-8 text-amber-600" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-black tracking-tight text-foreground">
              PEL ERP <span className="text-amber-600">Portal</span>
            </CardTitle>
            <CardDescription className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
              Petroleum Exploration Limited
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-bold text-foreground ml-1">Work Email</Label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-amber-600 transition-colors" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@pel.com.pk" 
                  className="pl-11 h-12 rounded-xl border-border/60 bg-white/50 dark:bg-black/50 focus-visible:ring-amber-500/50" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <Label htmlFor="password" className="text-sm font-bold text-foreground">Password</Label>
                <button type="button" className="text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors">
                  Forgot?
                </button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-amber-600 transition-colors" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-11 h-12 rounded-xl border-border/60 bg-white/50 dark:bg-black/50 focus-visible:ring-amber-500/50" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold animate-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-base shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Sign In to ERP"
              )}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="pb-8 pt-4 border-t border-border/30 mt-4 flex flex-col gap-4">
          <p className="text-xs text-center text-muted-foreground font-medium px-6 leading-relaxed">
            By signing in, you agree to our Terms of Service and data protection policies for internal use.
          </p>
          <div className="flex gap-4 justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500/40"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500/40"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500/40"></div>
          </div>
        </CardFooter>
      </Card>
      
      <div className="fixed bottom-6 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] pointer-events-none">
        Property of Petroleum Exploration Limited
      </div>
    </div>
  )
}
