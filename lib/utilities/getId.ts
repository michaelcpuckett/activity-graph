export const getId = (thing?: null | string | { id?: string | null }): string => {
  if (!thing) {
    return '';
  }

  if (typeof thing === 'string') {
    return thing;
  }

  if ('id' in thing && thing.id) {
    return thing.id;
  }

  return '';
};
