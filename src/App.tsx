import { useState, useEffect, useMemo } from 'react'
import Papa from 'papaparse'
import { fetchConcordances, type ConcordanceRow } from './api/dhlab'

interface CorpusItem {
  dhlabid: number
  avis: string
  dato: string
}

function App() {
  // Korpus state
  const [corpus, setCorpus] = useState<CorpusItem[]>([])
  const [corpusLoading, setCorpusLoading] = useState(true)

  // Filter state
  const [avisFilter, setAvisFilter] = useState<string>('')
  const [yearFilter, setYearFilter] = useState<string>('')

  // Søk state
  const [query, setQuery] = useState('')
  const [windowSize, setWindowSize] = useState(20)
  const [limit, setLimit] = useState(500)
  
  const [results, setResults] = useState<ConcordanceRow[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [error, setError] = useState('')

  // 1. Last inn CSV ved oppstart
  useEffect(() => {
    Papa.parse<any>(`${import.meta.env.BASE_URL}korpus.csv`, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed = results.data
          .map((row) => ({
            dhlabid: Number(row.dhlabid),
            avis: row.avis || '',
            dato: row.dato || '',
          }))
          .filter((item) => !isNaN(item.dhlabid))
        setCorpus(parsed)
        setCorpusLoading(false)
      },
      error: (err: unknown) => {
        console.error("Feil ved lasting av korpus:", err)
        setError("Kunne ikke laste inn korpus-filen.")
        setCorpusLoading(false)
      }
    })
  }, [])

  // 2. Bygg unike lister for filter-dropdowns
  const uniqueAviser = useMemo(() => {
    const aviser = new Set(corpus.map(c => c.avis).filter(Boolean))
    return Array.from(aviser).sort()
  }, [corpus])

  const uniqueYears = useMemo(() => {
    // Forventer dato format YYYY-MM-DD
    const years = new Set(corpus.map(c => c.dato.substring(0, 4)).filter(y => y.length === 4))
    return Array.from(years).sort()
  }, [corpus])

  // 3. Filtrer korpuset
  const filteredCorpus = useMemo(() => {
    return corpus.filter(c => {
      const matchAvis = avisFilter ? c.avis === avisFilter : true
      const matchYear = yearFilter ? c.dato.startsWith(yearFilter) : true
      return matchAvis && matchYear
    })
  }, [corpus, avisFilter, yearFilter])

  // 4. Utfør søk
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault() // Hindrer siden i å laste på nytt (og at søk skjer på tastetrykk)
    if (!query.trim()) return
    if (filteredCorpus.length === 0) {
      setError('Det filtrerte korpuset er tomt.')
      return
    }

    setSearchLoading(true)
    setError('')
    try {
      const dhlabids = filteredCorpus.map(c => c.dhlabid)
      
      const res = await fetchConcordances(query, dhlabids, windowSize, limit)
      setResults(res)
    } catch (err) {
      setError(String(err))
    } finally {
      setSearchLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Louise Korpus</h1>
        <p className="text-gray-600">Søk i utvalgte utgaver (Gjenoppbygget fra DH-lab)</p>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Venstre kolonne: Filtre */}
        <aside className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Filtrer korpus</h2>
            
            {corpusLoading ? (
              <p className="text-sm text-gray-500 animate-pulse">Laster korpus (15MB)...</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Avis</label>
                  <select 
                    value={avisFilter}
                    onChange={(e) => setAvisFilter(e.target.value)}
                    className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                  >
                    <option value="">-- Alle aviser --</option>
                    {uniqueAviser.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Årstall</label>
                  <select 
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                    className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                  >
                    <option value="">-- Alle år --</option>
                    {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600">
                    Søker i <strong className="text-blue-600">{filteredCorpus.length}</strong> av {corpus.length} utgaver.
                  </p>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Høyre kolonne: Søk og resultater */}
        <div className="md:col-span-3 space-y-6">
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <form onSubmit={handleSearch} className="flex flex-col gap-4">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Skriv inn nøkkelord eller frase..."
                  disabled={corpusLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={searchLoading || corpusLoading || filteredCorpus.length === 0}
                  className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {searchLoading ? 'Søker...' : 'Søk'}
                </button>
              </div>
              
              <div className="flex gap-6 text-sm text-gray-600 mt-2">
                <label className="flex items-center gap-2">
                  <span>Vindu (ord før/etter):</span>
                  <input 
                    type="number" 
                    min="1" 
                    max="100"
                    value={windowSize}
                    onChange={(e) => setWindowSize(Number(e.target.value))}
                    className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </label>
                <label className="flex items-center gap-2">
                  <span>Maks treff (limit):</span>
                  <input 
                    type="number" 
                    min="1" 
                    max="5000"
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                    className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </label>
              </div>
            </form>
            {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}
          </section>

          <section>
            {results.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-700">Søkeresultater ({results.length} treff)</h3>
                </div>
                <div className="max-h-[600px] overflow-y-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 sticky top-0 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">URN</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kontekst</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {results.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-xs text-gray-500 font-mono align-top w-48 break-all">
                            {row.urn}
                          </td>
                          <td 
                            className="px-6 py-4 text-sm text-gray-800"
                            dangerouslySetInnerHTML={{ __html: row.conc }}
                          />
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {!searchLoading && results.length === 0 && query && (
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
                <p className="text-gray-500">Ingen treff for "{query}" i det valgte utvalget.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

export default App
