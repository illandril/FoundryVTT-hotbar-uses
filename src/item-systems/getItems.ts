import { ItemLookupDetails } from './getItemLookupDetailsForCommand';

const getItems = <T extends Item>(actor: Actor, itemLookupDetails: ItemLookupDetails): T[] | null => {
  if (itemLookupDetails.id) {
    const item = actor.items.get(itemLookupDetails.id);
    return item ? [item as T] : [];
  }
  if (itemLookupDetails.name) {
    let firstType = itemLookupDetails.type;
    return actor.items.filter((item) => {
      if (item.name !== itemLookupDetails.name) {
        return false;
      }
      if (firstType === null) {
        firstType = item.type;
        return true;
      }
      return item.type === firstType;
    }) as T[];
  }
  if (itemLookupDetails.actionIndex) {
    const actionIndex = parseInt(itemLookupDetails.actionIndex, 10);
    if (!isNaN(actionIndex) && actionIndex >= 0) {
      const actions = foundry.utils.getProperty(actor, 'system.actions');
      if (actions && Array.isArray(actions)) {
        const action = actions[actionIndex] as { name?: string };
        if (action.name === itemLookupDetails.actionName) {
          return [action as T];
        }
      }
    }
    return [];
  }
  return null;
};

export default getItems;
