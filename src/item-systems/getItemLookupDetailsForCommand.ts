import getItemLookupDetailsForCommandFromRegex from '../lookups/getItemLookupDetailsForCommandFromRegex';
import { getMacroRegexArray } from './macroSettings';

const getItemLookupDetailsForCommand = (systemID: string, command: string | null) => {
  const results = getItemLookupDetailsForCommandFromRegex(getMacroRegexArray(systemID), command);
  return results;
};

export default getItemLookupDetailsForCommand;
