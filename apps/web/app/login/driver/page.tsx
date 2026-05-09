import { LoginScreen } from "../login-screen";

export default function DriverLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <LoginScreen
      searchParams={searchParams}
      audience="driver"
      title="Driver login"
      description="For drivers accessing assigned jobs, runs, vehicles, and operational updates."
      defaultNext="/app/dashboard"
    />
  );
}
