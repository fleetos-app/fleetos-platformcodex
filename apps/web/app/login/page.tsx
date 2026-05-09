import { LoginScreen } from "./login-screen";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <LoginScreen searchParams={searchParams} audience="staff" />;
}
