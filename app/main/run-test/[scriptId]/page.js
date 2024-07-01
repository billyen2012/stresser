import { fetchInternal } from "@/server/util/fetchInternal";
import RunTestPage from "../RunTestPage";
import NotFound from "@/app/not-found";
import Error from "@/app/error";

export const metadata = {
  title: "Run Test",
};

export default async function Page({ params }) {
  const id = params.scriptId;

  const res = await fetchInternal("/api/scripts/" + id + "?include=user");

  if (res.ok) {
    const data = await res.json();
    const scriptOwner = data.user;
    data.user = undefined;
    return (
      <RunTestPage
        defaultValues={{ ...data, isNew: false }}
        scriptOwner={scriptOwner}
        isNew={false}
      />
    );
  }

  if (res.status === 404) {
    return (
      <NotFound
        title={`Not Found`}
        subtitle={`The script id '${id}' can not be found`}
      />
    );
  }

  return <Error />;
}
