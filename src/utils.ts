export const none = (arr: any, callback: (item: any) => boolean) =>
  !arr.some(callback);
