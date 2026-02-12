"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { agentsApi } from "@/services/api"
import type { Agent, AgentFormData, GamificationRule, FollowUpMessage } from "@/types"
import { ArrowLeft, Loader2, Save, Plus, Trash2, Trophy, MessageCircle } from "lucide-react"

export default function EditAgentPage() {
  const router = useRouter()
  const params = useParams()
  const agentId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [agent, setAgent] = useState<Agent | null>(null)
  const [formData, setFormData] = useState<AgentFormData>({
    name: "",
    companyName: "",
    toneOfVoice: "professional",
    messageToClient: "",
    messageGiftToRecommender: "",
    messageToReferred: "",
    messageGiftToReferred: "",
    recommendationRule: "",
    offerDescription: "",
    gamificationRules: [],
    followUpMessages: [],
    status: "active",
  })

  useEffect(() => {
    loadAgent()
  }, [agentId])

  const loadAgent = async () => {
    setIsLoading(true)
    try {
      const response = await agentsApi.getById(agentId)
      if (response.success && response.data) {
        setAgent(response.data)
        setFormData({
          name: response.data.name,
          companyName: response.data.companyName,
          toneOfVoice: response.data.toneOfVoice,
          messageToClient: response.data.messageToClient,
          messageGiftToRecommender: response.data.messageGiftToRecommender,
          messageToReferred: response.data.messageToReferred,
          messageGiftToReferred: response.data.messageGiftToReferred,
          recommendationRule: response.data.recommendationRule,
          offerDescription: response.data.offerDescription,
          gamificationRules: response.data.gamificationRules || [],
          followUpMessages: response.data.followUpMessages || [],
          status: response.data.status,
        })
      }
    } catch (error) {
      console.error("Error loading agent:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const response = await agentsApi.update(agentId, formData)
      if (response.success) {
        router.push("/dashboard/agents")
      }
    } catch (error) {
      console.error("Error updating agent:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const updateFormData = (field: keyof AgentFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addGamificationRule = () => {
    const newRule: GamificationRule = {
      id: String(Date.now()),
      leadsRequired: (formData.gamificationRules.length + 1) * 5,
      bonusDescription: "",
      bonusMultiplier: formData.gamificationRules.length + 1,
    }
    updateFormData("gamificationRules", [...formData.gamificationRules, newRule])
  }

  const updateGamificationRule = (index: number, field: keyof GamificationRule, value: unknown) => {
    const updated = [...formData.gamificationRules]
    updated[index] = { ...updated[index], [field]: value }
    updateFormData("gamificationRules", updated)
  }

  const removeGamificationRule = (index: number) => {
    updateFormData("gamificationRules", formData.gamificationRules.filter((_, i) => i !== index))
  }

  const addFollowUpMessage = () => {
    const newMsg: FollowUpMessage = {
      id: String(Date.now()),
      name: "",
      trigger: "no_recommendations_sent",
      delayHours: 24,
      message: "",
      isActive: true,
    }
    updateFormData("followUpMessages", [...formData.followUpMessages, newMsg])
  }

  const updateFollowUpMessage = (index: number, field: keyof FollowUpMessage, value: unknown) => {
    const updated = [...formData.followUpMessages]
    updated[index] = { ...updated[index], [field]: value }
    updateFormData("followUpMessages", updated)
  }

  const removeFollowUpMessage = (index: number) => {
    updateFormData("followUpMessages", formData.followUpMessages.filter((_, i) => i !== index))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando agente...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <Button variant="ghost" onClick={() => router.back()} className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Editar Agente</h1>
        <p className="mt-1 text-muted-foreground">Atualize as configuracoes do seu agente de IA</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Informacoes Basicas</CardTitle>
            <CardDescription>Dados gerais do agente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Nome do Agente *</Label>
                <Input value={formData.name} onChange={(e) => updateFormData("name", e.target.value)} required className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label>Nome da Empresa *</Label>
                <Input value={formData.companyName} onChange={(e) => updateFormData("companyName", e.target.value)} required className="bg-background" />
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Tom de Voz *</Label>
                <Select value={formData.toneOfVoice} onValueChange={(value) => updateFormData("toneOfVoice", value)}>
                  <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Profissional</SelectItem>
                    <SelectItem value="friendly">Amigavel</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status *</Label>
                <Select value={formData.status} onValueChange={(value) => updateFormData("status", value)}>
                  <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Regra de Recomendacao *</Label>
              <Textarea value={formData.recommendationRule} onChange={(e) => updateFormData("recommendationRule", e.target.value)} required rows={3} className="bg-background resize-none" />
            </div>
            <div className="space-y-2">
              <Label>Oferta para Recomendados *</Label>
              <Textarea value={formData.offerDescription} onChange={(e) => updateFormData("offerDescription", e.target.value)} required rows={2} className="bg-background resize-none" />
            </div>
          </CardContent>
        </Card>

        {/* 4 Messages */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Mensagens do Fluxo
            </CardTitle>
            <CardDescription>Configure as 4 mensagens do fluxo de recomendacao</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-primary font-semibold">1. Mensagem para o Cliente (pedindo recomendacao) *</Label>
              <Textarea value={formData.messageToClient} onChange={(e) => updateFormData("messageToClient", e.target.value)} required rows={4} className="bg-background resize-none" />
              <p className="text-xs text-muted-foreground">Enviada ao seu cliente pedindo que ele recomende amigos</p>
            </div>
            <div className="space-y-2">
              <Label className="text-primary font-semibold">2. Presente para o Recomendador (cliente) *</Label>
              <Textarea value={formData.messageGiftToRecommender} onChange={(e) => updateFormData("messageGiftToRecommender", e.target.value)} required rows={4} className="bg-background resize-none" />
              <p className="text-xs text-muted-foreground">Enviada quando o cliente atinge uma meta de recomendacoes</p>
            </div>
            <div className="space-y-2">
              <Label className="text-primary font-semibold">3. Mensagem para o Recomendado (amigo do cliente) *</Label>
              <Textarea value={formData.messageToReferred} onChange={(e) => updateFormData("messageToReferred", e.target.value)} required rows={4} className="bg-background resize-none" />
              <p className="text-xs text-muted-foreground">Primeira mensagem para a pessoa recomendada pelo seu cliente</p>
            </div>
            <div className="space-y-2">
              <Label className="text-primary font-semibold">4. Presente para o Recomendado *</Label>
              <Textarea value={formData.messageGiftToReferred} onChange={(e) => updateFormData("messageGiftToReferred", e.target.value)} required rows={4} className="bg-background resize-none" />
              <p className="text-xs text-muted-foreground">Mensagem com bonus enviada ao recomendado ao aceitar a oferta</p>
            </div>
          </CardContent>
        </Card>

        {/* Gamification */}
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-primary" />Gamificacao - Regua de Bonus</CardTitle>
                <CardDescription>Quantas recomendacoes para cada nivel de bonus</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addGamificationRule} className="gap-2 bg-transparent"><Plus className="h-4 w-4" />Adicionar Nivel</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.gamificationRules.map((rule, index) => (
              <div key={rule.id} className="flex items-start gap-4 rounded-lg border border-border bg-background p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">{index + 1}</div>
                <div className="flex-1 grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Leads necessarios</Label>
                    <Input type="number" min={1} value={rule.leadsRequired} onChange={(e) => updateGamificationRule(index, "leadsRequired", Number(e.target.value))} className="bg-card" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Multiplicador</Label>
                    <Input type="number" min={1} value={rule.bonusMultiplier} onChange={(e) => updateGamificationRule(index, "bonusMultiplier", Number(e.target.value))} className="bg-card" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Descricao do Bonus</Label>
                    <Input value={rule.bonusDescription} onChange={(e) => updateGamificationRule(index, "bonusDescription", e.target.value)} className="bg-card" />
                  </div>
                </div>
                {formData.gamificationRules.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeGamificationRule(index)} className="shrink-0 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Follow-Up Messages */}
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2"><MessageCircle className="h-5 w-5 text-primary" />Mensagens de Follow-Up</CardTitle>
                <CardDescription>Mensagens automaticas de acompanhamento</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addFollowUpMessage} className="gap-2 bg-transparent"><Plus className="h-4 w-4" />Adicionar Follow-Up</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.followUpMessages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma mensagem de follow-up configurada</p>
              </div>
            ) : (
              formData.followUpMessages.map((msg, index) => (
                <div key={msg.id} className="rounded-lg border border-border bg-background p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Input placeholder="Nome do follow-up" value={msg.name} onChange={(e) => updateFollowUpMessage(index, "name", e.target.value)} className="bg-card w-64" />
                      <div className="flex items-center gap-2">
                        <Switch checked={msg.isActive} onCheckedChange={(checked) => updateFollowUpMessage(index, "isActive", checked)} />
                        <span className="text-xs text-muted-foreground">{msg.isActive ? "Ativo" : "Inativo"}</span>
                      </div>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeFollowUpMessage(index)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-xs">Gatilho</Label>
                      <Select value={msg.trigger} onValueChange={(value) => updateFollowUpMessage(index, "trigger", value)}>
                        <SelectTrigger className="bg-card"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no_recommendations_sent">Nao enviou recomendacoes</SelectItem>
                          <SelectItem value="partial_recommendations">Recomendacoes parciais</SelectItem>
                          <SelectItem value="post_recommendation">Apos recomendacao</SelectItem>
                          <SelectItem value="custom">Personalizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Atraso (horas)</Label>
                      <Input type="number" min={1} value={msg.delayHours} onChange={(e) => updateFollowUpMessage(index, "delayHours", Number(e.target.value))} className="bg-card" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Mensagem</Label>
                    <Textarea value={msg.message} onChange={(e) => updateFollowUpMessage(index, "message", e.target.value)} rows={3} className="bg-card resize-none" />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">Cancelar</Button>
          <Button type="submit" disabled={isSaving} className="flex-1 gap-2">
            {isSaving ? (<><Loader2 className="h-4 w-4 animate-spin" />Salvando...</>) : (<><Save className="h-4 w-4" />Salvar Alteracoes</>)}
          </Button>
        </div>
      </form>
    </div>
  )
}
