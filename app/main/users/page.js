import { fetchInternal } from "@/server/util/fetchInternal";
import UsersPage from "./UsersPage";
import Error from "@/app/error";

export const metadata = {
  title: "Users",
};

export default async function Page() {
  const res = await fetchInternal("/api/users", { cache: "no-store" });

  if (!res.ok) {
    return <Error subtitle={await res.text()} />;
  }

  const data = await res.json();

  return <UsersPage data={data} />;
}
