import magicitems from './specialty-modules/magicitems.js';

const specialtyModules = [
  // magicitems integration is disabled until the magicitems module fixes
  // issue #45: https://gitlab.com/riccisi/foundryvtt-magic-items/-/issues/45
  //magicitems,
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
