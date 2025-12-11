# Configuração do FlutterFlow - HelpNow

## Visão Geral

FlutterFlow é uma plataforma low-code/no-code para criar aplicativos mobile nativos usando Flutter, sem escrever código (ou com código customizado quando necessário).

## Pré-requisitos

- Conta no [FlutterFlow](https://flutterflow.io/)
- Plano **Standard** (€25/mês) - necessário para:
  - Exportar código
  - Publicar nas lojas
  - Remover branding FlutterFlow
  - Usar custom code
- Firebase já configurado
- Stripe já configurado

## Passo 1: Criar Conta FlutterFlow

1. Acesse [https://app.flutterflow.io/](https://app.flutterflow.io/)
2. Clique em **"Sign Up"**
3. Escolha método:
   - Google (recomendado)
   - E-mail
4. Faça upgrade para **Standard Plan** (€25/mês)

## Passo 2: Criar Novo Projeto

1. No Dashboard, clique em **"Create New"**
2. Escolha **"Blank App"**
3. Preencha:
   - **Project Name:** HelpNow
   - **Bundle ID (iOS):** `com.helpnow.app`
   - **Package Name (Android):** `com.helpnow.app`
4. Clique em **"Create"**

## Passo 3: Conectar Firebase

### Importar Configuração

1. No projeto FlutterFlow, vá em **"Settings" → "Firebase"**
2. Clique em **"Connect Firebase"**
3. Você tem 2 opções:

#### Opção A: Auto Setup (Recomendado)

1. Clique em **"Auto Setup"**
2. Faça login na sua conta Google (mesma do Firebase)
3. Selecione o projeto **"HelpNow"**
4. FlutterFlow configura automaticamente

#### Opção B: Manual Setup

1. Clique em **"Manual Setup"**
2. No Firebase Console:
   - **iOS:** Baixe `GoogleService-Info.plist`
   - **Android:** Baixe `google-services.json`
   - **Web:** Copie o config object
3. Faça upload no FlutterFlow

### Ativar Serviços Firebase

1. Em **"Settings" → "Firebase"**, ative:
   - ✅ **Authentication**
   - ✅ **Firestore**
   - ✅ **Storage**
   - ✅ **Cloud Messaging** (notificações push)
   - ✅ **Analytics** (opcional)

## Passo 4: Configurar Authentication

### Métodos de Login

1. Vá em **"Settings" → "Authentication"**
2. Ative:
   - ✅ **Email/Password**
   - ✅ **Google Sign-In** (recomendado)
   - ✅ **Apple Sign-In** (obrigatório para iOS)

### Criar Telas de Autenticação

#### Tela de Login

1. Crie página: **"LoginPage"**
2. Adicione widgets:
   - Logo do app
   - TextField (E-mail)
   - TextField (Password) com `obscureText: true`
   - Botão "Login"
   - Botão "Esqueci a senha"
   - Link "Criar conta"
   - Botão "Login com Google"
   - Botão "Login com Apple"

3. **Action no botão Login:**
   ```
   Backend Call → Firebase Auth → Login
   - Email: TextField_Email.text
   - Password: TextField_Password.text
   - On Success: Navigate to HomePage
   - On Error: Show Snackbar com erro
   ```

#### Tela de Cadastro

1. Crie página: **"SignUpPage"**
2. Adicione campos:
   - Nome completo
   - E-mail
   - Telefone
   - Senha
   - Confirmar senha
   - Checkbox "Sou profissional"
   - Botão "Criar conta"

3. **Action no botão:**
   ```
   Backend Call → Firebase Auth → Create Account
   - Email: TextField_Email.text
   - Password: TextField_Password.text
   - On Success:
     → Create Firestore Document (users)
     → Navigate to HomePage
   ```

## Passo 5: Configurar Firestore Collections

### Criar Collections no FlutterFlow

1. Vá em **"Firestore"** na sidebar
2. Clique em **"Create Collection"**

#### Collection: users

```
Collection Name: users
Fields:
  - userId (String) - Document ID
  - email (String)
  - displayName (String)
  - phoneNumber (String)
  - role (String) - "client" | "professional"
  - photoURL (String)
  - location (Map)
    - latitude (Double)
    - longitude (Double)
    - address (String)
    - city (String)
  - createdAt (Timestamp)
  - isActive (Boolean)
```

#### Collection: professionals

```
Collection Name: professionals
Fields:
  - professionalId (String) - Document ID
  - bio (String)
  - services (List<String>)
  - rating (Map)
    - average (Double)
    - count (Integer)
  - pricing (Map)
    - hourlyRate (Double)
  - isAcceptingJobs (Boolean)
  - createdAt (Timestamp)
```

#### Collection: service_requests

```
Collection Name: service_requests
Fields:
  - requestId (String) - Document ID
  - clientId (String) - Reference to users
  - professionalId (String) - Reference to users
  - category (String)
  - title (String)
  - description (String)
  - location (Map)
  - status (String)
  - pricing (Map)
    - estimatedCost (Double)
  - createdAt (Timestamp)
```

Veja schema completo em: [database-schema.md](../architecture/database-schema.md)

## Passo 6: Criar Interface do Cliente

### HomePage (Cliente)

1. **AppBar:**
   - Logo
   - Ícone de notificações
   - Ícone de perfil

2. **Search Bar:**
   - TextField com placeholder "Buscar profissionais..."
   - Ícone de filtro

3. **Categorias (Grid):**
   - ListView horizontal com categorias
   - Cada item: Ícone + Nome

4. **Profissionais Próximos:**
   - ListView de cards
   - Cada card:
     - Foto do profissional
     - Nome
     - Rating (estrelas)
     - Distância
     - Preço/hora
     - Botão "Solicitar"

### Criar Query Firestore

1. Clique na ListView → **"Backend Query"**
2. Configure:
   ```
   Collection: professionals
   Query Type: List of Documents
   Filters:
     - isAcceptingJobs == true
   Order By: rating.average (descending)
   Limit: 20
   ```

### Tela de Detalhes do Profissional

1. Crie página: **"ProfessionalDetailPage"**
2. Adicione:
   - Foto grande
   - Nome
   - Avaliação e número de reviews
   - Bio
   - Serviços oferecidos (chips)
   - Lista de avaliações
   - Botão "Solicitar Serviço"

3. **Action do botão:**
   ```
   Navigate to RequestServicePage
   - Pass parameter: professionalId
   ```

### Tela de Solicitação de Serviço

1. Crie página: **"RequestServicePage"**
2. Adicione:
   - Dropdown de categoria
   - TextField de título
   - TextField de descrição (multilinha)
   - DatePicker de data/hora preferida
   - Localização (com Google Maps)
   - Upload de fotos (opcional)
   - Botão "Solicitar"

3. **Action do botão:**
   ```
   Backend Call → Create Firestore Document
   Collection: service_requests
   Data:
     - clientId: currentUser.uid
     - professionalId: widget.professionalId
     - category: Dropdown_Category.value
     - title: TextField_Title.text
     - description: TextField_Description.text
     - location: mapLocation
     - status: "pending"
     - createdAt: serverTimestamp

   On Success:
     → Show Success Dialog
     → Navigate back
   ```

## Passo 7: Criar Interface do Profissional

### HomePage (Profissional)

1. **Estatísticas:**
   - Total de jobs concluídos
   - Avaliação média
   - Ganhos do mês

2. **Switch de Disponibilidade:**
   - Toggle "Aceitando novos jobs"

3. **Pedidos Pendentes:**
   - ListView de service_requests
   - Filtro: `professionalId == currentUser.uid && status == 'pending'`

4. **Cada pedido:**
   - Nome do cliente
   - Categoria
   - Localização
   - Preço estimado
   - Botões: "Aceitar" / "Recusar"

### Actions dos Botões

```
Botão Aceitar:
  → Update Firestore Document (service_requests/{requestId})
    - status: "accepted"
    - acceptedAt: serverTimestamp
  → Send Push Notification to Client
  → Navigate to ServiceDetailPage

Botão Recusar:
  → Update Firestore Document
    - status: "declined"
  → Remove from list
```

## Passo 8: Integrar Google Maps

1. Vá em **"Settings" → "Integrations"**
2. Ative **"Google Maps"**
3. Cole sua **Google Maps API Key**
4. Permissões necessárias:
   - Maps SDK for iOS
   - Maps SDK for Android
   - Places API
   - Geolocation API

### Adicionar Mapa na Tela

1. Arraste widget **"GoogleMap"**
2. Configure:
   - Initial Location: User's current location
   - Markers: Lista de profissionais
   - On Marker Tap: Navigate to ProfessionalDetailPage

### Obter Localização do Usuário

1. Vá em **"Settings" → "Permissions"**
2. Ative:
   - ✅ **Location** (iOS e Android)
3. No código:
   ```
   Action: Get Current Location
   Store in: App State → userLocation
   ```

## Passo 9: Integrar Stripe

### Adicionar Custom Action

1. Vá em **"Custom Code" → "Actions"**
2. Crie action: **"CreatePaymentIntent"**
3. Cole código:

```dart
import 'package:cloud_functions/cloud_functions.dart';

Future<String> createPaymentIntent(
  double amount,
  String currency,
  String serviceRequestId,
) async {
  final functions = FirebaseFunctions.instance;

  try {
    final result = await functions.httpsCallable('createPaymentIntent').call({
      'amount': (amount * 100).toInt(), // converter para centavos
      'currency': currency,
      'serviceRequestId': serviceRequestId,
    });

    return result.data['clientSecret'];
  } catch (e) {
    print('Error creating payment intent: $e');
    throw e;
  }
}
```

### Tela de Pagamento

1. Instale pacote: **"flutter_stripe"**
2. Crie página: **"PaymentPage"**
3. Adicione:
   - Resumo do serviço
   - Valor total
   - Card Input Widget (Stripe)
   - Botão Apple Pay
   - Botão Google Pay
   - Botão "Pagar"

4. **Action do botão Pagar:**
   ```
   Custom Action → createPaymentIntent
   - amount: widget.serviceAmount
   - currency: "eur"
   - serviceRequestId: widget.requestId

   On Success:
     → Confirm Card Payment (Stripe)
     → Navigate to SuccessPage
   ```

## Passo 10: Configurar Notificações Push

### No FlutterFlow

1. Vá em **"Settings" → "Notifications"**
2. Ative **"Push Notifications"**
3. Configure:
   - iOS: Upload APNs certificate (.p8)
   - Android: Configurado automaticamente

### Enviar Notificação (Cloud Function)

```javascript
// backend/cloud-functions/src/notifications/sendNotification.js
const admin = require('firebase-admin');

async function sendPushNotification(userId, title, body, data) {
  const userDoc = await admin.firestore().collection('users').doc(userId).get();
  const fcmToken = userDoc.data().fcmToken;

  if (!fcmToken) {
    console.log('User has no FCM token');
    return;
  }

  const message = {
    notification: {
      title: title,
      body: body
    },
    data: data,
    token: fcmToken
  };

  try {
    await admin.messaging().send(message);
    console.log('Notification sent successfully');
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}
```

## Passo 11: Testar o App

### Preview no FlutterFlow

1. Clique em **"Test Mode"** (canto superior direito)
2. Escolha:
   - **Web Preview** (mais rápido)
   - **Mobile Preview** (via QR code)

### Testar em Dispositivo Real

1. Baixe o app **"FlutterFlow"** na App Store / Google Play
2. Escaneie o QR code no FlutterFlow
3. Teste todas as funcionalidades

### Exportar Código (Opcional)

1. Vá em **"Settings" → "Export Code"**
2. Baixe o projeto Flutter
3. Abra no VS Code / Android Studio
4. Adicione código custom conforme necessário

## Passo 12: Publicar nas Lojas

### iOS (App Store)

1. No FlutterFlow, vá em **"Deploy" → "iOS"**
2. Configure:
   - Apple Developer Account
   - Provisioning Profile
   - Certificates
3. Upload de screenshots
4. Descrição do app
5. Clique em **"Deploy to App Store Connect"**
6. No App Store Connect, submeta para revisão

### Android (Google Play)

1. Vá em **"Deploy" → "Android"**
2. Configure:
   - Google Play Console Account
   - Signing Key (FlutterFlow gera automaticamente)
3. Upload de screenshots
4. Descrição do app
5. Clique em **"Deploy to Google Play"**
6. No Google Play Console, submeta para revisão

### Checklist Pré-Publicação

- [ ] Todas as funcionalidades testadas
- [ ] Ícone do app configurado
- [ ] Splash screen configurada
- [ ] Screenshots preparados (5-8 por plataforma)
- [ ] Descrição escrita (PT, EN)
- [ ] Política de privacidade publicada
- [ ] Termos de uso publicados
- [ ] Firebase em modo de produção
- [ ] Stripe em modo live
- [ ] Testado em dispositivos reais

## Recursos do FlutterFlow

### Widgets Úteis

- **ListView:** Listas infinitas com lazy loading
- **GridView:** Grid de categorias/serviços
- **BottomNavigationBar:** Navegação principal
- **GoogleMap:** Mapas interativos
- **ImagePicker:** Upload de fotos
- **DatePicker:** Seleção de data/hora
- **RatingBar:** Exibir e capturar avaliações

### App State Management

1. Vá em **"App State"**
2. Adicione variáveis globais:
   - `currentUserRole` (String)
   - `userLocation` (LatLng)
   - `isAcceptingJobs` (Boolean)

### Conditional Rendering

Use **Visibility** para mostrar/ocultar baseado em condições:
```
Visible When: AppState.currentUserRole == "professional"
```

## Troubleshooting

### Erro: "Firebase not initialized"

**Solução:** Verifique se Firebase está conectado em Settings → Firebase.

### Push Notifications não funcionam

**Solução:** Verifique se:
1. FCM está ativado
2. Permissões de notificação concedidas
3. Token FCM está salvo no Firestore

### Mapa não carrega

**Solução:** Verifique se Google Maps API Key está configurada e tem permissões corretas.

## Próximos Passos

- [Implementar Cloud Functions](../api/cloud-functions.md)
- [Definir User Flows](../architecture/user-flows.md)
- [Testar e Publicar](deployment-guide.md)

## Recursos

- [Documentação FlutterFlow](https://docs.flutterflow.io/)
- [Vídeos Tutoriais](https://www.youtube.com/@FlutterFlow)
- [Community Forum](https://community.flutterflow.io/)
- [Templates](https://marketplace.flutterflow.io/)

---

**Última atualização:** 2025-12-11
