# Illandril's Hotbar Uses
This is a module for Foundry Virtual Tabletop that adds a "uses" counter to item macros on your hotbar.

![Screenshot showing hotbar counters for spells, items, and feats](/screenshots/example-a.png?raw=true)

This module currently only works with the DnD5e system. It shows uses for any macro created by dragging an inventory item, spell, or feat from a character sheet into the hotbar.

Uses that are shown include...
* Weapons with a Resource Consumption
* Consumables
* Features with uses
* Spells (Pact slots, Level slots, and at-will with uses)

If an item has 0 uses left, or if the currently controlled actor doesn't have the item for a macro, the macro will have no number, a red outline, and appear slightly dimmed.

If an item has no uses (ex. weapons without a resource consumption), or if a macro is not an item macro, its appearance is left unchanged.

# Installation
1. Open the Configuration and Setup for your FoundryVTT server
1. Open the Add-on Modules Tab
1. Click the Install Module button
1. In the Manifest URL input, specify https://github.com/illandril/FoundryVTT-hotbar-uses/releases/latest/download/module.json
1. Click Install
1. Launch your world
1. Log in as the GM
1. Open the Settings tab
1. Click Manage Modules
1. Check the checkbox for Illandril's Hotbar Uses
