import { createStorefrontApiClient } from '@shopify/storefront-api-client';

// Shopify client - only created if environment variables are set
// This allows the app to build and run without Shopify configured (using mock data)
const storeDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const accessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

export const storefrontClient = storeDomain && accessToken
  ? createStorefrontApiClient({
      storeDomain,
      apiVersion: '2024-10',
      publicAccessToken: accessToken,
    })
  : null;

export const isShopifyConfigured = !!storefrontClient;

