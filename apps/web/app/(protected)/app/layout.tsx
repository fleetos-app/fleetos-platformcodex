import { AppShell } from "../../../components/app-shell";
import { getRequiredAuthSession } from "../../../lib/auth/server";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getRequiredAuthSession();

  return <AppShell session={session}>{children}</AppShell>;
}
