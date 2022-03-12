import { getShowMax } from './settings.js';

const CSS_PREFIX = 'illandril-hotbar-uses--';
const CSS_COUNTER = CSS_PREFIX + 'counter';
const CSS_HAS_USES = CSS_PREFIX + 'hasUses';
const CSS_ZERO_USES = CSS_PREFIX + 'zeroUses';
const CSS_SHOW_ZERO = CSS_PREFIX + 'showZero';

export const showUses = (slotElem, uses) => {
  let usesDisplay = slotElem.querySelector('.' + CSS_COUNTER);
  if (!usesDisplay) {
    usesDisplay = document.createElement('span');
    usesDisplay.classList.add(CSS_COUNTER);
    slotElem.appendChild(usesDisplay);
  }
  if (uses === null) {
    slotElem.classList.remove(CSS_HAS_USES);
    usesDisplay.classList.remove(CSS_SHOW_ZERO);
    usesDisplay.classList.remove(CSS_ZERO_USES);
    usesDisplay.innerText = '';
  } else {
    let showZeroUses = false;
    let hasUsesAvailable = false;
    let hasMaximum = false;
    let display = '';
    if (typeof uses === 'number') {
      hasUsesAvailable = uses > 0;
      display = uses;
    } else if (typeof uses === 'string') {
      hasUsesAvailable = true;
      display = uses;
    } else if (typeof uses === 'object') {
      if (typeof uses.available === 'number') {
        hasUsesAvailable = uses.available !== 0;
        showZeroUses = uses.showZeroUses;
        display = uses.available;
      } else if (typeof uses.consumed === 'number') {
        if (typeof uses.maximum === 'number') {
          hasUsesAvailable = uses.consumed < uses.maximum;
        } else {
          hasUsesAvailable = true;
        }
        display = uses.consumed;
      } else {
        display = '?';
      }
      if (getShowMax() && typeof uses.maximum === 'number') {
        hasMaximum = true;
        display += '/' + uses.maximum;
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
  }
};
