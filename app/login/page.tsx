import { redirect } from "next/navigation";

/** Starts headless OAuth (`/auth/login`) so `redirect_uri` matches `NEXT_PUBLIC_SITE_URL`. */
export default function LoginPage() {
  redirect("/auth/login");
}
