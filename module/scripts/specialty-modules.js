import magicitems from './specialty-modules/magicitems.js';

const specialtyModules = [magicitems];

export const canCalculateUses = (command) => {
  return specialtyModules.some((module) => {
    return module.isModuleActive() && module.canCalculateUses(command);
  });
};

export const calculateUses = async (command) => {
  let uses = null;
  for (let module of specialtyModules) {
    if (module.isModuleActive() && module.canCalculateUses(command)) {
      uses = await module.calculateUses(command);
      break;
    }
  }
  return uses;
};
