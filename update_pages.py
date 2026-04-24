import re, os

pages_dir = "frontend/src/lib/pages"

pages = [
    "FoodPage.svelte",
    "HousingPage.svelte",
    "HealthcarePage.svelte",
    "EducationPage.svelte",
    "FirePage.svelte",
    "ChildCarePage.svelte",
    "DependencyCarePage.svelte",
    "CourierPage.svelte",
    "TransportPage.svelte",
    "DeathcarePage.svelte",
    "EnrichmentPage.svelte",
    "ProvisioningPage.svelte",
    "AgriculturePage.svelte",
    "SanitationPage.svelte",
    "WaterPage.svelte",
    "CommunicationsPage.svelte",
]

PANEL_RE = re.compile(r'\n[ \t]*<DomainPoolPanel [^\n]+/>\n')
# We need to find what {#if loading} looks like in each file — match with optional leading whitespace
LOADING_RE = re.compile(r'(\n[ \t]*\{#if loading\})')

for page in pages:
    path = os.path.join(pages_dir, page)
    if not os.path.exists(path):
        print(f"{page}: File not found")
        continue
    with open(path, "r") as f:
        text = f.read()

    # Find panel tag
    m_panel = PANEL_RE.search(text)
    if not m_panel:
        print(f"{page}: DomainPoolPanel not found — skipping")
        continue

    panel_tag = m_panel.group(0)  # the full matched string including surrounding newlines

    # Remove panel from current position
    text_without = text[:m_panel.start()] + "\n" + text[m_panel.end():]

    # Find first {#if loading} in the text without the panel
    m_loading = LOADING_RE.search(text_without)
    if not m_loading:
        print(f"{page}: {{#if loading}} not found — skipping")
        continue

    # Insert panel tag before {#if loading}
    insert_pos = m_loading.start()
    text_new = text_without[:insert_pos] + panel_tag + text_without[insert_pos:]

    with open(path, "w") as f:
        f.write(text_new)

    print(f"{page}: OK")
