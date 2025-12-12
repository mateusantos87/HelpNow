# Google Maps API - Guia de Uso Rápido

## ✅ Configuração Completa

- ✅ Projeto Google Cloud: `helpnow-bbb08`
- ✅ 6 APIs ativadas
- ✅ API Key criada: `AIzaSyCYA7evpX8aSUzpzfYebxfSNMYbEH_yPG0`
- ✅ API Key adicionada ao Firebase Secrets

## 📍 APIs Ativadas

1. **Maps SDK for Android** - Mapas no app Android
2. **Maps SDK for iOS** - Mapas no app iOS
3. **Maps JavaScript API** - Mapas na web
4. **Places API** - Autocomplete de endereços
5. **Geocoding API** - Converter endereço em coordenadas
6. **Geolocation API** - Obter localização do dispositivo

## 🔑 Como Usar no FlutterFlow

### 1. Adicionar API Key no FlutterFlow

1. FlutterFlow → **Settings** → **Integrations**
2. Clique em **"Google Maps"**
3. Cole a API Key: `AIzaSyCYA7evpX8aSUzpzfYebxfSNMYbEH_yPG0`

### 2. Adicionar Widget de Mapa

```dart
GoogleMap(
  initialLocation: userLocation,
  markers: professionalsNearby,
  zoom: 14
)
```

### 3. Obter Localização do Usuário

```dart
// No FlutterFlow: Action → Get Current Location
// Salva em: App State → userLocation
```

### 4. Buscar Profissionais Próximos (Firestore)

```dart
// Query no Firestore com geohash
professionalsList
  .where('isAcceptingJobs', isEqualTo: true)
  .where('geohash', isGreaterThanOrEqualTo: startHash)
  .where('geohash', isLessThanOrEqualTo: endHash)
```

## 🔐 Segurança - IMPORTANTE!

**Antes de publicar o app:**

1. Vá em: https://console.cloud.google.com/apis/credentials?project=helpnow-bbb08
2. Clique na API Key **"HelpNow Mobile"**
3. Em **Application restrictions**, escolha:
   - **Android apps** → Adicione package: `com.helpnow.app`
   - **iOS apps** → Adicione bundle: `com.helpnow.app`
4. Em **API restrictions**, marque apenas:
   - Maps SDK for Android
   - Maps SDK for iOS
   - Places API
   - Geocoding API
   - Geolocation API

## 💰 Custos Estimados

| API | Uso Mensal Estimado | Custo |
|-----|---------------------|-------|
| Maps SDK | ~1000 carregamentos | €7 |
| Places API | ~500 requests | €1.50 |
| Geocoding | ~200 requests | €1 |
| **Total** | | **~€10-20/mês** |

**Crédito gratuito:** €200/mês por 12 meses (para novos usuários)

## 🧪 Testar

### Cartões de Teste (Geolocalização)

```
Dublin, Ireland:
Lat: 53.3498, Lng: -6.2603

Cork, Ireland:
Lat: 51.8985, Lng: -8.4756
```

### No Emulador

```bash
# Android Emulator
adb emu geo fix -6.2603 53.3498

# iOS Simulator
Debug → Location → Custom Location
Lat: 53.3498, Lng: -6.2603
```

## 📚 Recursos

- [Google Maps Platform Docs](https://developers.google.com/maps)
- [FlutterFlow Maps Guide](https://docs.flutterflow.io/widgets-and-components/widgets/google-map)
- [Geohashing Library](https://pub.dev/packages/geoflutterfire)

---

**Última atualização:** 2025-12-11
