import module from './module';

export const SETTINGS_UPDATED = `${module.id}.SettingsUpdated` as const;

declare global {
  interface HookCallbacks {
    [SETTINGS_UPDATED]: () => void;
  }
}

export default module.settings.register('showMax', Boolean, true, {
  scope: 'client',
  config: true,
  onChange: () => Hooks.callAll(SETTINGS_UPDATED),
});
