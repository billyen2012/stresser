import TopNav from "./TopNav";
import Main from "./Main";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { SessionProvider } from "@/context/session-context";
import SideNav from "./SIdeNav";
import MainContainer from "./MainContainer";
import { SIGN_IN_PAGE_URL } from "../../constant/sign-in-page-url";

export default async function MainLayout({ children }) {
  const session = await auth();

  if (!session) {
    return redirect(SIGN_IN_PAGE_URL);
  }

  return (
    /**
     * use custom session provider since the the session provider from next-auth will authenticate
     * user wherever useSession is called; this is unnecessary for this app because user session is already authenticated
     * on here.
     */
    <SessionProvider session={session}>
      <TopNav />
      <MainContainer>
        <SideNav />
        <Main>{children}</Main>
      </MainContainer>
    </SessionProvider>
  );
}
