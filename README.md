# Açucarada 🍫

> **Plataforma digital completa para confeitarias artesanais com gestão e analytics integrados**

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green.svg)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-blue.svg)](https://tailwindcss.com/)
[![Clean Architecture](https://img.shields.io/badge/Architecture-Clean-brightgreen.svg)](#)

## 📋 Sobre o Projetoo

Plataforma completa para digitalização de confeitarias artesanais. O sistema integra uma **vitrine digital** focada na experiência do cliente com um **painel administrativo** moderno para gestão de catálogo e métricas, abordando o ciclo completo (end-to-end) de uma aplicação web.

**Destaques Técnicos:**
- **Clean Architecture:** Desacoplamento de regras de negócios, garantindo manutenibilidade e isolamento da camada de domínio.
- **Segurança:** Autenticação e controle de acesso via Row Level Security (RLS) implementados no Supabase.
- **Gestão de Estado:** Gerenciamento eficiente de server state com TanStack Query e formulários tipados via Zod.
- **Performance:** Pipeline automatizado de otimização de imagens para formato WebP.
- Dashboard de analytics com métricas calculadas em tempo real.
- Design System escalável e responsivo utilizando Tailwind CSS e shadcn/ui.

---

## 🛠️ Stack Tecnológica

**Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui  
**Backend:** Supabase (PostgreSQL + Auth + Storage + Real-time)  
**Arquitetura:** Clean Architecture (Camadas de Domínio, Aplicação, Dados e Infraestrutura)  
**Principais libs:** React Router, TanStack Query, React Hook Form + Zod, Vitest para testes automatizados.

### 📁 Estrutura do Projeto (Clean Architecture)

Para garantir alta manutenibilidade e separar as regras de negócio das camadas de interface visual, o projeto foi dividido e estruturado de acordo com o Clean Architecture:

```text
src/
├── core/                  # Núcleo da Aplicação (Clean Architecture)
│   ├── domain/            # Entidades, Types e Interfaces (Regras de negócio centrais)
│   ├── application/       # Casos de uso (Use Cases) e Hooks de domínio
│   ├── data/              # Repositórios (Implementações das interfaces do domínio)
│   └── infrastructure/    # Integrações externas (Supabase, Fetchers)
├── components/            # Componentes visuais globais
│   ├── admin/             # Componentes específicos do painel admin
│   ├── home/              # Componentes da vitrine e tela inicial
│   └── ui/                # Componentes base e design system (shadcn/ui)
├── pages/                 # Páginas (Views) conectadas às rotas
├── hooks/                 # Custom hooks de UI (interface-specific)
├── lib/                   # Utilitários e configurações (ex: utils do Tailwind)
└── types/                 # Definições de tipos TypeScript globais

supabase/
├── migrations/            # Migrações do banco de dados relacional
└── setups/                # Scripts de configuração inicial e policies
```

---

## ⚡ Funcionalidades

### 🌐 Área Pública
- **Catálogo interativo** com filtros e busca
- **Páginas de produto** com galeria de sabores
- **Integração WhatsApp** para pedidos
- **Sistema de curtidas** e compartilhamento
- **Design responsivo** mobile-first

### 🔧 Painel Admin
- **CRUD completo** de produtos e categorias
- **Upload de imagens** (principal + sabores individuais) e conversão otimizada
- **Dashboard analytics** com métricas em tempo real
- **Configurações** do sistema (WhatsApp, perfil)
- **Autenticação segura** com controle de acesso via Supabase

### 📊 Analytics Integrado
- **Métricas automáticas:** visualizações, curtidas, cliques, compartilhamentos
- **Relatórios visuais** com gráficos interativos
- **Produtos populares** baseado em engajamento
- **Insights de negócio** para tomada de decisão

---

## 🚀 Instalação

**Pré-requisitos:** Node.js 18+, conta Supabase (gratuita)

```bash
# 1. Clone e instale
git clone <repository-url>
cd acucarada-v2
npm install

# 2. Configure ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais do Supabase

# 3. Execute migrações no Supabase Dashboard
# Arquivos disponíveis em: supabase/migrations/

# 4. Configure buckets de storage:
# - product-images
# - product-flavor-images

# 5. Execute a configuração de imagens (Opcional, porém recomendado para WebP)
npm run convert:setup

# 6. Execute o projeto localmente
npm run dev
```

---

## 📱 Como Usar

**Clientes:** Navegue pelo catálogo → Explore produtos → Faça pedidos via WhatsApp  
**Admins:** Acesse `/auth` → Faça o login seguro → Gerencie produtos em `/admin` → Monitore analytics

---

## 🗄️ Banco de Dados

**Tabelas principais:** `products`, `categories`, `profiles`, `product_analytics`, `app_settings`  
**Recursos avançados:** Row Level Security (RLS) para segurança granular, triggers automáticos para atualizações, e buckets otimizados de storage para imagens WebP.

---

## 🔧 Scripts de Automação e Qualidade

Diversos scripts estão prontos em `package.json` para facilitar a esteira de desenvolvimento:

```bash
npm run dev              # Inicia o servidor de desenvolvimento (Vite)
npm run build            # Gera o build transpilado para produção
npm run lint             # Varredura de código usando ESLint
npm run test             # Executa a suíte de testes (Vitest)
npm run convert:images   # Roda script nativo para otimizar imagens para formato WebP
npm run backup:list      # Lista backups ativos do Supabase via CLI
npm run backup:cleanup   # Limpa backups antigos (+30 dias) do Supabase
```

---

## 🚀 Deploy

**Plataformas Recomendadas:** Vercel, Netlify ou ferramentas de hospedagem estática suportadas pelo Vite.  
**Configuração:** Declare as variáveis de ambiente necessárias (URLs do Supabase e tokens), configure o diretório de saída como `dist`, e inicialize o deploy.

---

## 📄 Licença

Projeto real e portfólio de desenvolvimento full-stack modelado sob uma arquitetura limpa (Clean Architecture).

---

**Desenvolvido com ❤️ para modernizar confeitarias artesanais**  
*Açucarada - Onde tradição encontra inovação* 🍫✨
