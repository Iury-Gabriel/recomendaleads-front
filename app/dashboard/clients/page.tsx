"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { clientsApi, agentsApi } from "@/services/api"
import type { Client, ClientFormData, Agent } from "@/types"
import {
  Plus,
  Users,
  Loader2,
  Save,
  Search,
  Mail,
  Phone,
  PlayCircle,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react"

export default function ClientsPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [startingRecommendation, setStartingRecommendation] = useState<string | null>(null)
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [formData, setFormData] = useState<ClientFormData>({
    name: "",
    phone: "",
    email: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [clientsResponse, agentsResponse] = await Promise.all([clientsApi.getAll(), agentsApi.getAll()])
      if (clientsResponse.success && clientsResponse.data) {
        setClients(clientsResponse.data)
      }
      if (agentsResponse.success && agentsResponse.data) {
        setAgents(agentsResponse.data)
      }
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const response = await clientsApi.create(formData)
      if (response.success) {
        setIsModalOpen(false)
        setFormData({ name: "", phone: "", email: "" })
        loadData()
      }
    } catch (error) {
      console.error("Error creating client:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleStartRecommendations = async (clientId: string) => {
    const activeAgent = agents.find((a) => a.status === "active")
    if (!activeAgent) {
      alert("Você precisa ter pelo menos um agente ativo para iniciar recomendações")
      return
    }

    setStartingRecommendation(clientId)
    try {
      // future webhook n8n - This will trigger the WhatsApp conversation
      const response = await clientsApi.startRecommendations(clientId, activeAgent.id)
      if (response.success) {
        setShowSuccessAlert(true)
        setTimeout(() => setShowSuccessAlert(false), 5000)
        loadData()
      }
    } catch (error) {
      console.error("Error starting recommendations:", error)
    } finally {
      setStartingRecommendation(null)
    }
  }

  const handleViewReferred = async (clientId: string) => {
    router.push(`/dashboard/clients/${clientId}`)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      { variant: "default" | "secondary" | "outline"; label: string; color: string; icon: any }
    > = {
      not_started: {
        variant: "outline",
        label: "Não iniciado",
        color: "bg-slate-500/10 text-slate-500 border-slate-500/20",
        icon: AlertCircle,
      },
      collecting_recommendations: {
        variant: "default",
        label: "Coletando recomendações",
        color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        icon: Clock,
      },
      recommendations_completed: {
        variant: "secondary",
        label: "Recomendações finalizadas",
        color: "bg-green-500/10 text-green-500 border-green-500/20",
        icon: CheckCircle,
      },
    }
    const config = variants[status] || { variant: "outline", label: status, color: "", icon: AlertCircle }
    const Icon = config.icon
    return (
      <Badge variant={config.variant} className={`${config.color} gap-1.5`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando clientes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestão de Clientes</h1>
          <p className="mt-1 text-muted-foreground">Gerencie sua base de clientes e solicite recomendações</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Cliente
        </Button>
      </div>

      {showSuccessAlert && (
        <Alert className="border-green-500/50 bg-green-500/10">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-500">
            O agente de IA iniciou a conversa com este cliente via WhatsApp!
          </AlertDescription>
        </Alert>
      )}

      {/* Search */}
      <Card className="border-border bg-card">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, telefone ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clients List */}
      {filteredClients.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium text-foreground mb-2">
              {searchTerm ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              {searchTerm
                ? "Tente buscar com outros termos"
                : "Adicione clientes para começar a solicitar recomendações via WhatsApp"}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsModalOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Primeiro Cliente
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">
              {filteredClients.length} {filteredClients.length === 1 ? "Cliente" : "Clientes"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="flex flex-col gap-4 rounded-lg border border-border bg-background p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <h3 className="font-semibold text-foreground">{client.name}</h3>
                          <div className="mt-1 flex flex-col gap-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Phone className="h-3.5 w-3.5" />
                              <span>{client.phone}</span>
                            </div>
                            {client.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="h-3.5 w-3.5" />
                                <span>{client.email}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {getStatusBadge(client.status)}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          <strong className="text-foreground">{client.recommendationCount}</strong> recomendações
                        </span>
                        {client.lastRecommendationDate && (
                          <>
                            <span>•</span>
                            <span>
                              Última:{" "}
                              {new Intl.DateTimeFormat("pt-BR", {
                                day: "2-digit",
                                month: "short",
                              }).format(new Date(client.lastRecommendationDate))}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                      {client.status === "not_started" && (
                        <Button
                          onClick={() => handleStartRecommendations(client.id)}
                          disabled={startingRecommendation === client.id}
                          className="gap-2 bg-primary hover:bg-primary/90"
                          size="sm"
                        >
                          {startingRecommendation === client.id ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Iniciando...
                            </>
                          ) : (
                            <>
                              <PlayCircle className="h-4 w-4" />
                              Iniciar recomendações
                            </>
                          )}
                        </Button>
                      )}

                      {(client.status === "collecting_recommendations" ||
                        client.status === "recommendations_completed") && (
                        <Button
                          onClick={() => handleViewReferred(client.id)}
                          variant="outline"
                          className="gap-2"
                          size="sm"
                        >
                          <Eye className="h-4 w-4" />
                          Ver recomendados ({client.recommendationCount})
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Client Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Cliente</DialogTitle>
            <DialogDescription>Preencha os dados do cliente para adicionar à sua base</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Nome Completo *</Label>
              <Input
                id="clientName"
                placeholder="João Silva"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientPhone">Telefone (com DDD) *</Label>
              <Input
                id="clientPhone"
                type="tel"
                placeholder="+5511987654321"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                className="bg-background"
              />
              <p className="text-xs text-muted-foreground">Formato: +5511987654321</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientEmail">Email (opcional)</Label>
              <Input
                id="clientEmail"
                type="email"
                placeholder="joao@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-background"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={isSaving}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving} className="flex-1 gap-2">
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Adicionar
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
