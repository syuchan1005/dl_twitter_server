import path from 'path';

export const extname = (str: string) => {
  let ext = path.extname(str);
  return ext.match(/\.[a-zA-Z0-9]+/)?.[0] ?? ext.split(/[:\/?]/)[0];
};
