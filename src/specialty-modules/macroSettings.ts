const getMacroSettings = () => {
  const CONFIG = window.CONFIG as {
    illandril?: {
      hotbarUses?: {
        specialtyMacros?: Record<string, RegExp[] | undefined>
      }
    }
  };
  if (!CONFIG.illandril) {
    CONFIG.illandril = {};
  }
  if (!CONFIG.illandril.hotbarUses) {
    CONFIG.illandril.hotbarUses = {};
  }
  if (!CONFIG.illandril.hotbarUses.specialtyMacros) {
    CONFIG.illandril.hotbarUses.specialtyMacros = {};
  }
  return CONFIG.illandril.hotbarUses.specialtyMacros;
};

export const setDefaultMacroRegexArray = (moduleID: string, macroRegexArray: RegExp[]) => {
  getMacroSettings()[moduleID] = macroRegexArray;
};

export const getMacroRegexArray = (moduleID: string) => {
  return getMacroSettings()[moduleID] ?? [];
};
