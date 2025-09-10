export function isLinkedInUA(req){
  const ua = (req.headers['user-agent']||'').toLowerCase();
  return ua.includes('linkedinbot') || (req.headers.referer||'').includes('linkedin.com');
}

export function isBlockedSocialUA(req){
  const ua = (req.headers['user-agent']||'').toLowerCase();
  const blocked = ['facebookexternalhit','twitterbot','whatsapp','slackbot','telegrambot','discordbot','pinterest','snapchat'];
  return blocked.some(sig => ua.includes(sig));
}
