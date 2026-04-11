import { redirect } from "next/navigation";
import {
  CUSTOMER_ACCOUNT_ORDERS_URL,
  getCustomerAccountPortalEntryUrl,
} from "@/lib/customerAccountPortal";
import { isHeadlessCustomerAccountEnabled } from "@/lib/shopifyCustomerAccount";

/** Headless OAuth, or portal-only when `NEXT_PUBLIC_USE_HEADLESS_CUSTOMER_ACCOUNT=false`. */
export default function LoginPage() {
  if (!isHeadlessCustomerAccountEnabled()) {
    redirect(getCustomerAccountPortalEntryUrl() ?? CUSTOMER_ACCOUNT_ORDERS_URL);
  }
  redirect("/auth/login");
}
