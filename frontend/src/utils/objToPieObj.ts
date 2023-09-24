import ColorHash from "color-hash";

type PieObj = {
  id: string | number;
  label: string;
  value: number;
  color: string;
};

export function convertData<T extends Record<string, number>>(
  object: Partial<T>,
): PieObj[] {
  const colorHash = new ColorHash();

  const convertedData: PieObj[] = [];

  Object.keys(object).forEach(key => {
    const color = colorHash.hex(key);
    convertedData.push({
      id: key,
      label: key,
      value: object[key]!,
      color,
    });
  });

  return convertedData;
}
