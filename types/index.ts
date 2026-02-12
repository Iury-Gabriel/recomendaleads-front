// Core entity types for the AI Agent SaaS platform

export type AgentStatus = "active" | "inactive"
export type ClientStatus = "not_started" | "collecting_recommendations" | "recommendations_completed"
export type ToneOfVoice = "professional" | "friendly" | "casual" | "formal"
export type ConnectionStatus = "connected" | "disconnected" | "connecting"
export type ReferredClientStatus = "new" | "contact_initiated" | "offer_sent" | "converted"

export interface User {
  id: string
  email: string
  name: string
  companyName: string
  createdAt: Date
}

// Gamification bonus rule
export interface GamificationRule {
  id: string
  leadsRequired: number
  bonusDescription: string
  bonusMultiplier: number
}

// Follow-up message template
export interface FollowUpMessage {
  id: string
  name: string
  trigger: "no_recommendations_sent" | "partial_recommendations" | "post_recommendation" | "custom"
  delayHours: number
  message: string
  isActive: boolean
}

export interface Agent {
  id: string
  userId: string
  name: string
  companyName: string
  toneOfVoice: ToneOfVoice
  // 1 - Mensagem para o cliente pedindo recomendacao
  messageToClient: string
  // 2 - Mensagem de entrega do presente ao recomendador (cliente)
  messageGiftToRecommender: string
  // 3 - Mensagem para o recomendado (amigo do cliente)
  messageToReferred: string
  // 4 - Mensagem de entrega do presente ao recomendado
  messageGiftToReferred: string
  // Regras de recomendacao
  recommendationRule: string
  offerDescription: string
  // Gamification
  gamificationRules: GamificationRule[]
  // Follow-up
  followUpMessages: FollowUpMessage[]
  status: AgentStatus
  createdAt: Date
  updatedAt: Date
}

export interface Client {
  id: string
  userId: string
  name: string
  phone: string
  email?: string
  status: ClientStatus
  recommendationCount: number
  lastRecommendationDate?: Date
  createdAt: Date
}

export interface Recommendation {
  id: string
  agentId: string
  clientId: string
  referredClientName?: string
  referredClientPhone?: string
  status: "pending" | "accepted" | "converted" | "declined"
  messagesSent: number
  lastMessageDate: Date
  createdAt: Date
}

export interface DashboardMetrics {
  totalClients: number
  totalRecommendations: number
  totalReferredClients: number
  conversions: number
  conversionRate: number
  activeAgents: number
}

export interface WhatsAppConnection {
  instanceName: string
  status: ConnectionStatus
  phoneNumber?: string
  qrCode?: string
  lastActivityAt?: Date
  instanceToken?: string
  connectedAt?: Date
}

export interface Settings {
  userId: string
  companyName: string
  companyDescription: string
  companyContext: string
  language: "pt-BR" | "en-US" | "es-ES"
  webhookUrl: string
  apiKey: string
  notificationsEnabled: boolean
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Form types
export interface LoginFormData {
  email: string
  password: string
}

export interface AgentFormData {
  name: string
  companyName: string
  toneOfVoice: ToneOfVoice
  messageToClient: string
  messageGiftToRecommender: string
  messageToReferred: string
  messageGiftToReferred: string
  recommendationRule: string
  offerDescription: string
  gamificationRules: GamificationRule[]
  followUpMessages: FollowUpMessage[]
  status: AgentStatus
}

export interface ClientFormData {
  name: string
  phone: string
  email?: string
}

export interface ReferredClient {
  id: string
  userId: string
  name: string
  phone: string
  sourceClientId: string
  sourceClientName: string
  agentId: string
  status: ReferredClientStatus
  messagesSent: number
  lastContactDate?: Date
  offerSentDate?: Date
  convertedDate?: Date
  createdAt: Date
}

export interface TimelineEvent {
  id: string
  clientId?: string
  referredClientId?: string
  agentId: string
  type: "message_sent" | "recommendation_received" | "offer_sent" | "status_changed" | "gift_sent" | "follow_up_sent"
  description: string
  metadata?: Record<string, unknown>
  createdAt: Date
}

// Follow-up campaign for mass messaging
export interface FollowUpCampaign {
  id: string
  name: string
  message: string
  targetAudience: "all_clients" | "no_recommendations" | "partial_recommendations" | "completed" | "referred"
  status: "draft" | "scheduled" | "sent"
  scheduledAt?: Date
  sentAt?: Date
  recipientCount: number
  openRate?: number
  createdAt: Date
}
