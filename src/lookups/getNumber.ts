const getNumber = (data: unknown, key: string | null | undefined) => {
  if (!key) {
    return null;
  }
  const numeric = Number.parseInt(key, 10);
  if (!Number.isNaN(numeric)) {
    return numeric;
  }
  const value = foundry.utils.getProperty(data, key);
  let parsed: number;
  if (typeof value === 'number') {
    parsed = value;
  } else if (typeof value === 'string') {
    parsed = Number.parseInt(value, 10);
  } else {
    parsed = Number.NaN;
  }
  if (!Number.isNaN(parsed)) {
    return parsed;
  }
  return null;
};

export default getNumber;
