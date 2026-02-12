"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { dashboardApi, recommendationsApi } from "@/services/api"
import type { DashboardMetrics, Recommendation } from "@/types"
import { Users, MessageSquare, TrendingUp, Sparkles, Plus, Loader2, ArrowUpRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function DashboardPage() {
  const router = useRouter()
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [recentRecommendations, setRecentRecommendations] = useState<Recommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      const [metricsResponse, recommendationsResponse] = await Promise.all([
        dashboardApi.getMetrics(),
        recommendationsApi.getRecent(5),
      ])

      if (metricsResponse.success && metricsResponse.data) {
        setMetrics(metricsResponse.data)
      }
      if (recommendationsResponse.success && recommendationsResponse.data) {
        setRecentRecommendations(recommendationsResponse.data)
      }
    } catch (error) {
      console.error("[v0] Error loading dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "outline"; label: string }> = {
      pending: { variant: "secondary", label: "Pendente" },
      accepted: { variant: "default", label: "Aceita" },
      converted: { variant: "default", label: "Convertida" },
      declined: { variant: "outline", label: "Recusada" },
    }
    return variants[status] || { variant: "outline", label: status }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Visão geral das suas recomendações e agentes</p>
        </div>
        <Button onClick={() => router.push("/dashboard/agents/new")} className="gap-2">
          <Plus className="h-4 w-4" />
          Criar Novo Agente
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card hover:bg-card/80 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{metrics?.totalClients || 0}</div>
            <p className="mt-1 text-xs text-muted-foreground">Base de contatos ativos</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card hover:bg-card/80 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recomendações</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{metrics?.totalRecommendations || 0}</div>
            <p className="mt-1 text-xs text-muted-foreground">Recomendacoes solicitadas</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card hover:bg-card/80 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Conversões</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{metrics?.conversions || 0}</div>
            <p className="mt-1 text-xs text-muted-foreground">Recomendacoes convertidas</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card hover:bg-card/80 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Conversão</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{metrics?.conversionRate?.toFixed(1) || 0}%</div>
            <p className="mt-1 text-xs text-muted-foreground">De recomendacoes aceitas</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Recommendations */}
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-foreground">Recomendações Recentes</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Ultimas recomendacoes solicitadas pelos agentes</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/clients")} className="gap-1">
              Ver todas
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentRecommendations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3 mb-4">
                <MessageSquare className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma recomendação ainda</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-md">
                Crie um agente e adicione clientes para começar a solicitar recomendações automaticamente
              </p>
              <Button onClick={() => router.push("/dashboard/agents/new")} className="gap-2">
                <Plus className="h-4 w-4" />
                Criar Primeiro Agente
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentRecommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="flex flex-col gap-3 rounded-lg border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-foreground">{rec.referredClientName || "Aguardando resposta"}</p>
                        {rec.referredClientPhone && (
                          <p className="text-sm text-muted-foreground">{rec.referredClientPhone}</p>
                        )}
                      </div>
                      <Badge variant={getStatusBadge(rec.status).variant}>{getStatusBadge(rec.status).label}</Badge>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{rec.messagesSent} mensagens enviadas</span>
                      <span>•</span>
                      <span>{formatDate(rec.lastMessageDate)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card
          className="border-border bg-card hover:bg-card/80 transition-colors cursor-pointer"
          onClick={() => router.push("/dashboard/agents")}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-foreground">Gerenciar Agentes</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Configure e personalize seus agentes de IA para solicitar recomendações
            </p>
          </CardContent>
        </Card>

        <Card
          className="border-border bg-card hover:bg-card/80 transition-colors cursor-pointer"
          onClick={() => router.push("/dashboard/whatsapp")}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-foreground">Integração WhatsApp</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Conecte sua conta do WhatsApp para começar a enviar mensagens
            </p>
          </CardContent>
        </Card>

        <Card
          className="border-border bg-card hover:bg-card/80 transition-colors cursor-pointer"
          onClick={() => router.push("/dashboard/clients")}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-foreground">Adicionar Clientes</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Importe ou adicione manualmente clientes à sua base</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
