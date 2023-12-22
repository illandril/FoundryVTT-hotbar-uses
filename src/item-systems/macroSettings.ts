const GENERIC_MACRO_REGEX_ARRAY = [
  /*
  Comment...

  // HotbarUsesGeneric
  // ActorID=AID
  // ActorName=AN
  // ItemID=IID
  // ItemName=IN
  // ItemType=IT
  // Uses=U
  // Consumed=C
  // Max=M

  All values except the HotbarUsesGeneric identifier are optional, but order is important
  */
  /^(.*\n)?\s*\/\/\s*(?<generic>HotbarUsesGeneric)\s*(\n\s*\/\/\s*ActorID\s*=\s*(?<actorID>[^\n]+))?(\n\s*\/\/\s*ActorName\s*=\s*(?<actorName>[^\n]+))?(\n\s*\/\/\s*ItemID\s*=\s*(?<itemID>[^\n]+))?(\n\s*\/\/\s*ItemName\s*=\s*(?<itemName>[^\n]+))?(\n\s*\/\/\s*ItemType\s*=\s*(?<itemType>[^\n]+))?(\n\s*\/\/\s*Available\s*=\s*(?<available>[^\n]+))?(\n\s*\/\/\s*Consumed\s*=\s*(?<consumed>[^\n]+))?(\n\s*\/\/\s*Max\s*=\s*(?<max>[^\n]+))?(\n.*)?$/is,
];

const getMacroSettings = () => {
  const CONFIG = window.CONFIG as {
    illandril?: {
      hotbarUses?: {
        macros?: Record<string, RegExp[] | undefined>
      }
    }
  };
  if (!CONFIG.illandril) {
    CONFIG.illandril = {};
  }
  if (!CONFIG.illandril.hotbarUses) {
    CONFIG.illandril.hotbarUses = {};
  }
  if (!CONFIG.illandril.hotbarUses.macros) {
    CONFIG.illandril.hotbarUses.macros = {};
  }
  return CONFIG.illandril.hotbarUses.macros;
};

export const setDefaultMacroRegexArray = (systemID: string, macroRegexArray: RegExp[]) => {
  getMacroSettings()[systemID] = macroRegexArray;
};

export const getMacroRegexArray = (systemID: string) => {
  return (getMacroSettings()[systemID] ?? []).concat(GENERIC_MACRO_REGEX_ARRAY);
};
