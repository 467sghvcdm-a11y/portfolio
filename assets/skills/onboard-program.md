---
name: onboard-program
status: alpha
lifecycle: develop
description: >
  Configures a Claude workspace when a person is joining a new program.
  Finds available handoff material from the previous owner, loads about-me
  files for key collaborators, maps canonical sources (Figma files, Drive
  docs, Slack channels, Amplitude dashboards) into the workspace, and
  produces a day-one orientation summary. Scale-adaptive: works with a rich
  handoff package, a sparse one, or none at all. Paired with
  /create-about-me and /offboard-program for full knowledge transfer across
  program transitions and reorgs.
  Typical trigger phrases include 'I just joined this program', 'help me
  ramp on this', 'onboard me', 'set up my workspace for this program',
  'I'm the new DRI for'. Do NOT use for: ramping on a codebase or
  technical system (that's a different problem), general research on an
  unfamiliar topic, or creating program documentation that should exist
  regardless of transition.
knowledge:
  - config/user-profile.yaml
  - config/settings.yaml
next_steps:
  - "@create-about-me — once onboarded, create or refresh your own about-me file so the people you're working with have access to how you operate"
  - "@offboard-program — when it's your turn to leave this program, use this skill to package what you've learned"
---

# Onboard Program

Configure your Claude workspace when joining a new program. Find available handoff material, load collaborator context, map canonical sources, and produce a day-one orientation.

> **Attribution:** Original skill. Part of the about-me knowledge transfer system. Designed to reduce the ramp time that comes with every program transition — by making the outgoing person's context findable and loadable, rather than relying on memory and ad hoc Slack messages.

## When to Use

- Joining a new program as DRI, design lead, PM, or any role with ongoing ownership
- Taking over a program from a previous owner (post-reorg, post-departure, post-leave)
- Starting a new assignment where an existing program has history worth understanding
- Returning to a program after a gap (the same sources apply)

## When NOT to Use

- Ramping on a codebase or technical system (different problem; use repo documentation and code exploration tools)
- General research on a topic the user is unfamiliar with (use web search and synthesis tools)
- Creating program documentation that should exist regardless of transition (fix the documentation problem directly)
- Short-term involvement in a program where the user is contributing but not owning

## Philosophy: Scale-Adaptive Ramp

The most useful onboarding skill works whether or not there's a rich handoff package waiting. Most transitions don't come with a complete package. The skill's job is to make the best use of what's available, be explicit about what's missing, and give the user a working workspace regardless of input richness.

Scale-adaptive means:
- **Rich handoff (offboard-program package exists):** Load all five sections, configure canonical sources, produce orientation summary from the package
- **Sparse handoff (some docs exist, no structured package):** Pull what's available from Drive/Slack/Figma, ask the user to fill gaps, produce a partial orientation with clear "unknown" markers
- **No handoff (starting fresh or inheriting a stale program):** Pull what's discoverable from program channels and docs, ask the user what they know, produce a foundation document with placeholders for the incoming person to fill

The skill is honest about what it doesn't know. Plausible-sounding content is worse than empty sections.

## Settings Awareness

Read `config/user-profile.yaml` before starting:
- Connected MCPs (determines which sources can be pulled automatically)
- Current programs (checks whether the user is already configured for this program)
- Workspace location (determines where workspace configs are saved)

Read `config/settings.yaml` for:
- `output.verbosity` — concise: orientation summary only; standard: full workspace config with orientation; detailed: full config with extended context for each source

## Process

### Step 1 — Identify the program and available material

Before asking anything, **run `/consolidate-memory` first.** Clean memory means the skill can surface what's already known about the program and its collaborators before prompting the user for context they've already provided elsewhere.

Then ask the user:
1. Which program are you joining?
2. Who was the previous owner, if known?
3. Was there a handoff package created (via /offboard-program)? If so, where is it?
4. Is there a program channel, canonical Figma file, or Drive doc you already know about?

In parallel, scan available sources:
- Search Slack (if connected) for channels matching the program name
- Search Drive (if connected) for documents matching the program name
- Check workspace memory and CLAUDE.md for any existing program context
- Check if an offboard-program package exists at the expected location

Surface what was found before asking more. Don't ask for what can be discovered.

### Step 2 — Load the handoff package (if available)

If an offboard-program package exists, load and parse each section:

- **work-context.md** — extract: program overview, current status, what's been tried, canonical source mapping, key metrics
- **relationship-context.md** — extract: partner names and roles, how to work with each person, who to loop in and when (load as trusted context, not public)
- **political-context.md** — extract: what's been surfaced to leadership, how it landed, what's unresolved (load as trusted context)
- **about-me-slice.md** — extract: how the previous owner operated on this program, working preferences that shaped the program
- **open-threads.md** — extract: pending decisions, outstanding asks, things needing immediate action

Present each section to the user as a brief summary. Ask: Does any of this conflict with what you already know? Is there anything you want to flag for follow-up?

If no package exists, proceed to Step 3.

### Step 3 — Map canonical sources

Build a canonical source map for the workspace. This is the most durable output of the onboarding — it tells Claude (and the user) where to go for authoritative information about this program.

For each source category, check if the handoff package has it. If not, ask the user or search:

- **Figma:** file ID(s), relevant pages or frames, what each file covers
- **Drive:** doc IDs for in-flight docs, slide decks, data docs, retro files
- **Slack:** primary channel ID, secondary channels, DM contacts for key partners
- **Amplitude:** dashboard links or IDs for the program's primary metrics
- **Other tools:** Jira/Linear tickets, Confluence pages, any other systems in active use

Format the source map as a CLAUDE.md block the user can paste into their workspace config:

```yaml
# <Program Name> Canonical Sources
figma:
  - id: <file-id>
    description: <what it is>
    notes: <page or frame context if relevant>
drive:
  - id: <doc-id>
    description: <what it is>
slack:
  - channel: <channel-id>
    name: <channel-name>
    description: <primary use>
```

### Step 4 — Load collaborator context

For each key partner in the program (from the handoff package, or from the user's input), check whether an about-me file exists.

If an about-me file exists for a collaborator:
- Load the public tier into the workspace context
- Note that a trusted tier may exist and offer to load it if the user has access
- Surface the most relevant sections: how they think, what they value, working preferences

If no about-me file exists for a collaborator:
- Add them to a "context gaps" list
- Optionally: offer to send a request via Slack asking if they'd be willing to share one (future feature)

For the user's own about-me: check if one exists. If not, surface the recommendation to run /create-about-me before the first cross-functional meeting.

### Step 5 — Produce the orientation summary

Synthesize available material into a day-one orientation document. This is what the user reads first.

Orientation structure:
- **What this program is** (1-2 sentences, pulled from work context)
- **Where things stand** (current season status, what's in flight, what's coming)
- **The three things to know first** (synthesized from open threads + political context + relationship context — the highest-priority context for day one)
- **Who to talk to in the first week** (key partners, in order of urgency, with what to cover with each)
- **Where everything lives** (canonical source map summary, with links)
- **What's unknown** (explicit list of context gaps — questions the user should try to answer in the first two weeks)

The "What's unknown" section is required. An onboarding document that presents itself as complete is lying. Being explicit about gaps helps the user know where to direct their ramp energy.

### Step 6 — Configure the workspace

Write the workspace configuration changes to the appropriate files:

- Update CLAUDE.md with the canonical source map block (Step 3)
- Add a memory pointer for this program to MEMORY.md if the user uses the memory system
- Save the orientation summary to `workspace/<program-slug>/orientation.md`
- Save any loaded handoff sections to `workspace/<program-slug>/handoff/` with their original file names

Confirm what was written and where.

### Step 7 — Surface follow-up actions

After configuring the workspace:
- List context gaps (partners without about-me files, missing canonical sources, open threads needing immediate action)
- Remind the user to run /create-about-me if they don't have an about-me file
- If there are open threads with deadlines, offer to add them to a task list
- Confirm that when it's their turn to transition off this program, /offboard-program is how to package what they've learned

## Output Format Details

The orientation summary is a markdown document saved to the workspace. Header format:

```markdown
---
program: <program name>
onboarded: <user name>
onboard-date: <YYYY-MM-DD>
source: <"handoff-package" | "sparse" | "no-handoff">
last-updated: <YYYY-MM-DD>
---

# <Program Name> — Orientation

> Onboarded: <date>. Source richness: <rich / sparse / none>. Context gaps: <count>.
```

The "source richness" and "context gaps" markers help the user calibrate how much to rely on this document versus their own investigation.

## Trust and Control Defaults

- **Relationship and political context stay trusted-tier.** Content loaded from trusted-tier handoff sections is not surfaced in public outputs or shared without explicit user action.
- **About-me files are pulled, not pushed.** The skill loads collaborator about-me files the user has access to. It doesn't request or retrieve files without the user's awareness.
- **Context gaps are explicit.** Missing context is labeled as missing, not filled with plausible content.
- **No invention.** If a section can't be populated from available sources or user input, it's marked as a gap. Never generate plausible-sounding content to fill blanks.

## Common Pitfalls

- **Treating a sparse handoff as if it were rich.** When the available material is thin, the orientation should reflect that. A document that sounds confident when the underlying material is sparse misleads the user.
- **Skipping the "What's unknown" section.** This section is the most useful part of the orientation for the user's first two weeks. Don't skip it because it's uncomfortable to surface gaps.
- **Loading trusted-tier content into public contexts.** Relationship and political context from the handoff package is shared point-to-point for this transition only. It shouldn't surface in shared docs, meeting notes, or other outputs without the user's explicit decision.
- **Missing the about-me step.** The incoming person's own about-me file is as important as the context they receive. If the user doesn't have one, or it's out of date, flag that before the first cross-functional meeting.

## Pairing with /create-about-me and /offboard-program

The three skills work as a sequence:

1. `/create-about-me` — generates the personal context file. The incoming person should have one before their first cross-functional meeting.
2. `/offboard-program` — run by the person leaving. Produces the handoff package this skill consumes.
3. `/onboard-program` — this skill. Run by the person joining.

The sequence closes the loop: the outgoing person documents what they know, the incoming person loads it, and the incoming person builds their own about-me for the next transition.

## Scale-Adaptive Summary

| Input richness | What the skill does |
|---|---|
| Full offboard-program package | Loads all five sections, configures sources, produces full orientation |
| Some docs, no package | Pulls from Drive/Slack/Figma, asks user for gaps, produces partial orientation with explicit gap markers |
| Nothing | Asks user for what they know, searches available sources, produces foundation doc with placeholders |

## Roadmap

**v1 (current):**
- Package loading and parsing (five sections from offboard-program)
- Canonical source map configuration
- Collaborator about-me loading (public tier)
- Orientation summary generation
- Workspace configuration writes

**v2 (planned):**
- Automated source discovery: scan Slack and Drive for the program without requiring the user to provide IDs
- About-me request flow: if a collaborator doesn't have an about-me, send a request via Slack
- Handoff package registry: search for packages by program name rather than requiring a file path
- Gap closing: track context gaps over time and close them as the user learns more

**v3 (planned):**
- Bidirectional sync with offboard-program: incoming person's questions feed back to outgoing person for clarification
- Orientation refresh: skill detects when the orientation is stale (new collaborators, new season) and offers an update
- Completeness scoring: estimates ramp completeness based on what's been loaded vs. what's missing
