# Design QA — Shop Crediti

**Source visual truth path**

- `/workspace/scratch/shop-crediti-publicado-1790041321857.jpg` (estado publicado anterior, com Magalu e SHEIN grandes demais dentro dos ícones)
- `/workspace/scratch/4edd461a4510/upload/IMG_3236.jpeg` (desalinhamento nos quatro cards do painel “Um shopping inteiro na sua mão”)
- `/workspace/scratch/4edd461a4510/upload/IMG_3227.png` (relato visual de logos espremidas e desalinhadas)
- `/workspace/scratch/4edd461a4510/upload/FD8B6402-C172-4B47-9152-5CE1ECA13E8F.jpeg`
- `/workspace/scratch/4edd461a4510/upload/IMG_3210.jpeg` (evidência do espaço excessivo no fim da rolagem)

**Implementation evidence**

- Local preview: `http://terminal.local:4173/`
- Latest safe-area screenshot: `/workspace/scratch/shop-logos-safe-area-1790047628129.jpg`
- Latest focused before/after comparison: `/workspace/scratch/shop-logos-focused-before-after.jpg`
- Latest browser-rendered logo screenshot: `/workspace/scratch/4edd461a4510/shop-logo-alignment-after.jpg`
- Latest focused comparison: `/workspace/scratch/4edd461a4510/shop-logo-alignment-comparison.jpg`
- Browser-rendered screenshot: `/workspace/scratch/4edd461a4510/shop-browser-full.jpg`
- Focused bottom-state screenshot: `/workspace/scratch/4edd461a4510/shop-browser-final.jpg`
- Combined comparison: `/workspace/scratch/4edd461a4510/shop-qa-comparison.jpg`

**Viewport and normalization**

- Source: 711 × 1536 pixels, mobile portrait, 72 dpi.
- Browser viewport capture: 1348 × 926 CSS pixels, DPR 1.
- Latest implementation capture: 1348 × 926 pixels at the same viewport and state as the previous published capture.
- Full-page implementation: 1348 × 2025 pixels.
- Comparison normalized both images to 1200 pixels of height and placed them in one side-by-side artifact.
- State: Shop landing page, no active search or category filter, first seven brands visible; expanded catalog verified with 37 stores.

## Findings

- No actionable P0, P1, or P2 issues remain.
- The four lower-panel marks now have measured internal clearance. Magalu and SHEIN have 10 CSS pixels at both horizontal sides and 16 CSS pixels above and below; no letter touches the icon boundary. Shopee and Amazon retain 11 CSS pixels horizontally and 9 CSS pixels vertically.
- The logo tiles now reserve 9 to 11 CSS pixels of horizontal safety space around every visible mark. Avon, O Boticário and Cacau Show are fully contained and centered instead of touching or being clipped by the tile border.
- Store names and descriptions use explicit line heights and remain separated from the action control by 12 CSS pixels.
- The inactive regional-partner callout was removed. Its space now presents a photographic shopping gallery with four direct, functional store choices.
- “Ver todas” expands the store list from seven to all 37 registered brands and changes to “Ver menos”; the second activation collapses the list again.
- The priority order is Shopee, Magalu, SHEIN, Amazon, Avon, O Boticário and Cacau Show. The remaining 30 registered stores stay available in the expanded state.
- All 37 rendered logos returned nonzero intrinsic dimensions in the browser check. Magalu, SHEIN, Avon, O Boticário, Cacau Show, Amakha Paris, PromoFarma, CicatriSSim, Le’Loyn and Fator 5 use official brand assets. Incorrect La Luna, Freeway and Le’Loyn domains were corrected.
- At maximum scroll, the affiliate notice ends 15 CSS pixels above the fixed navigation, with no large blank footer area.

## Required fidelity surfaces

- **Fonts and typography:** heavy display headings, compact labels and supporting copy retain the selected visual hierarchy without clipping.
- **Spacing and layout rhythm:** hero, categories, store rows, shopping-gallery panel and notice have consistent spacing and rounded surfaces. The fixed navigation remains stable.
- **Colors and visual tokens:** Crediti yellow, white surfaces, black text and subtle borders/shadows stay aligned with the chosen direction.
- **Image quality and asset fidelity:** photographic hero, category images and gallery image are sharp. Store marks are official assets, not drawn approximations.
- **Copy and content:** the former local-partner promise was replaced by “Um shopping inteiro na sua mão”, which accurately describes the functional store sequence.

## Primary interactions tested

- Opened Shop from the persistent navigation.
- Expanded and collapsed “Ver todas”; verified 7 → 37 → 7 brand rows and the “Ver menos” state.
- Selected “Beleza”; verified SHEIN, Avon, O Boticário, Lojas Rede and AmoKarité.
- Cleared the category filter.
- Searched “Amazon”; verified a single matching row.
- Verified four enabled store buttons in the shopping-gallery panel.
- Verified every rendered brand image has a nonzero natural width and height.

## Console check

- No Crediti application errors were observed.
- Logged errors came only from the cloud-browser extension metadata bridge and are unrelated to the application.

## Full-view comparison evidence

- The combined comparison shows the implementation preserves the strong yellow header, search-first hierarchy, realistic shopping photography, category strip, official brand list and fixed navigation from the selected source direction.
- The implementation intentionally keeps the existing Crediti five-item navigation and responsive desktop container.

## Focused-region comparison evidence

- The focused lower-state capture shows the final brand rows, the shopping-gallery image with four store cards, the disclosure notice and the fixed navigation together.
- The focused before/after crop shows the corrected reduction of the Magalu and SHEIN wordmarks while preserving the same card, icon container and label alignment.

## Comparison history

- Earlier iteration: the footer had a P2 excessive blank region caused by duplicate navigation spacing. The existing override removed the duplicate reserve; the current maximum-scroll measurement confirms a 15-pixel gap.
- Current iteration: the first pass found a P1 broken Avon favicon and a P2 incorrect O Boticário cart favicon. Avon was replaced with its official wordmark and O Boticário with the official production logo. Post-fix browser checks reported zero failed images.
- Current catalog pass restored the 28 previously omitted registrations, verified 37 rendered rows, replaced generic globe icons with official brand assets where available, and added a high-contrast yellow “ABRIR” control to every row.
- Logo-alignment iteration: the source screenshot showed horizontal wordmarks rendered at 52 CSS pixels inside a 42-pixel content area, causing visible clipping and crowding. The logo tile was adjusted to 64 × 64 CSS pixels with an 8-pixel inset, wordmarks now use `max-width: 46px` and `max-height: 30px`, and text blocks received explicit line height. The latest focused browser capture and DOM geometry check confirm all seven priority logos are fully contained, with 9–11 pixels of horizontal safety space and no overlap with text or controls.
- Store-integrity iteration: Natura, Itatiaia, La Luna, Freeway, Sieno Perfumes, Komo Wellness and Casa das Alianças were replaced with official logo assets sourced from their own storefronts or official delivery assets. All seven loaded with nonzero intrinsic dimensions in the browser. The Shop component previously referenced an out-of-scope `openExternal` function, which prevented every store button from navigating. The callback is now passed explicitly by the app; a real browser click opened the tracked Natura link and completed the redirect to the secure official `natura.com.br` storefront. The other six links were individually resolved to their official HTTPS domains.
- Post-fix production build and stability checks passed. Three newly substituted official assets returned HTTP 200 with valid PNG/SVG MIME types; Fator 5 had already loaded successfully in the browser pass.
- Current interaction pass found no remaining P0/P1/P2 issue.
- Final-card alignment iteration: the source showed inconsistent vertical placement across Shopee, Magalu, SHEIN and Amazon. The cards now use fixed 50 px logo and 14 px label grid tracks. Browser geometry measured identical logo tops (`692.390625`), logo heights (`50`), label tops (`748.390625`), label heights (`14`) and button heights (`89`) for all four cards.
- Shopee correction: the supplied affiliate URL `https://s.shopee.com.br/qjgbXOrmd` replaced the obsolete Coolshop destination. A real browser activation completed the redirect to the official `shopee.com.br` storefront with affiliate parameters intact.
- Gazin quality correction: the low-resolution favicon was replaced with the official Gazin vector mark extracted from the brand's own production storefront. The local SVG rendered at `300 × 106` intrinsic pixels with no load failure.
- Lower-card safe-area correction: the previous wordmark rule forced a 46 × 26 CSS-pixel image into an icon container whose padding left a smaller usable area, allowing Magalu and SHEIN to crowd the boundary. The bottom-panel wrapper now has an 8-pixel inset, standard marks render at 32 × 32 and wordmarks at 34 × 18. Post-fix browser geometry confirms balanced clearances on all four sides, and the focused comparison shows no contact with the icon borders.

## Follow-up polish

- P3: locally cache additional official brand assets in a future maintenance pass to reduce dependence on partner CDNs.

## Implementation checklist

- [x] Inactive regional-partner CTA removed.
- [x] Shopping-gallery store sequence added.
- [x] Priority brands placed first.
- [x] “Ver todas” and “Ver menos” tested.
- [x] Official logos visually and programmatically checked.
- [x] All 37 registered stores restored in the expanded catalog.
- [x] Seven reported brand logos replaced with their official identities.
- [x] Store-button callback connected and real affiliate redirect tested.
- [x] Search and category filtering tested.
- [x] Bottom spacing measured.
- [x] Production build completed successfully.
- [x] Four final-card logo and label tracks measured and aligned.
- [x] New Shopee affiliate redirect tested in a real browser.
- [x] Gazin favicon replaced with official vector artwork.
- [x] Magalu and SHEIN lower-card safe areas measured and visually compared.

final result: passed
