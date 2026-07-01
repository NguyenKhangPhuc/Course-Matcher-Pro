import { redirect } from "next/navigation";
import { getUser } from "../actions/authentication";
import { getSearchHistoryWithMatches } from "../actions/search_history";
import HistoryClient from "./HistoryClient";

export default async function HistoryPage() {
  const { data, error } = await getUser();

  if (error || !data?.user) {
    redirect("/login");
  }

  const { data: searchHistories, error: historyError } = await getSearchHistoryWithMatches(data.user.id);

  return (
    <HistoryClient 
      user={data.user} 
      searchHistoryWithMatches={searchHistories ?? []} 
    />
  );
}
