# Food Stockpile Planning

## The goal

A community of any size should maintain a 3–6 month food stockpile at all times. Three months covers most supply chain disruptions. Six months covers a failed harvest plus the time needed to recover. The stockpile is not emergency rations — it is the normal operating inventory of a community that produces and distributes its own food.

The target is expressed in **days of coverage**: the number of days the community could feed all members at full nutritional requirements from stored supplies alone, without any new production or incoming trade.

---

## What to stockpile

Store commodities, not finished food. Commodities have long shelf lives, high caloric density, and can be prepared many ways. Finished food (canned meals, processed goods) is expensive, bulky, and nutritionally narrow.

### Caloric foundation — grains and starches

These should make up the bulk of the stockpile by weight and calorie. Stored dry, sealed, and cool, most last 20–30 years.

| Commodity | Shelf life (sealed) | kcal/kg | Notes |
|---|---|---|---|
| Hard wheat berries | 25–30 years | ~3,300 | Requires milling; store a mill |
| White rice | 25–30 years | ~3,600 | Ready to cook; no processing needed |
| Rolled oats | 20–30 years | ~3,800 | Versatile, fast to cook |
| Dried corn / masa | 10–25 years | ~3,600 | Nixtamalized for nutrition |
| Dried pasta | 25+ years | ~3,500 | Minimal preparation |

**Planning figure:** roughly 300–400 kcal/person/day from grain staples, scaled to fill about 50–60% of daily caloric needs.

### Protein — legumes

Legumes are the most important protein source for long-term storage. Cheap, dense, and shelf-stable.

| Commodity | Shelf life (sealed) | Protein/100g dry | Notes |
|---|---|---|---|
| Dried lentils | 25+ years | 25g | Fast cooking, no soaking required |
| Dried black beans | 25+ years | 21g | Soak before cooking |
| Dried chickpeas | 25+ years | 19g | Versatile |
| Dried split peas | 25+ years | 25g | Fast cooking |
| Dried soybeans | 25+ years | 36g | Highest protein density |

Animal protein (smoked/dried meat, canned fish) is harder to store at scale but important for nutritional completeness. Communities with livestock have a significant advantage.

### Fats

Fats are the hardest macronutrient to store. Most vegetable oils go rancid within 1–2 years. Solutions:

- **Ghee (clarified butter):** 1–2 years at room temperature, longer refrigerated or frozen
- **Coconut oil:** 2+ years, highly stable
- **Rendered lard / tallow:** 1 year at room temperature, much longer if rendered clean and sealed
- **Olive oil:** 2 years if stored dark and cool

Fat storage requires active rotation. Plan for 1–2 year cycles rather than long-term storage.

### Preservation essentials

These are not just food — they are tools for producing more food and extending the life of fresh production.

- **Salt:** Indefinite shelf life. Essential for preservation, cooking, and electrolyte balance. Store generously — at least 5–10 kg per person per year.
- **Sugar / honey:** Indefinite shelf life when dry and sealed. Honey is the more stable long-term option. Used for preservation and energy.
- **Vinegar:** Indefinite shelf life. Essential for pickling.
- **Baking soda / baking powder:** 1–2 year effective life. Important for breadmaking.
- **Yeast (dry active):** 2–4 years sealed. Essential if storing wheat.

### Micronutrients

Bulk grain and legume diets are deficient in certain vitamins and minerals. Plan for:

- **Multivitamin supplements:** 2–year shelf life, cheap, dense. Bridge the gap until the community has diverse fresh production.
- **Vitamin C:** Critical. Scurvy is a real risk in a restricted diet. Dried rosehips, stored ascorbic acid, or vitamin C tablets.
- **Iodized salt:** Prevents iodine deficiency, which causes thyroid problems. Use iodized salt as the standard.

### Seeds — the meta-stockpile

Seeds are more important than the food stockpile itself. They are the community's capacity to produce more food indefinitely.

Store **open-pollinated, non-hybrid** varieties — seeds that reproduce true to type. Hybrid seeds produce plants but their offspring are unreliable. Store in cool, dry, dark conditions. Rotate every 3–5 years.

Priority crops for a temperate community: tomatoes, squash, beans, corn, potatoes, carrots, onions, greens (kale, chard), herbs (medicinal and culinary).

---

## Quantities for a community of 1,000

Assumes 1,000 adults at 2,000 kcal/day for 180 days (6-month coverage).

**Total calories needed:** 360,000,000 kcal

| Category | Quantity | Weight (approx) | Storage volume (approx) |
|---|---|---|---|
| Grains (rice, wheat, oats) | ~55,000 kg | 55 tonnes | ~75 cubic meters |
| Legumes (beans, lentils) | ~15,000 kg | 15 tonnes | ~20 cubic meters |
| Fats (oil, ghee) | ~6,000 kg | 6 tonnes | ~7 cubic meters |
| Salt | ~5,000 kg | 5 tonnes | ~4 cubic meters |
| Sugar / honey | ~3,000 kg | 3 tonnes | ~3 cubic meters |

**Total storage footprint:** roughly 110 cubic meters of dry storage — approximately a large barn or a dedicated warehouse room (20m × 6m × 1m deep in shelving). This is achievable. It is not a small undertaking, but it is not an extraordinary one either.

For communities with children, elderly, or members with specific medical needs, adjust quantities using the `getDailyRequirements()` output from the FoodDomain.

---

## Storage infrastructure

**Environment:** Cool (below 20°C), dark, dry (below 15% humidity), and rodent-proof. A below-grade room is ideal — passive temperature control.

**Containers:** Food-grade 5-gallon buckets with gamma-seal lids, lined with mylar bags and oxygen absorbers. Stackable, standardized, labelable. Buy in bulk — they're cheap.

**Rotation discipline:** First in, first out. Every item in the stockpile has a date. The oldest stock is always consumed first and replaced with fresh. A stockpile that isn't being rotated is decaying, not accumulating.

**Inventory system:** The FoodDomain supply ledger tracks commodity quantities, caloric density, and expiration horizons. Coverage days should be visible to domain governance at all times.

---

## What this does not cover

- **Fresh production.** The stockpile is the buffer; the agriculture domain is the long-term answer. A community with productive land, active cultivation, and food preservation capacity needs a much smaller stockpile because it is continuously replenishing it.
- **Water.** Drinking water is a separate domain. Food preparation requires roughly 2 liters per person per day beyond drinking water. Ensure the sanitation and water infrastructure can support cooking at scale.
- **Fuel for cooking.** Stored grain is useless without the ability to cook it. Wood, propane, biogas — the community needs a cooking fuel plan that doesn't depend on the same supply chains it's trying to be resilient against.
- **Milling.** If storing whole wheat berries (recommended for shelf life), the community needs a mill. A hand-cranked or electric grain mill. This is not optional.
