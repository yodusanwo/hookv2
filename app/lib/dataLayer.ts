"use client";

type DataLayerEvent = Record<string, unknown>;

type DataLayerWindow = Window & {
  dataLayer?: DataLayerEvent[];
};

function getDataLayer(): DataLayerEvent[] | null {
  if (typeof window === "undefined") return null;
  const w = window as DataLayerWindow;
  w.dataLayer = w.dataLayer || [];
  return w.dataLayer;
}

export function pushDataLayerEvent(event: DataLayerEvent) {
  const dataLayer = getDataLayer();
  if (!dataLayer) return;
  dataLayer.push(event);
}

export function pushEcommerceEvent(event: DataLayerEvent) {
  const dataLayer = getDataLayer();
  if (!dataLayer) return;
  dataLayer.push({ ecommerce: null });
  dataLayer.push(event);
}
