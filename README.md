# THE PAPPAPPERO — sito web

Sito statico (HTML, CSS e JavaScript senza dipendenze) per THE PAPPAPPERO — Hosteria, Cucina Romana.
Nessun build, nessun server, nessun database: si pubblica così com'è su **GitHub Pages**.

## Pubblicare su GitHub Pages

1. Crea un repository su GitHub (es. `pappappero-sito`).
2. Carica **il contenuto di questa cartella** nella radice del repository
   (`index.html` deve stare in primo livello, non dentro una sottocartella).
   - Da browser: *Add file → Upload files*, trascina tutti i file e le cartelle.
   - **Importante:** il file `.nojekyll` e la cartella `.well-known/` iniziano con un punto e su macOS/Windows
     possono essere nascosti. Assicurati che vengano caricati (con GitHub Desktop o `git` succede automaticamente).
     Senza `.nojekyll`, GitHub ignora la cartella `.well-known/`.
3. *Settings → Pages → Build and deployment*: Source **Deploy from a branch**, branch `main`, cartella `/ (root)`.
4. Dopo 1–2 minuti il sito è online su `https://NOMEUTENTE.github.io/NOME-REPOSITORY/`.
   Tutti i percorsi sono relativi: il sito funziona sia in questa sottocartella sia sul dominio definitivo.

### Collegare il dominio definitivo
1. *Settings → Pages → Custom domain*: inserisci il dominio (GitHub crea il file `CNAME`).
2. Configura i DNS presso il registrar come indicato da GitHub.
3. Attiva **Enforce HTTPS**.
4. Sostituisci in tutto il repository `https://www.dominio-da-definire.it` con il dominio reale
   (su github.com premi il tasto `.` per aprire l'editor web e usa *Cerca e sostituisci*).
   File coinvolti: tutte le pagine `index.html` (tag Open Graph), `robots.txt`, `sitemap.xml`, `.well-known/security.txt`.
5. Inserisci lo stesso dominio in `assets/js/config.js` → `site.url` (serve ai dati strutturati Schema.org).

## Dove si modificano i dati

**Un solo file: `assets/js/config.js`.** Numeri WhatsApp, telefoni, link Google Maps e Google Business, orari,
foto, menu, social e dati del titolare. Homepage, pagine delle sedi, footer, modulo di prenotazione e Schema.org
leggono tutti da lì. Un campo vuoto viene nascosto: il sito non mostra mai link non funzionanti.

Per vedere evidenziati i dati mancanti apri qualsiasi pagina con `?bozza=1` (es. `/frascati/?bozza=1`).
Con `?bozza=1&banner=1` si vede anche il banner cookie.

## Struttura

```
index.html                      Homepage
frascati/index.html             Pagina sede Frascati
casal-palocco-acilia/index.html Pagina sede Casal Palocco · Acilia
privacy/ cookie/ termini/       Pagine legali (bozze da verificare)
404.html                        Pagina non trovata
assets/js/config.js             ← DATI CENTRALIZZATI
assets/js/main.js               Interazioni (prenotazione, menu, consenso, Schema.org)
assets/css/style.css            Stile
assets/img/ assets/icons/       Immagini ottimizzate (WebP + JPG) e icone
assets/fonts/                   Caratteri ospitati localmente (nessuna chiamata a Google Fonts)
robots.txt  sitemap.xml  site.webmanifest  .well-known/security.txt  _headers  .nojekyll
documentazione/                 Checklist e guida tecnica
```

Leggi `documentazione/CHECKLIST.md` prima della pubblicazione e `documentazione/GUIDA-TECNICA.md`
per sicurezza, SEO, analytics e manutenzione.
