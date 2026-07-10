import { AxiosProgressEvent } from "axios";
import { apiClient } from "../libs/api_client"
import { AgentStreamChunk } from "../types/agent";
export interface ChatRequest {
    job_description: string;
    source_id: string;
    position: string;
    company_name?: string;
    programme: string
}

export const analyzeJobDescriptionStreamingAxios = async (
    payload: ChatRequest,
    onChunk: (type: string, data: AgentStreamChunk) => void
) => {
    let seenBytes = 0;

    await apiClient.post('/api/chat', payload, {
        // 1. Bắt buộc phải để responseType là text hoặc blob trên Browser
        responseType: 'text', 
        
        // 2. Lắng nghe tiến trình tải về để cấu trúc lại stream
        onDownloadProgress: (progressEvent: AxiosProgressEvent) => {
            const rawResponse = progressEvent.event.target.response;
            
            // Chỉ lấy phần dữ liệu mới trả về (bỏ qua phần dữ liệu cũ đã đọc)
            const chunk = rawResponse.substring(seenBytes);
            seenBytes = rawResponse.length;
            

            // Xử lý chunk nhận được theo chuẩn SSE (\n\n)
            const lines = chunk.split('\n\n');
            for (const line of lines) {
                if (line.trim().startsWith('data: ')) {
                    const jsonStr = line.replace('data: ', '').trim();
                    try {
                        const parsed = JSON.parse(jsonStr);
                        // Gọi callback để trả data về component
                        onChunk(parsed.type, parsed.data);
                    } catch (e) {
                        // Bỏ qua các dòng json chưa hoàn chỉnh do cắt chuỗi ngắt quãng
                        // console.error("Error parse JSON chunk:", e);
                    }
                }
            }
        }
    });
};