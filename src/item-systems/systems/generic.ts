import ItemSystem from '../ItemSystem';

const SYSTEM_ID = 'GENERIC';

class GenericSystem extends ItemSystem<Item> {
  constructor() {
    // Everything that this "system" supports is handled by the base ItemSystem
    super(SYSTEM_ID, [], () => Promise.resolve(null));
  }
}
export default new GenericSystem();
