const addNullable = (current: number | null, addition: number | null) => {
  if (typeof addition === 'number') {
    if (current === null) {
      return addition;
    }
    return current + addition;
  }
  return current;
};

export default addNullable;
