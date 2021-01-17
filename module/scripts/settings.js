const MODULE_NAME = 'illandril-hotbar-uses';
export const SETTINGS_UPDATED = MODULE_NAME + '.SettingsUpdated';
const SHOW_MAX = 'showMax';

function refresh() {
  Hooks.callAll(SETTINGS_UPDATED);
}

Hooks.once('init', () => {
  game.settings.register(MODULE_NAME, SHOW_MAX, {
    name: game.i18n.localize('illandril-hotbar-uses.showMaximum'),
    scope: 'client',
    config: true,
    default: true,
    type: Boolean,
    onChange: refresh,
  });
});

export const getShowMax = () => game.settings.get(MODULE_NAME, SHOW_MAX);
