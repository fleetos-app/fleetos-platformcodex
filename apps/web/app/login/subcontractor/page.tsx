import { LoginScreen } from "../login-screen";

export default function SubcontractorLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <LoginScreen
      searchParams={searchParams}
      audience="subcontractor"
      title="Subcontractor login"
      description="For subcontractor partners coordinating assigned work with FleetOS operators."
      defaultNext="/app/dashboard"
    />
  );
}
