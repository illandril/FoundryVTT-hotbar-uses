const getNumber = (data: unknown, key: string | null | undefined) => {
  if (!key) {
    return null;
  }
  const numeric = parseInt(key, 10);
  if (!isNaN(numeric)) {
    return numeric;
  }
  const value = foundry.utils.getProperty(data, key);
  let parsed: number;
  if (typeof value === 'number') {
    parsed = value;
  } else if (typeof value === 'string') {
    parsed = parseInt(value, 10);
  } else {
    parsed = NaN;
  }
  if (!isNaN(parsed)) {
    return parsed;
  }
  return null;
};

export default getNumber;
