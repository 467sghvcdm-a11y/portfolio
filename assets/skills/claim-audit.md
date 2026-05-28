---
name: claim-audit
status: alpha
lifecycle: develop
description: >
  Audits customer or business claims against the underlying source data —
  qualitative or quantitative — and produces a structured comparison of the
  claim as stated vs. what the source actually supports. Catches "claim drift,"
  where a study finding or a metric gets compressed into a stronger statement
  than the data allows. Works for any designer in any program via a one-time
  setup flow that captures program-specific data sources, partners, and
  evidence norms. Outputs are framed as "evidence integrity for my own work,"
  not as ammunition against the claimant. Typical trigger phrases include
  'check this claim', 'audit this finding', 'does the data actually say that',
  'where is this from', 'verify this stat', 'is this transferable'.
  Do NOT use for: subjective design feedback (use @design-critique), live
  implementation verification (use @visual-qa), or running new research
  (use @research-interview / @ids:research).
knowledge:
  - config/user-profile.yaml
  - config/settings.yaml
  - workspace/projects/  # per-program configs live in user's personal workspace
next_steps:
  - "@research-interview — if the audit surfaces a gap that requires new qual research, run this next"
  - "@ids:research — for structured qual synthesis once new research is gathered"
  - "@design-critique — once claim is validated and design rationale is being drafted"
  - "@transferability-check — paired skill; once the audit passes, transferability-check evaluates whether the validated claim applies to the current decision context"
upstream_integrations:
  - "AI research-running tools (e.g. 3X hackathon tool by Ngoc Tran & Melrose Huang) — treat their outputs as canonical qual sources provided they cite underlying study artifacts"
---

# Claim Audit

Compare a customer or business claim against its underlying source data and produce a structured drift assessment — what the claim says vs. what the source actually supports. Works for both quantitative claims (test results, funnel metrics, attribution) and qualitative claims (research findings, customer themes, VoC summaries).

> **Attribution:** Original skill. Designed for the CG PDLC pipeline — sits across the full lifecycle as a evidence integrity check. Output is consumed by the designer for their own rationale documentation, and optionally shared with researchers, DS partners, or leadership.
>
> **Framing principle:** All outputs are positioned as the user maintaining evidence rigor in their own work, not as a critique of the person making the claim. Functionally identical to a rebuttal, politically deployable as self-discipline.

## When to Use

- Before incorporating someone else's claim into your own design rationale, deck, or doc
- Before stating a customer or business claim in stakeholder communication
- When a claim is being used to justify a decision and you want to verify the supporting evidence
- When a finding is being applied to a context different from where it was measured (transferability question — pair with `@transferability-check` if available)
- As a pre-CER / pre-readout check on customer or quant claims in the deck
- When inheriting a "customer truth" or "the data shows" claim from upstream documentation

## When NOT to Use

- The claim is a stated hypothesis or strategy POV (not yet evidence-backed by design — don't audit hypotheses against data that doesn't exist)
- You're doing primary research, not auditing — use `@research-interview` or `@ids:research`
- You're evaluating the *design itself* against principles — use `@design-critique`
- You're checking a live build against the design spec — use `@visual-qa`
- The claim is about engineering implementation quality — use `@launch-readiness`

## Design Philosophy: Canonical-First

The skill is built around a structural reality of CG's data infrastructure: **the same-named metric can mean materially different things in different views, because analysts ship personal-logic dashboards as if they were authoritative**. ECC alignment is aspirational rather than enforced. A claim cited from a Qlik or Tableau dashboard may be internally consistent but not reconciled to canonical.

The skill addresses this by always anchoring to the canonical layer first — ECC where possible, the `cgds:` reference skills where ECC doesn't cover the question, documented research artifacts for qual claims. Dashboards and personal analyst views are treated as **evidence of what's being cited**, not as truth-sources in their own right. The audit standard is always "does this match the canonical definition?"

For claims that cannot be anchored to a canonical metric — counterfactuals, novel framings, constructs presented as if measured — the audit's strongest finding is precisely that fact. The claim cannot be verified by data alone, regardless of which dashboard the claimant looked at.

The audit's other durable contribution is its **navigation layer**: for any claim the user audits, the skill surfaces where the canonical truth-source lives, which dashboards report adjacent metrics, who owns those dashboards, and what known fragmentation issues exist. Most designers and PMs can't answer those questions on their own — and answering them is half the daily-data-use problem at CG. The skill, used over time, builds the user's literacy of the CG data ecosystem.

## Settings Awareness

Read `config/settings.yaml` before producing output:
- `output.verbosity` — concise: drift assessment + corrected claim only; standard: full structured comparison; detailed: includes raw source data and methodology trace
- `output.default_format` — markdown file (`claim-audit-report.md`) or inline artifact

Read `config/user-profile.yaml` for:
- Designer's program(s) — determines which `knowledge/programs/<program>/claim-audit-config.yaml` to load
- Connected MCPs — determines which data sources the skill can reach (Databricks, Amplitude, HeyMarvin, etc.)

## First-Run Setup

On first invocation, the skill triggers `claim-audit-setup` (see [references/setup-flow.md](references/setup-flow.md)) to capture program-specific context. The setup writes to the user's personal workspace at `workspace/projects/<program-slug>/claim-audit-config.yaml` and runs once per program. Subsequent runs read from the config.

The skill is designed for any user in any program at CG. It ships without curated program configs and makes no assumptions about which programs exist or what data infrastructure they use. Each user describes their own context through the setup flow. The repo includes one annotated example config (`references/example-config.yaml`) for reference only.

Setup captures:
1. **Program identification** — name, designer's role, strategic focus areas
2. **Data sources for quant claims** — which warehouses (Databricks, Amplitude, ECC), canonical tables, accepted attribution models, relevant `cgds:` helper skills
3. **Data sources for qual claims** — research platforms (HeyMarvin, UserTesting), past research repositories (Drive folders, NotebookLM corpora), customer segments in scope
4. **Recurring artifacts that contain claims worth auditing** — weekly readouts, strategy docs, experiment readouts
5. **Partners** — designated researcher(s), DS partner(s), PM/PD relationships
6. **Confidence thresholds for this program** — required evidence level for design rationale, for stakeholder communication, program-specific norms

The setup also detects available MCPs and adapts the skill's reach to what's connected. If Databricks is not available, the skill warns that quant audits requiring Databricks tables will be unavailable until configured, and walks the user through enabling it from the cgpm-open-market connectors template.

## Process

### Step 1 — Determine Mode

The skill operates in three modes. Auto-detect from the input phrasing, or ask:

| Mode | Trigger | Output |
|------|---------|--------|
| **Auditing** | User is examining a claim made by someone else, or considering inheriting one | Drift assessment + corrected claim with proper qualifications |
| **Authoring** | User is writing their own claim and wants to validate it before stating | Confidence-labeled claim with source citation built in |
| **Gap surfacing** | User is working on a design decision and wants to surface which claims they'd need to support it | Prioritized list of evidence gaps + suggested next moves |

### Step 2 — Parse the Claim

Capture from input:
1. **Claim as stated** — verbatim quote if available
2. **Claim type** — quant, qual, or hybrid (e.g. survey results expressing customer sentiment)
3. **Source pointer** — deck slide, Slack message, doc URL, study ID, dashboard link, or "unknown / not cited"
4. **Context where claim is being used** — design decision it's supporting, audience it'll be presented to, stakes (informational / decisional / strategic)

### Step 3 — Canonical Anchor Check (run first, always)

Before any drift checking, the audit's first job is to identify whether the claim can be anchored to a **canonical source**. The CG data ecosystem is fragmented — analysts ship personal-logic dashboards as if they were authoritative, ECC alignment is aspirational rather than enforced, and the same-named metric can mean materially different things in different views. The audit's first move is to surface where the canonical truth-source lives for this claim, and whether the claim's cited source agrees with it.

**Canonical sources, in order of precedence:**
1. **ECC (Executive Command Center)** — the canonical layer for cross-product TT metrics. If a claim is about a metric ECC reports, ECC is the anchor.
2. **cgds skills** — `cgds:metric-lookup`, `cgds:scorecard-sample-queries`, `cgds:business-glossary`, `cgds:funnel-metrics`, `cgds:itt-calculation`, `cgds:tto-key-tables`, `cgds:cjdm-tables`. These skills exist precisely because the analyst-personal-logic problem is recognized; they publish the canonical definitions and queries.
3. **Documented research artifacts** — for qual claims, a HeyMarvin study, NotebookLM corpus entry, or program research repository.

**Canonical anchor check process:**

1. **Identify the metric or measure cited.** What is the claim actually a claim about? "AE units" → which canonical metric (S2C? Completes? Auth+Start chain?)? "T2A" → what definition? "Customers want X" → what study?
2. **Route to the canonical layer.** Call the relevant cgds skill (or qual repository) to surface the canonical definition.
3. **Determine whether a canonical anchor exists for this exact claim.** Three possible states:
   - **Anchored:** the claim maps cleanly to a canonical metric or study. Audit can proceed against canonical.
   - **Adjacent:** the claim doesn't map cleanly, but a related canonical metric exists. Audit proceeds against the closest canonical with the gap explicitly noted.
   - **No canonical anchor:** the claim is a construct (e.g. counterfactual attribution like "SEO-led work contributed 25% of units") that cannot be anchored to any canonical metric. The audit's strongest finding is this fact, and the claim cannot be verified by data alone.

**Output of canonical anchor check (always included in audit):**

| Canonical anchor | Status | Notes |
|------------------|--------|-------|
| Canonical metric identified | [yes / adjacent / no] | [which metric, or "construct does not map"] |
| Canonical definition pulled | [yes / no] | [source: ECC, cgds:metric-lookup, etc.] |
| Claim's cited source matches canonical | [yes / no / N/A] | [if no: where do they disagree?] |

### Step 4 — Source Interrogation

Based on canonical anchor status and available MCPs, route the source interrogation:

**For quant claims with a canonical anchor:**
- Pull the canonical definition and current value via the relevant cgds skill
- If the claim cites a specific source (dashboard, query, deck), pull or inspect that source too
- Compare: claim value vs. canonical value vs. cited-source value (three-way comparison)
- Call cgds sub-skills as helpers based on program config:
  - `cgds:metric-lookup` — canonical metric definition (always first)
  - `cgds:scorecard-sample-queries` — canonical ECC scorecard SQL
  - `cgds:business-glossary` — term-level definitions
  - `cgds:mix-adjustment` — if the claim is a comparison and composition shifts are plausible
  - `cgds:itt-calculation` — if claim is against a target/forecast
  - `cgds:funnel-metrics` — for stage definitions
  - `cgds:pre-auth-vs-post-auth` — if the claim's table layer is ambiguous
  - (Plus any program-specific cgds skills from the config)
- Verify: source table, date range, cohort definition, metric definition, sample/power if test result, mix-adjustment status, attribution model

**For quant claims anchored to a non-canonical dashboard (Qlik, Tableau, personal analyst workbook):**
- The dashboard is evidence of what's being cited — not the audit's truth-source
- Identify which canonical metric the dashboard *should* match if it were ECC-aligned
- Inspect the dashboard for its construction logic: filters applied, date range, segments included/excluded, calculated fields, annotations or caveats in the view
- If MCP access to the dashboard system exists (Tableau MCP, etc.), pull the dashboard's current state and metadata programmatically; otherwise, walk the user through a structured manual inspection
- Compare: dashboard's number vs. canonical metric value
- If they disagree, surface the gap as a finding — the claim is anchored to a non-canonical view that has not been reconciled to ECC

**For quant claims with no canonical anchor (constructs, counterfactuals, novel framings):**
- The audit's strongest finding is the absence of a canonical anchor
- Identify what canonical metrics are *adjacent* to the claim — what could be measured that would inform the construct?
- For counterfactual claims ("if X hadn't happened, we'd have had Y fewer units"), surface that the claim requires either a test, a holdout, or a model with stated assumptions — and ask whether any of those exist
- The audit output explicitly states the claim cannot be verified by data alone, and walks through what would be required to construct supporting evidence

**For qual claims:**
- If source is identified (e.g. HeyMarvin study ID): pull the study artifact, sample size, methodology, conditions
- If source is unidentified: use program config to search past research repositories (Drive folders, NotebookLM, HeyMarvin library)
- Verify: study ID, sample size, conditions, method, recency, customer segments in scope

**For hybrid claims (e.g. "85% of customers prefer X" from a survey):**
- Route to both quant and qual checks
- Verify quant (sample size, methodology, statistical confidence) AND qual (question wording, response options, segment composition)

### Step 4.5 — Navigation Layer (for any user)

The skill answers a question most designers and PMs can't answer on their own: **for a claim about [topic], where does the canonical truth-source live, who owns the relevant artifacts, and what known fragmentation issues exist?**

This navigation output is included in every audit, regardless of mode. It is one of the skill's most durable contributions — over time, it builds the user's literacy of the CG data ecosystem and reduces the per-claim research burden.

**Navigation output (always included):**

| Question | Answer |
|----------|--------|
| Canonical truth-source for this claim type | [ECC / cgds:metric-lookup / specific research study / "no canonical exists"] |
| Adjacent canonical metrics | [list with brief descriptions] |
| Known dashboards reporting this metric | [list, with owner if known from program config] |
| Known analyst owners | [from program config, if applicable] |
| Known fragmentation issues for this metric | [from cgds skills or program config known_definition_pitfalls] |
| Other places this claim might be cited | [past CER decks, exec updates, etc. from program config] |

### Step 5 — Run the Drift Check

Compare claim as stated to what the canonical source (or closest adjacent canonical) actually supports. Identify drift along these dimensions:

**Magnitude drift:**
- Numbers rounded up, intervals widened, sample sizes implied larger than actual

**Specificity drift:**
- Conditions stripped from the claim (segment, surface, time period, device)
- Caveats dropped (concurrent experimentation, known confounds)

**Attribution drift:**
- Causation implied where correlation was measured
- Single-factor attribution where multiple factors contributed
- Different attribution model than the canonical definition

**Population drift:**
- Aggregate cited to justify segment-specific decision
- Segment-specific finding generalized to aggregate population
- Customer-type drift (one type's behavior applied to another)

**Freshness drift:**
- Stale numbers cited as current
- Outdated study findings cited without acknowledging period

**Definition drift:**
- Metric defined one way at canonical source, interpreted another way in claim
- Same metric name but different table/source than claimant assumes
- Non-canonical dashboard reporting a number that does not match ECC's canonical definition

**Canonical-anchor drift:** (specific to claims that cannot be anchored to a canonical metric)
- Claim is a construct (counterfactual, novel framing) presented as if measured
- Required underlying tests, holdouts, or models do not exist
- Claim is non-falsifiable as stated

**Dashboard drift:** (specific to claims anchored to Qlik, Tableau, or analyst-personal dashboards)
- **Filter drift** — dashboard viewed with one filter state; claim cites a number from a different state
- **View drift** — claim cites aggregate when dashboard surfaces segment, or vice versa
- **Snapshot drift** — claim cites a value that was true on day of viewing but dashboard has since updated
- **Annotation drift** — dashboard caveats in footnotes or sub-headers stripped when the number was quoted
- **Construction drift** — dashboard's calculated fields, segment definitions, or attribution rules differ from canonical; the dashboard's number is internally consistent but not ECC-aligned

### Step 6 — Produce the Output

**For auditing mode:**

```markdown
# Claim Audit: [short claim description]

**Date:** [date]
**Claim type:** [quant / qual / hybrid]
**Source consulted:** [source pointer + verified at]
**Program context:** [program name from config]

## Claim as stated

> "[verbatim claim or close paraphrase]"

## Canonical anchor check

| Canonical anchor | Status | Notes |
|------------------|--------|-------|
| Canonical metric identified | [yes / adjacent / no] | [which metric, or "construct does not map"] |
| Canonical definition pulled | [yes / no] | [source: ECC, cgds:metric-lookup, etc.] |
| Claim's cited source matches canonical | [yes / no / N/A] | [if no: where do they disagree?] |

## Navigation

| Question | Answer |
|----------|--------|
| Canonical truth-source for this claim type | [ECC / cgds skill / specific study / "no canonical exists"] |
| Adjacent canonical metrics | [list] |
| Known dashboards reporting this metric | [list, with owner if known] |
| Known analyst owners | [from config] |
| Known fragmentation issues | [from cgds skills or config] |
| Other places this claim might be cited | [from config] |

## What the canonical source actually supports

[Structured breakdown of what the canonical data or study actually shows. For quant: canonical metric value with proper qualification — date range, cohort, attribution, definition, sample. For qual: the actual finding with conditions, sample size, methodology, segments.]

## What the claim's cited source actually supports (if different from canonical)

[If the claim cited a non-canonical dashboard or query, what that source actually shows — and how it differs from canonical. This section is often the most useful — it's where dashboard drift, construction drift, and definition drift get surfaced.]

## Drift assessment

| Drift type | Detected | Severity | Notes |
|------------|----------|----------|-------|
| Magnitude | [yes/no] | [minor / material / severe] | [details] |
| Specificity | [yes/no] | [minor / material / severe] | [details] |
| Attribution | [yes/no] | [minor / material / severe] | [details] |
| Population | [yes/no] | [minor / material / severe] | [details] |
| Freshness | [yes/no] | [minor / material / severe] | [details] |
| Definition | [yes/no] | [minor / material / severe] | [details] |
| Canonical-anchor | [yes/no] | [minor / material / severe] | [for constructs / counterfactuals] |
| Dashboard (filter / view / snapshot / annotation / construction) | [yes/no] | [minor / material / severe] | [if claim anchored to a dashboard] |

**Overall:** [Correct within tolerance / Directionally correct but overstated / Directionally correct with material qualifications missing / Materially wrong / Unsupported by source / Construct not verifiable by data alone]

## Corrected claim (suggested)

> "[Reworded claim with proper qualifications, source citation, and confidence level appropriate to the underlying evidence]"

## Confidence ladder

Where this claim sits after audit:
- [ ] **1 — Stakeholder hypothesis** (no evidence)
- [ ] **2 — Secondary signal** (indirect or anecdotal evidence)
- [ ] **3 — Triangulated qual or quant** (specific evidence, limited generalizability)
- [ ] **4 — Validated qual + quant** (both methods, transferable conditions)

## Suggested use

[Plain-language guidance: can the user incorporate this claim into their work? Under what qualifications? Should they flag the drift to the researcher / DS partner / claimant? Or just maintain a more accurate version for their own use?]
```

**For authoring mode:**

Same template, but the user is iterating *toward* a defensible claim rather than auditing an existing one. Output is the confidence-labeled claim plus the source citation embedded.

**For gap surfacing mode:**

```markdown
# Evidence Gaps: [design decision being supported]

**Design decision:** [what the user is trying to support]
**Customer claims this would require:** [list]
**Quant claims this would require:** [list]

## Existing evidence

[What's already available in the program's data and research repositories]

## Gaps

[Specific claims that lack supporting evidence — prioritized]

## Suggested next moves

[For each gap: pull existing signal (which source), run cheap study (suggested method), or flag as unsupported and proceed with explicit hypothesis status]
```

### Step 6 — Save the Output

Save as `claim-audit-report.md` in the same directory as the work being supported (e.g. the deck folder, the design rationale doc, the project workspace). Include the date and a short title in the filename if multiple audits will live in the same directory: `claim-audit-2026-05-12-seo-attribution.md`.

## Special Cases

### Documented research being overridden by undocumented assertion

A specific high-stakes pattern. A senior stakeholder makes a directional qual claim — about customer priority, preference, hierarchy, or need — that contradicts what documented research actually concluded. The claim is plausible-sounding. It gets repeated. Over time, repetition substitutes for evidence and the claim becomes organizational orthodoxy. Strategic decisions get made against it. The documented research, which had the right answer, sits unused in a Drive folder.

This is functionally a contradiction between **stakeholder-level 1 confidence** (hypothesis) and **canonical-level 4 confidence** (validated qual + quant). The audit's job is to surface that confidence gap as a structural fact, not to argue with the claimant.

**Detection:**
- During the Canonical Anchor Check, the skill flags when the canonical source *exists* and the claim *contradicts it* — distinct from "no canonical anchor" (SEO 25% case)
- Hierarchy drift, methodology drift, and aggregation drift are common drift types in this case

**Output emphasis for this case:**
- The audit's strongest finding is the direct contradiction between the claim and documented research
- The corrected claim is the documented research finding, with full citation
- The "Suggested use" section emphasizes the political deployability:
  - Build a durable record (date, context, who heard it) every time the claim is repeated
  - Generate a researcher feedback note so the canonical-research owner knows their work is being overridden
  - Anchor your own design rationale to the canonical research with explicit citation — don't argue against the claim, cite the documented finding
  - Share the audit with the designated researcher partner; they have standing to defend their own methodology
  - For high-stakes cases, share with design leadership (Laura or equivalent in program config) as an evidence-integrity concern, not as critique of the claimant

**Why this matters structurally:**
This is the failure mode where research investment is wasted at scale. CG funds research. Researchers do good work. Findings get documented. Then verbal assertion overrides those findings in practice, and the research budget effectively produced nothing. The skill, used routinely, creates organizational friction against this dynamic. It doesn't fix it. But it makes every override visible and citeable, which is the precondition for fixing it.

### Contradicting findings between research groups (e.g. product research vs. marketing research)

A related pattern that often explains *how* the previous case arises. CG typically has multiple research functions — product/design research, marketing research, sometimes a separate brand or insights team. Each group runs its own studies, often using different methodologies, sampling different populations, asking different questions. The findings frequently contradict each other.

A stakeholder hearing a finding from one group (often the one most accessible to leadership) may sincerely repeat it as "what customers want" without realizing the other group's research found something different. The compressed-claim problem then compounds: not only is a stakeholder repeating an undocumented version of a finding, the finding itself is contested between research groups.

**Detection:**
- During the Canonical Anchor Check, the skill searches **all** documented research repositories in the program config, not just the one most accessible
- When the skill finds contradicting findings on the same question, that contradiction becomes a first-class part of the audit output — neither finding gets privileged over the other on the basis of which was heard louder
- The skill explicitly identifies which research group produced each finding, and the methodology / sample / question / segment that distinguishes them

**Output emphasis for this case:**
- A new section in the audit output: **Contradicting canonical findings**
- For each contradicting finding: source, methodology, sample, segment scope, question asked, conclusion
- Analysis of why the findings differ — different segments? different question framings? different methods? Each contradiction has structural reasons that are themselves the finding
- The "Suggested use" section recommends:
  - Do not adopt either finding as singular truth; both are partial views
  - Surface the contradiction explicitly in any design rationale that touches the question
  - Where the contradicting findings reflect a real methodological gap (e.g. marketing research asks "would you value speed?" — a leading question; product research asks "what is most important to you?" — open-ended), the audit names the methodological asymmetry
  - Where possible, propose a joint research action — a single study that resolves the contradiction — and route to both research groups
- This is also a case where partner workflows matter — the audit can generate notes to **both** research groups so they each know their finding is being contradicted by the other

**Why this matters structurally:**
Contradicting research findings between groups are a chronic feature of CG, not a bug to be fixed by individual designers. The skill's job is not to adjudicate which group is right. The skill's job is to make the contradiction *visible* every time a claim is made — so that strategic decisions are made with explicit awareness of the disagreement, rather than by default-favoring whichever finding was heard first or loudest.

Over time, routine surfacing of these contradictions creates pressure for the two research groups to coordinate methodologies, or at minimum to publish their findings with enough methodological detail that downstream users can interpret which finding applies to which decision context. That's a meaningful structural contribution.

### Program config implications

Both special cases above depend on the program config capturing **all** research sources, not just the ones most accessible to the designer. The setup flow's qual section should explicitly prompt:

- "Are there multiple research groups producing findings for this program? (e.g. product research, marketing research, brand insights, etc.) — list each separately"
- "Where do each group's findings live? (separate repositories, different platforms, different cadences)"

Without this, the skill defaults to whichever research source is most accessible, and the contradicting-findings case is invisible.

### AI-assisted research output as a source

A growing share of research findings at CG come from AI-assisted workflows — synthesis tools, theming tools, interview-analysis tools, cross-study summarization. Some of these are first-party tools shipped through the cgpm-open-market pipeline (e.g. research-running tools being built in the 3X PM/XD hackathon). Others are ad-hoc uses of Claude or other AI by individual researchers and designers.

AI-assisted research output is not categorically more or less trustworthy than human-produced research, but it has a distinct set of confidence considerations that the audit should treat as first-class:

**Distinct trust dimensions for AI-assisted findings:**
- **Source-anchoring** — did the AI tool anchor its synthesis to canonical study artifacts, or to whatever it had easiest access to? Claims sourced from AI synthesis without explicit canonical anchoring should be flagged as having weaker provenance than the underlying studies they summarize.
- **Confidence calibration** — AI outputs tend to read with uniform confidence regardless of underlying evidence strength. A 4-confidence claim and a 1-confidence claim, both produced by AI, can sound equally authoritative. The audit should re-anchor confidence to the underlying evidence, not to the rhetorical confidence of the AI output.
- **Aggregation transparency** — did the AI surface contradictions in the underlying research (e.g. between product and marketing research groups), or did it flatten them into a single confident-sounding finding? The latter is a serious failure mode and should be flagged as aggregation drift.
- **Methodological erasure** — AI synthesis often strips methodological caveats (sample size, conditions, segments) from individual studies when aggregating. The audit should require those caveats to be reconstructed before treating AI-synthesized claims as canonical.

**Upstream integration:**
The skill is designed to route to upstream AI research tools as canonical sources when they're available and when their outputs are themselves anchored to canonical studies. Specifically:
- If a research-running tool ships in the cgpm pipeline (e.g. the 3X hackathon tool by Ngoc Tran and Melrose Huang), `/claim-audit` should treat its outputs as legitimate qual sources *provided they cite underlying study artifacts*. Outputs without underlying study citations are treated as synthesis hypotheses, not canonical findings.
- Where possible, `/claim-audit` and upstream research tools should share a common confidence framework (the 4-level ladder used throughout this skill) and a common config schema for research groups, so that confidence labels travel cleanly between tools.

**Coordination note:**
Skills that audit research output and skills that produce research output address adjacent parts of the same evidence-integrity problem. They should be designed to interoperate from the start, not to overlap or compete. If you are building or maintaining a research-running tool, contact the maintainer of this skill (and vice versa) to align on shared infrastructure before either tool ships widely.

## Output Format Details

See [references/output-templates.md](references/output-templates.md) for full templates for each mode.

## Scale-Adaptive Behavior

- **Single claim audit:** Inline output. No need for a saved file unless the user wants a defensible artifact.
- **Deck or document scan:** Produce a multi-claim audit report with a findings index. Group by severity (claims that materially affect a decision vs. claims that are background context).
- **Pre-readout review:** Run against the full deck. Flag any claim without a source citation or with a detected drift. Produce a "claims requiring correction" list before the readout.

## Common Pitfalls

- **Routing to the wrong data source.** The biggest risk. If the skill pulls from MAM when the claim's grain is MAAM, the output number will be confidently wrong. The skill should always show its work — which tables, date range, attribution model — and require human sign-off before any audit output is treated as final.
- **Treating the skill's output as the rebuttal.** The output is *your verification* of the evidence, not a public document. How you use it (cite it, share it, hold it in reserve) is a separate judgment call. The political framing of "evidence integrity for my own work" only holds if you actually use it that way.
- **Auditing claims that don't need auditing.** Not every claim in a deck is decision-affecting. Focus the audit on claims that are being used to justify resource allocation, design direction, or stakeholder commitments. Background context claims rarely warrant the effort.
- **Mistaking absence of source for absence of validity.** A claim without a cited source isn't automatically wrong — sometimes the source exists but wasn't cited. The skill should ask before declaring "unsupported."
- **Confidence inflation by skill output.** Once the skill produces a structured comparison, there's a temptation to treat the corrected claim as authoritative. The corrected claim is still subject to all the same source-quality questions as the original. State your confidence honestly.
- **Skipping the political framing.** Especially when auditing claims by senior stakeholders. The skill's value depends on being usable without burning relationships. If the output reads as "the VP is wrong," the skill becomes a weapon and gets banned. Frame as "before I incorporate this into my own work, here's what the source actually supports."

## Design System Evolution

The skill is intentionally program-agnostic. It does not ship with curated configs for specific CG programs and makes no assumptions about which programs are canonical. Each user builds their own config through setup, based on their actual context.

Over time, as more designers across CG adopt the skill, users on the same program can share their configs informally — comparing data sources, attribution norms, known pitfalls, and rigor requirements. This makes the evidence infrastructure of each program more explicit and easier for new designers to onboard into. That's a structural contribution to how customer claims propagate across CG, but it emerges from use rather than being baked in.

## Working With Partners

### Researchers
- Setup captures the designated researcher(s) for the program
- When the skill detects a qual claim citing a study, it can generate a "researcher feedback note" — short message to the researcher flagging how their study is being cited and whether the citation is faithful to the original finding
- When the skill surfaces an evidence gap, it can generate a "researcher conversation prep" artifact — one-pager teeing up a conversation about whether to study the question, with design context and existing signal pre-loaded
- This makes the skill amplifying rather than replacing for researchers — they get visibility into how findings are used downstream and pre-scoped intake for new studies

### DS partners
- Setup captures the designated DS partner(s) for the program
- For quant claims that the audit flags as definition-drift or attribution-drift, the skill can optionally generate a "DS clarification request" — a structured ask that surfaces the ambiguity without challenging the original analysis

### Leadership claims
- The skill does not attempt to "rebut" leadership claims as a feature
- Outputs are always framed as the user's own evidence-integrity check
- If the audit reveals material drift in a high-profile leadership claim, the skill suggests holding the audit output for use if the claim is invoked against a decision the user wants to challenge — not for proactive correction

## Roadmap

**v1 (implemented):**
- Setup flow + program config schema
- MCP detection and graceful degradation
- Quant audit (Databricks, Amplitude — when available; Tableau, Splunk as MCPs are added)
- Qual audit (HeyMarvin, NotebookLM, Drive research repositories)
- Hybrid claim audit (survey, NPS/PRS, GTKM data)
- All three modes (auditing, authoring, gap surfacing)
- Researcher and DS feedback note generation
- Deck-scan mode (multi-claim audit against a single document)

**v2 (planned):**
- Auto-detection of claims in a Slack thread or Google Doc (scan + audit pipeline)
- Confidence ladder learning — skill learns the user's typical confidence calibration over time and flags claims that diverge
- Cross-program claim transfer (paired with `@transferability-check`)
- "Claim drift alert" — proactive flag when a claim cited in one of the user's docs is being compressed in a downstream doc
