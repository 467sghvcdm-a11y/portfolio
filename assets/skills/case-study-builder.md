---
name: case-study-builder
status: alpha
lifecycle: ship-learn
description: >
  Reconstructs what actually happened on a project and produces a
  first-person narrative draft grounded in real sources — Slack threads,
  end-of-season docs, Drive artifacts, and linked data. Output is suitable
  for portfolio work, performance reviews, and award nominations. The skill
  pulls from available connected sources first; it does not rely on memory
  or require the user to narrate the whole project from scratch.
  Typical trigger phrases: 'build a case study for', 'write up my work on',
  'help me document what I did on', 'draft a portfolio entry for', 'write
  my performance narrative for'.
  Do NOT use for: real-time project status (use @stakeholder-update),
  post-sprint retrospectives (use @retrospective), or launch communications
  (use @launch-post).
knowledge:
  - config/user-profile.yaml
  - config/settings.yaml
next_steps:
  - "@writing-clearly — tighten prose and remove filler before sharing"
  - "@exec-communicator — adapt the narrative for a senior leadership audience"
  - "@stakeholder-update — extract the key metrics into a current status format"
  - "@add-knowledge — log durable insights from this project to the knowledge base"
---

# Case Study Builder

Reconstruct what happened on a project from primary sources and produce a first-person narrative draft ready for portfolio, performance review, or award nomination. The skill does the archaeology; you validate and refine.

## When to Use

- Building a portfolio entry for a completed project
- Writing your performance review narrative for a specific piece of work
- Drafting supporting material for an award nomination
- Preparing a case study for an interview or design review
- Capturing a project story before it fades from memory or Slack is purged

## When NOT to Use

- Real-time project status — use `@stakeholder-update`
- Post-sprint retrospective focused on process improvement — use `@retrospective`
- Launch announcement or press-ready communication — use `@launch-post`
- Broad career narrative across many projects — run this skill once per project, then synthesize

## Process

### Step 1 — Define the project and output mode

Ask the user:

| Question | Why it matters |
|----------|---------------|
| What's the project name or shorthand? | Seeds all source searches |
| What's this for? (Portfolio / Perf review / Award nom / Other) | Determines narrative frame, tone, and emphasis |
| Roughly when did it run? (Season, quarter, or date range) | Scopes Slack and doc searches |
| Who else was core to the work? | Adds names to Slack search, avoids over-attributing to the user |
| Is there a specific outcome or metric you want to anchor on? | Optional, but surfaces what the user already considers the headline |

If the user provides Drive links, Slack channel names, or a doc list upfront, accept those as the source list and skip Step 2 for any source already provided.

### Step 2 — Source archaeology (run before drafting anything)

Pull from every connected source. Do not rely on what the user remembers.

#### Slack (if connected)
Run two distinct passes. The first pass finds the user's own voice; the second finds how others saw the work. Both are required — ship-its and kudos threads alone produce a thin, generic draft.

**Pass 1 — Mine the user's own messages (do this first)**
Search `from:<@user_id> [project keywords]` for messages the user sent. Look for:
- Threads where the user explained their design rationale, framing, or intent
- Moments where the user pushed back, challenged a direction, or reframed a problem
- Messages where the user asked for alignment before designing — signals of real ownership
- DMs where the user processed the work candidly (often more revealing than public threads)
- The user's own descriptions of what was hard, what surprised them, or what they'd do differently
- Frameworks, taxonomies, principles, or decision criteria the user authored

These messages are the primary evidence for the "Approach" and "What Made It Hard" sections. They show how the user actually thought, not just what shipped. Quote them directly where possible — they are more credible than paraphrasing.

**Pass 2 — Find how others saw the work**
Search the project name and key people in `#` channels and DMs:
- Launch or milestone announcements referencing the project
- Threads where the user explained, defended, or advanced the work in public channels
- Decision points — moments where direction changed or a call was made
- Reactions and replies signaling traction (high-react threads, threads with leadership responding)
- Shoutouts, kudos, or end-of-season recognition mentioning the work or the user
- Messages where cross-functional partners (DS, Eng, Research, PM) acknowledged the design contribution explicitly
- Award announcements, State of the Company callouts, or executive attribution

For each relevant thread found, extract:
- Date
- What was shared or decided
- Who else was in the room (or thread)
- Outcome or response

#### Google Drive (if connected)
Search for documents related to the project:
- Strategy docs, PRDs, design briefs, research readouts
- End-of-season summaries or EOS decks
- Experiment write-ups or A/B results tied to the project
- Award nominations already submitted for adjacent work
- Metrics dashboards or data pulls linked from Slack

For each doc found, extract the sections most relevant to: what was the problem, what was the approach, what was the outcome.

#### Memory and CLAUDE.md
Check memory files and CLAUDE.md for any stored context on this project before asking the user. Surface what's already known — do not ask the user to repeat it.

#### Amplitude / metrics (if relevant and connected)
If the project has a measurable outcome (conversion, engagement, revenue, NPS), pull or reference the relevant chart. Note the metric name, baseline, and outcome.

**Surface the source inventory before drafting.** Tell the user what was found and where gaps exist:

```markdown
### Source Inventory

| Source | What was found | Confidence |
|--------|---------------|-----------|
| Slack: #t2a-strategy | 12 threads, Jan–Mar 2026 | High |
| Drive: EOS deck (TY25) | 3 slides covering this initiative | Medium |
| Memory: project_fy27_preauth_t2a.md | Design principles, KPIs | High |
| Amplitude | No direct chart found — metric TBD | Low |

**Gaps:** [What's missing and how to fill it — link, channel name, or a question to the user]
```

Do not proceed to drafting until the user confirms the source inventory or adds missing sources.

### Step 3 — Extract the story structure

From the sources gathered, extract answers to these questions. Synthesize from evidence; do not invent:

**Problem**
- What was the situation or pain going into this project?
- Why did it matter? What was at stake?
- Was there a specific trigger (data, customer research, strategic shift)?

**Role & Contribution**
- What specifically did *this person* contribute? (vs. team, vs. the broader initiative)
- What decisions were theirs to make?
- Where did they have to push, persuade, or create something from scratch?

**Approach**
- How did they frame or frame-shift the problem?
- What methods or tools did they use?
- What was the key design or strategic move?
- What was tried and changed?

**Outcome**
- What shipped, changed, or moved?
- What are the measurable results? (quantitative where possible)
- What happened downstream — decisions unlocked, work influenced, strategy shifted?
- How did others respond (stakeholders, partners, customers)?

**What made it hard**
- What constraints, ambiguity, or blockers existed?
- What would have gone wrong without this person's involvement?

Fill a structured extraction table before writing narrative prose:

```markdown
### Story Extraction

**Problem:** [1-2 sentences from sources]
**Why it mattered:** [business or customer stakes, from sources]
**My role:** [specific, first-person contribution]
**Approach:** [key move or method, grounded in evidence]
**Outcome:** [measurable result or observable change]
**What made it hard:** [constraint or complexity worth naming]
**Best quote or moment from sources:** [direct quote from Slack, doc, or recognition]
```

Show this extraction to the user for validation before writing the narrative. Ask:
- Is this accurate to what happened?
- What's missing or understated?
- What should be cut (belongs to team, not to you)?

### Step 4 — Draft the narrative

Write in first person. Ground every claim in what was found in Step 2. Do not editorialize beyond what the sources support.

Adjust tone and emphasis based on the output mode selected in Step 1:

| Mode | Narrative frame | Emphasis | Length |
|------|----------------|----------|--------|
| **Portfolio** | Craft + impact | Design decisions, process, visual thinking | 400–600 words + artifacts list |
| **Perf review** | Contribution + scope | Specific actions, influence, measurable outcomes | 250–400 words, tight bullets for each dimension |

#### Portfolio format
```markdown
## [Project Name]

**[One-line tagline capturing the challenge and outcome]**

---

### The Problem

[2-3 sentences: the situation, why it mattered, what was unclear or broken]

### My Approach

[3-4 sentences: how I framed it, key design move, what I tried and changed. Specific and concrete.]

### What Shipped

[1-2 sentences: the tangible output — feature, system, framework, recommendation]

### Outcome

[2-3 sentences: measurable result, stakeholder impact, downstream effect. Lead with numbers where possible.]

### What I Learned

[1-2 sentences: honest reflection on what was hard, what shifted my thinking]

---

**Artifacts:** [List of links to Figma, Drive, or other outputs if available]
**Skills demonstrated:** [List 3-5: e.g., Systems thinking, Cross-functional influence, Research synthesis]
**Team:** [Other core contributors — give credit explicitly]
```

#### Performance review format
```markdown
## [Project Name] — [Perf Period]

**What I did:** [1 sentence, first person, active verb]

**Scope and influence:** [Who and what was affected beyond my immediate team]

**Key contributions:**
- [Specific action with observable outcome]
- [Specific action with observable outcome]
- [Specific action with observable outcome]

**Outcome:** [Metric or observable result, with baseline where possible]

**Behaviors demonstrated:** [Map to the relevant competency framework if known]
```


### Step 5 — Validate and refine

After producing the draft, ask the user:
1. Does this accurately represent what happened?
2. Are there any claims that feel unsupported or overstated?
3. Is there a moment, decision, or insight that's missing?
4. Does the level of personal credit feel accurate — not too much, not too little?

Make edits based on feedback. Do not make silent changes to facts or metrics.

### Step 6 — Offer to persist

After the user approves:
- Offer to save the draft to `workspace/case-studies/[project-slug]-[mode].md`
- Offer to log any durable project insights to the knowledge base via `@add-knowledge`

## Scale-Adaptive Behavior

| Signal | Size | Behavior |
|--------|------|----------|
| Small, contained project; single quarter | **Light** | Streamlined extraction, one output mode, skip gaps inventory detail |
| Multi-quarter initiative with measurable outcomes | **Standard** | Full source archaeology, structured extraction table, one primary + one alternate format |
| Major multi-season initiative, exec-visible work | **Deep** | Full process, explicit quote mining from Slack/docs, two drafts (raw + refined), offer to connect to `@exec-communicator` for senior framing |

## Settings Awareness

Read `config/settings.yaml` before producing output:
- `output.verbosity` — `concise`: extraction table + one lean draft; `detailed`: full source inventory, extraction table, narrative draft with revision notes
- `output.show_next_steps` — include or skip follow-up skill suggestions

Read `config/user-profile.yaml` for:
- Name and role (used in first-person voice calibration)
- Current programs and workstreams (seeds source searches)

## Common Pitfalls

- **Drafting before sourcing.** Never write narrative prose until the source inventory is complete and the story extraction is validated. Narrative built on memory alone tends to be generic and misses the specific moments that make a case study compelling.
- **Over-attributing.** Design work is almost always collaborative. Be precise about what was the user's contribution vs. the team's. Giving shared work to one person erodes the credibility of the whole document.
- **Under-attributing.** The inverse: cases where the user carried something and the draft obscures it by hedging. The extraction step surfaces the specific moments — use them.
- **Inventing outcomes.** If a metric isn't in the sources, say "outcome data not available" or ask the user. Do not fill in plausible numbers.
- **Including circumstantial context that isn't part of the design story.** Reorgs, team changes, and org-level events are not design contributions — they are circumstances. If the work ended for structural reasons rather than design reasons, that belongs in a conversation, not a portfolio entry. Cut it.
- **Burying the hard part.** Portfolio entries land harder when they name the constraint, the ambiguity, or the moment of genuine difficulty. That's what distinguishes the entry from a list of shipped features.
- **Generic language.** "Led cross-functional collaboration" and "drove alignment" mean nothing. Specific: "Ran six alignment sessions with DS and Eng to establish a common framing before writing a line of spec." Source the specifics from Slack and docs.
- **Including candid in-progress quotes that don't belong in finished work.** Slack is full of honest, unguarded moments — expressions of confusion, frustration, or uncertainty that were appropriate in context but undermine a portfolio entry. Quote from sources that show reasoning and decision-making, not raw processing. If a quote reveals how the user thinks through complexity, use it. If it just reveals that something was hard in the moment, cut it.

## Related Skills

- `@retrospective` — if the project needs a process lens rather than a narrative lens
- `@writing-clearly` — tighten any draft this skill produces
- `@exec-communicator` — adapt the narrative for a formal leadership or exec audience
- `@experiment-writeup` — if the project is primarily an A/B test or experiment
- `@launch-post` — if the output is a public or internal announcement rather than a personal narrative
