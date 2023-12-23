
export type ItemLookupDetails = {
  name: string | null
  type: string | null
  id: string | null
  actorID: string | null
  actorName: string | null
  magicitemsModuleName: string | null
  generic: boolean
  available: string | null
  consumed: string | null
  max: string | null
  actionIndex: string | null
  actionName: string | null
  groups: {
    [index: string]: string | null | undefined
  }
};

const getItemLookupDetailsForCommandFromRegex = (regexArray: RegExp[], command: string | null) => {
  let results: ItemLookupDetails | null = null;
  if (command) {
    for (const regex of regexArray) {
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
          groups: match.groups ?? {},
        };
        break;
      }
    }
  }
  return results;
};

export default getItemLookupDetailsForCommandFromRegex;
