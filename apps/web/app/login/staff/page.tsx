import { LoginScreen } from "../login-screen";

export default function StaffLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <LoginScreen
      searchParams={searchParams}
      audience="staff"
      title="Staff login"
      description="For FleetOS owners, admins, operations, accounts, and workshop staff."
      defaultNext="/app/dashboard"
    />
  );
}
