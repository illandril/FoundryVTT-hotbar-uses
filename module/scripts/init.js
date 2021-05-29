import * as ItemSystem from './item-system.js';
import * as UI from './ui.js';
import { SETTINGS_UPDATED } from './settings.js';

const COMMAND_EQUIVALENT = /^(.*\n)?\s*\/\/\s*HotbarUses:(?<command>[^\n]+)(\n.*)?$/is;

let hasShownMacroUses = false;

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
  if (hasShownMacroUses) {
    renderHotbar();
  }
}, 1);

const renderHotbar = debounce(() => {
  ui.hotbar.render();

  // Module support: https://github.com/Norc/foundry-custom-hotbar
  ui.customHotbar && ui.customHotbar.render();
}, 1);

Hooks.on(SETTINGS_UPDATED, rerenderHotbarIfNecessary);
Hooks.on('updateItem', rerenderHotbarIfNecessary);
Hooks.on('updateActor', rerenderHotbarIfNecessary);
Hooks.on('updateToken', rerenderHotbarIfNecessary);
Hooks.on('controlToken', rerenderHotbarIfNecessary);
Hooks.on('deleteItem', rerenderHotbarIfNecessary);
Hooks.on('createItem', rerenderHotbarIfNecessary);

// The "OwnedItem" hooks are for v0.7.x
Hooks.on('updateOwnedItem', rerenderHotbarIfNecessary);
Hooks.on('deleteOwnedItem', rerenderHotbarIfNecessary);
Hooks.on('createOwnedItem', rerenderHotbarIfNecessary);

function onRenderHotbar(hotbar) {
  onRenderHotbarElem(hotbar.element[0], hotbar.macros);
}

function onRenderHotbarElem(hotbarElem, macros) {
  macros.forEach(async (macroSlot) => {
    const slot = macroSlot.slot;
    const command = getCommand(macroSlot.macro);
    const uses = await ItemSystem.calculateUses(command);
    UI.showUses(hotbarElem, slot, uses);
    if(uses !== null) {
      hasShownMacroUses = true;
    }
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

  // Supports Monk's Hotbar Expansion, assuming this pull request is accepted:
  // https://github.com/ironmonk88/hotbar-expansion/pull/2
  Hooks.on('renderMonksHotbarExpansionActionBar', (hotbar, actionBar, options) => {
    onRenderHotbarElem(actionBar[0], options.macros);
  });

  renderHotbar();
});
