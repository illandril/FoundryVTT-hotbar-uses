import { getMacroRegexArray } from './macroSettings';

export type ItemLookupDetails = {
  name?: string | null
  type?: string | null
  id?: string | null
  actorID?: string | null
  actorName?: string | null
  magicitemsModuleName?: string | null
  generic?: boolean
  available?: string | null
  consumed?: string | null
  max?: string | null
  actionIndex?: string | null
  actionName?: string | null
};

const getItemLookupDetailsForCommand = (systemID: string, command: string | null) => {
  let results: ItemLookupDetails | null = null;
  if (command) {
    for (const regex of getMacroRegexArray(systemID)) {
      const match = command.match(regex);
      if (match) {
        results = {
          name: match.groups?.itemName || null,
          type: match.groups?.itemType || null,
          id: match.groups?.itemID || null,
          actorID: match.groups?.actorID || null,
          actorName: match.groups?.actorName || null,
          magicitemsModuleName: match.groups?.magicitemsModuleName || null,
          generic: !!match.groups?.generic,
          available: match.groups?.available || null,
          consumed: match.groups?.consumed || null,
          max: match.groups?.max || null,
          actionIndex: match.groups?.actionIndex || null,
          actionName: match.groups?.actionName || null,
        };
        break;
      }
    }
  }
  return results;
};

export default getItemLookupDetailsForCommand;
