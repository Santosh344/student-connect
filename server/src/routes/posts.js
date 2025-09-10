import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
export const posts = [];
const r = express.Router();

r.get('/', authenticateToken, (req,res)=> res.json({ items: posts }));

r.post('/', authenticateToken, (req,res)=>{
  const id = posts.length+1;
  const p = {
    id,
    user_id: req.user.id,
    body: req.body?.body||'',
    mediaUrl: '',
    created_at: new Date().toISOString()
  };
  posts.unshift(p);
  res.json(p);
});

export default r;
