"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { whatsappApi } from "@/services/api"
import type { WhatsAppConnection } from "@/types"
import { MessageCircle, Loader2, QrCode, CheckCircle2, XCircle, AlertCircle, Smartphone, Plus, RefreshCw, Trash2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function WhatsAppPage() {
  const [instances, setInstances] = useState<WhatsAppConnection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [instanceName, setInstanceName] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  // Track loading/connecting state per instance token
  const [connectingInstances, setConnectingInstances] = useState<Record<string, boolean>>({})
  
  const pollInterval = useRef<NodeJS.Timeout | null>(null)
  
  // Ref to keep track of instances inside the interval closure
  const instancesRef = useRef<WhatsAppConnection[]>([])
  
  useEffect(() => {
    instancesRef.current = instances
  }, [instances])

  useEffect(() => {
    loadInstances()
    startPolling()
    return () => stopPolling()
  }, [])

  const startPolling = () => {
    if (pollInterval.current) return
    // Poll every 10 seconds
    pollInterval.current = setInterval(checkStatuses, 10000)
  }

  const stopPolling = () => {
    if (pollInterval.current) {
      clearInterval(pollInterval.current)
      pollInterval.current = null
    }
  }



  // Track which instance we are actively polling
  const [pollingInstanceToken, setPollingInstanceToken] = useState<string | null>(null)
  const pollingTokenRef = useRef<string | null>(null)

  useEffect(() => {
    pollingTokenRef.current = pollingInstanceToken
  }, [pollingInstanceToken])

  const checkStatuses = async () => {
    const activeToken = pollingTokenRef.current
    if (!activeToken) return

    try {
        const response = await whatsappApi.checkStatus(activeToken)
        // If status changed to connected
        if (response.success && response.data?.instance?.status === 'connected') {
            // We found a connection!
            setPollingInstanceToken(null) // Stop polling specific instance
            loadInstances() // Refresh full list
        }
    } catch (e) {
        console.error("Error checking status for active instance", e)
    }
  }

  const loadInstances = async () => {
    // Don't set global loading on subsequent polls to avoid flicker, only initial
    try {
      const response = await whatsappApi.getConnection()
      if (response.success && response.data) {
        if (Array.isArray(response.data)) {
            setInstances(response.data)
        } else {
            setInstances([])
        }
      }
    } catch (error) {
      console.error("[v0] Error loading WhatsApp instances:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateInstance = async () => {
    if (!instanceName) return
    setIsCreating(true)
    try {
      const response = await whatsappApi.createInstance(instanceName)
      if (response.success) {
        setIsDialogOpen(false)
        setInstanceName("")
        loadInstances() // Refresh list
      }
    } catch (error) {
      console.error("Error creating instance:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleConnect = async (instance: WhatsAppConnection) => {
    if (!instance.instanceToken) return
    
    setConnectingInstances(prev => ({ ...prev, [instance.instanceToken!]: true }))
    try {
      const response = await whatsappApi.connect(instance.instanceToken)
      if (response.success) {
        // Update local state with the new QR code directly
        const qrCode = response.data?.qrCode
        if (qrCode) {
             setInstances(prev => prev.map(i => 
                 i.instanceToken === instance.instanceToken 
                 ? { ...i, status: 'connecting', qrCode: qrCode } 
                 : i
             ))
             // Start polling this specific instance
             setPollingInstanceToken(instance.instanceToken)
        } else {
             loadInstances()
        }
      }
    } catch (error) {
      console.error("[v0] Error connecting WhatsApp:", error)
    } finally {
       setConnectingInstances(prev => ({ ...prev, [instance.instanceToken!]: false }))
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return (
          <Badge className="gap-1 bg-green-500/10 text-green-500 hover:bg-green-500/20">
            <CheckCircle2 className="h-3 w-3" />
            Conectado
          </Badge>
        )
      case "connecting":
        return (
          <Badge variant="secondary" className="gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Conectando
          </Badge>
        )
      case "disconnected":
      default:
        return (
          <Badge variant="outline" className="gap-1">
            <XCircle className="h-3 w-3" />
            Desconectado
          </Badge>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando instâncias...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-bold tracking-tight text-foreground">Integração WhatsApp</h1>
           <p className="mt-1 text-muted-foreground">Gerencie suas instâncias do WhatsApp para automação</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Nova Instância
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Instância do WhatsApp</DialogTitle>
              <DialogDescription>
                Dê um nome para sua nova instância.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nome
                </Label>
                <Input
                  id="name"
                  value={instanceName}
                  onChange={(e) => setInstanceName(e.target.value)}
                  placeholder="Ex: WhatsApp Vendas"
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateInstance} disabled={isCreating || !instanceName}>
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  "Criar Instância"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Instances List */}
      <div className="grid gap-6">
        {instances.length === 0 ? (
           <Card className="border-dashed">
             <CardContent className="flex flex-col items-center justify-center py-10 text-center">
               <MessageCircle className="h-10 w-10 text-muted-foreground mb-4" />
               <p className="text-lg font-medium">Nenhuma instância encontrada</p>
               <p className="text-sm text-muted-foreground mb-4">Crie sua primeira instância para começar.</p>
               <Button variant="outline" onClick={() => setIsDialogOpen(true)}>Criar Instância</Button>
             </CardContent>
           </Card>
        ) : (
           instances.map((instance) => (
             <Card key={instance.instanceToken} className="overflow-hidden">
               <CardHeader className="bg-muted/30 pb-4">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                       <Smartphone className="h-5 w-5 text-primary" />
                     </div>
                     <div>
                       <CardTitle className="text-lg">{instance.instanceName}</CardTitle>
                       <CardDescription>
                         {instance.phoneNumber ? `Conectado: ${instance.phoneNumber}` : "Não conectado"}
                       </CardDescription>
                     </div>
                   </div>
                   {getStatusBadge(instance.status)}
                 </div>
               </CardHeader>
               <CardContent className="pt-6">
                  {instance.status === "connected" ? (
                    <div className="flex items-center justify-between">
                       <div className="space-y-1">
                          <p className="text-sm font-medium">Status da Conexão</p>
                          <p className="text-sm text-muted-foreground">
                            Última atividade: {instance.lastActivityAt ? new Date(instance.lastActivityAt).toLocaleString() : 'N/A'}
                          </p>
                       </div>
                       <Button variant="outline" disabled className="gap-2">
                         <CheckCircle2 className="h-4 w-4 text-green-500" /> WhatsApp Conectado
                       </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                       {instance.status === "connecting" && instance.qrCode && (
                          <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border border-border">
                             <p className="text-sm font-medium mb-3">Escaneie o QR Code no seu WhatsApp</p>
                             <img src={instance.qrCode} alt="QR Code" className="w-48 h-48 object-contain" />
                          </div>
                       )}

                       <div className="flex items-center justify-between">
                         <div className="space-y-1">
                           <p className="text-sm font-medium">Ações da Instância</p>
                           <p className="text-sm text-muted-foreground">Clique para iniciar a conexão</p>
                         </div>
                         <Button 
                           onClick={() => handleConnect(instance)} 
                           disabled={connectingInstances[instance.instanceToken!] || (instance.status === "connecting" && !!instance.qrCode)}
                           className="gap-2"
                         >
                            {connectingInstances[instance.instanceToken!] || (instance.status === "connecting" && !!instance.qrCode) ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" /> Conectando...
                              </>
                            ) : (
                              <>Conectar WhatsApp</>
                            )}
                         </Button>
                       </div>
                    </div>
                  )}
               </CardContent>
             </Card>
           ))
        )}
      </div>

      {/* Integration Info */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Sobre a Integração</CardTitle>
          <CardDescription>Como funciona a conexão com WhatsApp</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                1
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Crie Instâncias</p>
                <p>
                  Você pode criar múltiplas instâncias para gerenciar diferentes números de WhatsApp.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                2
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Conecte via QR Code</p>
                <p>
                  Para cada instância, clique em Conectar e escaneie o QR Code gerado pelo sistema.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
