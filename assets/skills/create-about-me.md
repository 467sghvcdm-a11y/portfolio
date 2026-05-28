---
name: create-about-me
status: alpha
lifecycle: develop
description: >
  Generates a structured about-me file capturing how a person thinks,
  produces work, operates with other functions, and what they are uniquely
  good at. The interpretive layer of who someone is as a collaborator,
  not a clone of their Insight or Slack profile. Works for any role:
  designer, PM, engineer, researcher, manager, analyst, leader. Designed
  to be created once and refined over time as Claude builds context with
  the user across sessions. Output splits into three tiers (public,
  trusted, private) with user control over what goes into each. Paired
  with /offboard-program and /onboard-program for knowledge transfer
  across program transitions and reorgs.
  Typical trigger phrases include 'create my about-me', 'build an about-me
  file for me', 'help me document how I work', 'set up my profile for
  onboarding'. Do NOT use for: replacing Insight or HR profiles (those
  capture role/title/team and should be linked, not duplicated),
  performance review documentation (use calibration tools), or one-off
  collaboration briefs (those are program-specific, not personal).
knowledge:
  - config/user-profile.yaml
  - config/settings.yaml
next_steps:
  - "@offboard-program — once an about-me file exists, use this when transitioning out of a program to package program knowledge alongside a relevant slice of your about-me for the next person"
  - "@onboard-program — when joining a new program, this skill pulls about-me files for the people you'll work with, including yours so they can be referenced"
---

# Create About-Me

Generate a structured about-me file that captures how a person thinks, produces work, and collaborates. Output is split into three tiers (public, trusted, private) with the user controlling what goes into each.

> **Attribution:** Original skill. Part of the about-me knowledge transfer system. Designed to make program transitions and reorgs less lossy by capturing the interpretive layer of who someone is as a collaborator. This is the layer that doesn't fit in any existing profile system.

## When to Use

- Creating an about-me file for the first time
- Refreshing an existing about-me after a meaningful change in role, scope, or operating context
- Onboarding a new collaborator who would benefit from understanding how the user works
- Preparing for a program transition (offboarding) where the about-me feeds into the handoff package
- When the user explicitly asks to document how they work

## When NOT to Use

- Replacing or duplicating Insight, Workday, LinkedIn, or Slack profile content (those are the source for role/title/team; this skill links to them, doesn't replace them)
- Performance review or calibration documentation (use dedicated tools for that)
- One-off collaboration briefs that are program-specific rather than person-specific
- Generating profiles for people who haven't asked for one (this is self-authored only)

## Philosophy: The Interpretive Layer

Existing profile systems answer "who is this person and what do they do." This skill answers "how does this person think and how do I work with them effectively."

The value comes from observations only visible after working with someone over time: how they reason through ambiguity, where they have leverage and friction with other functions, what they're uniquely good at, blind spots they've come to recognize, working preferences that aren't formalized anywhere.

Claude is uniquely positioned to capture this because it builds context with a person across many sessions. The skill draws from that accumulated context, plus the user's own articulation, plus data sources where appropriate (Slack collaboration history, memory files, calibration docs). It does not invent. When context is insufficient, it asks.

The about-me file is a personal artifact. The user owns it, controls what tier each piece of content sits in, and decides what travels and where.

## Settings Awareness

Read `config/settings.yaml` before producing output:
- `output.verbosity` — concise: minimal viable file, public tier only; standard: all three tiers, recommended defaults; detailed: all three tiers with extensive prompts for elaboration
- `output.location` — where to save the generated files (default: `workspace/about-me/`)

Read `config/user-profile.yaml` for:
- User name, role, current focus areas (used to seed the file)
- Connected MCPs (used to determine which data sources can be drawn from)

## Process

### Step 1 — Establish what's already known

Before asking anything:

1. **Run `/consolidate-memory` first.** This tidies and sharpens whatever is already on disk before drafting begins. Stale or overlapping memory files produce a weaker draft. Consolidating first means the skill works from the cleanest possible baseline.

2. **Scan for existing context:**
- **Explicitly read CLAUDE.md** from the current working directory and from `~/.claude/CLAUDE.md` if it exists. Do not assume this file has been loaded — read it directly before proceeding.
- Check for an existing about-me file at the expected location. If one exists, treat this as a refresh, not a fresh creation
- Check memory files for stored user context
- Check any project-level memory for stated working preferences
- Check past artifacts (calibration docs, retros, growth decks) in the workspace that may already articulate how the user works

**If Slack is connected, run targeted searches before drafting anything.** Do not treat Slack as a passive source — actively search for signals about this specific person. Run all of the following:
- Messages the user sent that got reactions, replies, or visible traction — signals of ideas that landed
- Threads where the user reframed a problem, shifted a discussion, or challenged a direction
- Messages where others tag the user for expertise, ask for their opinion, or bring them in to unblock something
- Shoutouts, callouts, retro recognition, launch posts, or end-of-season messages mentioning the user
- How others introduce or describe the user to new people or in cross-functional contexts
- The user's own messages in design reviews, planning threads, and strategy discussions — these reveal how they think and what they prioritize

This Slack mining should happen before drafting "how I think," "how I produce work," and "what I'm uniquely good at." The signal is there — the skill just has to look for it.

**If memory is not found:** Surface this explicitly before proceeding. Tell the user: "I don't have memory files for you yet — the output will be lighter without accumulated context. Consider enabling memory and building some context across sessions before running the full skill. I can still produce a draft from Slack and CLAUDE.md, but it won't reflect the depth that comes from working together over time."

Surface what was found before asking. The user should never be asked to repeat what Claude already knows.

3. **Optional: pull context from Claude.ai projects.**

Claude Code cannot access Claude.ai chat history. If the user works in Claude.ai projects, those conversations may contain valuable context — how they think, decisions made, working preferences, programs worked on — that isn't available here.

Ask the user: "Do you use Claude.ai projects? If so, I can generate a prompt you can paste into each one to bring that context into this session."

If yes:
- Ask which projects are relevant (there may be multiple)
- Generate this prompt for the user to paste into each project:

> "Summarize everything you know about me from our conversations in this project. Include: how I think and approach problems, how I produce work, my working preferences, what programs or projects I've been working on, key decisions I've made or been part of, relationships and collaborators I've mentioned, and anything about how I like to operate that would help a new collaborator work with me effectively. Be specific — use examples from our actual conversations, not generalizations."

- Wait for the user to paste the response(s) back, one per project
- Ingest all responses as source context before drafting

If no: skip entirely. Do not pressure the user to use Claude.ai if they don't.

This step is optional. Some users will have rich Claude.ai project history; others won't use it at all. The skill works without it.

### Step 2 — Confirm scope of the file

Ask the user:
1. Is this a first-time creation or a refresh?
2. What's the most important reason for creating this now? (Onboarding a new collaborator, preparing for a program transition, general durability, other)
3. Should the file include the three-tier structure (public, trusted, private), or just one tier for now?

Respect the answer. Don't push to include more than the user wants.

**If this is a refresh:** Do not re-walk every section. Instead, diff the existing file against what's currently known from memory, Slack, Drive, and any Claude.ai project responses. Surface only what has changed or drifted — new programs, new collaborators, new frameworks, sections that are now stale or inaccurate. Present the delta to the user: "Here's what I think has changed since your last update. Does this look right?" Ask only about the gaps and changes, not everything already confirmed.

After the user confirms the delta, show the full updated public tier as it will appear post-edit — the same final gate that applies to new creation (see Step 3). Do not save any changes to the public file until the user explicitly approves the assembled result. Update `last_updated` in frontmatter on save.

### Step 3 — Draft the public tier first

The public tier is the lowest-risk layer and the most useful for collaborator decision-making. Drafting it first builds momentum and gives the user something concrete to react to.

**Honor the tier scope set in Step 2.** If the user said "public only," do not draft or show trusted or private tier content at all — not even as suggestions. If they said "all three tiers," proceed through all. If they said "just trusted for now," skip public and private. The user's answer in Step 2 is a hard constraint, not a preference to be nudged around.

Public tier sections (recommended defaults, user can override per section):
- Role, level, team, manager, current programs, past programs, focus areas (pull from existing sources; ask only for gaps)
- **How I think**, **How I produce work**, and **What I'm uniquely good at** — these three sections follow the same evidence-first pattern:

  **Source mining (run before drafting any of these three sections):**
  Before drafting, mine all available sources for evidence:
  1. **CLAUDE.md and memory files:** Extract stated preferences, working patterns, and any self-descriptions the user has already written.
  2. **Slack signals (if connected):** Search for: messages where the user is tagged for expertise or brought in to unblock something; threads where the user reframes a problem or shifts the direction of a discussion; compliments, callouts, retro shoutouts, and launch recognition; how others introduce or describe the user to new people. These are the clearest external signal of how the user actually thinks and what they're actually good at.
  3. **Feedback artifacts (if available):** Search Drive and the workspace for calibration docs, growth decks, peer feedback, performance narratives, and retros. Feedback written by others is often the most accurate articulation of someone's strengths — more reliable than self-report.

  **Drafting from evidence:**
  Use what was found to generate draft content for each section. Where evidence is direct (e.g. a calibration doc says "X is uniquely good at making complex tradeoffs legible to non-technical stakeholders"), use it verbatim or lightly paraphrased. Where evidence is inferential (e.g. Slack patterns suggest the user tends to reframe problems structurally), surface it as an observation for the user to confirm.

  **Confirmation — only ask about what can't be assumed:**
  When evidence is strong and direct (verbatim from a calibration doc, a clear Slack pattern with multiple instances, language the user wrote themselves), write it into the draft without asking. Do not confirm what is already obvious from sources — that creates friction for no reason.

  Only ask when:
  - Evidence is inferential or thin (one Slack message, an indirect signal)
  - Two sources conflict
  - The section has genuine gaps that can't be filled from available context

  When asking is necessary, use multiple choice generated from actual evidence — not open-ended questions. Open-ended questions produce vague, socially acceptable answers. Specific options drawn from real sources produce accurate ones. The user selects what fits, rejects what doesn't, adds anything missing.

  Example format when confirmation is needed:
  > I found a few patterns I'm less certain about — want to confirm these before I include them:
  > - A. [specific inferential observation from one source]
  > - B. [specific inferential observation from another source]
  > - C. None of these / tell me what's missing

  Aim for 4–6 options maximum. Always include a write-in option. If context is rich, skip this step entirely and go straight to showing the draft.

  **Fill in the blanks:**
  After drafting, surface only what genuinely couldn't be sourced. Ask those gaps as multiple choice where possible, open-ended only as a last resort.

- Working preferences (pull from CLAUDE.md, memory, observed patterns; confirm via multiple choice where options can be generated)
- Historical context (pull from LinkedIn-style summary if user provides one; otherwise ask)
- Vocabulary specific to the user's org (pull from existing CLAUDE.md or memory)
- Collaborators (pull from Slack collaboration history if available, with cross-reference placeholders)

For each drafted section, show the user the draft and ask:
- Is this accurate?
- What's missing?
- Should this stay public, move to trusted, or move to private?

Default tier is public for these sections, but the user can override per section.

**Before moving to Step 4, show the complete assembled public tier draft and require explicit approval.** This is a final gate — the user has confirmed each section individually, but the assembled file reads differently than the parts. Ask:

> "Here's the full public tier as it will appear. This is what you'd share with a collaborator or load into a shared registry. Read it as a whole — does anything land differently together than it did section by section? Anything you want to pull back, adjust, or move to a different tier before we lock it?"

Do not proceed to the trusted tier or save any files until the user explicitly approves the assembled public draft. This gate applies every time the public tier is created or updated — including refresh runs.

### Step 4 — Draft the trusted tier

Trusted tier is for content the user would share point-to-point with a direct collaborator but not put in a public registry.

Trusted tier sections (recommended defaults):
- How I operate with other functions (PM, DS, Research, Engineering, Leadership)
- What to tell a new collaborator about working with me
- Known patterns and blind spots
- What I'm not interested in

Same pattern: draft from context, show user, ask for accuracy/gaps/tier confirmation.

### Step 5 — Draft the private tier (optional)

Private tier is local-only content the user wants to load into their own Claude sessions but never share. Skip if the user opts out.

Private tier sections (suggestions, all optional):
- Political read on the org
- Exhaustion signals and energy management
- Uncited observations the user finds useful for their own thinking

Claude does not auto-populate this tier from observations. Instead, ask the user a few targeted prompting questions to help them populate it — most people won't fill in blank templates on their own, but will answer a direct question.

For each section the user opts to include, ask one of the following:

**Political read on the org:**
- "What's your current read on the org that you wouldn't say in a meeting?"
- "What do you think is going to change in the next 6 months that most people don't see coming yet?"
- "Where are the real decisions being made right now — and by whom?"

**Exhaustion signals and energy management:**
- "What kind of work drains you faster than anything else?"
- "What's a sign that you're running low — something you'd notice before others do?"
- "What do you do to recover? What helps you reset between intense stretches?"

**Uncited observations:**
- "What do you believe about how this org actually works that you've never put in a doc?"
- "What's something you've learned about working here that would take a new person two years to figure out on their own?"
- "What pattern have you noticed that you keep coming back to, even if you can't fully explain it yet?"

If the user skips a section, skip it. Don't pressure. These are prompts to unlock reflection, not required fields. After the user answers, write the response in the file in the user's own words — don't paraphrase or editorialize.

### Step 6 — Save the files with tier markers

Save as three separate files in the configured location:
- `<person-slug>.public.md` — public tier with frontmatter `tier: public`
- `<person-slug>.trusted.md` — trusted tier with frontmatter `tier: trusted`
- `<person-slug>.private.md` — private tier with frontmatter `tier: private`

Each file should have:
- Frontmatter with person identifier, tier, last_updated date
- `next_refresh_recommended` field in frontmatter — set to one of: next major program transition, next reorg, or start of next fiscal year (whichever is soonest). Surface this to the user at the end of the session so they know when to run the skill again.
- A header noting which tier the file represents and what that means for sharing
- The relevant sections, with section-level tier markers if a section's tier differs from the file's default

### Step 7 — Surface follow-up actions

After saving:
- Confirm where the files are saved
- Tell the user how to load them into Claude sessions (CLAUDE.md reference, memory pointer)
- Tell the user how to update them in the future (re-run the skill, edit directly, etc.)
- If the user has cross-references to other people who don't have about-me files yet, offer to push request notifications via the request flow
- **Set expectations about depth.** Tell the user: "This is a foundation, not a finished product. The first run produces a solid structure but the interpretive depth — how you think, what you're uniquely good at, blind spots you've developed — gets richer as Claude builds context with you across sessions. Run this again after a few months of working together and the output will be noticeably sharper. The file is designed to grow."

## Output Format Details

See [references/output-templates.md](references/output-templates.md) for the detailed templates for each tier.

## Trust and Control Defaults

The skill enforces these defaults:

- **Per-field control.** Every section, every field gets a tier recommendation but the user accepts or overrides per item. No bulk auto-classification.
- **Visible tiers.** Each file's tier is in the frontmatter and the header. Section-level tier markers are added when a section's tier differs from the file default.
- **Default deny on uncertainty.** If the user doesn't respond clearly when asked about a tier, the content stays private. Never auto-classify upward.
- **Explicit consent for upgrades.** Moving content from private to public requires a clear user action.
- **No invention.** If Claude doesn't have observation-based context for a field, ask the user. Don't fabricate.

## Common Pitfalls

- **Inventing content.** Claude should not generate observation-based sections (how I think, blind spots) without actual context or user input. If context is insufficient, ask. Filling in plausible-sounding content erodes trust.
- **Auto-classifying tier upward.** Default deny on uncertainty. When in doubt, the content is private.
- **Replacing profile systems.** This file is the interpretive layer above existing profiles, not a replacement. Pull role/title/team from authoritative sources; don't re-create them.
- **Over-asking.** If Claude already has the answer from memory, Slack, or accumulated context, don't ask. Surface what's known and ask only for gaps.
- **Treating it as one-and-done.** The file should be updated as observations accumulate. The skill supports refresh runs that diff against the existing file.

## Pairing with /offboard-program and /onboard-program

These three skills work together:

1. `/create-about-me` — generates the personal context file (run once, refresh periodically)
2. `/offboard-program` — when leaving a program, packages program-specific knowledge along with a relevant slice of the user's about-me for the next person
3. `/onboard-program` — when joining a program, pulls about-me files for collaborators in the new program, plus any handoff package from the previous owner

The about-me file is the human-context layer. The program handoff is the work-context layer. Together they make program transitions less lossy.

## Roadmap

**v1 (current):**
- Three-tier file generation
- Per-field tier control
- Draft-from-context with user confirmation
- Cross-reference placeholders for other about-me files

**v2 (planned):**
- Request flow: if a referenced person doesn't have an about-me, push a request to them via Slack
- Auto-refresh prompts: skill detects when a meaningful change has occurred (new role, new program, new collaborators) and asks the user if a refresh is needed
- Audit log of who pulled which tier of the file via onboarding skills
- Per-recipient tier overrides for trusted-tier sharing
- Integration with the central about-me registry for discoverability across the org

**v3 (planned): the recommendation surface**

The about-me file becomes a queryable input to the skill catalog, personalizing what each user sees:

- **Side-output during skill run.** After the about-me is saved, surface a "skills relevant to how you work" section. Recommendations matched against focus areas, working preferences, frameworks, and operating patterns in the user's file. Each recommendation includes a "why this matched" explanation.
- **Persistent catalog personalization.** Skill catalog UI reads the user's about-me and reorders / annotates results based on relevance. Same skills, different presentation per person. Role tags become one signal among many, not the determining one.
- **Card personalization.** Skill cards explain not just "what this skill does" but "what this skill does for you" — connecting capability to known patterns in the user's about-me. Informative and lightly persuasive without being pushy.
- **Serendipity mode.** Explicit "show me things outside my pattern" toggle so the recommender doesn't entrench narrowness. Recommendation engines that only show you more of what you already like produce narrow people. Catalog should help users see what they're missing, not just what fits.
- **Closed-loop refresh.** The catalog notices when a user installs and runs skills that aren't in their stated focus areas. Surfaces that as a signal the about-me may be out of date. Offers a refresh.

**Metadata approach.** Skill metadata for matching is extracted from each skill's SKILL.md at query time (or cached and invalidated on file change), not hand-coded. The SKILL.md already contains description, when-to-use, when-not-to-use, process, and output — enough natural language for a capable extractor to infer operating patterns, focus areas, and problem types. Zero metadata maintenance burden on skill authors; metadata stays in sync with skill content automatically.
