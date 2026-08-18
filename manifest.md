# Prosjektmanifest: Louise (Korpus-app)

## Visjon
Å bygge en moderne, rask og brukervennlig korpus-applikasjon (Progressive Web App - PWA) skreddersydd for PhD-stipendiater. Appen skal gjøre det intuitivt å utføre tekstanalyse og søk i Nasjonalbibliotekets samlinger via **dhlab API**.

## Målgruppe
Hovedbrukerne er PhD-stipendiater og andre forskere innen humaniora og samfunnsvitenskap. De trenger et verktøy som er kraftig nok for akademisk forskning, men med et rent og forståelig grensesnitt som reduserer den tekniske terskelen.

## Teknologivalg
For å sikre et profesjonelt utseende, god ytelse og enkel videreutvikling, velges følgende stack:
*   **Frontend-rammeverk:** React (via Vite for optimal byggehastighet og moderne tooling).
*   **Styling:** Tailwind CSS. Dette gir oss stor fleksibilitet til å bygge et pent, responsivt og tilgjengelig (accessible) brukergrensesnitt raskt.
*   **Arkitektur:** Progressive Web App (PWA). Gjør at appen kan "installeres" fra nettleseren (f.eks. på hjemskjermen eller skrivebordet), kjøre som en frittstående app, og cache ressurser for raskere innlasting.
*   **Hosting:** GitHub Pages. Siden alt kjører i nettleseren (klient-side), er dette en gratis og pålitelig løsning som integreres sømløst med kildekoden via GitHub Actions.

## Kjernefunksjonalitet (Fase 1 - MVP)
I første omgang fokuserer vi på den mest sentrale funksjonaliteten for korpusforskning:
1.  **Konkordanssøk (KWIC - Key Word In Context):**
    *   Mulighet til å søke etter ord eller fraser.
    *   Vise treffene med kontekst (ordene før og etter søkeordet).
    *   Enkel navigasjon og lenking til fulltekst eller mer metadata i NB sine systemer.
2.  **Filtrering og metadata:**
    *   Filtrere søk basert på korpus (URN-lister), årstall, forfatter etc., avhengig av hva dhlab-APIet støtter best.
3.  **Robust API-Integrasjon:**
    *   Sømløs kobling mot dhlab sitt API. Vi vil gjenbruke maler og beste praksis fra eksisterende søster-repositorier for å sikre stabile dataoppslag direkte fra nettleseren.

## Veien videre (Fremtidige faser)
Når konkordansene er på plass, kan appen eventuelt utvides med:
*   **Kollokasjoner:** Analyse av hvilke ord som ofte opptrer sammen med søkeordet.
*   **N-gram / Trendlinjer:** Visualisering av ordutvikling over tid.
*   **Eksport:** Nedlasting av søkeresultater til Excel/CSV.

## Neste steg
1.  Initialisere React + Vite + Tailwind prosjekt i repoet.
2.  Sette opp PWA-konfigurasjon (manifest og service workers).
3.  Sette opp nettverksmodulen med maler for dhlab API-kall (hente fra søster-repo hvis tilgjengelig).
4.  Utvikle en skisse/prototype for konkordans-søket.
