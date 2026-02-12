"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Users,
  Phone,
  Clock,
  CheckCircle2,
  Send,
  UserPlus,
  MessageSquare,
  Gift,
  TrendingUp,
  Loader2,
} from "lucide-react"
import type { Client, ReferredClient, TimelineEvent } from "@/types"
import { clientsApi, referredClientsApi } from "@/services/api"

const referredStatusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  new: { label: "Novo", color: "bg-slate-500/10 text-slate-400 border-slate-500/20", icon: UserPlus },
  contact_initiated: { label: "Contato iniciado", color: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: MessageSquare },
  offer_sent: { label: "Oferta enviada", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", icon: Send },
  converted: { label: "Convertido", color: "bg-green-500/10 text-green-400 border-green-500/20", icon: CheckCircle2 },
}

const timelineIcons: Record<string, typeof MessageSquare> = {
  message_sent: MessageSquare,
  recommendation_received: UserPlus,
  offer_sent: Send,
  status_changed: TrendingUp,
  gift_sent: Gift,
  follow_up_sent: Clock,
}

export function ClientRecommendationsContent({ id }: { id: string }) {
  const router = useRouter()
  const [client, setClient] = useState<Client | null>(null)
  const [referredClients, setReferredClients] = useState<ReferredClient[]>([])
  const [timeline, setTimeline] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [id])

  async function loadData() {
    setLoading(true)
    try {
      const [clientRes, referredRes, timelineRes] = await Promise.all([
        clientsApi.getById(id),
        referredClientsApi.getBySourceClient(id),
        clientsApi.getTimeline(id),
      ])
      if (clientRes.success && clientRes.data) setClient(clientRes.data)
      if (referredRes.success && referredRes.data) setReferredClients(referredRes.data)
      if (timelineRes.success && timelineRes.data) setTimeline(timelineRes.data)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSendOffer(referredId: string) {
    try {
      await referredClientsApi.startOffer(referredId, "1")
      loadData()
    } catch (error) {
      console.error("Error sending offer:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando recomendados...</p>
        </div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Cliente nao encontrado</p>
        <Button variant="ghost" onClick={() => router.back()} className="mt-4">Voltar</Button>
      </div>
    )
  }

  const stats = {
    total: referredClients.length,
    new: referredClients.filter((r) => r.status === "new").length,
    contacted: referredClients.filter((r) => r.status === "contact_initiated").length,
    offerSent: referredClients.filter((r) => r.status === "offer_sent").length,
    converted: referredClients.filter((r) => r.status === "converted").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/clients")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground text-balance">{client.name}</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Phone className="h-3.5 w-3.5" />
              {client.phone}
              {client.email && (<><span>{"  \u2022  "}</span>{client.email}</>)}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="w-fit gap-1.5 text-sm px-3 py-1.5">
          <Users className="h-4 w-4" />
          {client.recommendationCount} recomendacoes feitas
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-border bg-card">
          <CardContent className="pt-4 pb-4">
            <div className="text-sm text-muted-foreground mb-1">Total Recomendados</div>
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="pt-4 pb-4">
            <div className="text-sm text-muted-foreground mb-1">Novos</div>
            <div className="text-2xl font-bold text-slate-400">{stats.new}</div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="pt-4 pb-4">
            <div className="text-sm text-muted-foreground mb-1">Contatados</div>
            <div className="text-2xl font-bold text-blue-400">{stats.contacted}</div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="pt-4 pb-4">
            <div className="text-sm text-muted-foreground mb-1">Oferta Enviada</div>
            <div className="text-2xl font-bold text-yellow-400">{stats.offerSent}</div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="pt-4 pb-4">
            <div className="text-sm text-muted-foreground mb-1">Convertidos</div>
            <div className="text-2xl font-bold text-green-400">{stats.converted}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Referred Clients List */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Pessoas Recomendadas</h2>
          {referredClients.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-medium text-foreground mb-2">Nenhum recomendado ainda</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Este cliente ainda nao enviou recomendacoes. Inicie o fluxo de recomendacao para comecar a receber contatos.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {referredClients.map((referred) => {
                const statusInfo = referredStatusConfig[referred.status]
                const StatusIcon = statusInfo?.icon || UserPlus
                return (
                  <Card key={referred.id} className="border-border bg-card">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <div>
                              <h3 className="font-semibold text-foreground">{referred.name}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <Phone className="h-3.5 w-3.5" />
                                {referred.phone}
                              </div>
                            </div>
                            <Badge variant="outline" className={`${statusInfo?.color} gap-1.5`}>
                              <StatusIcon className="h-3 w-3" />
                              {statusInfo?.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
                            <span>{referred.messagesSent} mensagens enviadas</span>
                            {referred.lastContactDate && (
                              <>
                                <span>{"\u2022"}</span>
                                <span>Ultimo contato: {new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(referred.lastContactDate))}</span>
                              </>
                            )}
                            {referred.convertedDate && (
                              <>
                                <span>{"\u2022"}</span>
                                <span className="text-green-400">Convertido em {new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(referred.convertedDate))}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {referred.status === "new" && (
                            <Button size="sm" className="gap-2" onClick={() => handleSendOffer(referred.id)}>
                              <MessageSquare className="h-4 w-4" />
                              Iniciar Contato
                            </Button>
                          )}
                          {referred.status === "contact_initiated" && (
                            <Button size="sm" className="gap-2" onClick={() => handleSendOffer(referred.id)}>
                              <Send className="h-4 w-4" />
                              Enviar Oferta
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Linha do Tempo</h2>
          <Card className="border-border bg-card">
            <CardContent className="pt-4 pb-4">
              {timeline.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum evento ainda</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {timeline.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((event, index) => {
                    const Icon = timelineIcons[event.type] || MessageSquare
                    return (
                      <div key={event.id} className="relative">
                        {index !== timeline.length - 1 && (
                          <div className="absolute left-4 top-9 bottom-0 w-px bg-border" />
                        )}
                        <div className="flex gap-3">
                          <div className="bg-primary/10 p-2 rounded-full h-fit shrink-0">
                            <Icon className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground leading-relaxed">{event.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(event.createdAt))}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
