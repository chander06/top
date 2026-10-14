/*
 * THE PAPPAPPERO — CONFIGURAZIONE CENTRALE
 * ------------------------------------------------------------------
 * Questo è l'unico file da modificare per aggiornare dati, recapiti e link.
 * Homepage, pagine sede, footer, modulo di prenotazione e dati strutturati
 * (Schema.org) leggono tutti da qui.
 *
 * Regole:
 *  - Un campo vuoto ('' / null / []) significa "dato non disponibile":
 *    il sito lo nasconde e non genera mai link non funzionanti.
 *  - Per vedere i dati mancanti evidenziati, apri il sito aggiungendo
 *    ?bozza=1 all'indirizzo (es. /frascati/?bozza=1). Gli utenti normali non li vedono.
 *  - WhatsApp: formato internazionale, solo cifre, senza + e senza spazi.
 *    Esempio: '393331234567'
 *  - Orari: per ogni giorno un elenco di fasce ['HH:MM','HH:MM'].
 *    Giorno con [] = chiuso. Lascia hours: null finché gli orari non sono confermati.
 *    Esempio: hours: { mon: [], tue: [['12:30','15:00'], ['19:30','23:00']], ... }
 *  - service: 'walk-in' = senza prenotazione (nessun pulsante "Prenota", CTA "Vieni a trovarci")
 *             'booking' = prenotazione via WhatsApp (modulo + pulsante "Prenota un tavolo")
 */
window.PAPPAPPERO = {
  site: {
    brand: 'THE PAPPAPPERO',
    category: 'Hosteria — Cucina Romana',
    // Dominio definitivo, senza "/" finale. Es. 'https://www.tuodominio.it'
    url: '',
    email: '',
    social: {
      instagram: '',
      facebook: '',
      tiktok: ''
    },
    // Titolare del sito e del trattamento dei dati (pagine legali e footer)
    owner: {
      ragioneSociale: '',
      indirizzo: '',
      partitaIva: '',
      codiceFiscale: '',
      rea: '',
      email: '',
      pec: ''
    },
    legalUpdated: '' // data ultimo aggiornamento testi legali, es. '14 ottobre 2026'
  },

  // Strumenti di analisi: lasciare provider '' finché non si decide di attivarli.
  // Valori supportati: '' (nessuno) | 'ga4'. Con 'ga4' compilare ga4Id e aggiornare la CSP (vedi documentazione).
  analytics: {
    provider: '',
    ga4Id: ''
  },

  // Aumentare il numero di versione quando cambiano gli strumenti soggetti a consenso:
  // il banner verrà mostrato di nuovo a tutti.
  consentVersion: 1,

  sedi: [
    {
      id: 'frascati',
      path: 'frascati/index.html',
      number: '01',
      name: 'THE PAPPAPPERO',
      area: 'Frascati',
      areaShort: 'Frascati',
      region: 'Castelli Romani',
      city: 'Frascati',
      postalCode: '00044',
      province: 'RM',
      country: 'IT',
      // ATTENZIONE: non è ancora confermato se i due indirizzi appartengano alla stessa sede
      // o a due sedi distinte. Valori: 'da-confermare' | 'stessa-sede' | 'sedi-distinte'.
      // Se risultano sedi distinte: duplicare questo blocco, assegnare un id/path nuovo
      // e lasciare un solo indirizzo per blocco (vedi documentazione/CONTENUTI.md).
      addressRelation: 'da-confermare',
      service: 'walk-in',
      serviceNote: '',
      addresses: [
        { street: 'Via Giuseppe Lunati 8', note: '' },
        { street: 'Via Padre Campana 3', note: 'Due ingressi' }
      ],
      whatsapp: '',
      phone: '',
      googleMapsUrl: '',      // link ufficiale alla sede su Google Maps (se vuoto viene generata una ricerca per indirizzo)
      googleBusinessUrl: '',  // link al profilo Google Business ufficiale
      directionsUrl: '',      // link diretto alle indicazioni (se vuoto viene generato dall'indirizzo)
      geo: { lat: null, lng: null },
      hours: null,
      menuUrl: '',
      photos: [] // [{ src: 'assets/img/nome-file-1152.jpg', alt: 'Descrizione' }]
    },
    {
      id: 'casal-palocco-acilia',
      path: 'casal-palocco-acilia/index.html',
      number: '02',
      name: 'THE PAPPAPPERO',
      area: 'Casal Palocco · Acilia',
      areaShort: 'Casal Palocco',
      region: 'Roma',
      city: 'Roma',
      postalCode: '00124',
      province: 'RM',
      country: 'IT',
      addressRelation: 'stessa-sede',
      service: 'booking',
      serviceNote: 'Si mangia comodi, in sala. Prenoti con un messaggio su WhatsApp e ti rispondiamo noi per confermare il tavolo.',
      addresses: [
        { street: 'Via di Macchia Palocco 186', note: '' }
      ],
      whatsapp: '',
      phone: '',
      googleMapsUrl: '',
      googleBusinessUrl: '',
      directionsUrl: '',
      geo: { lat: null, lng: null },
      hours: null,
      menuUrl: '',
      photos: []
    }
  ]
};
