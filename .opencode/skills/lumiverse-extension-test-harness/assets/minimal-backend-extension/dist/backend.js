spindle.onFrontendMessage(async (payload, userId) => {
  if (payload?.type === 'ready') {
    const settings = await spindle.userStorage.getJson('settings.json', {
      fallback: { enabled: true },
      userId,
    });
    spindle.sendToFrontend({ type: 'state', state: { settings } }, userId);
  }
});

spindle.registerTool({
  name: 'fixture_tool',
  display_name: 'Fixture Tool',
  description: 'A fixture tool registered by the harness test extension.',
  parameters: { type: 'object', properties: {} },
  council_eligible: true,
});

spindle.log.info('Harness fixture loaded');
