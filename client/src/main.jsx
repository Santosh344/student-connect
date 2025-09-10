import React from 'react';
import { createRoot } from 'react-dom/client';
import LinkedInShareButton from './components/LinkedInShareButton.jsx';

const API = import.meta.env.VITE_API_URL || ''; // same-origin

function App(){
  const [token,setToken]=React.useState('');
  const [text,setText]=React.useState('');
  const [items,setItems]=React.useState([]);

  async function login(){
    const r=await fetch(`${API}/api/auth/dev-login`,{
      method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id: 1 })
    });
    const d=await r.json(); setToken(d.token);
  }
  async function post(){
    if (!token) return alert('Click Dev Login first');
    const r=await fetch(`${API}/api/posts`,{
      method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`},
      body: JSON.stringify({ body: text })
    });
    const d=await r.json(); setItems(v=>[d,...v]); setText('');
  }

  return (
    <div style={{padding:16, maxWidth:640, margin:'0 auto', fontFamily:'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif'}}>
      <h1>Student Connect (LinkedIn-only sharing demo)</h1>
      <div style={{display:'flex', gap:8, marginBottom:12}}>
        <button onClick={login}>Dev Login</button>
        <input value={text} onChange={e=>setText(e.target.value)} placeholder="Post something…" style={{flex:1}} />
        <button onClick={post}>Post</button>
      </div>
      <ul style={{listStyle:'none', padding:0}}>
        {items.map(p=> (
          <li key={p.id} style={{border:'1px solid #ddd', borderRadius:8, padding:12, marginBottom:10}}>
            <div style={{fontSize:12, color:'#666'}}>{new Date(p.created_at).toLocaleString()}</div>
            <div style={{marginTop:6}}>{p.body||<i>(no text)</i>}</div>
            <div style={{marginTop:8}}>
              <LinkedInShareButton postId={p.id} token={token}/>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App/>);
