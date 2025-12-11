# Configuração do Google Maps API - HelpNow

## Visão Geral

O Google Maps será usado para:
- Exibir localização de profissionais no mapa
- Buscar endereços (autocomplete)
- Calcular distâncias
- Obter geolocalização do usuário

## Passo 1: Criar Projeto no Google Cloud

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie novo projeto ou selecione o projeto Firebase "HelpNow"
3. Anote o **Project ID**

## Passo 2: Ativar APIs Necessárias

1. Vá em **"APIs & Services" → "Library"**
2. Busque e ative as seguintes APIs:
   - ✅ **Maps SDK for Android**
   - ✅ **Maps SDK for iOS**
   - ✅ **Maps JavaScript API** (para web)
   - ✅ **Places API** (autocomplete de endereços)
   - ✅ **Geocoding API** (converter endereços em coordenadas)
   - ✅ **Geolocation API** (localização do dispositivo)
   - ✅ **Distance Matrix API** (calcular distâncias)

## Passo 3: Criar API Key

1. Vá em **"APIs & Services" → "Credentials"**
2. Clique em **"Create Credentials" → "API Key"**
3. Anote a API Key: `AIza...`

### Restringir API Key (IMPORTANTE!)

**NUNCA** use API Key sem restrições em produção!

#### Para Android:

1. Clique na API Key criada
2. Em **"Application restrictions"**, escolha **"Android apps"**
3. Adicione:
   - **Package name:** `com.helpnow.app`
   - **SHA-1 fingerprint:** (obter com comando abaixo)

```bash
# Obter SHA-1 fingerprint
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Para release (após criar keystore)
keytool -list -v -keystore release-keystore.jks
```

4. Em **"API restrictions"**, escolha **"Restrict key"**
5. Selecione apenas:
   - Maps SDK for Android
   - Places API
   - Geolocation API

#### Para iOS:

1. Crie uma segunda API Key
2. Em **"Application restrictions"**, escolha **"iOS apps"**
3. Adicione **Bundle ID:** `com.helpnow.app`
4. Restrinja às APIs necessárias

#### Para Web/Testing:

1. Crie terceira API Key (apenas para desenvolvimento)
2. **HTTP referrers (web sites)**
3. Adicione:
   - `localhost/*`
   - `*.flutterflow.io/*` (para preview)
   - `helpnow.app/*` (seu domínio)

## Passo 4: Configurar no FlutterFlow

1. No FlutterFlow, vá em **"Settings" → "Integrations"**
2. Clique em **"Google Maps"**
3. Cole as API Keys:
   - **Android:** API Key restrita para Android
   - **iOS:** API Key restrita para iOS
   - **Web:** API Key restrita para web

## Passo 5: Configurar Permissões

### iOS (Info.plist)

No FlutterFlow, vá em **"Settings" → "Permissions" → "iOS"**

Adicione:
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>Precisamos da sua localização para encontrar profissionais próximos</string>

<key>NSLocationAlwaysUsageDescription</key>
<string>Usamos sua localização para melhorar sua experiência</string>
```

### Android (AndroidManifest.xml)

Vá em **"Settings" → "Permissions" → "Android"**

Adicione:
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.INTERNET" />
```

E dentro de `<application>`:
```xml
<meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="YOUR_ANDROID_API_KEY" />
```

## Passo 6: Implementar Funcionalidades

### Obter Localização Atual

```dart
import 'package:geolocator/geolocator.dart';

Future<Position> getCurrentLocation() async {
  bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
  if (!serviceEnabled) {
    throw Exception('Serviço de localização desabilitado');
  }

  LocationPermission permission = await Geolocator.checkPermission();
  if (permission == LocationPermission.denied) {
    permission = await Geolocator.requestPermission();
    if (permission == LocationPermission.denied) {
      throw Exception('Permissão de localização negada');
    }
  }

  return await Geolocator.getCurrentPosition(
    desiredAccuracy: LocationAccuracy.high
  );
}
```

### Buscar Profissionais Próximos

Use **Geohashing** para queries eficientes:

```dart
import 'package:geoflutterfire/geoflutterfire.dart';

final geo = Geoflutterfire();

// Criar query geográfica
Stream<List<DocumentSnapshot>> getNearbyProfessionals(
  double lat,
  double lng,
  double radius // em km
) {
  GeoFirePoint center = geo.point(latitude: lat, longitude: lng);

  var collectionReference = FirebaseFirestore.instance
      .collection('professionals')
      .where('isAcceptingJobs', isEqualTo: true);

  return geo.collection(collectionRef: collectionReference)
      .within(
        center: center,
        radius: radius,
        field: 'location',
        strictMode: true
      );
}
```

### Calcular Distância

```dart
import 'package:geolocator/geolocator.dart';

double calculateDistance(
  double lat1, double lon1,
  double lat2, double lon2
) {
  return Geolocator.distanceBetween(lat1, lon1, lat2, lon2) / 1000; // em km
}

String formatDistance(double distanceInKm) {
  if (distanceInKm < 1) {
    return '${(distanceInKm * 1000).toInt()} m';
  }
  return '${distanceInKm.toStringAsFixed(1)} km';
}
```

### Autocomplete de Endereços

```dart
import 'package:google_maps_webservice/places.dart';

final places = GoogleMapsPlaces(apiKey: 'YOUR_API_KEY');

Future<List<PlacesAutocompleteResponse>> searchAddress(String input) async {
  PlacesAutocompleteResponse response = await places.autocomplete(
    input,
    language: 'pt',
    components: [Component(Component.country, 'pt')], // Portugal
  );

  if (response.isOkay) {
    return response.predictions;
  }
  return [];
}
```

### Converter Endereço em Coordenadas (Geocoding)

```dart
import 'package:geocoding/geocoding.dart';

Future<LatLng> getCoordinatesFromAddress(String address) async {
  List<Location> locations = await locationFromAddress(address);

  if (locations.isNotEmpty) {
    return LatLng(locations.first.latitude, locations.first.longitude);
  }
  throw Exception('Endereço não encontrado');
}
```

### Exibir Mapa no FlutterFlow

1. Adicione widget **GoogleMap**
2. Configure:
   - **Initial Location:** App State → userLocation
   - **Markers:** List of professionals (mapping)
   - **Zoom:** 14

3. **Marker Builder:**
   ```
   For each professional in professionalsList:
     Marker(
       position: LatLng(professional.location.lat, professional.location.lng),
       infoWindow: professional.displayName,
       onTap: Navigate to ProfessionalDetailPage
     )
   ```

## Passo 7: Salvar Geohash no Firestore

Para permitir queries geográficas eficientes:

```dart
import 'package:geoflutterfire/geoflutterfire.dart';

final geo = Geoflutterfire();

Future<void> saveProfessionalLocation(
  String professionalId,
  double lat,
  double lng
) async {
  GeoFirePoint location = geo.point(latitude: lat, longitude: lng);

  await FirebaseFirestore.instance
      .collection('professionals')
      .doc(professionalId)
      .update({
        'location': location.data,
        'geohash': location.hash,
      });
}
```

Estrutura no Firestore:
```json
{
  "location": {
    "geopoint": {
      "latitude": 41.1579,
      "longitude": -8.6291
    },
    "geohash": "eyng2mte"
  },
  "geohash": "eyng2mte"
}
```

## Passo 8: Configurar Billing e Quotas

### Monitorar Uso

1. Vá em **"APIs & Services" → "Dashboard"**
2. Veja uso de cada API
3. Configure alertas de orçamento

### Custos Estimados

| API | Preço | Estimativa Mensal (MVP) |
|-----|-------|-------------------------|
| Maps SDK (Mobile) | €7 / 1000 loads | €10-20 |
| Places API (Autocomplete) | €2.83 / 1000 requests | €5-10 |
| Geocoding API | €5 / 1000 requests | €2-5 |
| Geolocation API | €5 / 1000 requests | €2-5 |
| **Total** | | **€20-40** |

**Crédito gratuito:** €200/mês para novos usuários (12 meses).

### Otimizar Custos

1. **Cache de geocoding:**
   - Salve coordenadas no Firestore
   - Não faça geocoding repetido do mesmo endereço

2. **Lazy loading de mapas:**
   - Carregue mapa apenas quando necessário
   - Use imagens estáticas quando possível

3. **Limitar autocomplete:**
   - Apenas após 3+ caracteres
   - Debounce de 300ms

```dart
Timer? _debounce;

void onSearchChanged(String query) {
  if (_debounce?.isActive ?? false) _debounce!.cancel();

  _debounce = Timer(const Duration(milliseconds: 300), () {
    if (query.length >= 3) {
      searchAddress(query);
    }
  });
}
```

## Passo 9: Testar

### Teste Local

```bash
# Simular localização no emulador Android
adb emu geo fix -8.6291 41.1579  # Porto, Portugal

# Simular no iOS Simulator
# Debug → Location → Custom Location
# Latitude: 41.1579, Longitude: -8.6291
```

### Teste em Dispositivo Real

1. Compile o app
2. Ative localização no dispositivo
3. Verifique se:
   - Mapa carrega corretamente
   - Localização atual é obtida
   - Profissionais próximos aparecem
   - Autocomplete funciona

## Passo 10: Migrar para Produção

1. **Crie novas API Keys para produção** (não reutilize as de teste!)
2. **Restrinja por pacote/bundle:** Nunca use `*` wildcard
3. **Habilite faturamento:** Configure método de pagamento
4. **Configure alertas:** Alertas de uso > €50/dia

## Troubleshooting

### Mapa não carrega (tela branca)

**Causa:** API Key incorreta ou sem permissões.

**Solução:**
1. Verifique se API Key está correta
2. Verifique se APIs estão habilitadas
3. Verifique restrições da Key

### Erro: "This API project is not authorized"

**Causa:** Package name ou Bundle ID incorreto nas restrições.

**Solução:** Verifique se package/bundle corresponde exatamente.

### Localização não funciona

**Causa:** Permissões não concedidas.

**Solução:**
1. Verifique se solicitou permissões
2. Verifique Settings do dispositivo
3. Em iOS, verifique Info.plist

### Erro de quota excedida

**Causa:** Atingiu limite gratuito.

**Solução:**
1. Configure faturamento
2. Otimize uso (cache, lazy loading)
3. Considere alternativas (OpenStreetMap)

## Alternativas (Futuro)

Se custos ficarem altos:

1. **Mapbox** (mais barato para alto volume)
2. **OpenStreetMap** (grátis, mas menos features)
3. **Here Maps** (preços competitivos)

## Recursos

- [Google Maps Platform Docs](https://developers.google.com/maps)
- [Pricing Calculator](https://mapsplatform.google.com/pricing/)
- [GeoFlutterFire](https://pub.dev/packages/geoflutterfire)
- [Geolocator Package](https://pub.dev/packages/geolocator)

---

**Última atualização:** 2025-12-11
