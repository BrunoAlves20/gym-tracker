// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    /*
     * Protege todas as rotas exceto:
     * - login
     * - api/auth (rotas do próprio next-auth)
     * - api/health, api/create-test-user, api/seed-exercises (rotas de teste/utilitárias)
     * - arquivos estáticos (_next/static, _next/image, favicon.ico, svgs)
     */
    "/((?!login|api/auth|api/health|api/create-test-user|api/seed-exercises|_next/static|_next/image|favicon.ico|.*\\.svg).*)",
  ],
};