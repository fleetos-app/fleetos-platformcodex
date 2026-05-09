import { LoginScreen } from "../login-screen";

export default function ClientLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <LoginScreen
      searchParams={searchParams}
      audience="client"
      title="Client and customer login"
      description="For customers with access to their jobs and delivery information."
      defaultNext="/app/dashboard"
    />
  );
}
