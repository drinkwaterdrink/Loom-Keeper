# Prompt Variable Strategy

Use prompt variables when users need safe, editable knobs inside prompt blocks.

Good variables:

- names
- style intensity
- POV mode
- genre pressure
- tracker labels
- output verbosity
- safety/tone switches

Avoid variables for:

- large prompt modules better represented as blocks
- hidden state that should be storage/metadata
- volatile random values
- story facts that belong in world books or chat history

Variable rules:

- Name clearly.
- Give defaults.
- Keep scope local to the block.
- Remove stale metadata when deleting variables.
- Avoid duplicating macro behavior.

