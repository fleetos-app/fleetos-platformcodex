import { getRequiredAuthSession } from "../../lib/auth/server";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await getRequiredAuthSession();

  return children;
}
