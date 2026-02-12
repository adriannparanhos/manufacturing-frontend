# 🏭 Manufacturing Control System - Frontend Web

![Status](https://img.shields.io/badge/Status-Concluído-brightgreen) ![React](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Vite](https://img.shields.io/badge/Build-Vite-purple)

Este repositório contém o **Frontend** da aplicação de Controle de Produção Industrial. Trata-se de uma Single Page Application (SPA) moderna, desenvolvida com **React** e **TypeScript**, focada em alta performance, tipagem estática segura e uma experiência de usuário (UX) polida e responsiva.

A aplicação se conecta à [Manufacturing API](link-para-o-repo-backend-se-tiver) para gerenciar estoques, produtos e realizar o planejamento inteligente de produção.

---

## 📋 Índice

- [Funcionalidades e UX](#-funcionalidades-e-ux)
- [Stack Tecnológico](#-stack-tecnológico)
- [Decisões de Arquitetura](#-decisões-de-arquitetura)
- [Instalação e Execução](#-instalação-e-execução)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Testes](#-testes)

---

## ✨ Funcionalidades e UX

O foco deste frontend foi transformar dados técnicos (CRUD) em informações visuais estratégicas.

### 1. 📊 Dashboard Executivo
Uma visão geral do negócio em tempo real.
- **KPIs Visuais:** Cards com Receita Potencial, Produtos Ativos, Insumos e Alertas Críticos.
- **Feedback de Carregamento:** Implementação de **Skeleton Loading** (esqueletos cinzas) enquanto os dados são buscados, evitando o "layout shift" e melhorando a percepção de velocidade.
- **Micro-interações:** Efeitos de hover e transições suaves nos cards.

### 2. 🧠 Planejamento de Produção Inteligente
A tela principal do sistema, onde o operador toma decisões.
- **Sugestão Automática:** Exibe uma tabela com o plano de produção ideal calculado pelo algoritmo do backend (Guloso/Greedy), priorizando itens de maior valor agregado.
- **Simulador Manual:** Permite ao operador inserir ordens de produção manualmente.
- **Validação em Tempo Real:** O botão "Produzir" e os inputs bloqueiam operações caso não haja matéria-prima suficiente, prevenindo erros operacionais.

### 3. 📦 Gestão Visual de Estoque
- **Barra de Progresso de Comprometimento:** Cada item de estoque possui uma barra visual que indica quanto daquele material está "reservado" pela sugestão automática de produção.
- **Indicadores de Cor:**
  - 🟢 **Verde:** Estoque confortável.
  - 🟠 **Laranja:** Estoque comprometido (>50%).
  - 🔴 **Vermelho:** Estoque crítico/esgotado (>90%).

### 4. 🛠️ Catálogo de Produtos Dinâmico
- **Receitas Complexas:** Formulário que permite adicionar múltiplos ingredientes (Matérias-Primas) para compor um produto.
- **Chips de Status:** A lista de produtos calcula automaticamente se um item é "Produzível" ou se "Falta Estoque" baseando-se nos insumos atuais, exibindo *Chips* coloridos (Verde/Vermelho) para rápida leitura.

### 5. 🔔 Sistema de Notificações
- Substituição completa de `alert()` nativos por **Snackbars (Toasts)** do Material UI, oferecendo feedback não intrusivo para ações de Sucesso, Erro ou Aviso.

---

## 💻 Stack Tecnológico

- **Core:** React 18, TypeScript, Vite.
- **UI Framework:** Material UI (MUI v5) - Escolhido pela robustez, acessibilidade e sistema de Grid responsivo.
- **Ícones:** MUI Icons Material.
- **Comunicação HTTP:** Axios (configurado com baseURL e interceptors).
- **Testes:** Vitest (Runner), JSDOM (Ambiente) e React Testing Library (Interações).
- **Code Quality:** ESLint.

---

## 🏛️ Decisões de Arquitetura

1.  **Vite:** Optou-se pelo **Vite** devido à velocidade de build (esbuild) e Hot Module Replacement (HMR) instantâneo.
2.  **Configuração de Proxy:** Para evitar problemas de CORS durante o desenvolvimento local, foi configurado um proxy no `vite.config.ts` que redireciona chamadas `/api` para `http://localhost:8080`.
3.  **Separação de Responsabilidades:**
    - **`services/api.ts`:** Centraliza a configuração do Axios. Nenhum componente faz `fetch` nativo.
    - **`types/`:** Interfaces TypeScript compartilhadas (ex: `Product`, `ProductionPlan`) para garantir que o Front e o Back falem a mesma língua.
    - **`pages/` vs `components/`:** Páginas gerenciam estado e dados; Componentes são (majoritariamente) puramente visuais.

---

## 🚀 Instalação e Execução

### Pré-requisitos
- **Node.js** (v18+)
- **Backend Rodando** (A API deve estar ativa em `localhost:8080` para que os dados carreguem).

### Passo a Passo

1.  **Clone o repositório:**
    ```bash
    git clone <https://github.com/adriannparanhos/manufacturing-frontend.git>
    cd frontend-web
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Rode o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

4.  **Acesse:** Abra `http://localhost:5173` no seu navegador.

---

## 📂 Estrutura do Projeto

```bash
src/
├── assets/          
├── components/      
├── pages/           
│   ├── Dashboard.tsx
│   ├── Planning.tsx
│   ├── Products.tsx
│   ├── RawMaterials.tsx
│   └── __tests__/   
├── services/        
├── types/           
├── App.tsx          
├── main.tsx         
└── setupTests.ts    