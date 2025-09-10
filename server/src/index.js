import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';

import posts from './routes/posts.js';
import shareRoutes from './routes/share.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Anti-index for public responses
app.use((req,res,next)=>{ res.setHeader('X-Robots-Tag','noindex, noimageindex, nofollow'); next(); });

// health
app.get('/api/health', (req,res)=> res.json({ ok:true }));

// dev login (returns a Bearer token)
app.post('/api/auth/dev-login', (req,res)=>{
  const id = Number(req.body?.id||1);
  const token = jwt.sign({ id }, process.env.JWT_SECRET||'dev_secret');
  res.json({ token, user: { id, name: 'Dev User' } });
});

// API routes
app.use('/api/posts', posts);
app.use('/api/share', shareRoutes);

// Serve SPA static files (built client)
const publicDir = path.join(__dirname, '../public');
app.use(express.static(publicDir));

// Short public token path -> share resolver
app.get('/s/:token', (req,res)=>{
  req.url = `/api/share/resolve/${req.params.token}`;
  app._router.handle(req,res,()=>res.status(404).end());
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

const PORT = process.env.PORT||5000;
app.listen(PORT, ()=> console.log('API listening on', PORT));
