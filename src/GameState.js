export function initGameState(registry) {
  registry.set('gameState', {
    character: 'fabi',
    inventory: [],
    abilityUsed: false,
    lang: 'es',
    currentLevel: 1,
  });
}

export function getGameState(registry) {
  return registry.get('gameState');
}

export function setGameState(registry, patch) {
  const current = registry.get('gameState');
  registry.set('gameState', { ...current, ...patch });
}
