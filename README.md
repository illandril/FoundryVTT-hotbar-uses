# Illandril's Hotbar Uses
![Latest Release Download Count](https://img.shields.io/github/downloads/illandril/FoundryVTT-hotbar-uses/latest/module.zip?color=4b0000&label=Downloads)
![Forge Installs](https://img.shields.io/badge/dynamic/json?color=4b0000&label=Forge%20Installs&query=package.installs&url=http%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Fillandril-hotbar-uses&suffix=%25)
![Foundry Core Compatible Version](https://img.shields.io/badge/dynamic/json?color=4b0000&label=Foundry%20Version&query=$.compatibleCoreVersion&url=https%3A%2F%2Fgithub.com%2Fillandril%2FFoundryVTT-hotbar-uses%2Freleases%2Flatest%2Fdownload%2Fmodule.json)

This is a module for Foundry Virtual Tabletop that adds a "uses" counter to item macros on your hotbar.

![Screenshot showing hotbar counters for spells, items, and feats](/screenshots/example-a.png?raw=true)

It shows uses for any macro created by dragging an inventory item, spell, or feat from a character sheet into the hotbar.

Uses that are shown include...
* Weapons with a Resource Consumption
* Consumables
* Features with uses
* Spells (Pact slots, Level slots, and at-will with uses)

If an item has 0 uses left, or if the currently controlled actor doesn't have the item for a macro, the macro will have no number, a red outline, and appear slightly dimmed.

If an item has no uses (ex. weapons without a resource consumption), or if a macro is not an item macro, its appearance is left unchanged.

# Systems Supported
This module currently supports the following systems:
* DnD5e
* Pathfinder 1
* Shadow of the Demon Lord

If you would like native support for other systems (or a specific module), please [open a New Issue](https://github.com/illandril/FoundryVTT-hotbar-uses/issues) to let me know (if I don't know there is desire for support for a system, I won't spend time adding that support).

# Custom Macro Support
For those who use systems this module does not natively support, or who create more complicated macros, you can add a Uses counter by adding a comment to your macro's command. There are a few varieties of comments that this module will recognize...

1. Equivalent Commands
1. Actor and Item ID matching
1. Item Name matching (optionally further filtered by Actor Name and/or Item Type)
1. Custom "Uses Remaining" calculations

## Equivalent Command
```
// HotbarUses: {some other command}
```
This will cause the uses to be calculated as if the command were the `{some other command}` value. For example, if you are using the Better Rolls and Furnace modules, and have a special "useMultipleCharges" Furnace macro that will prompt the number of points to use, and then effectively call `BetterRolls.quickRollById`, you could have a macro that looks like this:
```
// HotbarUses: BetterRolls.quickRollById("pzGA6GqAoSsQWY0L", "Em91Iu07HkLAWAfK");
let macro = game.macros.getName("useMultipleCharges")
macro.execute("pzGA6GqAoSsQWY0L", "Em91Iu07HkLAWAfK")
```

## Actor and Item ID Matching
```
// HotbarUses5e: ActorID="X" ItemID="Y"
```
This will cause the uses to be calculated for the actor with ID "X" and the item with ID "Y". For example, if you have a Paladin with an ID of "pzGA6GqAoSsQWY0L", and their "Lay on Hands" item has an ID of "Em91Iu07HkLAWAfK", it will show the uses left for "Lay on Hands".
```
// HotbarUses5e: ActorID="pzGA6GqAoSsQWY0L" ItemID="Em91Iu07HkLAWAfK"
CoolLayOnHandsMod.layOnHands("pzGA6GqAoSsQWY0L");
```

## Item Name Matching
```
// HotbarUses5e: ItemName="Y"
// HotbarUses5e: ActorName="X" ItemName="Y"
// HotbarUses5e: ItemName="Y" ItemType="Z"
// HotbarUses5e: ActorName="X" ItemName="Y" ItemType="Z"
```
This will cause the uses to be calculated for an item with the name of "Y". If ActorName is specified, it will be for that actor. If ActorName is not specified, it will be for the currently selected actor.
If ItemType is specified, it will only match items with the specified type.the actor with ID "X" and the item with ID "Y".
For example, if you had a macro that caused Sally to cast Goodberry, and Sally also had both a Spell named Goodberry and an Inventory item named Goodberry, you would want...
```
// HotbarUses5e: ActorName="Sally" ItemName="Goodberry" ItemType="spell"
CoolGoodberyMod.castGoodberry("Sally");
```

## Custom Calculation
```
// HotbarUsesGeneric
// ActorID=AID
// ActorName=AN
// ItemID=IID
// ItemName=IN
// ItemType=IT
// Available=A
// Consumed=C
// Max=M
```
Starting a macro with a HotbarUsesGeneric comment will allow for custom uses calculation matching. All parameters are optional, but any parameters specified must be in the correct order. If both ActorID and ActorName are specified, ActorName will be ignored. If actor is not specified, it will select the currently selected actor. If both ItemID and ItemName and/or ItemType are specified, ItemName and ItemType will be ignored. If both Available and Consumed are specified, Consumed will be ignored.

If no Item lookup details are specified, Available, Consumed, and Max are lookup attributes of the actor.

If Item lookup details are specified, Available, Consumed, and Max are lookup attributes of the item.

Available, Consumed, and Max can either be property keys (ex. `data.resources.legact.value`) or fixed numbers.

*Notice:* Whitespace and spelling are important. Make sure these comments are the very first thing in the macro, everything is spelled correctly, and that you don't have any extra spaces anywhere.

If you find yourself adding these comments to macros that you think could be natively supported, please [open a New Issue](https://github.com/illandril/FoundryVTT-hotbar-uses/issues) to let me know and I will see what I can do to add support for it.

### Custom Example: Bob's Arrow Quantity
```
// HotbarUsesGeneric
// ActorName=Bob
// ItemName=Arrow
// Available=data.quantity
```

### Custom Example: Insanity Level, with a fixed maximum
```
// HotbarUsesGeneric
// Consumed=data.attributes.insanity.value
// Max=10
```

### Custom Example: Power Remaining (plus a simple macro to actually decrement the power value)
```
// HotbarUsesGeneric
// Available=data.power.value
// Max=data.power.max
let speaker = ChatMessage.getSpeaker();
let actor = speaker.token && game.actors.tokens[speaker.token];
if(actor && actor.data.data.power.value > 0) {
  actor.update({"data.power.value": actor.data.data.power.value-1});
  ChatMessage.create({user: game.user._id, speaker: ChatMessage.getSpeaker(), content: 'I cast magic missile!'});
}
```

# Module Support
Some modules modify item macros, which will cause this module to appear to not work. If you notice this, please open an issue with the full Command string for the macro that doesn't show counts and, if you know it, the name of the module that caused the macro to be created.

If you are a module author, you can add support right in your own module by adding a regular expression to this module's config for the appropriate system (`CONFIG.illandril.hotbarUses.macros.{system}}`). Example:
```
Hooks.once('init', () => {
  const hotbarUsesMacros = getProperty(CONFIG, 'illandril.hotbarUses.macros.dnd5e');
  hotbarUsesMacros && hotbarUsesMacros.push(/^\s*BetterRolls\s*\.\s*quickRollByName\s*\(\s*(?<q>["'`])(?<actorName>.+)\k<q>\s*,\s*(?<qb>["'`])(?<itemName>.+)\k<qb>\s*\)\s*;?\s*$/);
});
```

The regular expression should match against your module's macros, with one or more of the following named capture groups: `itemName`, `itemType`, `itemID`, `actorID`, `actorName`. I can provide assistance in creating an appropriate regular expression if necessary.


# Credits
Support for the Shadow of the Demon Lord system was added by [Xacus](https://github.com/Xacus)
