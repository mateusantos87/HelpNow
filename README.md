# HelpNow - Marketplace de Serviços Profissionais

![Status](https://img.shields.io/badge/status-MVP-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Visão Geral

**HelpNow** é uma plataforma mobile que conecta clientes a profissionais de serviços (encanadores, eletricistas, pintores, handymen, etc.) de forma rápida e segura, com geolocalização em tempo real e pagamento integrado.

## Objetivo do MVP

- Permitir que **clientes** encontrem profissionais próximos por categoria e localização
- Permitir que **profissionais** se cadastrem, gerenciem disponibilidade e recebam pagamentos
- Implementar **pagamento seguro** via Stripe (cartão, Apple Pay, Google Pay)
- Funcionar em **Android e iOS**
- Ter **dashboard administrativo** para gestão e monitoramento

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| **Mobile App** | FlutterFlow (iOS + Android) |
| **Backend** | Firebase Firestore |
| **Autenticação** | Firebase Auth |
| **Pagamentos** | Stripe API |
| **Geolocalização** | Google Maps API |
| **Notificações** | Firebase Cloud Messaging |
| **Admin Dashboard** | FlutterFlow Web |

## Perfis de Usuários

### Cliente
- Cadastro/login com e-mail
- Buscar profissionais por categoria ou localização
- Solicitar serviços
- Chat com profissional
- Avaliar serviços
- Pagamento via Stripe

### Profissional
- Cadastro/login com verificação
- Gerenciar categorias e serviços oferecidos
- Gerenciar disponibilidade
- Receber notificações de solicitações
- Aceitar/recusar pedidos
- Receber pagamentos

### Administrador
- Dashboard web
- Listar usuários e serviços
- Monitorar pagamentos
- Aprovar/reprovar profissionais
- Relatórios básicos

## Estrutura do Projeto

```
HelpNow/
├── docs/                      # Documentação completa
│   ├── architecture/          # Diagramas e arquitetura
│   ├── api/                   # Documentação de APIs
│   ├── user-guides/           # Guias de usuário
│   └── setup/                 # Guias de configuração
├── backend/                   # Backend e Cloud Functions
│   ├── firebase/              # Regras e configuração Firebase
│   ├── cloud-functions/       # Firebase Cloud Functions
│   └── stripe-integration/    # Integração com Stripe
├── mobile/                    # Aplicativo mobile
│   ├── flutterflow-config/    # Configuração do FlutterFlow
│   ├── assets/                # Imagens, ícones, etc
│   └── screens/               # Documentação de telas
├── admin-dashboard/           # Dashboard administrativo
└── infrastructure/            # Scripts e configuração
    ├── firebase-config/       # Configuração Firebase
    ├── deployment/            # Scripts de deploy
    └── scripts/               # Utilitários
```

## Primeiros Passos

### Pré-requisitos

- Conta no [FlutterFlow](https://flutterflow.io/) (Standard - €25/mês)
- Conta no [Firebase](https://firebase.google.com/) (Free Tier)
- Conta no [Stripe](https://stripe.com/) (1.4% + €0.25 por transação)
- Conta Google Cloud (para Maps API)
- Conta Apple Developer (€99/ano) - para publicar no iOS
- Conta Google Play Console (€25 uma vez) - para publicar no Android

### Configuração Inicial

1. Clone o repositório:
```bash
git clone https://github.com/mateusantos87/HelpNow.git
cd HelpNow
```

2. Siga os guias de configuração:
   - [Configurar Firebase](docs/setup/firebase-setup.md)
   - [Configurar Stripe](docs/setup/stripe-setup.md)
   - [Configurar FlutterFlow](docs/setup/flutterflow-setup.md)
   - [Configurar Google Maps API](docs/setup/maps-setup.md)

## Roadmap do MVP

- [ ] **Fase 1: Configuração Inicial** (1 semana)
  - Configurar Firebase (Firestore, Auth, Storage)
  - Configurar Stripe
  - Configurar Google Maps API
  - Setup FlutterFlow

- [ ] **Fase 2: Autenticação e Perfis** (1 semana)
  - Telas de login/cadastro
  - Perfis de cliente e profissional
  - Estrutura do banco de dados

- [ ] **Fase 3: Busca e Geolocalização** (1 semana)
  - Busca por categoria
  - Mapa com profissionais próximos
  - Filtros básicos

- [ ] **Fase 4: Solicitação de Serviços** (1 semana)
  - Fluxo de solicitação
  - Notificações push
  - Aceitação/recusa de pedidos

- [ ] **Fase 5: Pagamentos** (1 semana)
  - Integração com Stripe
  - Checkout seguro
  - Apple Pay e Google Pay

- [ ] **Fase 6: Chat e Avaliações** (1 semana)
  - Chat básico Firebase
  - Sistema de avaliações
  - Histórico de serviços

- [ ] **Fase 7: Dashboard Admin** (1 semana)
  - Listar usuários e serviços
  - Monitorar pagamentos
  - Aprovar profissionais

- [ ] **Fase 8: Testes e Publicação** (1 semana)
  - Testes de integração
  - Publicação nas lojas

**Tempo Estimado Total:** 6-8 semanas

## Estimativa de Custos (MVP)

| Item | Custo |
|------|-------|
| FlutterFlow Standard | €25/mês |
| Firebase Free Tier | €0 |
| Stripe | 1.4% + €0.25/transação |
| Google Play Console | €25 (uma vez) |
| Apple Developer | €99/ano |
| Domínio (opcional) | €10-20/mês |
| **Total Inicial** | **~€150-200** |
| **Mensal Recorrente** | **~€25-40** |

## Funcionalidades Futuras (Pós-MVP)

- Avaliações detalhadas e sistema de reputação
- Reservas recorrentes e agendamento
- Subscrição premium para profissionais
- Matching inteligente por ML
- Chat com fotos e documentos
- Relatórios financeiros avançados
- Multi-idioma
- Programa de referência
- Sistema de cupons/promoções

## Documentação

- [Arquitetura do Sistema](docs/architecture/system-architecture.md)
- [Estrutura do Banco de Dados](docs/architecture/database-schema.md)
- [Fluxos de Usuário](docs/architecture/user-flows.md)
- [API Reference](docs/api/README.md)
- [Guia de Contribuição](docs/CONTRIBUTING.md)

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## Contato

Para dúvidas ou sugestões, abra uma issue no GitHub.

---

**HelpNow** - Conectando quem precisa com quem resolve.
