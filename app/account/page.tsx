import { cookies } from "next/headers";
import Link from "next/link";
import { getAccessTokenFromCookies } from "@/lib/authCookie";
import {
  fetchCustomerOrders,
  isCustomerAccountConfigured,
  type CustomerOrdersResult,
} from "@/lib/shopifyCustomerAccount";

function getAccountUrl(): string | null {
  const explicit = process.env.NEXT_PUBLIC_SHOPIFY_ACCOUNT_URL?.trim();
  if (explicit) return explicit;
  const domain = (process.env.SHOPIFY_STORE_DOMAIN ?? "")
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "");
  return domain ? `https://${domain}/account` : null;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const cookieStore = await cookies();
  const token = getAccessTokenFromCookies(cookieStore);
  const params = await searchParams;
  const accountUrl = getAccountUrl();
  const useHeadlessLogin = isCustomerAccountConfigured();

  if (!token) {
    return (
      <main className="min-h-screen bg-[#F8F8F8] px-4 pt-24 pb-12 md:pt-32 md:pb-16">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-6 font-semibold text-[var(--section-title-size,24px)] text-[#1E1E1E] [font-family:var(--font-inter)]">
            Account
          </h1>
          {params.error === "invalid_state" && (
            <p className="mb-4 text-sm text-amber-700">Login failed (invalid state). Please try again.</p>
          )}
          {params.error === "token_exchange" && (
            <p className="mb-4 text-sm text-amber-700">Login failed. Please try again.</p>
          )}
          {params.error === "missing_params" && (
            <p className="mb-4 text-sm text-amber-700">Login failed (missing parameters). Please try again.</p>
          )}
          <div className="rounded-xl bg-white p-8 shadow-sm">
            <p className="mb-6 text-[#1E1E1E]">Sign in to view your orders and account details.</p>
            {useHeadlessLogin ? (
              <a
                href="/auth/login"
                className="inline-block rounded-lg bg-[var(--brand-navy)] px-6 py-3 font-medium text-white hover:opacity-90 [font-family:var(--font-inter)]"
              >
                Log in
              </a>
            ) : null}
            {accountUrl && (
              <p className="mt-4">
                <a
                  href={accountUrl}
                  rel="noopener noreferrer"
                  className="text-[#498CCB] underline hover:no-underline [font-family:var(--font-inter)]"
                >
                  Open account on Shopify
                </a>
              </p>
            )}
          </div>
        </div>
      </main>
    );
  }

  let data: CustomerOrdersResult | null = null;
  try {
    data = await fetchCustomerOrders(token);
  } catch {
    // show empty state
  }

  const customer = data?.customer;
  const orders = customer?.orders?.edges ?? [];

  return (
    <main className="min-h-screen bg-[#F8F8F8] px-4 pt-24 pb-12 md:pt-32 md:pb-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-semibold text-[var(--section-title-size,24px)] text-[#1E1E1E] [font-family:var(--font-inter)]">
            Account
          </h1>
          <a
            href="/auth/logout"
            className="text-sm text-[#498CCB] underline hover:no-underline [font-family:var(--font-inter)]"
          >
            Log out
          </a>
        </div>
        {customer && (
          <p className="mb-6 text-[#1E1E1E] [font-family:var(--font-inter)]">
            {[customer.firstName, customer.lastName].filter(Boolean).join(" ") || "Customer"}
            {customer.emailAddress?.emailAddress ? ` · ${customer.emailAddress.emailAddress}` : ""}
          </p>
        )}
        <h2 className="mb-4 font-medium text-lg text-[#1E1E1E] [font-family:var(--font-inter)]">Orders</h2>
        {orders.length === 0 ? (
          <div className="rounded-xl bg-white p-8 shadow-sm">
            <p className="font-medium text-[#1E1E1E]">No orders yet</p>
            <p className="mt-1 text-[#1E1E1E]">
              <Link href="/shop" className="text-[#498CCB] underline hover:no-underline">
                Go to store to place an order
              </Link>
              .
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {orders.map(({ node: order }) => (
              <li key={order.id} className="rounded-xl bg-white p-6 shadow-sm">
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="font-medium text-[#1E1E1E]">{order.name}</span>
                  <span className="text-sm text-[#1E1E1E]">{formatDate(order.createdAt)}</span>
                </div>
                <p className="mt-1 text-sm text-[#1E1E1E]">
                  {order.totalPriceSet?.shopMoney
                    ? `${order.totalPriceSet.shopMoney.currencyCode} ${order.totalPriceSet.shopMoney.amount}`
                    : ""}
                  {order.status ? ` · ${order.status}` : ""}
                </p>
                {order.lineItems?.edges?.length ? (
                  <ul className="mt-2 list-inside list-disc text-sm text-[#1E1E1E]">
                    {order.lineItems.edges.slice(0, 5).map(({ node: item }) => (
                      <li key={item.title}>
                        {item.title} × {item.quantity}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        )}
        {accountUrl && (
          <p className="mt-8">
            <a
              href={accountUrl}
              rel="noopener noreferrer"
              className="text-[#498CCB] underline hover:no-underline [font-family:var(--font-inter)]"
            >
              Manage account on Shopify
            </a>
          </p>
        )}
      </div>
    </main>
  );
}
