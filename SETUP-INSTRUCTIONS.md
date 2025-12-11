# 🔧 Instruções de Setup - HelpNow Firebase

## ✅ O que já foi feito:

1. ✅ Projeto GitHub criado
2. ✅ Firebase CLI instalado
3. ✅ Arquivos de configuração criados:
   - `firestore.rules` - Regras de segurança do Firestore
   - `storage.rules` - Regras de segurança do Storage
   - `firestore.indexes.json` - Índices do Firestore

## 📋 Próximos Passos (FAÇA VOCÊ):

### 1️⃣ Fazer Login no Firebase CLI

Abra o **PowerShell** ou **CMD** no diretório do projeto e execute:

```bash
cd HelpNow
npx firebase login
```

Isso vai:
- Abrir seu navegador
- Pedir login na conta Google
- Autorizar Firebase CLI

### 2️⃣ Inicializar Firebase no Projeto

Depois do login, execute:

```bash
npx firebase init
```

**Seleções a fazer:**

#### Quais recursos quer usar? (Espaço para selecionar, Enter para confirmar)
- ✅ **Firestore** (Database)
- ✅ **Functions** (Cloud Functions)
- ✅ **Storage** (File storage)
- ✅ **Emulators** (para testes locais)

#### Project Setup:
- **Opção:** "Use an existing project"
- **Projeto:** Selecione `helpnow-bbb08`

#### Firestore Setup:
- **Firestore rules file:** `firestore.rules` (já existe, pressione Enter)
- **Firestore indexes file:** `firestore.indexes.json` (já existe, pressione Enter)

#### Functions Setup:
- **Language:** JavaScript (ou TypeScript se preferir)
- **ESLint:** Yes (recomendado)
- **Install dependencies:** Yes

#### Storage Setup:
- **Storage rules file:** `storage.rules` (já existe, pressione Enter)

#### Emulators Setup:
- Selecione:
  - ✅ Authentication Emulator
  - ✅ Firestore Emulator
  - ✅ Storage Emulator
- **Porta Firestore:** 8080 (padrão)
- **Porta Auth:** 9099 (padrão)
- **Porta Storage:** 9199 (padrão)
- **Download emulators now:** Yes

### 3️⃣ Ativar Serviços no Firebase Console

Abra o navegador em: [https://console.firebase.google.com/](https://console.firebase.google.com/)

Selecione o projeto **helpnow-bbb08**

#### Ativar Authentication:
1. Menu lateral → **Authentication**
2. Clique em **"Get started"**
3. Ative os métodos:
   - ✅ **Email/Password** (Sign-in method)
   - ✅ **Google** (opcional mas recomendado)

#### Ativar Firestore:
1. Menu lateral → **Firestore Database**
2. Clique em **"Create database"**
3. **Modo:** "Start in production mode" (vamos usar nossas rules)
4. **Localização:** `europe-west1` (Frankfurt) ou mais próximo
5. Clique em **"Enable"**

#### Ativar Storage:
1. Menu lateral → **Storage**
2. Clique em **"Get started"**
3. **Security rules:** "Start in production mode"
4. **Localização:** Mesma do Firestore
5. Clique em **"Done"**

### 4️⃣ Deploy das Regras de Segurança

Após ativar os serviços, faça deploy das regras:

```bash
npx firebase deploy --only firestore:rules
npx firebase deploy --only storage:rules
npx firebase deploy --only firestore:indexes
```

### 5️⃣ Verificar Deploy

```bash
npx firebase projects:list
npx firebase use helpnow-bbb08
```

### 6️⃣ Testar com Emulators (Opcional)

Para testar localmente antes de usar produção:

```bash
npx firebase emulators:start
```

Isso vai abrir:
- **Emulator Suite UI:** http://localhost:4000
- **Firestore Emulator:** http://localhost:8080
- **Auth Emulator:** http://localhost:9099

---

## 🎯 Depois de Completar

Me avise quando terminar! Vou te ajudar com:

1. ✅ Criar categorias de serviço iniciais
2. ✅ Criar usuário admin inicial
3. ✅ Configurar Firebase Functions básicas
4. ✅ Conectar com FlutterFlow
5. ✅ Configurar Stripe

---

## 📞 Problemas?

Se tiver algum erro, me mande:
- O comando que executou
- A mensagem de erro completa

---

**Última atualização:** 2025-12-11
