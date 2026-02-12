"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { agentsApi } from "@/services/api"
import type { Agent } from "@/types"
import { Plus, Sparkles, Edit, Power, PowerOff, Loader2 } from "lucide-react"

export default function AgentsPage() {
  const router = useRouter()
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAgents()
  }, [])

  const loadAgents = async () => {
    setIsLoading(true)
    try {
      const response = await agentsApi.getAll()
      if (response.success && response.data) {
        setAgents(response.data)
      }
    } catch (error) {
      console.error("[v0] Error loading agents:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleAgentStatus = async (agent: Agent) => {
    const newStatus = agent.status === "active" ? "inactive" : "active"
    const response = await agentsApi.update(agent.id, { status: newStatus })
    if (response.success) {
      loadAgents()
    }
  }

  const getToneLabel = (tone: string) => {
    const labels: Record<string, string> = {
      professional: "Profissional",
      friendly: "Amigável",
      casual: "Casual",
      formal: "Formal",
    }
    return labels[tone] || tone
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando agentes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Agentes de IA</h1>
          <p className="mt-1 text-muted-foreground">Gerencie seus agentes de recomendação automatizada</p>
        </div>
        <Button onClick={() => router.push("/dashboard/agents/new")} className="gap-2">
          <Plus className="h-4 w-4" />
          Criar Novo Agente
        </Button>
      </div>

      {/* Agents List */}
      {agents.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Sparkles className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium text-foreground mb-2">Nenhum agente criado ainda</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              Crie seu primeiro agente de IA para começar a solicitar recomendações dos seus clientes via WhatsApp
            </p>
            <Button onClick={() => router.push("/dashboard/agents/new")} className="gap-2">
              <Plus className="h-4 w-4" />
              Criar Primeiro Agente
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {agents.map((agent) => (
            <Card key={agent.id} className="border-border bg-card hover:bg-card/80 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-foreground">{agent.name}</CardTitle>
                      <CardDescription className="mt-1">{agent.companyName}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={agent.status === "active" ? "default" : "secondary"}>
                    {agent.status === "active" ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Tom de voz</p>
                    <p className="text-sm text-foreground">{getToneLabel(agent.toneOfVoice)}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Mensagem inicial</p>
                    <p className="text-sm text-foreground line-clamp-2">{agent.messageToClient}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Oferta</p>
                    <p className="text-sm text-foreground line-clamp-1">{agent.offerDescription}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Presente/Bônus</p>
                    <p className="text-sm text-foreground line-clamp-1">{agent.messageGiftToRecommender}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2 bg-transparent"
                    onClick={() => router.push(`/dashboard/agents/${agent.id}/edit`)}
                  >
                    <Edit className="h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    variant={agent.status === "active" ? "secondary" : "default"}
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => toggleAgentStatus(agent)}
                  >
                    {agent.status === "active" ? (
                      <>
                        <PowerOff className="h-4 w-4" />
                        Desativar
                      </>
                    ) : (
                      <>
                        <Power className="h-4 w-4" />
                        Ativar
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
