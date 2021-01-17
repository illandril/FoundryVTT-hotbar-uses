import * as ItemSystem from './item-system.js';
import * as UI from './ui.js';
import { SETTINGS_UPDATED } from './settings.js';

const COMMAND_EQUIVALENT = /^(.*\n)?\s*\/\/\s*HotbarUses:(?<command>[^\n]+)(\n.*)?$/is;

function getCommand(macro) {
  if (!macro) {
    return null;
  }
  const rawCommand = macro.data.command;
  const equivalentMatch = rawCommand.match(COMMAND_EQUIVALENT);
  if (equivalentMatch) {
    return equivalentMatch.groups.command;
  }
  return rawCommand;
}

const rerenderHotbarIfNecessary = debounce(() => {
  const canCalculateUses = ui.hotbar.macros.some((macroSlot) => {
    return ItemSystem.canCalculateUses(getCommand(macroSlot.macro));
  });
  if (canCalculateUses) {
    ui.hotbar.render();

    // Module support: https://github.com/Norc/foundry-custom-hotbar
    ui.customHotbar && ui.customHotbar.render();
  }
}, 10);

Hooks.on(SETTINGS_UPDATED, rerenderHotbarIfNecessary);
Hooks.on('updateOwnedItem', rerenderHotbarIfNecessary);
Hooks.on('updateActor', rerenderHotbarIfNecessary);
Hooks.on('updateToken', rerenderHotbarIfNecessary);
Hooks.on('controlToken', rerenderHotbarIfNecessary);
Hooks.on('deleteOwnedItem', rerenderHotbarIfNecessary);
Hooks.on('createOwnedItem', rerenderHotbarIfNecessary);

function onRenderHotbar(hotbar) {
  const hotbarElem = hotbar.element[0];
  hotbar.macros.forEach((macroSlot) => {
    const slot = macroSlot.slot;
    const command = getCommand(macroSlot.macro);
    UI.showUses(hotbarElem, slot, ItemSystem.calculateUses(command));
  });
}

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

  onRenderHotbar(ui.hotbar, ui.hotbar.element, { macros: ui.hotbar.macros });
});
