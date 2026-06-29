import { redirect } from "next/navigation";
import { getUser } from "../actions/authentication";
import { getUserSources } from "../actions/source_management";
import DashboardClient from "./DashboardClient";

/**
 * DashboardServer
 * ---------------
 * Server component — fetches the authenticated user and their sources,
 * then passes data down to DashboardClient for rendering.
 *
 * Redirects to /login if the user is not authenticated.
 */
export default async function DashboardServer() {
  const { data, error } = await getUser();

  const sources = await getUserSources();

  return (
    <DashboardClient
      user={data.user!}
      initialSources={sources}
    />
  );
}
