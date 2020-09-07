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

    // Module support: https://github.com/Norc/foundry-custom-hotbar
    ui.customHotbar && ui.customHotbar.render()
  }
}

Hooks.on('updateOwnedItem', rerenderHotbarIfNecessary);
Hooks.on('updateActor', rerenderHotbarIfNecessary);
Hooks.on('controlToken', rerenderHotbarIfNecessary);
Hooks.on('deleteOwnedItem', rerenderHotbarIfNecessary);
Hooks.on('createOwnedItem', rerenderHotbarIfNecessary);

function onRenderHotbar(hotbar, html, options) {
  const hotbarElem = hotbar.element[0];
  options.macros.forEach((macroSlot) => {
    const slot = macroSlot.slot;
    const command = getCommand(macroSlot.macro);
    UI.showUses(hotbarElem, slot, ItemSystem.calculateUses(command));
  });
}
Hooks.on('renderHotbar', onRenderHotbar);

// Module support: https://github.com/Norc/foundry-custom-hotbar
Hooks.on('renderCustomHotbar', onRenderHotbar);
