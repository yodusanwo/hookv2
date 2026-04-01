"use client";

import { useEffect, useRef } from "react";
import { Card, Stack, Text } from "@sanity/ui";
import { set, unset } from "sanity";

type LegacyVideoValue =
  | string
  | {
      asset?: {
        url?: string | null;
      } | null;
    }
  | null
  | undefined;

export function HeroVideoUrlInput(props: any) {
  const hasMigrated = useRef(false);
  const value = props.value as LegacyVideoValue;
  const legacyUrl =
    value && typeof value === "object"
      ? value.asset?.url?.trim() || ""
      : "";

  useEffect(() => {
    if (hasMigrated.current) return;
    if (!legacyUrl) return;
    hasMigrated.current = true;
    props.onChange(legacyUrl ? set(legacyUrl) : unset());
  }, [legacyUrl, props]);

  const displayValue =
    typeof value === "string" ? value : legacyUrl || undefined;

  return (
    <Stack space={3}>
      {legacyUrl ? (
        <Card padding={3} radius={2} tone="caution">
          <Text size={1}>
            Converted a legacy uploaded-video value into its direct asset URL.
            Publish this page to save the new format.
          </Text>
        </Card>
      ) : null}
      {props.renderDefault({
        ...props,
        value: displayValue,
      })}
    </Stack>
  );
}
