import { useLocation, Navigate } from "react-router-dom";
import { useCompanyPermissions } from "@/hooks/useCompanyPermissions";

/**
 * Maps dashboard path patterns to required permission (resource:action).
 * First matching pattern wins.
 */
const PATH_PERMISSIONS: { pattern: RegExp | string; permission: string }[] = [
  { pattern: /^\/Dashboard\/Home$/, permission: "reports:read" },
  { pattern: /^\/Dashboard\/Reports/, permission: "reports:read" },
  { pattern: /^\/Dashboard\/Sales\/Create(?!Customer)/, permission: "sales:create" },
  { pattern: /^\/Dashboard\/Sales\/CreateCustomer/, permission: "customers:read" },
  { pattern: /^\/Dashboard\/Sales$/, permission: "sales:create" },
  { pattern: /^\/Dashboard\/Sales\//, permission: "sales:read" },
  { pattern: /^\/Dashboard\/Products\//, permission: "products:read" },
  { pattern: /^\/Dashboard\/Products$/, permission: "products:read" },
  { pattern: /^\/Dashboard\/Store/, permission: "products:read" },
  { pattern: /^\/Dashboard\/TransferredItems/, permission: "products:read" },
  { pattern: /^\/Dashboard\/Invoices/, permission: "invoices:read" },
  { pattern: /^\/Dashboard\/Receiveable/, permission: "sales:read" },
  // Only the user LIST requires users:read — viewing/updating a single user (own profile) does not
  { pattern: /^\/Dashboard\/User$/, permission: "users:read" },
  { pattern: /^\/Dashboard\/Treasury/, permission: "banking:read" },
  { pattern: /^\/Dashboard\/Banks/, permission: "banking:read" },
  { pattern: /^\/Dashboard\/CompanyExpenses/, permission: "expenses:read" },
  { pattern: /^\/Dashboard\/Expenses/, permission: "expenses:read" },
  { pattern: /^\/Dashboard\/Payables/, permission: "vendors:read" },
  { pattern: /^\/Dashboard\/Purchases/, permission: "purchases:read" },
  { pattern: /^\/Dashboard\/Vendor/, permission: "vendors:read" },
  { pattern: /^\/Dashboard\/Transfer_Money/, permission: "banking:read" },
];

function getRequiredPermission(pathname: string): string | null {
  for (const { pattern, permission } of PATH_PERMISSIONS) {
    if (typeof pattern === "string") {
      if (pathname.startsWith(pattern)) return permission;
    } else if (pattern.test(pathname)) {
      return permission;
    }
  }
  return null;
}

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Wraps dashboard content. If the current path requires a permission
 * the user doesn't have, redirects to /Dashboard/Home.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const { can } = useCompanyPermissions();

  const required = getRequiredPermission(location.pathname);
  if (!required) {
    return <>{children}</>;
  }

  const [resource, action] = required.split(":");
  if (!can(resource, action)) {
    return <Navigate to="/Dashboard/Home" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
