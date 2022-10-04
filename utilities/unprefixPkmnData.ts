const unprefixPkmnDataArray = (array: Array<unknown>): Array<unknown> => {
  return array.map(item => {
    if (Array.isArray(item)) {
      return unprefixPkmnDataArray(item);
    } else if (item && typeof item === 'object') {
      return unprefixPkmnData(item as unknown as { [key: string]: unknown });
    } else {
      return item;
    }
  });
}

export const unprefixPkmnData = (data: { [key: string]: unknown }) => {
  const unprefixedData: Array<[string, unknown]> = [];

  for (const [key, value] of Object.entries({...data})) {
    const newKey = key.startsWith('pkmn:') ? key.split('pkmn:')[1] : key;

    if (Array.isArray(value)) {
      unprefixedData.push([newKey, unprefixPkmnDataArray(value)]);
    } else if (value && typeof value === 'object') {
      unprefixedData.push([newKey, unprefixPkmnData(value as { [key: string]: unknown })]);
    } else {
      unprefixedData.push([newKey, value]);
    }
  }

  return Object.fromEntries(unprefixedData);
}
