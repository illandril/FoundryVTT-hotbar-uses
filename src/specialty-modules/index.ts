import type { ItemUses } from '../item-systems/ItemSystem';
import magicitems from './magicitems';

const specialtyModules = [magicitems];

export const calculateUses = async (command: string | null) => {
  let uses: ItemUses | null = null;
  for (const specialtyModule of specialtyModules) {
    if (specialtyModule.isModuleActive() && specialtyModule.canCalculateUses(command)) {
      uses = await specialtyModule.calculateUses(command);
      if (uses) {
        break;
      }
    }
  }
  return uses;
};
