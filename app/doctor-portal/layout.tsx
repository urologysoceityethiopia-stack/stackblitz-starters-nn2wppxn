import RoleGuard from "@/components/auth/RoleGuard";

export default function DoctorPortalLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={["doctor", "physician"]}>{children}</RoleGuard>;
}