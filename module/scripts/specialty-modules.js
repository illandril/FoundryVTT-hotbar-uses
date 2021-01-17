import magicitems from './specialty-modules/magicitems.js';

const specialtyModules = [
  magicitems,
];

export const canCalculateUses = (command) => {
  return specialtyModules.some(module => {
    return module.isModuleActive() && module.canCalculateUses(command);
  });
};

export const calculateUses = (command) => {
  let uses = null;
  specialtyModules.some(module => {
    if(module.isModuleActive() && module.canCalculateUses(command)) {
      uses = module.calculateUses(command);
      return true;
    }
  });
  return uses;
};
