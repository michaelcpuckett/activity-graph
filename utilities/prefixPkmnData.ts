const prefixPkmnDataArray = (array: Array<unknown>): Array<unknown> => {
  return array.map(item => {
    if (Array.isArray(item)) {
      return prefixPkmnDataArray(item);
    } else if (item && typeof item === 'object') {
      return prefixPkmnData(item as unknown as { [key: string]: unknown });
    } else {
      return item;
    }
  });
}

export const prefixPkmnData = (data: { [key: string]: unknown }) => {
  const unprefixedData: Array<[string, unknown]> = [];

  for (const [key, value] of Object.entries({...data})) {
    const newKey = `poke:${key}`;

    if (Array.isArray(value)) {
      unprefixedData.push([newKey, prefixPkmnDataArray(value)]);
    } else if (value && typeof value === 'object') {
      unprefixedData.push([newKey, prefixPkmnData(value as { [key: string]: unknown })]);
    } else {
      unprefixedData.push([newKey, value]);
    }
  }

  return Object.fromEntries(unprefixedData);
}
