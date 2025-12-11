# Arquitetura do Sistema HelpNow

## Visão Geral

O HelpNow é construído com uma arquitetura moderna baseada em serviços gerenciados (Firebase) e desenvolvimento low-code (FlutterFlow) para acelerar o MVP.

## Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                     APLICATIVOS MOBILE                       │
│                    (iOS + Android)                           │
│                     FlutterFlow                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/WSS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    FIREBASE PLATFORM                         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Firebase   │  │  Firestore   │  │   Storage    │      │
│  │     Auth     │  │   Database   │  │   (Files)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Cloud     │  │     FCM      │  │   Analytics  │      │
│  │  Functions   │  │(Notifications)│  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
        ┌──────────────┐        ┌──────────────┐
        │   Stripe     │        │ Google Maps  │
        │     API      │        │     API      │
        │  (Pagamento) │        │(Geolocalização)│
        └──────────────┘        └──────────────┘
                            │
                            ▼
                ┌──────────────────────┐
                │  Admin Dashboard     │
                │   (FlutterFlow Web)  │
                └──────────────────────┘
```

## Componentes Principais

### 1. Camada de Apresentação

#### Mobile App (FlutterFlow)
- **Tecnologia:** FlutterFlow (Flutter compilado)
- **Plataformas:** iOS e Android
- **Responsabilidades:**
  - Interface do usuário
  - Navegação entre telas
  - Validação de dados
  - Gerenciamento de estado local
  - Cache de dados

#### Admin Dashboard (FlutterFlow Web)
- **Tecnologia:** FlutterFlow Web
- **Responsabilidades:**
  - Gestão de usuários
  - Monitoramento de serviços
  - Relatórios financeiros
  - Aprovação de profissionais

### 2. Camada de Serviços (Firebase)

#### Firebase Authentication
- **Responsabilidades:**
  - Registro e login de usuários
  - Autenticação por e-mail/senha
  - Recuperação de senha
  - Gestão de sessões
  - Tokens JWT

#### Cloud Firestore
- **Tipo:** NoSQL Document Database
- **Responsabilidades:**
  - Armazenamento de dados
  - Queries em tempo real
  - Sincronização offline
  - Regras de segurança

**Coleções Principais:**
```
firestore/
├── users/                  # Dados dos usuários
├── professionals/          # Perfis de profissionais
├── services/              # Catálogo de serviços
├── service_requests/      # Solicitações de serviço
├── payments/              # Registro de pagamentos
├── reviews/               # Avaliações
├── chats/                 # Conversas
└── notifications/         # Notificações
```

#### Firebase Storage
- **Responsabilidades:**
  - Armazenamento de fotos de perfil
  - Documentos de verificação
  - Imagens de serviços
  - Arquivos do chat

#### Firebase Cloud Functions
- **Linguagem:** JavaScript/TypeScript
- **Responsabilidades:**
  - Lógica de negócio no servidor
  - Webhooks do Stripe
  - Envio de notificações
  - Processamento de pagamentos
  - Validações complexas
  - Geração de relatórios

#### Firebase Cloud Messaging (FCM)
- **Responsabilidades:**
  - Notificações push
  - Alertas de novos pedidos
  - Confirmações de pagamento
  - Mensagens do chat

### 3. Integrações Externas

#### Stripe API
- **Responsabilidades:**
  - Processamento de pagamentos
  - Cartão de crédito/débito
  - Apple Pay
  - Google Pay
  - Gestão de refunds
  - Webhooks de pagamento

#### Google Maps API
- **Responsabilidades:**
  - Geolocalização
  - Mapa interativo
  - Busca de endereços
  - Cálculo de distâncias
  - Autocomplete de endereços

## Fluxo de Dados

### 1. Cadastro de Usuário

```
App → Firebase Auth (criar conta)
    → Cloud Function (criar perfil)
    → Firestore (salvar dados)
    → App (retornar sucesso)
```

### 2. Busca de Profissional

```
App → obter localização GPS
    → Firestore Query (profissionais próximos)
    → Google Maps (exibir no mapa)
    → App (listar resultados)
```

### 3. Solicitação de Serviço

```
App → Firestore (criar service_request)
    → Cloud Function (notificar profissional)
    → FCM (push notification)
    → Profissional recebe notificação
```

### 4. Processamento de Pagamento

```
App → Stripe Checkout
    → Stripe API (processar pagamento)
    → Webhook → Cloud Function
    → Firestore (atualizar status)
    → FCM (confirmar para cliente)
```

### 5. Chat em Tempo Real

```
Cliente → Firestore (escrever mensagem)
    → Realtime Listener (sincronização)
    → Profissional (receber mensagem)
    → FCM (notificação se offline)
```

## Segurança

### Firebase Security Rules

```javascript
// Exemplo de regra Firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users podem ler apenas seu próprio perfil
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId;
    }

    // Service requests visíveis para cliente e profissional
    match /service_requests/{requestId} {
      allow read: if request.auth.uid == resource.data.clientId
                  || request.auth.uid == resource.data.professionalId;
      allow create: if request.auth.uid == request.resource.data.clientId;
    }
  }
}
```

### Autenticação e Autorização

- **JWT Tokens** via Firebase Auth
- **Role-based access control** (cliente, profissional, admin)
- **API Keys** protegidas por regras de segurança
- **HTTPS obrigatório** em todas as comunicações
- **Validação server-side** em Cloud Functions

### Proteção de Dados

- **Dados sensíveis criptografados** no Firestore
- **PCI DSS compliance** via Stripe
- **GDPR compliance** para dados europeus
- **Backup automático** diário do Firestore

## Escalabilidade

### Estratégias

1. **Firestore Auto-scaling**
   - Escalabilidade automática de leitura/escrita
   - Queries otimizadas com índices compostos

2. **Cloud Functions Auto-scaling**
   - Instâncias sob demanda
   - Timeout configurável

3. **CDN para Assets**
   - Firebase Hosting para arquivos estáticos
   - Cache de imagens

4. **Geolocalização Otimizada**
   - Geohashing para queries espaciais
   - Índices geográficos

### Limites do Firebase (Free Tier)

| Recurso | Limite Gratuito |
|---------|----------------|
| Firestore Reads | 50k/dia |
| Firestore Writes | 20k/dia |
| Cloud Functions | 2M invocações/mês |
| Storage | 5 GB |
| FCM | Ilimitado |

**Plano pago necessário quando:**
- > 1000 usuários ativos
- > 10k transações/dia
- > 100 GB armazenamento

## Monitoramento

### Firebase Analytics
- Eventos de usuário
- Conversões
- Retention
- Crash reports

### Logging
- Cloud Functions logs
- Firestore audit logs
- Stripe webhooks logs

### Alertas
- Erros de pagamento
- Falhas de Cloud Functions
- Uso de quota
- Performance degradation

## Backup e Disaster Recovery

1. **Firestore Backups**
   - Export automático diário
   - Armazenamento em Google Cloud Storage

2. **Rollback Strategy**
   - Cloud Functions versioning
   - Firestore restore point-in-time

3. **Redundância**
   - Multi-region Firebase
   - Stripe failover

## Evolução da Arquitetura (Pós-MVP)

### Curto Prazo
- Adicionar Redis para cache
- Implementar rate limiting
- Adicionar testes E2E

### Médio Prazo
- Microserviços especializados
- Machine Learning para matching
- Sistema de recomendação

### Longo Prazo
- Migração para Kubernetes
- Backend próprio em Node.js/Python
- Data warehouse para analytics

---

**Última atualização:** 2025-12-11
