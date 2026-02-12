import type {
  User,
  Agent,
  Client,
  Recommendation,
  DashboardMetrics,
  WhatsAppConnection,
  Settings,
  ApiResponse,
  LoginFormData,
  AgentFormData,
  ClientFormData,
  ReferredClient,
  TimelineEvent,
  FollowUpCampaign,
} from "@/types"
import { authHelpers } from "@/lib/auth"

const API_URL = "https://recomendaleads-api.onrender.com/v1"

const getHeaders = () => {
  const token = authHelpers.getToken()
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  try {
    const data = await response.json()
    if (!response.ok) {
      if (response.status === 401) {
        authHelpers.clearAuth();
        if (typeof window !== 'undefined') window.location.href = '/login';
      }
      return { success: false, error: data.error || "Erro na requisição" }
    }
    return data
  } catch (error) {
    return { success: false, error: "Erro ao processar resposta do servidor" }
  }
}

// Auth API
export const authApi = {
  login: async (data: LoginFormData): Promise<ApiResponse<{ user: User; token: string }>> => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const result = await handleResponse<{ user: User; token: string }>(response)
      return result
    } catch (e) {
      return { success: false, error: "Erro de conexão" }
    }
  },
  register: async (data: any): Promise<ApiResponse<{ user: User; token: string }>> => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const result = await handleResponse<{ user: User; token: string }>(response)
      return result
    } catch (e) {
      return { success: false, error: "Erro de conexão" }
    }
  },
  logout: async (): Promise<ApiResponse<void>> => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: getHeaders(),
      })
      authHelpers.clearAuth()
      return { success: true }
    } catch {
      return { success: true }
    }
  },
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: getHeaders(),
      })
      return handleResponse<User>(response)
    } catch {
      return { success: false, error: "Erro de conexão" }
    }
  },
}

// Agents API
export const agentsApi = {
  getAll: async (): Promise<ApiResponse<Agent[]>> => {
    const response = await fetch(`${API_URL}/agents`, { headers: getHeaders() })
    return handleResponse<Agent[]>(response)
  },
  getById: async (id: string): Promise<ApiResponse<Agent>> => {
    const response = await fetch(`${API_URL}/agents/${id}`, { headers: getHeaders() })
    return handleResponse<Agent>(response)
  },
  create: async (data: AgentFormData): Promise<ApiResponse<Agent>> => {
    const response = await fetch(`${API_URL}/agents`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse<Agent>(response)
  },
  update: async (id: string, data: Partial<AgentFormData>): Promise<ApiResponse<Agent>> => {
    const response = await fetch(`${API_URL}/agents/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse<Agent>(response)
  },
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await fetch(`${API_URL}/agents/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    })
    return handleResponse<void>(response)
  },
}

// Clients API
export const clientsApi = {
  getAll: async (): Promise<ApiResponse<Client[]>> => {
    const response = await fetch(`${API_URL}/clients`, { headers: getHeaders() })
    return handleResponse<Client[]>(response)
  },
  getById: async (id: string): Promise<ApiResponse<Client>> => {
    const response = await fetch(`${API_URL}/clients/${id}`, { headers: getHeaders() })
    return handleResponse<Client>(response)
  },
  create: async (data: ClientFormData): Promise<ApiResponse<Client>> => {
    const response = await fetch(`${API_URL}/clients`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse<Client>(response)
  },
  update: async (id: string, data: Partial<ClientFormData>): Promise<ApiResponse<Client>> => {
    const response = await fetch(`${API_URL}/clients/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse<Client>(response)
  },
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await fetch(`${API_URL}/clients/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    })
    return handleResponse<void>(response)
  },
  startRecommendations: async (
    clientId: string,
    agentId: string,
  ): Promise<ApiResponse<{ client: Client; timeline: TimelineEvent }>> => {
    const response = await fetch(`${API_URL}/clients/${clientId}/start-recommendations`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ agentId }),
    })
    return handleResponse<{ client: Client; timeline: TimelineEvent }>(response)
  },
  getTimeline: async (clientId: string): Promise<ApiResponse<TimelineEvent[]>> => {
    const response = await fetch(`${API_URL}/clients/${clientId}/timeline`, { headers: getHeaders() })
    return handleResponse<TimelineEvent[]>(response)
  },
}

// Referred Clients API
export const referredClientsApi = {
  getAll: async (): Promise<ApiResponse<ReferredClient[]>> => {
    const response = await fetch(`${API_URL}/referred-clients`, { headers: getHeaders() })
    return handleResponse<ReferredClient[]>(response)
  },
  getBySourceClient: async (sourceClientId: string): Promise<ApiResponse<ReferredClient[]>> => {
    // Currently the API returns all, or filter by param?
    // The backend controller supported query params, but I implemented `listReferredClients` with `sourceClientId` check?
    // Let's assume ?sourceClientId=X if I implemented filtering, or just filter client side if needed.
    // In `referredClient.controller.js`, I check `req.query`.
    // Step 14 checks: `const listReferredClients ... const { sourceClientId } = req.query; if (sourceClientId) ...`
    // So yes, I can pass the query param.
    const response = await fetch(`${API_URL}/referred-clients?sourceClientId=${sourceClientId}`, { headers: getHeaders() })
    return handleResponse<ReferredClient[]>(response)
  },
  getById: async (id: string): Promise<ApiResponse<ReferredClient>> => {
    const response = await fetch(`${API_URL}/referred-clients/${id}`, { headers: getHeaders() })
    return handleResponse<ReferredClient>(response)
  },
  startOffer: async (referredClientId: string, agentId: string): Promise<ApiResponse<ReferredClient>> => {
    const response = await fetch(`${API_URL}/referred-clients/${referredClientId}/send-offer`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ agentId }),
    })
    return handleResponse<ReferredClient>(response)
  },
}

// Recommendations API
export const recommendationsApi = {
  getAll: async (): Promise<ApiResponse<Recommendation[]>> => {
    const response = await fetch(`${API_URL}/recommendations`, { headers: getHeaders() })
    return handleResponse<Recommendation[]>(response)
  },
  getRecent: async (limit = 10): Promise<ApiResponse<Recommendation[]>> => {
    const response = await fetch(`${API_URL}/recommendations/recent?limit=${limit}`, { headers: getHeaders() })
    return handleResponse<Recommendation[]>(response)
  },
}

// Dashboard API
export const dashboardApi = {
  getMetrics: async (): Promise<ApiResponse<DashboardMetrics>> => {
    const response = await fetch(`${API_URL}/dashboard/metrics`, { headers: getHeaders() })
    return handleResponse<DashboardMetrics>(response)
  },
}

// WhatsApp API
export const whatsappApi = {
  getConnection: async (): Promise<ApiResponse<WhatsAppConnection[]>> => {
    const response = await fetch(`${API_URL}/whatsapp/connection`, { headers: getHeaders() })
    return handleResponse<WhatsAppConnection[]>(response)
  },
  createInstance: async (name: string): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_URL}/whatsapp/instance`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ name }),
    })
    return handleResponse<any>(response)
  },
  connect: async (token?: string): Promise<ApiResponse<WhatsAppConnection>> => {
    const response = await fetch(`${API_URL}/whatsapp/connect`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ token }),
    })
    return handleResponse<WhatsAppConnection>(response)
  },
  checkStatus: async (token?: string): Promise<ApiResponse<any>> => {
    if (!token) return { success: false, error: "Token não fornecido" };
    const response = await fetch(`${API_URL}/whatsapp/instance/${token}/status`, {
      method: "GET",
      headers: getHeaders(),
    })
    return handleResponse<any>(response)
  },
  disconnect: async (): Promise<ApiResponse<void>> => {
    const response = await fetch(`${API_URL}/whatsapp/disconnect`, {
      method: "POST",
      headers: getHeaders(),
    })
    return handleResponse<void>(response)
  },
}

// Settings API
export const settingsApi = {
  get: async (): Promise<ApiResponse<Settings>> => {
    const response = await fetch(`${API_URL}/settings`, { headers: getHeaders() })
    return handleResponse<Settings>(response)
  },
  update: async (data: Partial<Settings>): Promise<ApiResponse<Settings>> => {
    const response = await fetch(`${API_URL}/settings`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse<Settings>(response)
  },
}

// Checkout API
export const checkoutApi = {
  createOrder: async (data: any): Promise<ApiResponse<any>> => {
    try {
      // Direct call to external checkout endpoint as requested
      const response = await fetch("https://recomendaleads-api.onrender.com/criar-pedido", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      // The endpoint returns { success: true } on success, or error details
      // We'll normalize it to our ApiResponse structure
      // Also checking specific message as requested: "Pedido criado com sucesso"
      if (response.ok && (result.success || result.message === "Pedido criado com sucesso")) {
        return { success: true, data: result }
      }

      return {
        success: false,
        error: result.message || result.error || "Erro ao processar pagamento"
      }
    } catch (e) {
      return { success: false, error: "Erro de conexão com servidor de pagamento" }
    }
  },
}

// Follow-Up Campaigns API
export const followUpApi = {
  getAll: async (): Promise<ApiResponse<FollowUpCampaign[]>> => {
    const response = await fetch(`${API_URL}/follow-up-campaigns`, { headers: getHeaders() })
    return handleResponse<FollowUpCampaign[]>(response)
  },
  create: async (data: any): Promise<ApiResponse<FollowUpCampaign>> => {
    const response = await fetch(`${API_URL}/follow-up-campaigns`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse<FollowUpCampaign>(response)
  },
  send: async (id: string): Promise<ApiResponse<FollowUpCampaign>> => {
    // I didn't implement 'send' endpoint in backend specifically? 
    // I implemented list and create. The controller has `createCampaign`.
    // `campaign.controller.js` has `listCampaigns`, `createCampaign`.
    // `send` logic might be missing in backend or implicit.
    // For now, I'll return mock or error, or maybe I should check if I missed it.
    // Checked `campaign.controller.js` in step 88. Only `listCampaigns` and `createCampaign`.
    // So `send` is not valid. I will comment it out or leave as NotImplemented.
    return { success: false, error: "Not implemented in backend" }
  },
  delete: async (id: string): Promise<ApiResponse<void>> => {
    // also not implemented in backend yet
    return { success: false, error: "Not implemented in backend" }
  },
}
