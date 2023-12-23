import * as ItemSystem from './item-system';
import module from './module';
import { SETTINGS_UPDATED } from './showMax';
import './test.scss';
import { updateSlot } from './ui';

const COMMAND_EQUIVALENT = /^(.*\n)?\s*\/\/\s*HotbarUses:(?<command>[^\n]+)(\n.*)?$/is;

let hasShownMacroUses = false;

function getCommand(macro?: { command: string }) {
  if (!macro) {
    return null;
  }
  const rawCommand = macro.command;
  const equivalentMatch = rawCommand.match(COMMAND_EQUIVALENT);
  return equivalentMatch?.groups?.command ?? rawCommand;
}

const renderHotbar = foundry.utils.debounce(() => {
  module.logger.debug('Forcing hotbar render');

  ui.hotbar.render();

  // Module support: https://github.com/Norc/foundry-custom-hotbar
  (ui as { customHotbar?: Application }).customHotbar?.render?.();
}, 1);

const rerenderHotbarIfNecessary = foundry.utils.debounce(() => {
  if (hasShownMacroUses) {
    renderHotbar();
  }
}, 1);


Hooks.on(SETTINGS_UPDATED, rerenderHotbarIfNecessary);
Hooks.on('updateItem', rerenderHotbarIfNecessary);
Hooks.on('updateActor', rerenderHotbarIfNecessary);
Hooks.on('updateToken', rerenderHotbarIfNecessary);
Hooks.on('controlToken', rerenderHotbarIfNecessary);
Hooks.on('deleteItem', rerenderHotbarIfNecessary);
Hooks.on('createItem', rerenderHotbarIfNecessary);

function onRenderHotbar(hotbar: Application) {
  void onRenderHotbarElem(hotbar.element[0]);
}

const onRenderHotbarElem = async (hotbarElem: HTMLElement) => {
  const macroElems = hotbarElem.querySelectorAll('[data-macro-id]');

  for (const macroElem of macroElems) {
    const macroID = macroElem.getAttribute('data-macro-id');
    if (!macroID) {
      module.logger.debug('onRenderHotbarElem', macroID, null);
      continue;
    }
    const macro = (game as { macros?: foundry.utils.Collection<string, { command: string }> }).macros?.get(macroID);
    const command = getCommand(macro);
    // eslint-disable-next-line no-await-in-loop
    const uses = await ItemSystem.calculateUses(command);
    module.logger.debug('onRenderHotbarElem', macroID, command, uses);
    updateSlot(macroElem, uses);
    if (uses !== null) {
      hasShownMacroUses = true;
    }
  }
};

Hooks.once('ready', () => {
  Hooks.on('render', (hotbar) => {
    // The CustomHotbar overrides the Hotbar class with an anonymous class, which causes the
    // renderHotbar hook to instead be "render" in Firefox.
    // See https://github.com/Norc/foundry-custom-hotbar/issues/74
    if (hotbar === ui.hotbar) {
      onRenderHotbar(hotbar);
    }
  });
  Hooks.on('renderHotbar', onRenderHotbar);

  renderHotbar();
});

module.logger.error('Initialized');
