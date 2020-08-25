import * as ItemSystem from './item-system/index.js';
import * as UI from './ui.js';

function getCommand(macro) {
  return macro && macro.data.command;
}

function rerenderHotbarIfNecessary() {
  const canCalculateUses = ui.hotbar.macros.some((macroSlot) => {
    return ItemSystem.canCalculateUses(getCommand(macroSlot.macro));
  });
  if (canCalculateUses) {
    ui.hotbar.render();
  }
}

Hooks.on('updateOwnedItem', rerenderHotbarIfNecessary);
Hooks.on('updateActor', rerenderHotbarIfNecessary);
Hooks.on('controlToken', rerenderHotbarIfNecessary);
Hooks.on('deleteOwnedItem', rerenderHotbarIfNecessary);
Hooks.on('createOwnedItem', rerenderHotbarIfNecessary);

Hooks.on('renderHotbar', (hotbar, html, options) => {
  options.macros.forEach((macroSlot) => {
    const slot = macroSlot.slot;
    const command = getCommand(macroSlot.macro);
    UI.showUses(slot, ItemSystem.calculateUses(command));
  });
});
