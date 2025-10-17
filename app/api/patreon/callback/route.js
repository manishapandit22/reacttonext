import { patreonOAuth } from "@/lib/apis/patreon";

export default async function handler(req, res) {
  const { code } = req.query;
  
  try {
    const tokens = await patreonOAuth.getTokens(code);
    
    res.redirect('/patreon-success');
  } catch (error) {
    console.error('Patreon authentication error:', error);
    res.redirect('/error');
  }
}