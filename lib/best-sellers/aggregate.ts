import { cloverFetch, isCloverConfigured } from "@/lib/clover/client";
import type { CloverOrder, CloverOrdersResponse } from "@/types/clover";

export interface AggregatedProduct {
  cloverItemId: string;
  itemName: string;
  totalQuantitySold: number;
  totalRevenueCents: number;
  orderCount: number;
  lastSoldAt: string | null;
}

/**
 * Fetch ALL orders from Clover, paginating through the full history.
 */
async function fetchAllOrders(): Promise<CloverOrder[]> {
  if (!isCloverConfigured) {
    throw new Error("Clover API not configured");
  }

  const allOrders: CloverOrder[] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const data = await cloverFetch<CloverOrdersResponse>("/orders", {
      params: {
        limit: String(limit),
        offset: String(offset),
        expand: "lineItems",
        orderBy: "createdTime DESC",
      },
    });

    const orders = data.elements || [];
    allOrders.push(...orders);

    if (orders.length < limit) break;
    offset += limit;
  }

  return allOrders;
}

/**
 * Aggregate order line items by product ID.
 * Returns a map of cloverItemId → aggregated sales data.
 */
export function aggregateLineItems(
  orders: CloverOrder[]
): Map<string, AggregatedProduct> {
  const productMap = new Map<string, AggregatedProduct>();

  for (const order of orders) {
    const lineItems = order.lineItems?.elements || [];
    const orderTime = order.createdTime
      ? new Date(order.createdTime).toISOString()
      : null;

    for (const lineItem of lineItems) {
      // Skip line items without a product reference (manual entries)
      if (!lineItem.item?.id) continue;
      // Skip refunded items
      if (lineItem.refunded) continue;

      const itemId = lineItem.item.id;
      const existing = productMap.get(itemId);

      if (existing) {
        existing.totalQuantitySold += 1;
        existing.totalRevenueCents += lineItem.price;
        existing.orderCount += 1;
        if (
          orderTime &&
          (!existing.lastSoldAt || orderTime > existing.lastSoldAt)
        ) {
          existing.lastSoldAt = orderTime;
        }
      } else {
        productMap.set(itemId, {
          cloverItemId: itemId,
          itemName: lineItem.name,
          totalQuantitySold: 1,
          totalRevenueCents: lineItem.price,
          orderCount: 1,
          lastSoldAt: orderTime,
        });
      }
    }
  }

  return productMap;
}

/**
 * Fetch all Clover orders and aggregate line items into best-seller data.
 */
export async function fetchAndAggregate(): Promise<AggregatedProduct[]> {
  const orders = await fetchAllOrders();
  const aggregated = aggregateLineItems(orders);

  return Array.from(aggregated.values()).sort(
    (a, b) => b.totalQuantitySold - a.totalQuantitySold
  );
}
