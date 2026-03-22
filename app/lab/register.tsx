import { Redirect } from "expo-router";

/** Legacy path; contact screen lives at `/lab/regis`. */
export default function RegisterRedirect() {
  return <Redirect href="/lab/regis" />;
}
