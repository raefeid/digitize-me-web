
# Add real customer logos to the trust strip

Replace the fallback text names ("ADNOC", "Emirates NBD", …) with the 8 uploaded logo images so the `ClientLogosCarousel` (which already reads from `client_logos`) takes over from the text-based `TrustedBySection`.

## Steps

1. **Prep each logo**
   - ADNOC, Emirates NBD, Etisalat, DEWA, Emaar, DP World, Majid Al Futtaim → uploaded with white/solid backgrounds. Run each through `imagegen--edit_image` with `transparent_background: true` to produce clean transparent PNGs.
   - RTA → already appears transparent; use as-is (skip background removal to avoid quality loss).

2. **Upload to CDN** via `lovable-assets create` from `/mnt/user-uploads/…` → write `.asset.json` pointers under `src/assets/logos/`. This avoids putting binaries in the repo.

3. **Seed `client_logos` table** via a single `supabase--insert` (or SQL migration) with 8 rows:
   | company_name | logo_url (CDN url from pointer) | sort_order | published |
   |---|---|---|---|
   | ADNOC | … | 10 | true |
   | Emirates NBD | … | 20 | true |
   | Etisalat | … | 30 | true |
   | DEWA | … | 40 | true |
   | RTA | … | 50 | true |
   | Emaar | … | 60 | true |
   | DP World | … | 70 | true |
   | Majid Al Futtaim | … | 80 | true |

4. **Verify** the homepage: `ClientLogosCarousel` now renders (currently hidden because table is empty), and the older text-based `TrustedBySection` becomes redundant. Confirm scroll animation and spacing look right; no code changes expected since sizing was already boosted.

## Notes / open item

- The homepage currently renders **both** `TrustedBySection` (text fallback) and `ClientLogosCarousel` (image logos). Once real logos are seeded, we'll have two trust strips stacked. **Recommend removing `TrustedBySection` from `src/pages/Index.tsx`** so only the real-logo carousel shows. Let me know if you'd prefer to keep both.
