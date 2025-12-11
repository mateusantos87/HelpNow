# Configuração do Firebase - HelpNow

## Pré-requisitos

- Conta Google
- Projeto criado no [Firebase Console](https://console.firebase.google.com/)

## Passo 1: Criar Projeto Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em **"Adicionar projeto"**
3. Preencha:
   - **Nome do projeto:** `HelpNow`
   - **Google Analytics:** Ative (recomendado)
   - **Região:** Europe (se for para mercado europeu)
4. Clique em **"Criar projeto"**

## Passo 2: Configurar Authentication

1. No menu lateral, clique em **"Authentication"**
2. Clique em **"Get started"**
3. Ative os seguintes métodos de login:
   - **E-mail/Senha** (obrigatório para MVP)
   - **Google** (opcional, mas recomendado)
   - **Apple** (se for publicar no iOS)

### Configuração de E-mail

1. Em **"Authentication" → "Settings" → "Email Enumeration Protection"**
   - **Ative** para prevenir ataques de enumeração
2. Configure o template de e-mail:
   - **"Templates"** → Personalize os e-mails de:
     - Verificação de e-mail
     - Redefinição de senha
     - Mudança de e-mail

## Passo 3: Configurar Firestore Database

1. No menu lateral, clique em **"Firestore Database"**
2. Clique em **"Create database"**
3. Escolha:
   - **Modo:** Produção (com regras de segurança)
   - **Localização:** `europe-west1` (Frankfurt) ou mais próximo
4. Clique em **"Ativar"**

### Criar Índices Compostos

Vá em **"Firestore" → "Indexes" → "Composite"** e adicione:

```
Collection: professionals
Fields:
  - services (Array)
  - isAcceptingJobs (Ascending)
  - rating.average (Descending)

Collection: service_requests
Fields:
  - clientId (Ascending)
  - status (Ascending)
  - createdAt (Descending)

Collection: reviews
Fields:
  - professionalId (Ascending)
  - isVerified (Ascending)
  - createdAt (Descending)
```

### Aplicar Regras de Segurança

1. Vá em **"Firestore" → "Rules"**
2. Copie as regras do arquivo: [database-schema.md](../architecture/database-schema.md)
3. Clique em **"Publicar"**

## Passo 4: Configurar Storage

1. No menu lateral, clique em **"Storage"**
2. Clique em **"Get started"**
3. Escolha **"Production mode"**
4. Selecione a mesma região do Firestore

### Regras de Storage

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // Perfil photos
    match /users/{userId}/profile/{fileName} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.auth.uid == userId
                   && request.resource.size < 5 * 1024 * 1024 // 5MB max
                   && request.resource.contentType.matches('image/.*');
    }

    // Professional documents
    match /professionals/{professionalId}/documents/{fileName} {
      allow read: if request.auth != null
                  && (request.auth.uid == professionalId || isAdmin());
      allow write: if request.auth != null
                   && request.auth.uid == professionalId
                   && request.resource.size < 10 * 1024 * 1024; // 10MB max
    }

    // Service request photos
    match /service_requests/{requestId}/photos/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
                   && request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }

    // Helper function
    function isAdmin() {
      return request.auth != null
             && firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## Passo 5: Configurar Cloud Messaging (FCM)

1. No menu lateral, clique em **"Cloud Messaging"**
2. Será habilitado automaticamente
3. Anote as credenciais:
   - **Server Key** (para backend)
   - **Sender ID**

### Configurar APNs (Apple Push Notifications)

Para iOS, você precisará:

1. Baixar o arquivo `.p8` da sua conta Apple Developer
2. Em **"Cloud Messaging" → "Apple app configuration"**
3. Faça upload do arquivo `.p8`
4. Preencha:
   - **Key ID**
   - **Team ID**

## Passo 6: Ativar Google Cloud APIs

No [Google Cloud Console](https://console.cloud.google.com/):

1. Selecione seu projeto HelpNow
2. Vá em **"APIs & Services" → "Enable APIs and Services"**
3. Ative as seguintes APIs:
   - **Cloud Functions API**
   - **Cloud Build API**
   - **Secret Manager API** (para variáveis de ambiente)

## Passo 7: Configurar Variáveis de Ambiente

### No Firebase Functions:

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Inicializar projeto
cd HelpNow/backend/cloud-functions
firebase init functions

# Configurar variáveis
firebase functions:config:set stripe.secret_key="sk_test_..."
firebase functions:config:set stripe.webhook_secret="whsec_..."
firebase functions:config:set google.maps_api_key="AIza..."
```

### Arquivo `.env` (local development):

Crie `backend/cloud-functions/.env`:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
GOOGLE_MAPS_API_KEY=AIza...
```

## Passo 8: Obter Credenciais do Firebase

### Para o App (FlutterFlow):

1. Vá em **"Project Settings" → "Your apps"**
2. Clique em **"Add app"** → Selecione plataforma:
   - **iOS:** Siga instruções, baixe `GoogleService-Info.plist`
   - **Android:** Siga instruções, baixe `google-services.json`
   - **Web:** Copie o snippet de configuração

### Exemplo de configuração Web:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "helpnow-xxxxx.firebaseapp.com",
  projectId: "helpnow-xxxxx",
  storageBucket: "helpnow-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:xxxxx",
  measurementId: "G-XXXXXX"
};
```

## Passo 9: Configurar Billing

1. Vá em **"Blaze Plan"** (pay-as-you-go)
2. Configure alertas de orçamento:
   - **€10/dia** (inicial)
   - **€50/mês** (inicial)
3. Configure notificações de billing

### Custos Estimados (MVP):

| Serviço | Estimativa Mensal |
|---------|-------------------|
| Firestore | €0-5 |
| Storage | €0-2 |
| Cloud Functions | €0-5 |
| Hosting | €0 |
| **Total** | **€0-12** |

O Free Tier cobre até ~1000 usuários ativos.

## Passo 10: Configurar Backup

```bash
# Instalar gcloud CLI
# https://cloud.google.com/sdk/docs/install

# Login
gcloud auth login

# Configurar projeto
gcloud config set project helpnow-xxxxx

# Agendar export diário do Firestore
gcloud firestore export gs://helpnow-backups --async
```

### Criar bucket para backups:

```bash
gsutil mb -l europe-west1 gs://helpnow-backups
gsutil lifecycle set lifecycle.json gs://helpnow-backups
```

`lifecycle.json`:
```json
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "Delete"},
        "condition": {"age": 30}
      }
    ]
  }
}
```

## Passo 11: Testar Configuração

### Testar Authentication:

```javascript
// No FlutterFlow ou código de teste
import firebase from 'firebase/app';
import 'firebase/auth';

firebase.auth().createUserWithEmailAndPassword('teste@email.com', 'senha123')
  .then((user) => console.log('Usuário criado:', user))
  .catch((error) => console.error('Erro:', error));
```

### Testar Firestore:

```javascript
import firebase from 'firebase/app';
import 'firebase/firestore';

const db = firebase.firestore();

db.collection('users').add({
  email: 'teste@email.com',
  displayName: 'Teste',
  createdAt: firebase.firestore.FieldValue.serverTimestamp()
})
  .then((doc) => console.log('Documento criado:', doc.id))
  .catch((error) => console.error('Erro:', error));
```

## Arquivos de Configuração

Salve as credenciais nos seguintes arquivos:

```
HelpNow/
└── infrastructure/
    └── firebase-config/
        ├── firebase-config.json          # Configuração geral
        ├── GoogleService-Info.plist      # iOS
        ├── google-services.json          # Android
        └── firebase-web-config.js        # Web
```

**IMPORTANTE:** Adicione esses arquivos ao `.gitignore`!

## Troubleshooting

### Erro: "Firebase: Firebase App named '[DEFAULT]' already exists"

**Solução:** Você está inicializando o Firebase duas vezes. Verifique se não há múltiplas chamadas a `firebase.initializeApp()`.

### Erro: "PERMISSION_DENIED: Missing or insufficient permissions"

**Solução:** Verifique as regras de segurança do Firestore/Storage. Certifique-se de que o usuário está autenticado.

### Erro: "Quota exceeded"

**Solução:** Você atingiu o limite do Free Tier. Verifique o uso em **"Usage and Billing"** e considere upgrade para Blaze Plan.

## Próximos Passos

- [Configurar Stripe](stripe-setup.md)
- [Configurar FlutterFlow](flutterflow-setup.md)
- [Configurar Google Maps API](maps-setup.md)

---

**Última atualização:** 2025-12-11
