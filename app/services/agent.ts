import { apiClient } from "../libs/api_client"
import { AgentResponse } from "../types/agent"
export interface ChatRequest {
    job_description: string;
    source_id: string;
    company_name?: string;
}

export const analyzeJobDescription = async (payload: ChatRequest) => {
    const response = await apiClient.post<AgentResponse>('/api/chat', {
        job_description: payload.job_description,
        source_id: payload.source_id,
        company_name: payload.company_name,
    })
    return response.data
}