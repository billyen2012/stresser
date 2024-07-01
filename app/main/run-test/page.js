import RunTestPage from "./RunTestPage";

export const metadata = {
  title: "Create new test",
};

/**
 *
 * @param {{
 *  id:string
 * }} param0
 * @returns
 */
export default async function Page() {
  return <RunTestPage isNew />;
}
