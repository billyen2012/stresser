import { redirect } from "next/navigation";
import { MAIN_APP_LANDING_PAGE_URL } from "../../constant/main-app-landing-page-url";

export default function Page() {
  return redirect(MAIN_APP_LANDING_PAGE_URL);
}
