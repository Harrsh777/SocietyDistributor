"use client"

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { FiRefreshCw, FiCopy, FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface DSERecord {
  dse_name: string;
  sm: string | null;
  ct: string | null;
  be: string | null;
  tbe: string | null;
  dse_type: string | null;
}

export default function DSENamesPage() {
  const [dseRecords, setDseRecords] = useState<DSERecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDSENames = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('dse_attendance')
        .select('dse_name, sm, ct, be, tbe, dse_type')
        .not('dse_name', 'is', null)
        .order('dse_name', { ascending: true });

      if (fetchError) throw fetchError;

      // Get unique records based on dse_name (keep first occurrence)
      const uniqueMap = new Map<string, DSERecord>();
      data.forEach((item: any) => {
        if (item.dse_name && !uniqueMap.has(item.dse_name)) {
          uniqueMap.set(item.dse_name, {
            dse_name: item.dse_name,
            sm: item.sm || null,
            ct: item.ct || null,
            be: item.be || null,
            tbe: item.tbe || null,
            dse_type: item.dse_type || null,
          });
        }
      });

      const uniqueRecords = Array.from(uniqueMap.values());
      setDseRecords(uniqueRecords);
      toast.success(`Found ${uniqueRecords.length} unique DSE records`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch DSE names';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error fetching DSE names:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDSENames();
  }, []);

  const copyToClipboard = () => {
    const header = 'DSE Name\tSM\tCT\tBE\tTBE\tDSE Type';
    const rows = dseRecords.map(record => 
      `${record.dse_name}\t${record.sm || ''}\t${record.ct || ''}\t${record.be || ''}\t${record.tbe || ''}\t${record.dse_type || ''}`
    );
    const text = [header, ...rows].join('\n');
    navigator.clipboard.writeText(text);
    toast.success('DSE records copied to clipboard!');
  };

  const downloadAsText = () => {
    const header = 'DSE Name\tSM\tCT\tBE\tTBE\tDSE Type';
    const rows = dseRecords.map(record => 
      `${record.dse_name}\t${record.sm || ''}\t${record.ct || ''}\t${record.be || ''}\t${record.tbe || ''}\t${record.dse_type || ''}`
    );
    const text = [header, ...rows].join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dse_records_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('DSE records downloaded!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                DSE Names from Database
              </h1>
              <p className="text-gray-600">
                All unique DSE records with <code className="bg-gray-100 px-2 py-1 rounded">dse_name</code>, <code className="bg-gray-100 px-2 py-1 rounded">sm</code>, <code className="bg-gray-100 px-2 py-1 rounded">ct</code>, <code className="bg-gray-100 px-2 py-1 rounded">be</code>, <code className="bg-gray-100 px-2 py-1 rounded">tbe</code>, and <code className="bg-gray-100 px-2 py-1 rounded">dse_type</code> from <code className="bg-gray-100 px-2 py-1 rounded">dse_attendance</code> table
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchDSENames}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
              <button
                onClick={copyToClipboard}
                disabled={loading || dseRecords.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FiCopy />
                Copy All
              </button>
              <button
                onClick={downloadAsText}
                disabled={loading || dseRecords.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FiDownload />
                Download
              </button>
            </div>
          </div>

          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-gray-600">Loading DSE names...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 font-semibold">Error:</p>
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="mb-4 p-4 bg-indigo-50 rounded-lg">
                <p className="text-indigo-800 font-semibold">
                  Total Unique DSE Records: <span className="text-2xl">{dseRecords.length}</span>
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 max-h-[600px] overflow-y-auto">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700">DSE Name</th>
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700">SM</th>
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700">CT</th>
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700">BE</th>
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700">TBE</th>
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700">DSE Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dseRecords.map((record, index) => (
                        <tr
                          key={index}
                          className="bg-white hover:bg-gray-50 transition-colors"
                        >
                          <td className="border border-gray-300 px-4 py-2">
                            <code className="text-sm text-gray-800 font-mono">{record.dse_name}</code>
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">
                            {record.sm || <span className="text-gray-400">-</span>}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">
                            {record.ct || <span className="text-gray-400">-</span>}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">
                            {record.be || <span className="text-gray-400">-</span>}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">
                            {record.tbe || <span className="text-gray-400">-</span>}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">
                            {record.dse_type || <span className="text-gray-400">-</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {dseRecords.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No DSE records found in the database.
                </div>
              )}
            </>
          )}
        </div>

        {/* SQL Query Reference */}
        <div className="bg-white rounded-lg shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">SQL Query Reference</h2>
          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-green-400 text-sm">
{`-- Get all unique DSE records with all fields
SELECT DISTINCT ON (dse_name) 
  dse_name, sm, ct, be, tbe, dse_type
FROM public.dse_attendance 
WHERE dse_name IS NOT NULL 
ORDER BY dse_name, created_at DESC;

-- Get all dse_name values with count
SELECT dse_name, COUNT(*) as count
FROM public.dse_attendance 
WHERE dse_name IS NOT NULL 
GROUP BY dse_name 
ORDER BY dse_name;

-- Get all records with dse_name and related fields
SELECT id, dse_name, sm, ct, be, tbe, dse_type, branch, created_at
FROM public.dse_attendance 
WHERE dse_name IS NOT NULL 
ORDER BY dse_name;`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

