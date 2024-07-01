import { fetchInternal } from "@/server/util/fetchInternal";
import NotFound from "@/app/not-found";
import Error from "@/app/error";
import TestResultPage from "./TestResultPage";

export const metadata = {
  title: "Test Result",
};

export default async function Page({ params }) {
  const id = params.scriptId;

  const res = await fetchInternal("/api/scripts/" + id + "?include=user");

  if (res.ok) {
    const data = await res.json();
    return <TestResultPage scriptData={data} />;
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
