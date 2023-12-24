import { ItemUses } from './item-systems/ItemSystem';
import module from './module';
import showMax from './showMax';
import './ui.scss';

const CSS_COUNTER = module.cssPrefix.child('counter');
const CSS_HAS_USES = module.cssPrefix.child('hasUses');
const CSS_ZERO_USES = module.cssPrefix.child('zeroUses');
const CSS_SHOW_ZERO = module.cssPrefix.child('showZero');

const getCounterElem = (slotElem: Element) => {
  let usesDisplay = slotElem.querySelector<HTMLSpanElement>('.' + CSS_COUNTER);
  if (!usesDisplay) {
    usesDisplay = document.createElement('span');
    usesDisplay.classList.add(CSS_COUNTER);
    slotElem.appendChild(usesDisplay);
  }
  return usesDisplay;
};

const hideUses = (slotElem: Element) => {
  slotElem.classList.remove(CSS_HAS_USES);

  const counterElem = getCounterElem(slotElem);
  counterElem.classList.remove(CSS_SHOW_ZERO);
  counterElem.classList.remove(CSS_ZERO_USES);
  counterElem.innerText = '';
};

const showUses = (slotElem: Element, uses: ItemUses | string | number) => {
  const usesDisplay = getCounterElem(slotElem);
  let showZeroUses = false;
  let hasUsesAvailable = false;
  let hasMaximum = false;
  let display = '';
  if (typeof uses === 'number') {
    hasUsesAvailable = uses > 0;
    display = `${uses}`;
  } else if (typeof uses === 'string') {
    hasUsesAvailable = true;
    display = uses;
  } else if (typeof uses === 'object') {
    if (typeof uses.available === 'number') {
      hasUsesAvailable = uses.available !== 0;
      showZeroUses = !!uses.showZeroUses;
      display = `${uses.available}`;
    } else if (typeof uses.consumed === 'number') {
      if (typeof uses.maximum === 'number') {
        hasUsesAvailable = uses.consumed < uses.maximum;
      } else {
        hasUsesAvailable = true;
      }
      display = `${uses.consumed}`;
    } else if (uses.showZeroUses) {
      hasUsesAvailable = false;
      showZeroUses = true;
      display = '0';
    } else {
      module.logger.error('Unable to determine uses', uses);
      display = '?';
    }
    if (showMax.get() && typeof uses.maximum === 'number') {
      hasMaximum = true;
      display = `${display}/${uses.maximum}`;
    }
  }
  usesDisplay.innerText = display;
  if (hasMaximum || showZeroUses) {
    usesDisplay.classList.add(CSS_SHOW_ZERO);
  } else {
    usesDisplay.classList.remove(CSS_SHOW_ZERO);
  }
  slotElem.classList.add(CSS_HAS_USES);
  if (hasUsesAvailable) {
    usesDisplay.classList.remove(CSS_ZERO_USES);
  } else {
    usesDisplay.classList.add(CSS_ZERO_USES);
  }
};

export const updateSlot = (slotElem: Element, uses: ItemUses | string | number | null) => {
  if (uses === null) {
    hideUses(slotElem);
  } else {
    showUses(slotElem, uses);
  }
};
