import express from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../middleware/auth.js';
import { isLinkedInUA, isBlockedSocialUA } from '../middleware/shareGuards.js';
import { posts } from './posts.js';

const r = express.Router();
const TTL = parseInt(process.env.SHARE_TTL_SECONDS||'1800',10);
const ALLOWED = (process.env.ALLOWED_SHARE_TARGETS||'linkedin').split(',').map(s=>s.trim());

function signShare(payload){
  return jwt.sign(payload, process.env.SHARE_JWT_SECRET, { expiresIn: TTL });
}

function getPostMeta(id){
  const p = posts.find(x=> x.id === Number(id));
  if (!p) return null;
  return {
    id: p.id,
    body: p.body,
    mediaUrl: p.mediaUrl || '',
    authorName: 'Student Connect User',
    created_at: p.created_at
  };
}

// Issue a tokenized share URL (only for allowed targets)
r.post('/issue/:id', authenticateToken, (req,res)=>{
  const postId = Number(req.params.id);
  const target = String(req.query.target||'').toLowerCase();
  if (!ALLOWED.includes(target)) return res.status(403).json({ error:'share target not allowed' });
  const meta = getPostMeta(postId);
  if (!meta) return res.status(404).json({ error:'post not found' });
  const v = new Date(meta.created_at).getTime();
  const token = signShare({ pid: postId, t: target, v });
  const url = `${req.protocol}://${req.get('host')}/s/${token}`;
  res.json({ url, expiresIn: TTL });
});

// Public resolver (LinkedIn only)
r.get('/resolve/:token', (req,res)=>{
  if (isBlockedSocialUA(req) && !isLinkedInUA(req)) return res.status(403).end();
  try{
    const payload = jwt.verify(req.params.token, process.env.SHARE_JWT_SECRET);
    if (payload.t !== 'linkedin') return res.status(403).end();
    const meta = getPostMeta(payload.pid);
    if (!meta) return res.status(404).end();

    res.setHeader('X-Robots-Tag','noindex, noimageindex, nofollow');
    const title = `${meta.authorName} on Student Connect`;
    const desc  = (meta.body||'').slice(0,180);
    const image = meta.mediaUrl && /(png|jpe?g|webp|gif)$/i.test(meta.mediaUrl) ? meta.mediaUrl : '';
    const canonical = `${req.protocol}://${req.get('host')}/post/${meta.id}`;

    const html = `<!doctype html><html><head>
      <meta charset="utf-8">
      <meta name="robots" content="noindex,nofollow,noimageindex">
      <meta property="og:type" content="article">
      <meta property="og:title" content="${title}">
      <meta property="og:description" content="${desc}">
      ${image ? `<meta property="og:image" content="${image}">` : ``}
      <meta property="og:url" content="${canonical}">
      <meta name="twitter:card" content="summary">
      <title>${title}</title>
      <meta http-equiv="refresh" content="0; url='${canonical}'" />
    </head><body>Redirecting…</body></html>`;
    res.status(200).send(html);
  }catch(e){
    return res.status(400).end();
  }
});

export default r;
