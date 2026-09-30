// middleware.ts
export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    // Rotas protegidas que exigem login
    '/treinar/:path*',
    '/evolucao/:path*',
  ],
};