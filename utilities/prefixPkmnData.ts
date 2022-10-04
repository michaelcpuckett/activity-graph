export const prefixPkmnData = (data: { [key: string]: unknown }) => {
  const prefixedData: Array<[string, unknown]> = [];

  for (const [key, value] of Object.entries({...data})) {
    const newKey = `pkmn:${key}`;
    if (Array.isArray(value)) {
      prefixedData.push([newKey, value.map(item => {
        if (item && typeof item === 'object') {
          return prefixPkmnData(item);
        } else {
          return item;
        }
      })]);
    } else if (value && typeof value === 'object') {
      prefixedData.push([newKey, prefixPkmnData(value as { [key: string]: unknown })]);
    } else {
      prefixedData.push([newKey, value]);
    }
  }

  return Object.fromEntries(prefixedData);
}
