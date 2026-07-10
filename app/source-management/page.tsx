/**
 * PURPOSE:
 * Source Management page. Server component that authenticates the user,
 * fetches all their sources, then renders the interactive client component.
 * Courses are fetched lazily on the client when a source is expanded.
 *
 * ROUTE: /source-management
 */

import { redirect } from "next/navigation";
import { getUser } from "../actions/authentication";
import { getUserSources } from "../actions/source_management";
import { SourceInsert } from "../types/source";
import SourceManagementClient from "./SourceManagementClient";

export default async function SourceManagementPage() {
    // ── Auth ──────────────────────────────────────────────────────────
    const { data, error } = await getUser();
    if (error || !data.user) redirect("/login");

    // ── Sources only — courses are fetched lazily on the client ───────
    const sources: SourceInsert[] = await getUserSources(false);

    return (
        <SourceManagementClient
            sources={sources}
            userId={data.user.id}
        />
    );
}
