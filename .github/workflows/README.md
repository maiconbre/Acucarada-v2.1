# CI/CD Workflows

Este projeto utiliza GitHub Actions para automação de CI/CD, com foco integral em **velocidade**, **segurança de código** e **PRs limpos**.

## 📋 Workflows Disponíveis

### 1. Main Branch CI/CD (`main.yml`)
**Trigger:** Push e Pull Requests para a branch `main`.

**Funcionalidades:**
- ✅ Instalação rápida de dependências.
- 🔍 Linting de código rigoroso.
- ⚡ **Testes Unitários:** Execução rápida (Vitest) validando Use Cases e a camada de Domínio (Clean Architecture).
- 🏗️ Build da aplicação principal.
- 📦 Upload e cache de artefatos.

### 2. Develop Branch CI (`develop.yml`)
**Trigger:** Push e Pull Requests para a branch `develop`.

**Funcionalidades:**
- ✅ Instalação e verificação de integridade (Type Check).
- 🔍 Linting e preenchimento de regras de qualidade.
- ⚡ **Testes Unitários:** Execução garantida para blindar a entrada de código ruim na branch de desenvolvimento.
- 🏗️ Build do ambiente de desenvolvimento (Early feedback).

## 🚀 Filosofia do CI/CD

A pipeline do Açucarada foi desenhada para otimizar e padronizar o processo de desenvolvimento, com foco em:
- **Testes super rápidos:** Toda a validação acontece focada na camada core (Domain/Application), o que resulta em testes rodando em poucos segundos e sem travar os Pull Requests.
- **Fail-Fast:** Regras de ESLint e Typescript (`type-check`) rodam antes, abortando pipelines fadadas ao erro.

