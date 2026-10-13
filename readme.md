# Pong Arcade - Extensió de Chrome

**Pong Arcade** és una adaptació fidel, ràpida i elegant del clàssic joc de tenis taula retro dels anys 70, dissenyada per funcionar com una extensió per al navegador Google Chrome (Manifest V3). 

Ofereix una experiència de joc immediata i fluida en una finestra emergent (*popup*), ideal per fer pauses ràpides sense necessitat d'obrir noves pestanyes ni carregar llocs webs externs.

---

## 🌟 Característiques principals

- **Accés immediat:** Obre el joc amb un sol clic des de la barra d'eines del navegador.
- **Controls dobles:** Juga de forma còmoda utilitzant el ratolí sobre el camp o les tecles del teclat (`W` / `S` o les fletxes `↑` / `↓`).
- **Rendiment optimitzat:** Desenvolupat amb HTML5 Canvas per aconseguir una taxa de fotogrames estable i un moviment ultra fluid.
- **Sistema de telemetria d'errors (1xx–5xx):** Mòdul de diagnòstic integrat en temps real per detectar i categoritzar qualsevol fallada tècnica durant les proves.
- **100% Privat i Offline:** No requereix connexió a Internet ni recull cap tipus de dada d'usuari.

---

## 📁 Estructura del projecte

```text
pong-extension/
├── manifest.json       # Configuració del Manifest V3 de Chrome
├── background.js       # Service worker per a la gestió d'events i registres
├── error-handler.js    # Sistema de diagnòstic i capturador d'errors
├── index.html          # Interfície visual del popup de l'extensió
├── script.js           # Lògica principal del joc i bucle d'animació
├── styles.css          # Estils visuals retro i adaptació de mida
├── README.md           # Documentació del projecte
└── icons/              # Icones oficials de l'extensió
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## 🛠️ Instruccions d'instal·lació (Mode desenvolupador)

Per provar o instal·lar aquesta extensió localment a Google Chrome, segueix aquests passos:

1. **Descarrega o clona** aquest repositori al teu ordinador.
2. Obre Google Chrome i navega a la direcció: `chrome://extensions/`
3. A la cantonada superior dreta, activa l'opció **Mode de desenvolupador** (*Developer mode*).
4. Fes clic al botó **Carrega la descapsulada** (*Load unpacked*) que apareixerà a la part superior esquerra.
5. Selecciona la carpeta `pong-extension` que conté el fitxer `manifest.json`.
6. L'extensió s'afegirà automàticament a la teva barra d'eines. Fes clic a la icona de la taca de fitxa per fixar **Pong Arcade** i començar a jugar!

---

## 🚨 Sistema de Codis d'Error (Diagnòstic i Depuració)

El fitxer `error-handler.js` inclou una taxonomia de codis d'error categoritzada per facilitar la identificació de fallades durant la fase de desenvolupament o proves:

| Codi | Categoria | Descripció / Diagnòstic |
| :--- | :--- | :--- |
| **1xx** | **Entorn / Inicialització** |
| `101` | `ENV_WINDOW_UNDEFINED` | Context global de la finestra no disponible. |
| `102` | `ENV_CHROME_API_MISSING` | Les APIS de runtime de Chrome no estan disponibles. |
| `103` | `ENV_INIT_TIMEOUT` | La inicialització de l'entorn ha superat el temps d'espera. |
| **2xx** | **DOM / Canvas** |
| `201` | `DOM_CANVAS_MISSING` | L'element `<canvas id="gameCanvas">` no s'ha trobat al DOM. |
| `202` | `DOM_CONTEXT_2D_FAILED` | No s'ha pogut obtenir el context de renderització 2D del Canvas. |
| `203` | `DOM_UI_ELEMENT_MISSING` | Falta un o més elements de la interfície d'usuari (marcador, botó, etc.). |
| **3xx** | **Recursos / Xarxa** |
| `301` | `ASSET_STYLESHEET_MISSING` | El fitxer d'estils (`styles.css`) no s'ha carregat correctament. |
| `302` | `ASSET_FONT_IMAGE_LOAD_FAILED` | Error en carregar recursos gràfics o tipogràfics locals. |
| **4xx** | **Runtime de l'extensió** |
| `401` | `EXT_DISCONNECTED` | Es va perdre la connexió amb el *service worker* de l'extensió. |
| `402` | `EXT_STORAGE_ERROR` | Error en accedir a l'API d'emmagatzematge local `chrome.storage`. |
| **5xx** | **Lògica del Joc / Excepcions** |
| `501` | `GAME_UNHANDLED_EXCEPTION` | Excepció de JavaScript no controlada durant l'execució del joc. |
| `502` | `GAME_UNHANDLED_REJECTION` | Promesa asíncrona rebutjada no gestionada. |
| `503` | `GAME_LOOP_CRASH` | Fallada crítica dins del bucle d'animació principal (*requestAnimationFrame*). |

---

## 🔒 Política de Privadesa Oficial

**Última actualització:** Octubre 2026

L'extensió **Pong Arcade** està dissenyada prioritzant la privadesa absoluta dels usuaris. 

### 1. Recopilació de dades
**Pong Arcade NO recull, emmagazema, processa ni transmet cap tipus de dada personal o d'identificació d'usuari.**

### 2. Ús dels permisos del navegador
- **Permís `storage`:** S'utilitza exclusivament de manera local al navegador de l'usuari (`chrome.storage.local`) per desar registres d'errors tècnics i estat intern del joc. Aquestes dades mai no surten del dispositiu.
- No s'utilitzen permisos de lectura d'historial, pestanyes obertes, dades de navegació ni contingut de webs terceres.

### 3. Transferència i divulgació a tercers
En no recopilar cap dada, **no es ven, cedeix ni comparteix cap informació amb tercers**, empreses d'analítica o xarxes de publicitat.

### 4. Execució offline
Tot el codi (HTML, CSS i JS) s'executa íntegrament des del paquet local de l'extensió. No es realitza cap crida a servidors externs ni s'executa codi remot (*remote code*).

---

## 📜 Llicència

Aquest projecte es distribueix sota la llicència MIT. Consulta el fitxer de llicència per a més detalls.