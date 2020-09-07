const CSS_PREFIX = 'illandril-hotbar-uses--';
const CSS_COUNTER = CSS_PREFIX + 'counter';
const CSS_HAS_USES = CSS_PREFIX + 'hasUses';
const CSS_ZERO_USES = CSS_PREFIX + 'zeroUses';

export const showUses = (hotbarElem, slot, uses) => {
  const slotElem = hotbarElem.querySelector('[data-slot="' + slot + '"]');
  let usesDisplay = slotElem.querySelector('.' + CSS_COUNTER);
  if (!usesDisplay) {
    usesDisplay = document.createElement('span');
    usesDisplay.classList.add(CSS_COUNTER);
    slotElem.appendChild(usesDisplay);
  }
  usesDisplay.innerText = uses;
  if (uses === null) {
    slotElem.classList.remove(CSS_HAS_USES);
  } else {
    slotElem.classList.add(CSS_HAS_USES);
    if (uses === 0) {
      usesDisplay.classList.add(CSS_ZERO_USES);
    } else {
      usesDisplay.classList.remove(CSS_ZERO_USES);
    }
  }
};
