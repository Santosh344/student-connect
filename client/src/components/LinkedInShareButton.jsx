import React from 'react';
const API = import.meta.env.VITE_API_URL || ''; // same-origin in single-app hosting

export default function LinkedInShareButton({ postId, token }){
  async function share(){
    const r = await fetch(`${API}/api/share/issue/${postId}?target=linkedin`, {
      method:'POST', headers:{ Authorization:`Bearer ${token}` }
    });
    const d = await r.json();
    if (!r.ok) return alert(d.error||'Share failed');
    const li = new URL('https://www.linkedin.com/sharing/share-offsite/');
    li.searchParams.set('url', d.url);
    window.open(li.toString(), '_blank', 'noopener,noreferrer');
  }
  return (
    <button onClick={share} style={{background:'#0a66c2',color:'#fff',border:'none',padding:'6px 10px',borderRadius:6,fontSize:12}}>
      Share on LinkedIn
    </button>
  );
}
