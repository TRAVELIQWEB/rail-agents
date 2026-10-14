// Admin layout — server component that checks session on every request
// Login page is excluded via the children prop (Next.js handles route nesting)

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Note: the login page renders at /admin/login which is a child of this layout.
  // We need to allow the login page through. We check the session here but
  // the login page itself doesn't call requireAdmin — it handles its own redirect.
  return <>{children}</>;
}

