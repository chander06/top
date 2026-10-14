# Guida tecnica

## Scelte di architettura
- **Sito statico puro**: HTML + un CSS + due JS, nessuna dipendenza npm, nessun build. Il sito non ha
  backend né raccoglie dati: aggiungere server o database non porterebbe vantaggi.
- **Contenuto SEO nel codice HTML**: titoli, testi e indirizzi sono scritti nelle pagine, quindi indicizzabili
  anche senza JavaScript. JavaScript aggiunge dati variabili (orari, telefono, pulsanti, Schema.org) da `config.js`.
- **Percorsi relativi ovunque**: funziona su `nomeutente.github.io/repo/` e sul dominio definitivo senza modifiche.

## Identità visiva
- Concept: *«Tutto fatto in casa. Si respira l'aria di casa, con le tradizioni romane.»*
- Motivo grafico: il **disco arancione** dell'insegna, usato come elemento ricorrente (hero, card sedi, pagine sede).
- Palette (in `style.css`, `:root`): Carbone `#1C1B19`, Antracite `#2A2B2C`, Arancio `#EC9A1E` (azioni e brand),
  Avorio `#F6F1E7`, Sabbia `#E9E0CF`, Pietra `#BFB29C`. Il testo su arancio è sempre carbone (contrasto AA).
- Tipografia: **Archivo** (variabile, condensato per i titoli, normale per i testi) e **Instrument Serif** corsivo
  per le frasi evocative, che richiama la poesia dipinta in sala. Font ospitati localmente.

## Sedi
Ogni sede in `config.js` ha dati indipendenti: un pulsante di Frascati non può puntare ai link di Casal Palocco.
- **Aggiungere una sede**: duplica un blocco in `sedi`, cambia `id`, `path`, `number`; duplica una cartella sede
  (es. `frascati/`) con il nuovo nome, sostituisci nell'HTML l'id della sede (`data-sede`, `data-ld`, `data-sede-panel`…),
  titolo, descrizione e testi; aggiungi l'URL a `sitemap.xml` e i link nel menu (header).
- **Frascati, se gli indirizzi risultano due sedi distinte**: crea una seconda sede come sopra con un solo indirizzo per blocco.
  Se sono la stessa sede, imposta `addressRelation: 'stessa-sede'` e precisa le note (es. "Ingresso principale").

## Modalità di servizio per sede (`service`)
- `'walk-in'` (Frascati): nessun pulsante "Prenota", la sede non compare nel modulo. CTA principale **"Vieni a trovarci"**
  (indicazioni Google Maps) + "Apri in Google Maps". Etichetta "Senza prenotazione" su card, striscia hero e pagina.
  Nell'HTML statico della pagina Frascati i link `data-visit="frascati"` vengono aggiornati da `config.js`.
- `'booking'` (Casal Palocco): CTA principale **"Prenota un tavolo"** → modulo WhatsApp. Il pulsante "Prenota"
  dell'header punta sempre a questa sede. Schema.org: `acceptsReservations` segue questo campo.
- Se in futuro anche Frascati accettasse prenotazioni: `service: 'booking'`, compilare `whatsapp` e ripristinare
  i pulsanti nella pagina `frascati/index.html` (header, sezione "In tavola", barra mobile).

## Prenotazione WhatsApp
- Modulo: sede, nome, data, orario, persone, note facoltative. Validazione lato client con messaggi accessibili.
- Genera `https://wa.me/NUMERO?text=MESSAGGIO` con `encodeURIComponent`. Il numero viene validato (8–15 cifre);
  se manca, il modulo mostra un avviso cortese e non apre alcun link.
- Il testo dichiara che si tratta di una **richiesta**, confermata solo dalla risposta della sede.
- Alternativa: "Apri solo la chat" (stesso numero, messaggio minimo). Link diretto: `?prenota=casal-palocco-acilia` apre il modulo.
- Nessun dato viene inviato a server: il messaggio è composto nel browser.

## SEO
- Un H1 per pagina, gerarchia H2/H3, `title` e `description` distinti, canonical, Open Graph, `alt` descrittivi,
  breadcrumb sulle pagine sede, `sitemap.xml`, `robots.txt`.
- Canonical relativo (`./`): sempre corretto su qualsiasi dominio. I tag `og:url`/`og:image` richiedono l'URL assoluto:
  vanno aggiornati con il dominio (vedi README).
- Schema.org (`Organization` in home, `Restaurant` + `BreadcrumbList` nelle sedi) generato da `config.js`:
  orari, telefono, coordinate e `sameAs` compaiono solo se compilati. Nessuna recensione o valutazione.

## Privacy e cookie
- Oggi il sito non usa cookie: salva solo la scelta di consenso in `localStorage` (`pp-consent`), strumento tecnico.
- Il banner compare **solo** se è attivo uno strumento che richiede consenso (`analytics.provider`). "Preferenze cookie"
  nel footer è sempre disponibile. Accetta e Rifiuta hanno la stessa evidenza.
- Nessun servizio di terze parti incorporato: mappe e WhatsApp sono collegamenti esterni.
- Cambiando gli strumenti, aumentare `consentVersion` per richiedere di nuovo il consenso.

## Analytics (facoltativo, spento)
Per attivare GA4: `analytics.provider = 'ga4'`, `analytics.ga4Id = 'G-XXXX'`. Lo script viene caricato solo dopo il consenso.
Aggiornare Cookie Policy e Privacy Policy prima di attivarlo. Eventi già predisposti (senza dati personali):

| Evento | Quando | Parametri |
|---|---|---|
| `booking_form_open` | Apertura modulo prenotazione | `sede` |
| `booking_whatsapp_submit` | Invio a WhatsApp dal modulo | `sede`, `persone` |
| `booking_form_error` | Errore di compilazione | `sede` |
| `booking_unavailable` | Numero WhatsApp non configurato | `sede` |
| `whatsapp_chat_click` | Apertura chat diretta | `sede`, `from` |
| `visit_click` | "Vieni a trovarci" (sedi senza prenotazione) | `sede` |
| `phone_click` | Clic su "Chiama" | `sede` |
| `maps_click` / `maps_directions_click` | Google Maps / indicazioni | `sede` |
| `google_business_click` | Profilo Google | `sede` |
| `sede_card_open` / `sede_page_view` | Apertura sede | `sede` |
| `menu_open` | Apertura menu | `sede` |

Con `?bozza=1` gli eventi vengono stampati nella console del browser, utile per verificarli.

## Sicurezza
- Nessuna chiave, credenziale o dato segreto nel codice. Nessun backend da proteggere.
- I dati di `config.js` vengono inseriti solo come testo (`textContent`), mai come HTML: nessun rischio XSS.
  Gli input del modulo vengono ripuliti e limitati in lunghezza; l'URL WhatsApp è codificato.
- I link esterni usano `rel="noopener noreferrer"`.
- **Content Security Policy** via `<meta>` in ogni pagina: solo risorse dal sito stesso (più i domini Google Analytics
  già predisposti per l'eventuale attivazione). Niente script o stili inline.
- **HTTPS**: su GitHub Pages attivare "Enforce HTTPS".
- **Header HTTP**: GitHub Pages non permette header personalizzati. Il file `_headers` contiene la configurazione
  consigliata (HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, frame-ancestors) ed è letto
  automaticamente da Netlify e Cloudflare Pages. Restando su GitHub Pages, si possono applicare tramite Cloudflare
  (proxy DNS + "Transform Rules → Response headers").
- Il sito non è stato sottoposto a penetration test o audit esterni.

## Prestazioni
- Immagini ridimensionate e convertite in WebP (JPG di riserva in `assets/img/`), dimensioni esplicite per evitare
  spostamenti del layout, `fetchpriority="high"` sull'immagine principale, `loading="lazy"` sulle altre.
- Font WOFF2 locali con `font-display: swap` e preload del carattere principale.
- Animazioni solo CSS/IntersectionObserver, disattivate con `prefers-reduced-motion`.
- Nessuna libreria esterna. Peso totale della homepage ≈ 650 KB, quasi tutto immagini.

## Accessibilità
Struttura semantica, link "Vai al contenuto", focus visibile, navigazione da tastiera, menu mobile con `aria-expanded`
e tasto Esc, dialog nativi (`<dialog>`) per prenotazione e preferenze, etichette ed errori associati ai campi,
area di tocco ≥ 44px, contrasti AA. Va verificata con lettori di schermo reali (VoiceOver, TalkBack).
