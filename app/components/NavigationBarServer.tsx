import { createClient } from "../utils/supabase/server";
import MobileNavigationBar from "./MobileNavigationBar";
import { NavigationBarClient } from "./NavigationBarClient";

/**
 * NavigationBarServer
 * -------------------
 * Server component — fetches the authenticated user from Supabase,
 * then passes it down to the client component for rendering.
 *
 * Place this in your root layout inside a flex container:
 *   <div className="flex min-h-screen">
 *     <NavigationBarServer />
 *     <main className="flex-1">{children}</main>
 *   </div>
 */
export async function NavigationBarServer() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return null
  }
  return <>
    <div className="hidden md:block">
      <NavigationBarClient user={user} />
    </div>
    <MobileNavigationBar user={user} />
  </>;
}
