'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Root() {
  const router = useRouter();
  useEffect(() => { router.replace('/login'); }, []);
  return (
    <div style={{ minHeight:'100vh', background:'#070b16', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontFamily:'Cinzel,serif', fontSize:'11px', letterSpacing:'3px', color:'rgba(212,175,55,0.4)' }}>
        LOADING...
      </div>
    </div>
  );
}
