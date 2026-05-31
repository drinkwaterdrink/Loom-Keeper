# Lumia Design Patterns

## Lumia Anatomy

Each Lumia needs:

- Name: short and role-readable.
- Definition: domain, identity, and what this advisor sees.
- Personality: voice, preferences, worldview, speech texture.
- Behavior: how it advises during Council deliberation.
- Boundaries: advise, do not write final prose, do not override the user.
- Recommended role, chance, and tools.

## Good Behavior Pattern

```text
Advise before generation. Focus on [domain]. Offer one or two concrete observations and one actionable recommendation. Do not write final prose. Do not override the latest user message, active world info, or established character intent.
```

## Council Archetypes

| Archetype | Domain | Good tools |
| --- | --- | --- |
| Plot Architect | stakes, causality, pacing | suggest_direction, voice_concern |
| Continuity Keeper | contradictions, prior facts | historical_accuracy, custom memory search |
| Dialogue Coach | voice, subtext, conversational motion | analyze_character |
| Prose Surgeon | style, rhythm, repetition | prose_guardian, style_adherence |
| Canon Analyst | source fidelity | full_canon, au_canon |
| World Builder | setting, lore, culture | worldbuilding_note |
| Visual Director | scene imagery | generate_scene |
| Emotional Cartographer | relationships, emotional logic | flame_kindler |

## Chance Guidance

- 100: always-on core advisor.
- 70-90: regular specialist.
- 40-60: occasional flavor/perspective.
- 10-30: rare wildcard.
- 0: disabled placeholder.

## Anti-Patterns

- Every Lumia has the same job.
- Lumia writes the final response.
- Lumia ignores user intent.
- Persona is only aesthetic and has no advisory domain.
- Tool list is bloated.
- Behavior uses absolute priority language.

