import { redirect } from "next/navigation";
import { CUSTOMER_ACCOUNT_PORTAL_URL } from "@/lib/customerAccountPortal";

export default function AccountPage() {
  redirect(CUSTOMER_ACCOUNT_PORTAL_URL);
}
