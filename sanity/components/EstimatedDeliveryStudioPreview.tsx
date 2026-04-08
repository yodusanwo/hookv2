import React from "react";
import { Box, Card, Stack, Text } from "@sanity/ui";
import { useFormValue } from "sanity";
import { buildDeliveryCalendarConfig } from "../../lib/estimatedDeliveryCalendar";
import { computeEstimatedDeliveryTimeline } from "../../lib/estimatedDeliveryTimeline";
import {
  parseProcessingDaysFromSanity,
  parseTransitDaysFromSanity,
} from "../../lib/parseSanityDayRange";
import type { StringInputProps, StringSchemaType } from "sanity";

type Doc = {
  estimatedDeliveryBlockedDates?: string[] | null;
  estimatedDeliveryProcessingWeekdaysAmbient?: string[] | null;
  estimatedDeliveryProcessingWeekdaysFrozen?: string[] | null;
  estimatedDeliveryTransitWeekdaysAmbient?: string[] | null;
  estimatedDeliveryTransitWeekdaysFrozen?: string[] | null;
  estimatedDeliveryProcessingDays?: number | null;
  estimatedDeliveryFrozenProcessingDays?: number | null;
  estimatedDeliveryProcessingDaysRange?: string | null;
  estimatedDeliveryFrozenProcessingDaysRange?: string | null;
  estimatedDeliveryTransitDays?: string | null;
  estimatedDeliveryFrozenTransitDays?: string | null;
};

function fmt(d: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(d);
}

function fmtRange(a: Date, b: Date): string {
  const t = a.getTime();
  const u = b.getTime();
  const [x, y] = t <= u ? [a, b] : [b, a];
  if (
    x.getFullYear() === y.getFullYear() &&
    x.getMonth() === y.getMonth() &&
    x.getDate() === y.getDate()
  ) {
    return fmt(x);
  }
  if (x.getMonth() === y.getMonth()) {
    return `${fmt(x)} – ${y.getDate()}`;
  }
  return `${fmt(x)} – ${fmt(y)}`;
}

function block(doc: Doc | undefined, isFrozen: boolean) {
  if (!doc) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const processing = parseProcessingDaysFromSanity(
    isFrozen
      ? doc.estimatedDeliveryFrozenProcessingDaysRange
      : doc.estimatedDeliveryProcessingDaysRange,
    isFrozen ? doc.estimatedDeliveryFrozenProcessingDays : doc.estimatedDeliveryProcessingDays,
    isFrozen,
  );
  const transit = parseTransitDaysFromSanity(
    isFrozen ? doc.estimatedDeliveryFrozenTransitDays : doc.estimatedDeliveryTransitDays,
    isFrozen,
  );
  const calendar = buildDeliveryCalendarConfig({
    isFrozen,
    blockedDates: doc.estimatedDeliveryBlockedDates,
    processingWeekdaysAmbient: doc.estimatedDeliveryProcessingWeekdaysAmbient,
    processingWeekdaysFrozen: doc.estimatedDeliveryProcessingWeekdaysFrozen,
    transitWeekdaysAmbient: doc.estimatedDeliveryTransitWeekdaysAmbient,
    transitWeekdaysFrozen: doc.estimatedDeliveryTransitWeekdaysFrozen,
  });
  const t = computeEstimatedDeliveryTimeline(today, processing, transit, calendar);
  const label = isFrozen ? "Frozen" : "Ambient";
  return (
    <Card padding={3} radius={2} shadow={1} tone="transparent">
      <Stack space={3}>
        <Text size={1} weight="semibold">
          {label} (as on PDP)
        </Text>
        <Text size={1}>
          Order today → package between{" "}
          <strong>{fmt(t.deliveryEarliest)}</strong> – <strong>{fmt(t.deliveryLatest)}</strong>
        </Text>
        <Stack space={2}>
          <Text size={1}>
            Purchased: <strong>{fmt(t.purchasedDate)}</strong>
          </Text>
          <Text size={1}>
            Processing:{" "}
            <strong>
              {fmtRange(t.processingDisplayStart, t.processingDisplayEnd)}
            </strong>{" "}
            <span style={{ opacity: 0.75 }}>
              (shortest–longest processing: {processing.min}–{processing.max} days)
            </span>
          </Text>
          <Text size={1}>
            Delivered:{" "}
            <strong>{fmtRange(t.deliveryEarliest, t.deliveryLatest)}</strong>{" "}
            <span style={{ opacity: 0.75 }}>
              (transit {transit.min}–{transit.max} days)
            </span>
          </Text>
        </Stack>
      </Stack>
    </Card>
  );
}

/**
 * Subscribe to each shipping field explicitly so the preview re-renders on every edit.
 * `useFormValue([])` alone often does not update when nested values change in Studio.
 */
function useSiteSettingsDeliveryDoc(): Doc {
  const estimatedDeliveryBlockedDates = useFormValue([
    "estimatedDeliveryBlockedDates",
  ]) as Doc["estimatedDeliveryBlockedDates"];
  const estimatedDeliveryProcessingWeekdaysAmbient = useFormValue([
    "estimatedDeliveryProcessingWeekdaysAmbient",
  ]) as Doc["estimatedDeliveryProcessingWeekdaysAmbient"];
  const estimatedDeliveryProcessingWeekdaysFrozen = useFormValue([
    "estimatedDeliveryProcessingWeekdaysFrozen",
  ]) as Doc["estimatedDeliveryProcessingWeekdaysFrozen"];
  const estimatedDeliveryTransitWeekdaysAmbient = useFormValue([
    "estimatedDeliveryTransitWeekdaysAmbient",
  ]) as Doc["estimatedDeliveryTransitWeekdaysAmbient"];
  const estimatedDeliveryTransitWeekdaysFrozen = useFormValue([
    "estimatedDeliveryTransitWeekdaysFrozen",
  ]) as Doc["estimatedDeliveryTransitWeekdaysFrozen"];
  const estimatedDeliveryProcessingDays = useFormValue([
    "estimatedDeliveryProcessingDays",
  ]) as Doc["estimatedDeliveryProcessingDays"];
  const estimatedDeliveryFrozenProcessingDays = useFormValue([
    "estimatedDeliveryFrozenProcessingDays",
  ]) as Doc["estimatedDeliveryFrozenProcessingDays"];
  const estimatedDeliveryProcessingDaysRange = useFormValue([
    "estimatedDeliveryProcessingDaysRange",
  ]) as Doc["estimatedDeliveryProcessingDaysRange"];
  const estimatedDeliveryFrozenProcessingDaysRange = useFormValue([
    "estimatedDeliveryFrozenProcessingDaysRange",
  ]) as Doc["estimatedDeliveryFrozenProcessingDaysRange"];
  const estimatedDeliveryTransitDays = useFormValue([
    "estimatedDeliveryTransitDays",
  ]) as Doc["estimatedDeliveryTransitDays"];
  const estimatedDeliveryFrozenTransitDays = useFormValue([
    "estimatedDeliveryFrozenTransitDays",
  ]) as Doc["estimatedDeliveryFrozenTransitDays"];

  return React.useMemo(
    () => ({
      estimatedDeliveryBlockedDates,
      estimatedDeliveryProcessingWeekdaysAmbient,
      estimatedDeliveryProcessingWeekdaysFrozen,
      estimatedDeliveryTransitWeekdaysAmbient,
      estimatedDeliveryTransitWeekdaysFrozen,
      estimatedDeliveryProcessingDays,
      estimatedDeliveryFrozenProcessingDays,
      estimatedDeliveryProcessingDaysRange,
      estimatedDeliveryFrozenProcessingDaysRange,
      estimatedDeliveryTransitDays,
      estimatedDeliveryFrozenTransitDays,
    }),
    [
      estimatedDeliveryBlockedDates,
      estimatedDeliveryProcessingWeekdaysAmbient,
      estimatedDeliveryProcessingWeekdaysFrozen,
      estimatedDeliveryTransitWeekdaysAmbient,
      estimatedDeliveryTransitWeekdaysFrozen,
      estimatedDeliveryProcessingDays,
      estimatedDeliveryFrozenProcessingDays,
      estimatedDeliveryProcessingDaysRange,
      estimatedDeliveryFrozenProcessingDaysRange,
      estimatedDeliveryTransitDays,
      estimatedDeliveryFrozenTransitDays,
    ],
  );
}

/** Read-only preview; replaces the string input UI. */
export function EstimatedDeliveryStudioPreviewInput(
  _props: StringInputProps<StringSchemaType>,
) {
  const doc = useSiteSettingsDeliveryDoc();
  return (
    <Box>
      <Stack space={4}>
        <Text size={1} muted>
          Live preview (updates as you edit fields above). Uses today’s date in your browser. The
          string value of this field is unused. Shopify Essential Estimated may still differ
          slightly in edge cases.
        </Text>
        <Stack space={3}>
          {block(doc, false)}
          {block(doc, true)}
        </Stack>
      </Stack>
    </Box>
  );
}
