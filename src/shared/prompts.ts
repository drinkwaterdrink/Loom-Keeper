import type { LoomPreset, LoomTrackerState } from './types.js';

export function buildTrackerPrompt(input: {
  preset: LoomPreset;
  latestAssistantMessage: string;
  previousTracker: LoomTrackerState | null;
  recentContext: string;
}): Array<{ role: 'system' | 'user'; content: string }> {
  const previous = input.previousTracker ? JSON.stringify(input.previousTracker.data, null, 2) : '{}';
  const schema = JSON.stringify(input.preset.schemaJson, null, 2);
  return [
    {
      role: 'system',
      content: input.preset.promptInstructions,
    },
    {
      role: 'user',
      content: [
        'Schema:',
        schema,
        '',
        'Previous tracker state:',
        previous,
        '',
        'Recent context:',
        input.recentContext || '(none)',
        '',
        'Latest assistant message to track:',
        input.latestAssistantMessage,
        '',
        'Return JSON only. No markdown. No commentary.',
      ].join('\n'),
    },
  ];
}
