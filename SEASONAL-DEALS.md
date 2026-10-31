# Seasonal offers

The Early Black Friday campaign replaces Closeout Deals in the homepage hero,
beside the headline on desktop and below it on phones. It also appears in
navigation and at `/deals`, with a shareable `/deals/[slug]` detail page for each active offer.
English and Spanish use the same prices and product definitions.

## Update or end the campaign

- Update `lib/deals.ts` to add products, change prices, or disable individual
  offers with `active: false`. Add the corresponding copy under
  `blackFriday.products` in both translation files and an image in
  `public/images/deals`.
- Prices are integer cents. Only set `originalPriceCents` and `discountPercent`
  when the shop has supplied a genuine comparison price and discount.
- Set `installationIncluded: false` for the additional product-only offers
  when the shop provides them. Do not reuse installed prices for product-only
  offers.
- Set `EARLY_BLACK_FRIDAY_ENABLED` to `false` when the promotion ends. This
  removes the campaign from the homepage, navigation, and sitemap; direct deal
  URLs return 404. No end date was provided, so no countdown or automatic end
  date has been invented.

The initial approved offers are PRO 940S at $408 installed ($480 less 15%,
saving $72), and CSX 5300S at a final $589.99 installed. The 15% discount applies
only to the PRO 940S. Customers call the shop to confirm vehicle compatibility
and arrange installation. These offers are not added to Clover checkout under
unverified product IDs, and no live inventory or payment configuration changes
are made by this feature.

## Product sources

The original photos were downloaded unmodified from Compustar's official site.
Product specifications come from the corresponding manufacturer pages.

- [PRO 940S / CSP940-S](https://www.compustar.com/bundles/csp940-s)
  — [photo](https://www.compustar.com/wp-content/uploads/2024/09/CSP940-S.jpg)
- [CSX 5300S / CSX5300-S](https://www.compustar.com/bundles/csx5300-s/)
  — [photo](https://www.compustar.com/wp-content/uploads/2024/09/CSX5300-S.jpg)
- [DroneMobile service plans](https://www.dronemobile.com/subscriptions)

The LTE module is included with the CSX bundle; smartphone service requires a
separate plan, as disclosed on its detail page.
