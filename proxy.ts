import { NextResponse, type NextRequest } from "next/server"
import { updateSession } from "./app/utils/supabase/proxy"
import { createServerClient } from "@supabase/ssr"
import { Database } from "./app/types/database.types"

export async function proxy(request: NextRequest) {

    const updateSessionResponse = await updateSession(request)
    if (updateSessionResponse.status !== 200) return updateSessionResponse
    let supabaseResponse = NextResponse.next({
        request,
    })
    const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
                },
            },
        }
    )
    const { data: user } = await supabase.auth.getUser()

}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
}