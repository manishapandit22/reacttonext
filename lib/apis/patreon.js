import { oauth } from 'patreon';

const CLIENT_ID = process.env.PATREON_CLIENT_ID;
const CLIENT_SECRET = process.env.PATREON_CLIENT_SECRET;
const REDIRECT_URL = process.env.PATREON_REDIRECT_URI;

export const patreonOAuth = oauth(CLIENT_ID, CLIENT_SECRET);

export async function getPatronInfo(accessToken) {
  const apiClient = patreonOAuth(accessToken);
  const { rawJson } = await apiClient('/current_user');
  return rawJson;
}