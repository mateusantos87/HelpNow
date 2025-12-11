# Estrutura do Banco de Dados - HelpNow

## Visão Geral

O HelpNow utiliza **Firebase Firestore**, um banco de dados NoSQL orientado a documentos. Esta estrutura foi projetada para o MVP com foco em simplicidade e escalabilidade.

## Coleções Principais

### 1. users

Armazena informações básicas de todos os usuários (clientes e profissionais).

```javascript
users/{userId}
{
  userId: string,              // UID do Firebase Auth
  email: string,               // E-mail do usuário
  displayName: string,         // Nome completo
  phoneNumber: string,         // Telefone com código do país
  role: string,                // "client" | "professional" | "admin"
  photoURL: string,            // URL da foto de perfil
  createdAt: timestamp,        // Data de criação
  updatedAt: timestamp,        // Última atualização
  isActive: boolean,           // Conta ativa?
  isVerified: boolean,         // E-mail verificado?
  fcmToken: string,            // Token para notificações push
  location: {
    latitude: number,
    longitude: number,
    address: string,
    city: string,
    state: string,
    country: string,
    zipCode: string
  },
  settings: {
    language: string,          // "pt" | "en" | "es"
    notifications: boolean,    // Receber notificações?
    emailMarketing: boolean    // Receber e-mails marketing?
  }
}
```

**Índices:**
- `role` (para queries por tipo de usuário)
- `location.city` (para busca por cidade)
- `isActive` (para filtrar usuários ativos)

---

### 2. professionals

Dados específicos de profissionais (extensão de `users`).

```javascript
professionals/{professionalId}
{
  professionalId: string,      // Referência ao userId
  bio: string,                 // Descrição do profissional
  services: array<string>,     // ["plumber", "electrician"]

  availability: {
    monday: { start: "08:00", end: "18:00", available: boolean },
    tuesday: { start: "08:00", end: "18:00", available: boolean },
    wednesday: { start: "08:00", end: "18:00", available: boolean },
    thursday: { start: "08:00", end: "18:00", available: boolean },
    friday: { start: "08:00", end: "18:00", available: boolean },
    saturday: { start: "09:00", end: "14:00", available: boolean },
    sunday: { start: null, end: null, available: boolean }
  },

  pricing: {
    hourlyRate: number,        // Preço por hora (€)
    minCharge: number,         // Cobrança mínima (€)
    currency: string           // "EUR" | "USD"
  },

  verification: {
    isVerified: boolean,       // Verificado pelo admin?
    documents: array<string>,  // URLs dos documentos
    verifiedAt: timestamp,     // Data da verificação
    verifiedBy: string         // ID do admin
  },

  rating: {
    average: number,           // Média de avaliações (0-5)
    count: number,             // Número total de avaliações
    breakdown: {
      5: number,               // Quantas avaliações 5 estrelas
      4: number,
      3: number,
      2: number,
      1: number
    }
  },

  stats: {
    totalJobs: number,         // Total de jobs concluídos
    completionRate: number,    // Taxa de conclusão (%)
    responseTime: number,      // Tempo médio de resposta (minutos)
    acceptanceRate: number     // Taxa de aceitação (%)
  },

  bankAccount: {
    stripeAccountId: string,   // ID da conta Stripe Connect
    isConnected: boolean,      // Conta bancária conectada?
    lastPayoutAt: timestamp    // Último pagamento recebido
  },

  geohash: string,             // Para queries geográficas
  isAcceptingJobs: boolean,    // Aceitando novos jobs?
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Índices:**
- `services` (array-contains para busca por serviço)
- `rating.average` (para ordenação)
- `geohash` (para busca geográfica)
- `isAcceptingJobs` (para filtrar disponíveis)

---

### 3. service_categories

Catálogo de categorias de serviços disponíveis.

```javascript
service_categories/{categoryId}
{
  categoryId: string,          // ID único
  name: string,                // "Plumber", "Electrician"
  nameTranslations: {
    pt: string,
    en: string,
    es: string
  },
  description: string,
  icon: string,                // URL do ícone
  color: string,               // Cor HEX para UI
  isActive: boolean,
  displayOrder: number,        // Ordem de exibição
  createdAt: timestamp
}
```

---

### 4. service_requests

Solicitações de serviço feitas por clientes.

```javascript
service_requests/{requestId}
{
  requestId: string,
  clientId: string,            // Referência ao userId
  professionalId: string,      // Referência ao userId (null se não aceito)

  category: string,            // ID da categoria
  title: string,               // "Encanamento entupido"
  description: string,         // Descrição detalhada

  location: {
    latitude: number,
    longitude: number,
    address: string,
    city: string,
    state: string,
    zipCode: string
  },

  scheduling: {
    preferredDate: timestamp,  // Data/hora preferida
    flexibility: string,       // "flexible" | "strict"
    estimatedDuration: number  // Duração estimada (horas)
  },

  status: string,              // Ver estados abaixo

  pricing: {
    estimatedCost: number,     // Custo estimado (€)
    finalCost: number,         // Custo final (€)
    currency: string           // "EUR"
  },

  payment: {
    paymentIntentId: string,   // Stripe Payment Intent ID
    status: string,            // "pending" | "paid" | "refunded"
    paidAt: timestamp
  },

  timeline: {
    createdAt: timestamp,
    acceptedAt: timestamp,
    startedAt: timestamp,
    completedAt: timestamp,
    cancelledAt: timestamp
  },

  photos: array<string>,       // URLs de fotos do problema

  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Estados do status:**
- `pending` - Aguardando aceitação de profissional
- `accepted` - Profissional aceitou
- `in_progress` - Serviço em andamento
- `completed` - Serviço concluído
- `cancelled` - Cancelado
- `disputed` - Em disputa

**Índices:**
- `clientId` (para histórico do cliente)
- `professionalId` (para histórico do profissional)
- `status` (para filtrar por estado)
- `createdAt` (para ordenação cronológica)

---

### 5. reviews

Avaliações de serviços.

```javascript
reviews/{reviewId}
{
  reviewId: string,
  serviceRequestId: string,    // Referência ao service_request
  clientId: string,            // Quem avaliou
  professionalId: string,      // Quem foi avaliado

  rating: number,              // 1-5 estrelas
  comment: string,             // Comentário (opcional)

  categories: {
    punctuality: number,       // 1-5
    quality: number,           // 1-5
    communication: number,     // 1-5
    cleanliness: number        // 1-5
  },

  photos: array<string>,       // Fotos do resultado (opcional)

  response: {                  // Resposta do profissional (opcional)
    text: string,
    respondedAt: timestamp
  },

  isVerified: boolean,         // Review verificado (pagamento confirmado)?
  isFlagged: boolean,          // Marcado como inadequado?

  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Índices:**
- `professionalId` (para listar reviews de um profissional)
- `rating` (para ordenação)
- `isVerified` (para filtrar reviews verificados)

---

### 6. chats

Conversas entre cliente e profissional.

```javascript
chats/{chatId}
{
  chatId: string,
  serviceRequestId: string,    // Referência ao pedido
  participants: array<string>, // [clientId, professionalId]

  lastMessage: {
    text: string,
    senderId: string,
    timestamp: timestamp
  },

  unreadCount: {
    [userId]: number           // Mensagens não lidas por usuário
  },

  isActive: boolean,           // Chat ativo?

  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### Subcoleção: messages

```javascript
chats/{chatId}/messages/{messageId}
{
  messageId: string,
  senderId: string,            // Quem enviou
  text: string,                // Conteúdo da mensagem
  type: string,                // "text" | "image" | "system"
  imageUrl: string,            // Se type = "image"

  isRead: boolean,
  readAt: timestamp,

  createdAt: timestamp
}
```

**Índices:**
- `chats`: `participants` (array-contains para queries)
- `messages`: `createdAt` (para ordenação)

---

### 7. payments

Registro de todos os pagamentos.

```javascript
payments/{paymentId}
{
  paymentId: string,
  serviceRequestId: string,
  clientId: string,
  professionalId: string,

  amount: number,              // Valor em centavos
  currency: string,            // "EUR"

  stripe: {
    paymentIntentId: string,
    chargeId: string,
    paymentMethod: string,     // "card" | "apple_pay" | "google_pay"
    last4: string,             // Últimos 4 dígitos do cartão
    brand: string              // "visa" | "mastercard"
  },

  fees: {
    stripeFee: number,         // Taxa do Stripe
    platformFee: number,       // Taxa da plataforma (%)
    professionalReceives: number // Valor líquido do profissional
  },

  status: string,              // "pending" | "succeeded" | "failed" | "refunded"

  payout: {
    payoutId: string,          // ID do payout Stripe
    paidAt: timestamp
  },

  refund: {
    refundId: string,
    reason: string,
    refundedAt: timestamp
  },

  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Índices:**
- `clientId` (histórico de pagamentos do cliente)
- `professionalId` (histórico de recebimentos)
- `status` (filtrar por estado)
- `createdAt` (ordenação cronológica)

---

### 8. notifications

Notificações do sistema.

```javascript
notifications/{notificationId}
{
  notificationId: string,
  userId: string,              // Destinatário

  type: string,                // Ver tipos abaixo
  title: string,
  body: string,

  data: {                      // Dados específicos por tipo
    serviceRequestId: string,
    professionalId: string,
    // ... outros campos
  },

  isRead: boolean,
  readAt: timestamp,

  action: {                    // Ação ao clicar
    type: string,              // "navigate" | "open_chat"
    route: string              // Rota do app
  },

  createdAt: timestamp
}
```

**Tipos de notificação:**
- `new_service_request` - Novo pedido para profissional
- `service_accepted` - Profissional aceitou pedido
- `service_started` - Serviço iniciado
- `service_completed` - Serviço concluído
- `payment_received` - Pagamento recebido
- `new_message` - Nova mensagem no chat
- `new_review` - Nova avaliação recebida

**Índices:**
- `userId` (notificações do usuário)
- `isRead` (filtrar não lidas)
- `createdAt` (ordenação)

---

### 9. admin_logs

Logs de ações administrativas.

```javascript
admin_logs/{logId}
{
  logId: string,
  adminId: string,             // ID do admin
  action: string,              // "approve_professional" | "ban_user"

  target: {
    type: string,              // "user" | "professional" | "service_request"
    id: string
  },

  details: object,             // Dados específicos da ação

  createdAt: timestamp
}
```

---

## Queries Comuns

### Buscar profissionais próximos por categoria

```javascript
// Usando geohash para busca geográfica
db.collection('professionals')
  .where('services', 'array-contains', 'plumber')
  .where('isAcceptingJobs', '==', true)
  .where('geohash', '>=', startHash)
  .where('geohash', '<=', endHash)
  .orderBy('rating.average', 'desc')
  .limit(20)
```

### Histórico de serviços do cliente

```javascript
db.collection('service_requests')
  .where('clientId', '==', userId)
  .orderBy('createdAt', 'desc')
  .limit(50)
```

### Reviews de um profissional

```javascript
db.collection('reviews')
  .where('professionalId', '==', professionalId)
  .where('isVerified', '==', true)
  .orderBy('createdAt', 'desc')
  .limit(20)
```

---

## Regras de Segurança (Firestore Rules)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    function isAdmin() {
      return isSignedIn() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Users collection
    match /users/{userId} {
      allow read: if isSignedIn();
      allow create: if isOwner(userId);
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }

    // Professionals collection
    match /professionals/{professionalId} {
      allow read: if isSignedIn();
      allow create: if isOwner(professionalId);
      allow update: if isOwner(professionalId) || isAdmin();
      allow delete: if isAdmin();
    }

    // Service requests
    match /service_requests/{requestId} {
      allow read: if isSignedIn() && (
        resource.data.clientId == request.auth.uid ||
        resource.data.professionalId == request.auth.uid ||
        isAdmin()
      );
      allow create: if isSignedIn() && request.resource.data.clientId == request.auth.uid;
      allow update: if isSignedIn() && (
        resource.data.clientId == request.auth.uid ||
        resource.data.professionalId == request.auth.uid ||
        isAdmin()
      );
      allow delete: if isAdmin();
    }

    // Reviews
    match /reviews/{reviewId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() && request.resource.data.clientId == request.auth.uid;
      allow update: if isOwner(resource.data.clientId) || isAdmin();
      allow delete: if isAdmin();
    }

    // Chats
    match /chats/{chatId} {
      allow read: if isSignedIn() && request.auth.uid in resource.data.participants;
      allow create: if isSignedIn() && request.auth.uid in request.resource.data.participants;
      allow update: if isSignedIn() && request.auth.uid in resource.data.participants;

      match /messages/{messageId} {
        allow read: if isSignedIn() && request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
        allow create: if isSignedIn() && request.resource.data.senderId == request.auth.uid;
      }
    }

    // Payments (read-only for users, write via Cloud Functions)
    match /payments/{paymentId} {
      allow read: if isSignedIn() && (
        resource.data.clientId == request.auth.uid ||
        resource.data.professionalId == request.auth.uid ||
        isAdmin()
      );
      allow write: if false; // Only via Cloud Functions
    }

    // Notifications
    match /notifications/{notificationId} {
      allow read: if isSignedIn() && resource.data.userId == request.auth.uid;
      allow update: if isSignedIn() && resource.data.userId == request.auth.uid;
      allow write: if false; // Only via Cloud Functions
    }
  }
}
```

---

## Estratégia de Backup

1. **Export automático diário** para Google Cloud Storage
2. **Retention de 30 dias** para backups
3. **Point-in-time recovery** disponível
4. **Disaster recovery plan** documentado

---

**Última atualização:** 2025-12-11
