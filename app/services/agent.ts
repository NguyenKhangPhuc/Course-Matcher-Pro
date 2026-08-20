import { AxiosProgressEvent } from "axios";
import { apiClient } from "../libs/api_client"
import { AgentStreamChunk } from "../types/agent";
export interface ChatRequest {
    job_description: string;
    source_id: string;
    position: string;
    company_name?: string;
    programme: string;
    start_date?: string | null;
    end_date?: string | null;
}

export const analyzeJobDescriptionStreamingAxios = async (
    payload: ChatRequest,
    onChunk: (type: string, data: AgentStreamChunk) => void
) => {
    let seenBytes = 0;
    let sseBuffer = "";

    await apiClient.post('/api/chat', payload, {
        // 1. Bắt buộc phải để responseType là text hoặc blob trên Browser
        responseType: 'text', 

        // 2. Lắng nghe tiến trình tải về để cấu trúc lại stream
        onDownloadProgress: (progressEvent: AxiosProgressEvent) => {
            const target = progressEvent.event?.target || (progressEvent as any).target || (progressEvent as any).currentTarget;
            const rawResponse: string = (target && typeof target.response === "string")
                ? target.response
                : (typeof (progressEvent as any).response === "string" ? (progressEvent as any).response : "");

            // Chỉ lấy phần dữ liệu mới trả về kể từ lần callback trước
            const chunk = rawResponse.substring(seenBytes);
            seenBytes = rawResponse.length;

            sseBuffer += chunk;

            // Tách các khối SSE theo chuẩn ngắt \n\n
            const parts = sseBuffer.split('\n\n');

            // Phần cuối cùng có thể chưa hoàn chỉnh, giữ lại trong sseBuffer cho đợt nhận kế tiếp
            sseBuffer = parts.pop() || "";

            for (const message of parts) {
                const lines = message.split('\n');
                for (const line of lines) {
                    if (line.trim().startsWith('data: ')) {
                        const jsonStr = line.trim().replace(/^data:\s*/, '');
                        if (!jsonStr) continue;
                        try {
                            const parsed = JSON.parse(jsonStr);
                            onChunk(parsed.type, parsed.data);
                        } catch (e) {
                            console.error("Error parsing SSE JSON chunk:", e, jsonStr);
                        }
                    }
                }
            }
        }
    });

    // Xử lý các dòng dữ liệu hoàn chỉnh còn đọng lại trong buffer sau khi kết thúc stream
    if (sseBuffer.trim()) {
        const lines = sseBuffer.split('\n');
        for (const line of lines) {
            if (line.trim().startsWith('data: ')) {
                const jsonStr = line.trim().replace(/^data:\s*/, '');
                if (!jsonStr) continue;
                try {
                    const parsed = JSON.parse(jsonStr);
                    onChunk(parsed.type, parsed.data);
                } catch (e) {
                    // Ignored incomplete trailing chunk
                }
            }
        }
    }
};