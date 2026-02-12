"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { authApi } from "@/services/api"
import { authHelpers } from "@/lib/auth"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await authApi.login({ email, password })

      if (response.success && response.data) {
        authHelpers.setAuth(response.data.user, response.data.token)
        router.push("/dashboard")
      } else {
        setError(response.error || "Erro ao fazer login")
      }
    } catch (err) {
      setError("Erro ao conectar com o servidor")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-muted">
            <Image
              src="/logo.jpeg"
              alt="High Funnel"
              width={96}
              height={96}
              className="h-full w-full object-cover"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">High Funnel</h1>
          <p className="mt-2 text-lg font-medium text-foreground">IA de Recomendacao</p>
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-2xl">Entrar na plataforma</CardTitle>
            <CardDescription>Digite suas credenciais para acessar</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-background"
                />
              </div>

              {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/register" className="text-sm font-medium text-primary hover:underline">
                Criar uma conta
              </Link>
            </div>

            <div className="mt-6 rounded-lg bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">Demo:</strong> Use qualquer email e senha para testar a plataforma
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Ao entrar, você concorda com nossos Termos de Serviço e Política de Privacidade
        </p>
      </div>
    </div>
  )
}
