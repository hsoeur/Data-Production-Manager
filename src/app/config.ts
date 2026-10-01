const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');
const runtimeUrl = window.APP_CONFIG?.apiDataBaseUrl?.trim();
const buildUrl = import.meta.env.VITE_API_DATA_BASE_URL?.trim();

export const appConfig = {
  apiDataBaseUrl: trimTrailingSlash(runtimeUrl || buildUrl || 'http://localhost:11000/api'),
};
