"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { authApi, checkoutApi } from "@/services/api"
import { authHelpers } from "@/lib/auth"
import { Loader2, Check, ArrowRight, ArrowLeft, CreditCard, Lock, Calendar } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  
  // Step 1: Account Details
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [companyName, setCompanyName] = useState("")
  
  // Step 2: Plan
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  
  // Step 3: Payment Details
  const [cpf, setCpf] = useState("")
  const [phone, setPhone] = useState("") // "numero" in the payload
  const [cardName, setCardName] = useState("")
  const [cardNumber, setCardNumber] = useState("")
    const [cardExpiry, setCardExpiry] = useState("") // MM/YY
    const [cardCvv, setCardCvv] = useState("")
    // Installments are fixed per plan now

    const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const plans = [
    {
      id: "monthly",
      name: "Mensal",
      price: "R$ 997",
      period: "/mês",
      description: "Flexibilidade total para seu negócio",
      features: [
        "Automação WhatsApp Multi-instância",
        "CRM & Gestão de Leads",
        "Até 5 Agentes de IA",
        "Suporte por Email"
      ],
      highlight: false,
      // Assuming 1 mapped to monthly in backend if needed
      planId: 1 
    },
    {
      id: "quarterly",
      name: "Trimestral",
      price: "3x R$ 697",
      period: "",
      total: "R$ 2.091 à vista",
      description: "Economize 30% no plano trimestral",
      features: [
        "Tudo do plano Mensal",
        "Prioridade no Suporte",
        "Onboarding Assistido",
        "3 meses de acesso garantido"
      ],
      highlight: true,
      badge: "Mais Popular",
      planId: 2
    },
    {
      id: "semiannual",
      name: "Semestral",
      price: "6x R$ 497",
      period: "",
      total: "R$ 2.982 à vista",
      description: "Melhor custo-benefício para escalar",
      features: [
        "Tudo do plano Trimestral",
        "Consultoria de Implementação",
        "Até 10 Agentes de IA",
        "Acesso antecipado a novas features"
      ],
      highlight: false,
      badge: "Melhor Oferta",
      planId: 3
    }
  ]

  const formatCardNumber = (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim().slice(0, 19)
  }

  const formatExpiry = (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{2})(?=\d)/g, '$1/').trim().slice(0, 5)
  }
  
  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1')
  }

  const formatPhone = (value: string) => {
     // User JSON example: "5598999999999". Only numbers.
     // But for display maybe format? For now just keep raw numbers input or simple mask.
     return value.replace(/\D/g, '')
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password || !companyName) {
      setError("Por favor, preencha todos os campos")
      return
    }
    setError("")
    setIsLoading(true)

    try {
      const registerResponse = await authApi.register({ name, email, password, companyName })

      if (registerResponse.success && registerResponse.data) {
          authHelpers.setAuth(registerResponse.data.user, registerResponse.data.token)
          router.push("/dashboard")
      } else {
          setError(registerResponse.error || "Erro ao criar conta. Tente novamente.")
      }
    } catch (err) {
      console.error(err)
      setError("Erro inesperado. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlanSelection = (planId: string) => {
    setSelectedPlan(planId)
    setStep(3)
  }

  const handlePaymentAndRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!selectedPlan || !cardName || !cardNumber || !cardExpiry || !cardCvv || !cpf || !phone) {
        setError("Preencha todos os campos do pagamento")
        setIsLoading(false)
        return
    }

    const plan = plans.find(p => p.id === selectedPlan)
    if (!plan) {
         setError("Plano inválido")
         setIsLoading(false)
         return
    }

    // Parse Expiry
    const [month, yearFull] = cardExpiry.split('/')
    // Ensure year is 4 digits. If user typed 28 -> 2028
    const year = yearFull?.length === 2 ? `20${yearFull}` : yearFull

    const checkoutData = {
        nome: name,
        email: email,
        cpf: cpf.replace(/\D/g, ''),
        numero: phone.replace(/\D/g, ''),
        metodo_pagamento: "credito",
        plan: plan.planId,
        cartao: {
            number: cardNumber.replace(/\s/g, ''),
            cvv: cardCvv,
            month: month,
            year: year,
            name: cardName.toUpperCase(),
            installments: plan.id === 'monthly' ? 1 : plan.id === 'quarterly' ? 3 : 6
        }
    }

    try {
        // 1. Create Order
        const orderResponse = await checkoutApi.createOrder(checkoutData)
        
        if (!orderResponse.success) {
            setError(orderResponse.error || "Erro ao processar pagamento")
            setIsLoading(false)
            return
        }

        // 2. Register User (only if payment success)
        // Note: The requirement says "create the account normally". 
        // We use the data from Step 1.
        const registerResponse = await authApi.register({ name, email, password, companyName })

        if (registerResponse.success && registerResponse.data) {
            authHelpers.setAuth(registerResponse.data.user, registerResponse.data.token)
            router.push("/dashboard")
        } else {
            setError(registerResponse.error || "Pagamento aprovado, mas erro ao criar conta. Contate o suporte.")
            // Ideally we would have a fallback here or retry logic since payment was charged.
        }

    } catch (err) {
        console.error(err)
        setError("Erro inesperado. Tente novamente.")
    } finally {
        setIsLoading(false)
    }
  }

  // Calculate installments options based on plan
  const getInstallmentOptions = () => {
     if (!selectedPlan) return []
     const plan = plans.find(p => p.id === selectedPlan)
     if (!plan) return []
     
     // Simplistic logic: give 1 to 12 options for testing, or strictly follow plan description?
     // The plan description says "6x R$ ...". 
     // Let's provide up to 12x for all for flexibility or limit based on plan type?
     // User request didn't specify installment limits, but the plan cards imply it.
     // "Trimestral - 3x", "Semestral - 6x". 
     // Let's generic to 12x.
     return Array.from({ length: 12 }, (_, i) => i + 1)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 py-8">
      <div className={`w-full ${step === 2 || step === 3 ? 'max-w-7xl' : 'max-w-md'} transition-all duration-500`}>
        <div className="mb-8 text-center">
             <div className="mb-4 inline-flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-muted shadow-sm">
            <Image
              src="/logo.jpeg"
              alt="High Funnel"
              width={80}
              height={80}
              className="h-full w-full object-cover"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">High Funnel</h1>
          <p className="mt-2 text-lg font-medium text-foreground">
            {step === 1 ? "Crie sua conta" : step === 2 ? "Escolha o plano ideal" : "Finalizar Pagamento"}
          </p>
        </div>

        {/* STEP 1: ACCOUNT DATA */}
        {step === 1 && (
          <Card className="border-border bg-card animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader>
              <CardTitle className="text-xl">Dados da Conta</CardTitle>
              <CardDescription>Preencha seus dados para criar sua conta</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Seu nome"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="seu@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nome da Empresa</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    placeholder="Sua empresa"
                  />
                </div>

                {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

                <Button type="submit" className="w-full gap-2 group" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Criando conta...
                    </>
                  ) : (
                    <>
                      Criar Conta
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Já tem uma conta?{" "}
                  <Link href="/login" className="font-medium text-primary hover:underline">
                    Entrar
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 2: PLAN SELECTION */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
             <div className="grid gap-6 md:grid-cols-3">
              {plans.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`relative flex flex-col ${plan.highlight ? 'border-primary shadow-lg scale-105 z-10' : 'border-border hover:border-primary/50 transition-colors'}`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground hover:bg-primary px-3 py-1">
                        {plan.badge}
                      </Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <div className="mt-2">
                       <span className="text-3xl font-bold">{plan.price}</span>
                       {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                    </div>
                    {plan.total && (
                        <p className="text-sm text-muted-foreground mt-1">{plan.total}</p>
                    )}
                    <CardDescription className="mt-2">{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-3 text-sm">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                        onClick={() => handlePlanSelection(plan.id)} 
                        className={`w-full ${plan.highlight ? 'default' : 'variant-outline'}`}
                        variant={plan.highlight ? 'default' : 'outline'}
                    >
                        Selecionar Plano
                    </Button>
                  </CardFooter>
                </Card>
              ))}
             </div>

             <div className="flex justify-center mt-8">
                <Button 
                    variant="ghost" 
                    onClick={() => setStep(1)}
                    className="gap-2 text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" /> Voltar para dados
                </Button>
             </div>
          </div>
        )}

        {/* STEP 3: CHECKOUT */}
{step === 3 && (
          <div className="grid gap-8 lg:grid-cols-3 animate-in fade-in slide-in-from-right-8 duration-500">
            {/* Left Column: Payment Form */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Personal Data Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold">1</span>
                    </div>
                    Dados do Titular
                  </CardTitle>
                  <CardDescription>Informações para emissão da nota fiscal</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="cpf">CPF</Label>
                        <Input 
                            id="cpf" 
                            placeholder="000.000.000-00" 
                            value={cpf}
                            onChange={e => setCpf(formatCPF(e.target.value))}
                            maxLength={14}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Celular</Label>
                        <Input 
                            id="phone" 
                            placeholder="(11) 99999-9999" 
                            value={phone}
                            onChange={e => setPhone(formatPhone(e.target.value))}
                            maxLength={15}
                            required
                        />
                    </div>
                </CardContent>
              </Card>

              {/* Credit Card Section */}
              <Card className="overflow-hidden border-primary/20">
                <CardHeader className="bg-muted/30 pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <CreditCard className="h-4 w-4 text-primary" />
                        </div>
                        Pagamento com Cartão
                    </CardTitle>
                    <div className="flex gap-2">
                        {/* Icons placeholders for brands */}
                        <div className="h-6 w-8 bg-muted rounded flex items-center justify-center text-[10px] font-bold text-muted-foreground">VISA</div>
                        <div className="h-6 w-8 bg-muted rounded flex items-center justify-center text-[10px] font-bold text-muted-foreground">MC</div>
                    </div>
                  </div>
                  <CardDescription>Transação segura e criptografada</CardDescription>
                </CardHeader>
                <CardContent className="p-6 md:p-8">
                    <div className="grid gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="cardNumber">Número do Cartão</Label>
                            <div className="relative">
                                <Input 
                                    id="cardNumber" 
                                    placeholder="0000 0000 0000 0000" 
                                    value={cardNumber}
                                    onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                                    maxLength={19}
                                    required
                                    className="pl-10 font-mono"
                                />
                                <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cardName">Nome Impresso no Cartão</Label>
                            <Input 
                                id="cardName" 
                                placeholder="NOME COMO NO CARTAO" 
                                value={cardName}
                                onChange={e => setCardName(e.target.value.toUpperCase())}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="expiry">Validade</Label>
                                <div className="relative">
                                    <Input 
                                        id="expiry" 
                                        placeholder="MM/AA" 
                                        value={cardExpiry}
                                        onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                                        maxLength={5}
                                        required
                                        className="pl-9"
                                    />
                                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cvv">CVV</Label>
                                <div className="relative">
                                    <Input 
                                        id="cvv" 
                                        placeholder="123" 
                                        value={cardCvv}
                                        onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                        maxLength={4}
                                        required
                                        className="pl-9"
                                    />
                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 pt-2">
                            <Label htmlFor="installments">Parcelamenento (Fixo do Plano)</Label>
                            <Input 
                                value={
                                    selectedPlan === 'monthly' ? '1x de R$ 997,00' :
                                    selectedPlan === 'quarterly' ? '3x de R$ 697,00' :
                                    selectedPlan === 'semiannual' ? '6x de R$ 497,00' : ''
                                }
                                disabled
                                className="bg-muted text-muted-foreground font-medium"
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/30 px-6 py-4 flex flex-col items-center gap-4 border-t">
                     <Button 
                        onClick={handlePaymentAndRegister} 
                        className="w-full gap-2 h-12 text-base shadow-md transition-all hover:scale-[1.01]" 
                        disabled={isLoading}
                     >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" /> Processando Pagamento...
                            </>
                        ) : (
                            <>
                                <Lock className="h-5 w-5" /> 
                                Pagar {plans.find(p => p.id === selectedPlan)?.price}
                            </>
                        )}
                    </Button>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Lock className="h-3 w-3" /> Pagamento 100% seguro via gateway criptografado
                    </div>
                </CardFooter>
              </Card>

            </div>

            {/* Right Column: Order Summary */}
            <div className="space-y-6">
                <Card className="sticky top-8 bg-muted/10 border-dashed">
                    <CardHeader>
                        <CardTitle className="text-base">Resumo do Pedido</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start justify-between pb-4 border-b border-dashed">
                            <div>
                                <p className="font-medium">{plans.find(p => p.id === selectedPlan)?.name}</p>
                                <p className="text-xs text-muted-foreground">{plans.find(p => p.id === selectedPlan)?.description}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold">{plans.find(p => p.id === selectedPlan)?.price}</p>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                             {plans.find(p => p.id === selectedPlan)?.features.slice(0, 3).map((feat, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Check className="h-3 w-3 text-green-500" />
                                    <span>{feat}</span>
                                </div>
                             ))}
                        </div>

                        <div className="pt-4 flex items-center justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>{plans.find(p => p.id === selectedPlan)?.total || plans.find(p => p.id === selectedPlan)?.price}</span>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant="link" onClick={() => setStep(2)} className="w-full text-xs text-muted-foreground">
                            Alterar Plano
                        </Button>
                    </CardFooter>
                </Card>
                
                {error && (
                    <div className="rounded-md bg-destructive/10 p-4 border border-destructive/20 text-sm text-destructive font-medium flex gap-2 items-start animate-pulse">
                         <div className="mt-0.5 shrink-0 h-2 w-2 rounded-full bg-destructive" />
                         {error}
                    </div>
                )}
            </div>
          </div>
        )}

        {step === 1 && (
             <p className="mt-8 text-center text-xs text-muted-foreground">
               Ao se cadastrar, você concorda com nossos Termos de Serviço e Política de Privacidade
             </p>
        )}
      </div>
    </div>
  )
}
