const getMacroSettings = () => {
  const config = window.CONFIG as {
    illandril?: {
      hotbarUses?: {
        specialtyMacros?: Record<string, RegExp[] | undefined>;
      };
    };
  };
  if (!config.illandril) {
    config.illandril = {};
  }
  if (!config.illandril.hotbarUses) {
    config.illandril.hotbarUses = {};
  }
  if (!config.illandril.hotbarUses.specialtyMacros) {
    config.illandril.hotbarUses.specialtyMacros = {};
  }
  return config.illandril.hotbarUses.specialtyMacros;
};

export const setDefaultMacroRegexArray = (moduleID: string, macroRegexArray: RegExp[]) => {
  getMacroSettings()[moduleID] = macroRegexArray;
};

export const getMacroRegexArray = (moduleID: string) => {
  return getMacroSettings()[moduleID] ?? [];
};
