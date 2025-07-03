"use client"

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { FiDownload, FiMail, FiUser, FiCalendar, FiAlertCircle, FiRefreshCw } from 'react-icons/fi'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { motion } from 'framer-motion'

// Types
interface Employee {
  id: string
  dse_name: string
  branch: string
  dse_type: string
  tbe: string | null
  be: string | null
  [key: string]: string | number | null
}

interface ProcessedEmployee extends Employee {
  totalLeavesThisMonth: number
  todayReason: string
}

// Supabase Client
const supabase: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function HighLeaveDashboard() {
  const [employees, setEmployees] = useState<ProcessedEmployee[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const currentDate = new Date()

  // Format date to match your Supabase column names (e.g., "1-Jun-25")
  const getFormattedDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: '2-digit'
    }).replace(/ /g, '-')
  }

  // Format employee name
  const formatName = (name: string) => {
    if (!name) return 'Unknown'
    return name.replace(/^S_/, '').replace(/\..*$/, '').replace(/\d+$/, '').trim()
  }

  // Calculate leaves this month
  const calculateLeaves = (employee: Employee, currentMonth: number): number => {
    return Object.keys(employee).reduce((count, key) => {
      if (key.match(/^\d+-[a-zA-Z]+-\d+$/) && !key.includes('_reason') && employee[key] === 'L') {
        try {
          const [day, month, year] = key.split('-')
          const date = new Date(`${month} ${day}, 20${year}`)
          if (date.getMonth() === currentMonth) {
            return count + 1
          }
        } catch {
          console.error('Error parsing date:', key)
        }
      }
      return count
    }, 0)
  }

  // Fetch data from Supabase
  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from('dse_attendance')
        .select('*')

      if (error) throw error

      const todayKey = getFormattedDate(currentDate)
      const reasonKey = `${todayKey}_reason`
      const currentMonth = currentDate.getMonth()

      const processed = data
        .filter((emp: Employee) => emp[todayKey] === 'L')
        .map((emp: Employee) => ({
          ...emp,
          totalLeavesThisMonth: calculateLeaves(emp, currentMonth),
          todayReason: (emp[reasonKey] as string) || 'No reason provided'
        }))
        .filter((emp: ProcessedEmployee) => emp.totalLeavesThisMonth >= 2)
        .sort((a, b) => b.totalLeavesThisMonth - a.totalLeavesThisMonth)

      setEmployees(processed)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Export to Excel
  const exportToExcel = () => {
    const data = employees.map(emp => ({
      'Employee Name': formatName(emp.dse_name as string),
      'Branch': emp.branch,
      'Type': emp.dse_type,
      'TBE': emp.tbe,
      'BE': emp.be,
      'Leaves This Month': emp.totalLeavesThisMonth,
      'Today&apos;s Reason': emp.todayReason
    }))

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "High Leave Employees")
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    
    saveAs(blob, `high-leave-employees-${currentDate.toISOString().split('T')[0]}.xlsx`)
  }

  // Open email client
  const emailHR = () => {
    const subject = `High Leave Employees Report - ${currentDate.toLocaleDateString()}`
    const body = `Employees on leave today with 2+ leaves this month:\n\n${
      employees.map(emp => 
        `• ${formatName(emp.dse_name as string)} (${emp.branch})\n` +
        `  Type: ${emp.dse_type} | TBE: ${emp.tbe || 'N/A'} | BE: ${emp.be || 'N/A'}\n` +
        `  Leaves: ${emp.totalLeavesThisMonth} | Reason: ${emp.todayReason}`
      ).join('\n\n')
    }`
    
    window.location.href = `mailto:dhre@sdlkanpur.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  // Refresh data
  const handleRefresh = () => {
    setRefreshing(true)
    fetchData()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              High Leave Employees Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              {currentDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
              disabled={refreshing}
            >
              <FiRefreshCw className={`${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow-sm hover:bg-green-700 transition-colors"
            >
              <FiDownload />
              Export Excel
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={emailHR}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
            >
              <FiMail />
              Email HR
            </motion.button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                <FiUser size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Employees on Leave</p>
                <p className="text-xl font-semibold">{employees.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg text-red-600">
                <FiAlertCircle size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">With 3+ Leaves</p>
                <p className="text-xl font-semibold">
                  {employees.filter(e => e.totalLeavesThisMonth >= 3).length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600">
                <FiAlertCircle size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">With 2 Leaves</p>
                <p className="text-xl font-semibold">
                  {employees.filter(e => e.totalLeavesThisMonth === 2).length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                <FiCalendar size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Month</p>
                <p className="text-xl font-semibold">
                  {currentDate.toLocaleDateString('en-US', { month: 'long' })}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Main Table */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : employees.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <FiCalendar className="mx-auto text-gray-400 text-4xl mb-4" />
            <h3 className="text-lg font-medium text-gray-700">No employees on leave today with 2+ leaves</h3>
            <p className="text-gray-500 mt-2">Check back later or refresh the data</p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TBE</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BE</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leaves</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Today&apos;s Reason</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employees.map((employee, index) => (
                    <motion.tr
                      key={employee.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                            {formatName(employee.dse_name as string).charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {formatName(employee.dse_name as string)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.branch}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.dse_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.tbe || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.be || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          employee.totalLeavesThisMonth >= 3 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {employee.totalLeavesThisMonth} leaves
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                        <div className="line-clamp-2">
                          {employee.todayReason}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}