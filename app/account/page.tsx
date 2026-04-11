import { cookies } from "next/headers";
import Link from "next/link";
import { getAccessTokenFromCookies } from "@/lib/authCookie";
import {
  fetchCustomerOrdersWithOutcome,
  isCustomerAccountConfigured,
  type CustomerOrdersResult,
} from "@/lib/shopifyCustomerAccount";

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
  const useHeadlessLogin = isCustomerAccountConfigured();

  if (!token) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--section-bg-light)] px-4">
        <div className="w-full max-w-[620px]">
          <div
            className="flex flex-col overflow-y-auto rounded-card bg-white p-8 md:h-[360px] md:w-[620px]"
            style={{
              borderRadius: 10,
              boxShadow: "0 4px 4px 0 rgba(0, 0, 0, 0.05)",
            }}
          >
            <h1 className="mb-2 font-bold text-[var(--section-title-size,24px)] uppercase tracking-wide text-[#1E1E1E] [font-family:var(--font-inter)]">
              Account
            </h1>
            <p
              className="mb-6 font-normal [font-family:var(--font-inter)]"
              style={{
                color: "var(--Text-Color, #1E1E1E)",
                fontSize: 16,
                fontStyle: "normal",
                lineHeight: "normal",
              }}
            >
              Sign in to view your orders and account details.
            </p>
            {params.error === "invalid_state" && (
              <p className="mb-4 text-sm text-amber-700">Login failed (invalid state). Please try again.</p>
            )}
            {params.error === "token_exchange" && (
              <p className="mb-4 text-sm text-amber-700">Login failed. Please try again.</p>
            )}
            {params.error === "missing_params" && (
              <p className="mb-4 text-sm text-amber-700">Login failed (missing parameters). Please try again.</p>
            )}
            {useHeadlessLogin ? (
              <div className="flex flex-col gap-3">
                <a
                  href="/auth/login"
                  className="block w-full rounded-lg bg-[var(--brand-green)] px-6 py-3 text-center font-medium text-white hover:opacity-90 [font-family:var(--font-inter)]"
                >
                  Log in
                </a>
                <a
                  href="/auth/login"
                  className="block w-full rounded-lg border-2 border-[var(--brand-green)] bg-white px-6 py-3 text-center font-medium text-[var(--brand-green)] hover:bg-[var(--brand-green)]/5 [font-family:var(--font-inter)]"
                >
                  Create account
                </a>
              </div>
            ) : null}
          </div>
        </div>
      </main>
    );
  }

  let data: CustomerOrdersResult | null = null;
  let ordersLoadFailed = false;
  let ordersDevHint: string | undefined;
  try {
    const outcome = await fetchCustomerOrdersWithOutcome(token);
    data = outcome.data;
    ordersLoadFailed = outcome.loadFailed;
    ordersDevHint = outcome.devHint;
  } catch {
    ordersLoadFailed = true;
    if (process.env.NODE_ENV === "development") {
      ordersDevHint = "fetchCustomerOrdersWithOutcome threw — check server logs.";
    }
  }

  const customer = data?.customer;
  const orders = customer?.orders?.edges ?? [];
  const showDevOrdersHint =
    process.env.NODE_ENV === "development" && ordersLoadFailed && Boolean(ordersDevHint);

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
        {showDevOrdersHint ? (
          <div className="rounded-card border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 [font-family:var(--font-inter)]">
            <p className="font-semibold">Development: orders request did not succeed</p>
            <p className="mt-2 whitespace-pre-wrap break-words opacity-90">{ordersDevHint}</p>
            <p className="mt-2 text-amber-900/80">
              Production users still see the generic empty state below when this happens.
            </p>
          </div>
        ) : null}
        {orders.length === 0 ? (
          <div
            className={`rounded-card bg-white p-8 shadow-sm${showDevOrdersHint ? " mt-4" : ""}`}
          >
            <p className="font-medium text-[#1E1E1E]">
              {ordersLoadFailed ? "Couldn’t load orders" : "No orders yet"}
            </p>
            <p className="mt-1 text-[#1E1E1E]">
              {ordersLoadFailed ? (
                <>
                  Try signing out and back in, or open your account on Shopify if the problem continues.
                </>
              ) : (
                <>
                  <Link href="/shop" className="text-[#498CCB] underline hover:no-underline">
                    Go to store to place an order
                  </Link>
                  .
                </>
              )}
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {orders.map(({ node: order }) => (
              <li key={order.id} className="rounded-card bg-white p-6 shadow-sm">
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
      </div>
    </main>
  );
}
