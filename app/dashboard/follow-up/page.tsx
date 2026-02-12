"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { followUpApi } from "@/services/api"
import type { FollowUpCampaign } from "@/types"
import {
  Plus,
  Send,
  Clock,
  CheckCircle2,
  FileText,
  Loader2,
  Users,
  BarChart3,
  Trash2,
  Megaphone,
  AlertCircle,
} from "lucide-react"

const audienceLabels: Record<string, string> = {
  all_clients: "Todos os clientes",
  no_recommendations: "Sem recomendacoes",
  partial_recommendations: "Recomendacoes parciais",
  completed: "Recomendacoes completas",
  referred: "Recomendados",
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Send }> = {
  draft: { label: "Rascunho", color: "bg-slate-500/10 text-slate-400 border-slate-500/20", icon: FileText },
  scheduled: { label: "Agendada", color: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: Clock },
  sent: { label: "Enviada", color: "bg-green-500/10 text-green-400 border-green-500/20", icon: CheckCircle2 },
}

export default function FollowUpPage() {
  const [campaigns, setCampaigns] = useState<FollowUpCampaign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSending, setIsSending] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    message: "",
    targetAudience: "all_clients" as FollowUpCampaign["targetAudience"],
    status: "draft" as FollowUpCampaign["status"],
    recipientCount: 0,
  })

  useEffect(() => {
    loadCampaigns()
  }, [])

  const loadCampaigns = async () => {
    setIsLoading(true)
    try {
      const response = await followUpApi.getAll()
      if (response.success && response.data) {
        setCampaigns(response.data)
      }
    } catch (error) {
      console.error("Error loading campaigns:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCampaign = async () => {
    if (!newCampaign.name || !newCampaign.message) return
    setIsSaving(true)
    try {
      const response = await followUpApi.create({
        ...newCampaign,
        recipientCount: Math.floor(Math.random() * 80) + 20,
      })
      if (response.success) {
        setIsModalOpen(false)
        setNewCampaign({ name: "", message: "", targetAudience: "all_clients", status: "draft", recipientCount: 0 })
        loadCampaigns()
      }
    } catch (error) {
      console.error("Error creating campaign:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSendCampaign = async (campaignId: string) => {
    setIsSending(campaignId)
    try {
      const response = await followUpApi.send(campaignId)
      if (response.success) {
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 5000)
        loadCampaigns()
      }
    } catch (error) {
      console.error("Error sending campaign:", error)
    } finally {
      setIsSending(null)
    }
  }

  const handleDeleteCampaign = async (campaignId: string) => {
    try {
      await followUpApi.delete(campaignId)
      loadCampaigns()
    } catch (error) {
      console.error("Error deleting campaign:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando campanhas...</p>
        </div>
      </div>
    )
  }

  const draftCampaigns = campaigns.filter((c) => c.status === "draft")
  const scheduledCampaigns = campaigns.filter((c) => c.status === "scheduled")
  const sentCampaigns = campaigns.filter((c) => c.status === "sent")

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Follow-Up e Campanhas</h1>
          <p className="mt-1 text-muted-foreground">Dispare mensagens para sua base de clientes e recomendados</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Campanha
        </Button>
      </div>

      {showSuccess && (
        <Alert className="border-green-500/50 bg-green-500/10">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-500">
            Campanha enviada com sucesso! As mensagens estao sendo disparadas via WhatsApp.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rascunhos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{draftCampaigns.length}</div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Agendadas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{scheduledCampaigns.length}</div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Enviadas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{sentCampaigns.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      {campaigns.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Megaphone className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium text-foreground mb-2">Nenhuma campanha criada</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              Crie campanhas de follow-up para enviar mensagens em massa para sua base de clientes e recomendados
            </p>
            <Button onClick={() => setIsModalOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Criar Primeira Campanha
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {campaigns.map((campaign) => {
            const status = statusConfig[campaign.status]
            const StatusIcon = status?.icon || FileText
            return (
              <Card key={campaign.id} className="border-border bg-card">
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <h3 className="font-semibold text-lg text-foreground">{campaign.name}</h3>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {audienceLabels[campaign.targetAudience]}
                          </Badge>
                        </div>
                        <Badge variant="outline" className={`${status?.color} gap-1.5`}>
                          <StatusIcon className="h-3 w-3" />
                          {status?.label}
                        </Badge>
                      </div>

                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-sm text-foreground leading-relaxed">{campaign.message}</p>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {campaign.recipientCount} destinatarios
                        </span>
                        {campaign.openRate !== undefined && (
                          <span className="flex items-center gap-1">
                            <BarChart3 className="h-3.5 w-3.5" />
                            {campaign.openRate}% taxa de abertura
                          </span>
                        )}
                        {campaign.sentAt && (
                          <span>
                            Enviada em {new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(campaign.sentAt))}
                          </span>
                        )}
                        {campaign.scheduledAt && campaign.status === "scheduled" && (
                          <span>
                            Agendada para {new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(campaign.scheduledAt))}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      {(campaign.status === "draft" || campaign.status === "scheduled") && (
                        <Button
                          size="sm"
                          onClick={() => handleSendCampaign(campaign.id)}
                          disabled={isSending === campaign.id}
                          className="gap-2"
                        >
                          {isSending === campaign.id ? (
                            <><Loader2 className="h-4 w-4 animate-spin" />Enviando...</>
                          ) : (
                            <><Send className="h-4 w-4" />Enviar Agora</>
                          )}
                        </Button>
                      )}
                      {campaign.status === "draft" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteCampaign(campaign.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Create Campaign Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle>Nova Campanha de Follow-Up</DialogTitle>
            <DialogDescription>
              Crie uma campanha para disparar mensagens via WhatsApp para sua base
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Nome da Campanha *</Label>
              <Input
                placeholder="Ex: Promocao de Janeiro"
                value={newCampaign.name}
                onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label>Publico Alvo *</Label>
              <Select
                value={newCampaign.targetAudience}
                onValueChange={(value) => setNewCampaign({ ...newCampaign, targetAudience: value as FollowUpCampaign["targetAudience"] })}
              >
                <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_clients">Todos os clientes</SelectItem>
                  <SelectItem value="no_recommendations">Clientes sem recomendacoes</SelectItem>
                  <SelectItem value="partial_recommendations">Clientes com recomendacoes parciais</SelectItem>
                  <SelectItem value="completed">Clientes com recomendacoes completas</SelectItem>
                  <SelectItem value="referred">Pessoas recomendadas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Mensagem *</Label>
              <Textarea
                placeholder={"Ex: Ola {nome_cliente}! Temos uma promocao especial para voce..."}
                value={newCampaign.message}
                onChange={(e) => setNewCampaign({ ...newCampaign, message: e.target.value })}
                rows={5}
                className="bg-background resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {"Use variaveis como {nome_cliente}, {empresa}, {quantidade}, {faltam} para personalizar"}
              </p>
            </div>

            <Alert className="bg-muted/50 border-border">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                As mensagens serao enviadas via WhatsApp atraves da integracao com n8n. Certifique-se de que o WhatsApp esta conectado.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={handleCreateCampaign} disabled={isSaving || !newCampaign.name || !newCampaign.message} className="gap-2">
              {isSaving ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Criando...</>
              ) : (
                <><Plus className="h-4 w-4" />Criar Campanha</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
