import getItemLookupDetailsForCommandFromRegex from '../lookups/getItemLookupDetailsForCommandFromRegex';
import module from '../module';
import { getMacroRegexArray } from './macroSettings';

const getItemLookupDetailsForCommand = (systemID: string, command: string | null) => {
  const results = getItemLookupDetailsForCommandFromRegex(getMacroRegexArray(systemID), command);
  module.logger.debug('getItemLookupDetailsForCommand', systemID, command, results);
  return results;
};

export default getItemLookupDetailsForCommand;
