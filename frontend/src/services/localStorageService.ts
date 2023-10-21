const getFromLocalStorage = (key: string): string | null =>
  localStorage.getItem(key) || null;

const setToLocalStorage = (key: string, value: string): void =>
  localStorage.setItem(key, value);

const removeFromLocalStorage = (key: string): void => {
  localStorage.removeItem(key);
};

// auth services
const getAuthTokensFromLocalStorage = (): string | null =>
  getFromLocalStorage("cms_auth");

const setAuthTokensToLocalStorage = (value: string): void =>
  setToLocalStorage("cms_auth", value);

const removeAuthTokensFromLocalStorage = (): void =>
  removeFromLocalStorage("cms_auth");

const getAccessToken = (): string | undefined => {
  const strValue = getAuthTokensFromLocalStorage();
  const parsedValue = strValue ? JSON.parse(strValue) : null;
  return parsedValue?.access;
};

const getRefreshToken = (): string | undefined => {
  const strValue = getAuthTokensFromLocalStorage();
  const parsedValue = strValue ? JSON.parse(strValue) : null;
  return parsedValue?.refresh;
};

export const localStorageServices = {
  getFromLocalStorage,
  setToLocalStorage,
  removeFromLocalStorage,
  getAuthTokensFromLocalStorage,
  setAuthTokensToLocalStorage,
  removeAuthTokensFromLocalStorage,
  getAccessToken,
  getRefreshToken,
};
