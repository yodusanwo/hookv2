import { redirect } from "next/navigation";
import { CUSTOMER_ACCOUNT_PORTAL_URL } from "@/lib/customerAccountPortal";

/** Login page: send users to Shopify Customer Account portal. */
export default function LoginPage() {
  redirect(CUSTOMER_ACCOUNT_PORTAL_URL);
}
