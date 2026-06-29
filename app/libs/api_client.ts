import axios from "axios";
import { createClient } from "../utils/supabase/client";

export const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL : '',
    withCredentials: true,
})

apiClient.interceptors.request.use(async (config) => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    
    return config;
})