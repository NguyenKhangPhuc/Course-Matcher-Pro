import { CourseAgentResponse } from "./course";

export interface AgentResponse {
    summary: string,
    courses: CourseAgentResponse[],
    technical_requirements: string,
    user_id: string,
    steps_taken: string,
    source_id: string,
}