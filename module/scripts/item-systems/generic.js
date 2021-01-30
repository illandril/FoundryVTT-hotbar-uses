import ItemSystem from './item-system.js';

const SYSTEM_ID = 'GENERIC';

class GenericSystem extends ItemSystem {
  constructor() {
    super(SYSTEM_ID, []);
  }

  async calculateUsesForItem(item) {
    // Everything that this system supports is handled by the base ItemSystem
    return null;
  }
}
export default new GenericSystem();
