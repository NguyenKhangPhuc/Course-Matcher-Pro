import { CourseAgentResponse } from "./course";

export interface AgentResponseClient {
    summary: string,
    courses: CourseAgentResponse[],
    technical_requirements: string,
    user_id: string,
    steps_taken: string,
    source_id: string,
    programme: string,
}

export interface DoneResponse {
    total: number;
    summary: string;
}

// 1. Định nghĩa chi tiết từng loại Chunk từ Stream đổ về

export type ErrorChunk = string

// 2. Gộp lại thành một Union Type
export type AgentStreamChunk = string | CourseAgentResponse | DoneResponse | ErrorChunk;