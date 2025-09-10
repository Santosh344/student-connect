import jwt from 'jsonwebtoken';
import 'dotenv/config';

export function authenticateToken(req, res, next){
  const h = req.headers.authorization||'';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'no token' });
  try{
    const payload = jwt.verify(token, process.env.JWT_SECRET||'dev_secret');
    req.user = { id: payload.id || 1 };
    next();
  }catch(e){ return res.status(401).json({ error: 'bad token' }); }
}
