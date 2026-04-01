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

type HeroVideoUrlInputProps = {
  value?: LegacyVideoValue;
  onChange: (patch: ReturnType<typeof set> | ReturnType<typeof unset>) => void;
  renderDefault: (props: HeroVideoUrlInputProps & { value?: string }) => React.ReactNode;
};

export function HeroVideoUrlInput(props: HeroVideoUrlInputProps) {
  const hasMigrated = useRef(false);
  const legacyUrl =
    props.value && typeof props.value === "object"
      ? props.value.asset?.url?.trim() || ""
      : "";

  useEffect(() => {
    if (hasMigrated.current) return;
    if (!legacyUrl) return;
    hasMigrated.current = true;
    props.onChange(legacyUrl ? set(legacyUrl) : unset());
  }, [legacyUrl, props]);

  const displayValue =
    typeof props.value === "string" ? props.value : legacyUrl || undefined;

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
