import { auth, providers } from "@/server/auth";
import SignIn from "./SignIn";
import { redirect } from "next/navigation";
import { MAIN_APP_LANDING_PAGE_URL } from "@/constant/main-app-landing-page-url";
import { getAppVersion } from "@/util/getAppVersion";

const PROVIDERS = providers.map((e) => ({
  id: e.id,
  name: e.name,
  clientId: e.clientId,
  style: e.style,
}));

export async function generateMetadata({ params, searchParams }) {
  return {
    title:
      searchParams.registerAccount == 1 ? "Register new account" : "Sign in",
  };
}
export default async function Page({ searchParams }) {
  const session = await auth();

  if (session) {
    return redirect(MAIN_APP_LANDING_PAGE_URL);
  }

  const appVersion = await getAppVersion();
  return (
    <SignIn
      providers={PROVIDERS}
      error={searchParams.code}
      isRegisterAccount={searchParams.registerAccount == 1}
      appVersion={appVersion}
    />
  );
}
