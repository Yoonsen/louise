/**
 * Funksjoner for å kommunisere med dhlab API.
 * Gjenskapt fra Garborg-appen (https://api.nb.no/dhlab/)
 */

export interface ConcordanceRow {
  dhlabid: string;
  urn: string;
  conc: string; // HTML formatert tekst
}

export interface FrequencyRow {
  urn: string;
  word: string;
  freq: number;
}

/**
 * Henter konkordanser for et gitt søkeord i et utvalg dokumenter (dhlabids)
 */
export async function fetchConcordances(
  query: string,
  dhlabids: number[],
  windowSize: number = 20,
  limit: number = 500
): Promise<ConcordanceRow[]> {
  const response = await fetch("https://api.nb.no/dhlab/conc", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      dhlabids,
      window: windowSize,
      limit,
      html_formatting: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status}`);
  }

  const payload = await response.json();
  
  // payload fra dhlab er et Pandas DataFrame eksportert som et kolonne-objekt (dict),
  // f.eks. { docid: { "0": 123 }, urn: { "0": "urn..." }, conc: { "0": "..." } }
  // Vi må flate dette ut til et vanlig array av objekter.
  const rows: ConcordanceRow[] = [];
  
  if (payload && payload.urn) {
    const keys = Object.keys(payload.urn);
    for (const key of keys) {
      rows.push({
        dhlabid: String(payload.docid?.[key] || ''),
        urn: payload.urn[key] || '',
        conc: payload.conc?.[key] || ''
      });
    }
  }

  return rows;
}

/**
 * Henter ordfrekvenser for spesifikke ord i et sett med URN-er
 */
export async function fetchFrequencies(
  urns: string[],
  words: string[],
  cutoff: number = 0
): Promise<FrequencyRow[]> {
  const response = await fetch("https://api.nb.no/dhlab/frequencies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ urns, words, cutoff }),
  });

  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status}`);
  }

  const payload = await response.json();
  return payload as FrequencyRow[];
}
