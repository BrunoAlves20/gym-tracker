// app/login/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div style={{
      backgroundColor: '#181a20', // Fundo escuro da referência
      minHeight: '100vh',
      color: '#ffffff',
      fontFamily: 'system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px'
    }}>
      
      {/* Botão de voltar oculto por simplicidade, mas espaço mantido */}
      <div style={{ height: '40px', marginTop: '20px' }}>
        <Link href="/" style={{ color: '#fff', textDecoration: 'none', fontSize: '1.5rem' }}>←</Link>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: '400px', width: '100%', margin: '0 auto' }}>
        
        <h1 style={{ fontSize: '2.5rem', marginBottom: '40px', fontWeight: 'bold' }}>
          Entre com sua<br/>Conta
        </h1>

        {/* Inputs com design arredondado e escuro */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              backgroundColor: '#1f222a',
              border: 'none',
              padding: '18px 20px',
              borderRadius: '16px',
              color: '#fff',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              backgroundColor: '#1f222a',
              border: 'none',
              padding: '18px 20px',
              borderRadius: '16px',
              color: '#fff',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Checkbox Remember me */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <input type="checkbox" id="remember" style={{ accentColor: '#6a4df4', width: '18px', height: '18px' }} />
          <label htmlFor="remember" style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Lembrar-me</label>
        </div>

        {/* Botão Roxo Vibrante */}
        <button 
          onClick={async () => {
            // Chama o NextAuth para validar as credenciais
            const result = await signIn('credentials', {
              email,
              password,
              redirect: true,
              callbackUrl: '/', // Se o login der certo, manda para a Home (Ficha)
            });
          }}
          style={{
            backgroundColor: '#6a4df4',
            color: '#fff',
            border: 'none',
            padding: '18px',
            borderRadius: '30px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginBottom: '24px',
            boxShadow: '0 4px 15px rgba(106, 77, 244, 0.4)'
          }}>
          Sign in
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px', color: '#616161' }}>
          <span>ou continue com</span>
        </div>

        {/* Botões Sociais */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '40px' }}>
          {['Facebook', 'Google', 'Apple'].map((provider) => (
            <button key={provider} style={{
              backgroundColor: '#1f222a',
              border: '1px solid #35383f',
              borderRadius: '16px',
              padding: '14px 24px',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}>
              {provider}
            </button>
          ))}
        </div>

        <div style={{ textAlign: 'center', fontSize: '0.9rem', color: '#9e9e9e' }}>
          Don't have an account? <span style={{ color: '#6a4df4', fontWeight: 'bold', cursor: 'pointer' }}>Sign up</span>
        </div>

      </div>
    </div>
  );
}