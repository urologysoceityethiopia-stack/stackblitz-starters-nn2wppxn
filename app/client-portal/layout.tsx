import RoleGuard from "@/components/auth/RoleGuard";

export default function ClientPortalLayout({ children }: { children: React.ReactNode }) {
  // We still check for the "patient" role in the database, 
  // but we apply it to the client-portal folder.
  return <RoleGuard allowedRoles={["patient"]}>{children}</RoleGuard>;
}