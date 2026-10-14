# Checklist dati e verifiche prima della pubblicazione

Tutti i dati si inseriscono in `assets/js/config.js`, salvo dove indicato.
Apri il sito con `?bozza=1` per vedere cosa manca, pagina per pagina.

## Da decidere / confermare
- [ ] **Indirizzi di Frascati**: Via Giuseppe Lunati 8 e Via Padre Campana 3 sono la stessa sede o due sedi distinte?
      Cosa significano i "due ingressi" di Via Padre Campana 3? → `addressRelation` (vedi GUIDA-TECNICA, "Sedi").
- [ ] Dominio definitivo → README, "Collegare il dominio definitivo".
- [ ] CAP inseriti (00044 Frascati, 00124 Casal Palocco): verificarli.

## Per ogni sede
- [ ] Numero WhatsApp di Casal Palocco (formato `393331234567`) → `whatsapp` (Frascati non prenota: non serve)
- [ ] Telefono → `phone`
- [ ] Link ufficiale Google Business Profile → `googleBusinessUrl`
- [ ] Link Google Maps della scheda ufficiale → `googleMapsUrl` (finché vuoto si usa una ricerca per indirizzo)
- [ ] Coordinate → `geo.lat`, `geo.lng`
- [ ] Orari ufficiali → `hours`
- [ ] Menu (PDF in `assets/menu/` o URL) → `menuUrl`
- [ ] Fotografie specifiche della sede → `photos` (ottimizzate, max 1600px lato lungo, WebP o JPG)

## Brand e contenuti
- [ ] Logo vettoriale originale (in uso: tracciato estratto dal PDF fornito "Insegna")
- [ ] Fotografie dei piatti (nessuna foto di piatti è presente nel sito: non ne sono state fornite)
- [ ] Menu e prezzi, se da pubblicare
- [ ] Profili social ufficiali → `site.social`
- [ ] Indicare quale sede ritraggono le foto attuali (sala, insegna, dettaglio): ora sono usate come immagini del brand, senza attribuirle a una sede

## Legale
- [ ] Ragione sociale, indirizzo, P. IVA, C.F., REA, e-mail, PEC → `site.owner`
- [ ] Data aggiornamento testi legali → `site.legalUpdated`
- [ ] Revisione di Privacy Policy, Cookie Policy e Termini da parte di un professionista
- [ ] Indicare fornitore di hosting e periodo di conservazione delle chat WhatsApp (Privacy Policy)
- [ ] Recapito reale per `.well-known/security.txt`

## Verifiche da fare dopo la pubblicazione
- [ ] Ogni pagina si apre (home, 2 sedi, 3 legali, una pagina inesistente → 404)
- [ ] Ogni pulsante "Prenota" apre WhatsApp sul numero di Casal Palocco, con il messaggio corretto
- [ ] Nessun pulsante di prenotazione compare per Frascati; "Vieni a trovarci" apre le indicazioni corrette
- [ ] Ogni link Google Maps / Google Business porta alla scheda della sede giusta
- [ ] Test su iPhone e Android reali (modulo, selettori data/ora, barra in basso)
- [ ] Rich Results Test di Google sulle pagine sede (dati strutturati Restaurant)
- [ ] Invio della sitemap in Google Search Console
- [ ] Lighthouse (prestazioni, accessibilità, SEO) su mobile
- [ ] `https://DOMINIO/.well-known/security.txt` raggiungibile
