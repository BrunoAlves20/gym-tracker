# 🏋️ Gym AI Coach

Um aplicativo web moderno que atua como um personal trainer inteligente. Ele utiliza Inteligência Artificial para gerar planos de treino personalizados com base nas limitações, objetivos e disponibilidade do usuário, além de permitir o registro de cargas em tempo real para comprovar a sobrecarga progressiva e a evolução na academia.

## ✨ Funcionalidades

- **🤖 Entrevista com Instrutor IA:** Questionário interativo que coleta dados do usuário (objetivo, experiência, frequência, restrições) para gerar uma divisão de treino biomecanicamente estruturada.
- **📚 Catálogo de Exercícios:** Integração com mais de 150 exercícios reais (via ExerciseDB), incluindo músculos-alvo, equipamentos necessários e GIFs demonstrativos.
- **📝 Workout Logger (Diário de Treino):** Interface otimizada para o momento do treino, permitindo registrar rapidamente o peso e as repetições de cada série concluída.
- **📈 Dashboard de Evolução:** Gráficos interativos (gerados nativamente em SVG) que comprovam o resultado mostrando o aumento da carga máxima e o volume total acumulado por exercício ao longo do tempo.

## 🛠️ Tecnologias Utilizadas

- **Frontend & Backend:** [Next.js](https://nextjs.org/) (App Router) com React e TypeScript.
- **Banco de Dados:** [Neon Serverless Postgres](https://neon.tech/) (PostgreSQL na nuvem).
- **Inteligência Artificial:** [Google Gemini API](https://aistudio.google.com/) (Modelo `gemini-3.5-flash`).
- **API de Exercícios:** [ExerciseDB via RapidAPI](https://rapidapi.com/).

## 🚀 Como rodar o projeto localmente

### 1. Pré-requisitos
- Node.js (v18+ recomendado)
- Conta no [Neon.tech](https://neon.tech/) (para o banco de dados)
- Chave de API do [Google AI Studio](https://aistudio.google.com/)
- Chave da API [ExerciseDB na RapidAPI](https://rapidapi.com/)

### 2. Instalação e Configuração

Clone o repositório e instale as dependências:
```bash
git clone [https://github.com/SEU-USUARIO/gym-ai-app.git](https://github.com/SEU-USUARIO/gym-ai-app.git)
cd gym-ai-app
npm install


This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
