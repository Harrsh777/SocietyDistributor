"use client"
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface jsPDFWithPlugin extends jsPDF {
  autoTable: (options: any) => jsPDF; // Replace 'any' with a more specific type if needed
}

// --- Type Definitions (for better readability and type safety) ---
interface DSEAttendance {
  id: string; // Assuming Supabase 'id' column or primary key
  sm: string;
  ct: string;
  be: string;
  tbe: string;
  branch: string;
  dse_name: string;
  dse_type: string;
  // Dynamic daily attendance fields (example for June 2025)
  // Made optional as data might not have all dates
  "1-Jun-25"?: string;
  "2-Jun-25"?: string;
  "3-Jun-25"?: string;
  "4-Jun-25"?: string;
  "5-Jun-25"?: string;
  "6-Jun-25"?: string;
  "7-Jun-25"?: string;
  "8-Jun-25"?: string;
  "9-Jun-25"?: string;
  "10-Jun-25"?: string;
  "11-Jun-25"?: string;
  "12-Jun-25"?: string;
  "13-Jun-25"?: string;
  "14-Jun-25"?: string;
  "15-Jun-25"?: string;
  "16-Jun-25"?: string;
  "17-Jun-25"?: string;
  "18-Jun-25"?: string;
  "19-Jun-25"?: string;
  "20-Jun-25"?: string;
  "21-Jun-25"?: string;
  "22-Jun-25"?: string;
  "23-Jun-25"?: string;
  "24-Jun-25"?: string;
  "25-Jun-25"?: string;
  "26-Jun-25"?: string;
  "27-Jun-25"?: string;
  "28-Jun-25"?: string;
  "29-Jun-25"?: string;
  "30-Jun-25"?: string;
  "1-Jul-25"?: string;
  "2-Jul-25"?: string;
  "3-Jul-25"?: string;
  "4-Jul-25"?: string;
  "5-Jul-25"?: string;
  "6-Jul-25"?: string;
  "7-Jul-25"?: string;
  "8-Jul-25"?: string;
  "9-Jul-25"?: string;
  "10-Jul-25"?: string;
  "11-Jul-25"?: string;
  "12-Jul-25"?: string;
  "13-Jul-25"?: string;
  "14-Jul-25"?: string;
  "15-Jul-25"?: string;
  "16-Jul-25"?: string;
  "17-Jul-25"?: string;
  "18-Jul-25"?: string;
  "19-Jul-25"?: string;
  "20-Jul-25"?: string;
  "21-Jul-25"?: string;
  "22-Jul-25"?: string;
  "23-Jul-25"?: string;
  "24-Jul-25"?: string;
  "25-Jul-25"?: string;
  "26-Jul-25"?: string;
  "27-Jul-25"?: string;
  "28-Jul-25"?: string;
  "29-Jul-25"?: string;
  "30-Jul-25"?: string;
  "31-Jul-25"?: string;
  "1-Aug-25"?: string;
  "2-Aug-25"?: string;
  "3-Aug-25"?: string;
  "4-Aug-25"?: string;
  "5-Aug-25"?: string;
  "6-Aug-25"?: string;
  "7-Aug-25"?: string;
  "8-Aug-25"?: string;
  "9-Aug-25"?: string;
  "10-Aug-25"?: string;
  "11-Aug-25"?: string;
  "12-Aug-25"?: string;
  "13-Aug-25"?: string;
  "14-Aug-25"?: string;
  "15-Aug-25"?: string;
  "16-Aug-25"?: string;
  "17-Aug-25"?: string;
  "18-Aug-25"?: string;
  "19-Aug-25"?: string;
  "20-Aug-25"?: string;
  "21-Aug-25"?: string;
  "22-Aug-25"?: string;
  "23-Aug-25"?: string;
  "24-Aug-25"?: string;
  "25-Aug-25"?: string;
  "26-Aug-25"?: string;
  "27-Aug-25"?: string;
  "28-Aug-25"?: string;
  "29-Aug-25"?: string;
  "30-Aug-25"?: string;
  "31-Aug-25"?: string;
  "1-Sep-25"?: string;
  "2-Sep-25"?: string;
  "3-Sep-25"?: string;
  "4-Sep-25"?: string;
  "5-Sep-25"?: string;
  "6-Sep-25"?: string;
  "7-Sep-25"?: string;
  "8-Sep-25"?: string;
  "9-Sep-25"?: string;
  "10-Sep-25"?: string;
  "11-Sep-25"?: string;
  "12-Sep-25"?: string;
  "13-Sep-25"?: string;
  "14-Sep-25"?: string;
  "15-Sep-25"?: string;
  "16-Sep-25"?: string;
  "17-Sep-25"?: string;
  "18-Sep-25"?: string;
  "19-Sep-25"?: string;
  "20-Sep-25"?: string;
  "21-Sep-25"?: string;
  "22-Sep-25"?: string;
  "23-Sep-25"?: string;
  "24-Sep-25"?: string;
  "25-Sep-25"?: string;
  "26-Sep-25"?: string;
  "27-Sep-25"?: string;
  "28-Sep-25"?: string;
  "29-Sep-25"?: string;
  "30-Sep-25"?: string;
  total_leave: number;
  created_at: string;
}

// --- Main Page Component ---
export default function LeaveReportPage() {
  const [employeesOnLeave, setEmployeesOnLeave] = useState<DSEAttendance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [allScriptsLoaded, setAllScriptsLoaded] = useState<boolean>(false);
  const [supabaseClient, setSupabaseClient] = useState<any>(null);


  // Determine today's date in the format "D-Mon-YY"
  const getTodayDateKey = () => {
    const today = new Date();
    const day = today.getDate();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[today.getMonth()];
    const year = today.getFullYear().toString().slice(-2); // Get last two digits of the year
    return `${day}-${month}-${year}`;
  };

  const todayDateKey = getTodayDateKey();

  // Load external scripts and initialize Supabase client
  useEffect(() => {
    const initialize = async () => {
      try {
        // No scripts to load

        setAllScriptsLoaded(true);

        // Initialize Supabase client ONLY after its script is loaded
        const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL; // Get from .env.local
        const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Get from .env.local

        if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
          throw new Error("Supabase URL or Anon Key is missing from .env.local");
        }

          const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            global: {
              fetch: window.fetch
            }
          });
          setSupabaseClient(client);


      } catch (err: any) {
        console.error("Error during initialization:", err);
        setError(`Initialization failed: ${err.message}`);
        setLoading(false);
      }
    };

    initialize();

  }, []); // Run once on component mount

  // Fetch leave data using Supabase
  useEffect(() => {
    const fetchLeaveData = async () => {
      if (!allScriptsLoaded || !supabaseClient) {
        // Wait for all scripts to load and Supabase client to be initialized
        // If an error already occurred during init, don't proceed
        if (error) {
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null); // Clear previous errors before attempting new fetch
      try {
        // Fetch all data from the public.dse_attendance table
        // Ensure your Supabase table 'dse_attendance' is publicly readable
        const { data, error: supabaseError } = await supabaseClient
          .from('dse_attendance')
          .select('*'); // Select all columns

        if (supabaseError) {
          console.error("Supabase fetch error:", supabaseError);
          setError(`Failed to load employee leave data: ${supabaseError.message}. Check your Supabase table permissions.`);
          setLoading(false);
          return;
        }

        if (!data) {
          setEmployeesOnLeave([]);
          setLoading(false);
          return;
        }

        const fetchedData: DSEAttendance[] = data.map((item: any) => ({
          id: item.id,
          sm: item.sm,
          ct: item.ct,
          be: item.be,
          tbe: item.tbe,
          branch: item.branch,
          dse_name: item.dse_name,
          dse_type: item.dse_type,
          total_leave: item.total_leave,
          created_at: item.created_at,
          // Dynamically map all date fields
          ...Object.keys(item).reduce((acc, key) => {
            // Regex to match dates like "1-Jan-25", "30-Jun-25", etc.
            if (key.match(/^\d{1,2}-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-\d{2}$/)) {
              acc[key as keyof DSEAttendance] = item[key];
            }
            return acc;
          }, {} as Partial<DSEAttendance>) // Ensure acc is cast to Partial<DSEAttendance>
        }));


        // Filter logic: on leave today AND total leave > 2
        const filteredData = fetchedData.filter(employee => {
          // Access the attendance for today using the dynamic key
          const attendanceToday = employee[todayDateKey as keyof DSEAttendance];

          // Ensure attendanceToday is a string and matches 'L'
          const isOnLeaveToday = typeof attendanceToday === 'string' && attendanceToday === 'L';
          const hasMoreThanTwoLeaves = employee.total_leave > 2;

          return isOnLeaveToday && hasMoreThanTwoLeaves;
        });

        setEmployeesOnLeave(filteredData);
      } catch (err: any) {
        console.error("Error fetching data from Supabase:", err);
        setError("Failed to fetch employee leave data. Please check your Supabase connection and table permissions.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveData();
  }, [allScriptsLoaded, supabaseClient, todayDateKey, error]); // Added error to dependencies to react to init error

  // Function to generate and download PDF
  const downloadPdf = () => {


    const doc: jsPDFWithPlugin = new jsPDF() as jsPDFWithPlugin;

    // Check if autoTable is available
    if (typeof doc.autoTable !== 'function') {
      console.error("autoTable plugin is not loaded correctly.");
      setError("PDF generation failed. The autoTable plugin is missing.");
      return;
    }

    // Define table headers
    const headers = [['DSE Name', 'Branch', 'DSE Type', 'Total Leaves', `Leave Today (${todayDateKey})`]];

    // Prepare table data from filtered employees
    const data = employeesOnLeave.map(emp => [
      emp.dse_name,
      emp.branch,
      emp.dse_type,
      emp.total_leave.toString(),
      (emp[todayDateKey as keyof DSEAttendance] as string) === 'L' ? 'On Leave' : 'Present'
    ]);

    // Add title
    doc.setFontSize(16);
    doc.text(`Employee Leave Report - ${todayDateKey}`, 14, 20);

    // Generate table using autoTable plugin
    doc.autoTable({
      head: headers,
      body: data,
      startY: 30, // Start table below the title
      theme: 'grid', // Add borders to the table
      styles: {
        font: 'helvetica',
        fontSize: 10,
        cellPadding: 3,
        lineColor: [100, 100, 100], // Darker grid lines
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [30, 144, 255], // Dodger Blue for header
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [240, 248, 255], // Alice Blue for alternate rows
      },
      columnStyles: {
        0: { cellWidth: 50 }, // DSE Name
        1: { cellWidth: 40 }, // Branch
        2: { cellWidth: 25 }, // DSE Type
        3: { cellWidth: 25, halign: 'center' }, // Total Leaves
        4: { cellWidth: 40, halign: 'center' }, // Leave Today
      },
    });

    doc.save(`Employee_Leave_Report_${todayDateKey}.pdf`);
  };

  const handleEmailClick = () => {
    window.open('mailto:dhre@sdlkanpur.com', '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 sm:p-8 font-sans antialiased">
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-xl overflow-hidden">
        <header className="bg-gradient-to-r from-blue-600 to-blue-400 p-6 text-white text-center rounded-t-xl">
          <h1 className="text-3xl font-extrabold mb-2 leading-tight">
            <i className="fas fa-calendar-alt mr-3"></i> Employee Leave Status
          </h1>
          <p className="text-blue-100 text-sm opacity-90">
            Current Leave Report for {todayDateKey} (Total Leaves {'>'} 2 Days)
          </p>
        </header>

        <main className="p-6 md:p-8">
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-10 flex flex-col items-center justify-center"
            >
              <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
              <p className="text-blue-600 font-medium text-lg">Loading employee data...</p>
              {/* CSS for simple spinner */}
              <style>{`
                .loader {
                  border-top-color: #3b82f6;
                  -webkit-animation: spinner 1.5s linear infinite;
                  animation: spinner 1.5s linear infinite;
                }
                @-webkit-keyframes spinner {
                  0% { -webkit-transform: rotate(0deg); }
                  100% { -webkit-transform: rotate(360deg); }
                }
                @keyframes spinner {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative text-center"
              role="alert"
            >
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline ml-2">{error}</span>
            </motion.div>
          )}

          {!loading && !error && employeesOnLeave.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center py-12 bg-blue-50 rounded-lg border border-blue-200"
            >
              <p className="text-lg text-blue-800 font-semibold mb-2">
                No employees on leave today with more than 2 total leaves.
              </p>
              <p className="text-sm text-blue-600">All clear!</p>
            </motion.div>
          )}

          {!loading && !error && employeesOnLeave.length > 0 && (
            <>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-6 flex flex-wrap justify-end gap-3"
              >
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={downloadPdf}
                  disabled={!allScriptsLoaded}
                  className="inline-flex items-center px-5 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  Download PDF
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEmailClick}
                  className="inline-flex items-center px-5 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-1 11a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h12a2 2 0 012 2v12z"></path>
                  </svg>
                  Email dhre@sdlkanpur.com
                </motion.button>
              </motion.div>

              <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
                <motion.table
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="min-w-full divide-y divide-gray-200"
                >
                  <thead className="bg-blue-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                        DSE Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                        Branch
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                        DSE Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-blue-700 uppercase tracking-wider">
                        Total Leaves
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-blue-700 uppercase tracking-wider">
                        Leave Today ({todayDateKey})
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <AnimatePresence>
                      {employeesOnLeave.map((employee, index) => (
                        <motion.tr
                          key={employee.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {employee.dse_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {employee.branch}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {employee.dse_type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-800 font-semibold">
                            {employee.total_leave}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              (employee[todayDateKey as keyof DSEAttendance] as string) === 'L'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {(employee[todayDateKey as keyof DSEAttendance] as string) === 'L' ? 'On Leave' : 'Present'}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </motion.table>
              </div>
            </>
          )}
        </main>
        <footer className="p-4 bg-gray-50 text-center text-gray-500 text-xs rounded-b-xl border-t border-gray-200">
          Generated by Employee Management System.
        </footer>
      </div>
    </div>
  );
}