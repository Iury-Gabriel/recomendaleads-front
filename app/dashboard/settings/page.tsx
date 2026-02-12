"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { settingsApi } from "@/services/api"
import type { Settings } from "@/types"
import { Loader2, Save, AlertCircle, Building2, Globe, Webhook } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [settings, setSettings] = useState<Settings>({
    userId: "1",
    companyName: "",
    companyDescription: "",
    companyContext: "",
    language: "pt-BR",
    webhookUrl: "",
    apiKey: "",
    notificationsEnabled: true,
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setIsLoading(true)
    try {
      const response = await settingsApi.get()
      if (response.success && response.data) {
        setSettings(response.data)
      }
    } catch (error) {
      console.error("Error loading settings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setShowSuccess(false)
    try {
      const response = await settingsApi.update(settings)
      if (response.success) {
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      }
    } catch (error) {
      console.error("Error updating settings:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando configuracoes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Configuracoes</h1>
        <p className="mt-1 text-muted-foreground">Gerencie as configuracoes da sua conta e integracoes</p>
      </div>

      {showSuccess && (
        <Alert className="bg-green-500/10 border-green-500/20">
          <AlertCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-500">Configuracoes salvas com sucesso!</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Company Info */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Informacoes da Empresa
            </CardTitle>
            <CardDescription>Dados da sua organizacao usados pelo agente de IA nas mensagens</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="companyName">Nome da Empresa *</Label>
              <Input
                id="companyName"
                value={settings.companyName}
                onChange={(e) => updateSetting("companyName", e.target.value)}
                required
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyDescription">Descricao da Empresa *</Label>
              <Textarea
                id="companyDescription"
                placeholder="Descreva brevemente o que sua empresa faz, seus produtos e servicos principais..."
                value={settings.companyDescription}
                onChange={(e) => updateSetting("companyDescription", e.target.value)}
                rows={4}
                className="bg-background resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Esta descricao sera usada pela IA para entender seu negocio e gerar mensagens mais contextualizadas
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyContext">Contexto e Segmento de Atuacao</Label>
              <Textarea
                id="companyContext"
                placeholder="Ex: Atuamos no segmento B2B de tecnologia. Nossos clientes sao empresas de medio porte que buscam automacao..."
                value={settings.companyContext}
                onChange={(e) => updateSetting("companyContext", e.target.value)}
                rows={4}
                className="bg-background resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Informacoes sobre seu publico-alvo, segmento, tom de comunicacao preferido e qualquer contexto relevante para o agente
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Localization */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Localizacao
            </CardTitle>
            <CardDescription>Idioma e preferencias regionais</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="language">Idioma *</Label>
              <Select value={settings.language} onValueChange={(value) => updateSetting("language", value as Settings["language"])}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-BR">Portugues (Brasil)</SelectItem>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="es-ES">Espanol</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Integration Settings */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5 text-primary" />
              Integracoes e API
            </CardTitle>
            <CardDescription>Configure webhooks e chaves de API para integracao com n8n</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="webhookUrl">Webhook URL</Label>
              <Input
                id="webhookUrl"
                type="url"
                placeholder="https://api.exemplo.com/webhook"
                value={settings.webhookUrl}
                onChange={(e) => updateSetting("webhookUrl", e.target.value)}
                className="bg-background"
              />
              <p className="text-xs text-muted-foreground">
                URL que recebera notificacoes sobre recomendacoes e mensagens (usado pelo n8n)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="text"
                value={settings.apiKey}
                className="bg-background font-mono"
                readOnly
              />
              <p className="text-xs text-muted-foreground">
                Chave de API para autenticacao (somente leitura - gerada automaticamente)
              </p>
            </div>

            <Alert className="bg-muted/50 border-border">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Configure o webhook URL no n8n para receber eventos em tempo real sobre suas recomendacoes e conversas do WhatsApp
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving} className="gap-2">
            {isSaving ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Salvando...</>
            ) : (
              <><Save className="h-4 w-4" />Salvar Configuracoes</>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
