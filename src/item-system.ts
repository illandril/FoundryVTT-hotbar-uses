import { calculateUses as calculateSystemUses } from './item-systems';
import { calculateUses as calculateSpecialtyModuleUses } from './specialty-modules';

export const calculateUses = async (command: string | null) => {
  const systemUses = await calculateSystemUses(command);
  if (systemUses) {
    return systemUses;
  }
  return calculateSpecialtyModuleUses(command);
};
