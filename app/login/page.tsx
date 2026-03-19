import { redirect } from "next/navigation";

/**
 * Login page: redirect to /account (which shows "Log in" and uses /auth/login for headless OAuth).
 * Keeps a single place for sign-in UI and ensures login flow uses our callback URL.
 */
export default function LoginPage() {
  redirect("/account");
}
