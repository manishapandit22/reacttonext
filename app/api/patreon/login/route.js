import { patreonOAuth } from "@/lib/apis/patreon";


export default function handler(req, res) {
  const redirectURL = patreonOAuth.getAuthorizationURL();
  res.redirect(redirectURL);
}