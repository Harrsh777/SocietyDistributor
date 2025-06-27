"use client"

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TooltipItem
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and/or Anon Key are not defined in environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)

interface DSEData {
  id: string
  old_ct: string | null
  ct: string | null
  be: string | null
  tbe: string | null
  branch: string | null
  dse_name: string | null
  dse_type: string | null
  employee_code: string | null
  // Replace any with specific types for dynamic properties
  [key: string]: string | number | null
}

interface MonthData {
  month: string
  value: number
  rawValue: string
}

export default function DSEDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [dse, setDse] = useState<DSEData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0)
  const [performanceAnalysis, setPerformanceAnalysis] = useState<string>('')
  const [isAnalyzing, setIsAnalyzing] = useState(true)

  const fetchDSE = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('dse_retailing_fundamentals')
        .select('*')
        .eq('id', params.id)
        .single()
      
      if (error) throw error
      
      if (data) {
        setDse(data)
        // Set current month based on actual current date
        const currentDate = new Date()
        const monthIndex = currentDate.getMonth() // 0-11
        // Adjust for fiscal year starting in July (0=Jul, 1=Aug, ..., 5=Dec, 6=Jan, ..., 11=Jun)
        setCurrentMonthIndex(monthIndex < 6 ? monthIndex + 6 : monthIndex - 6)
      } else {
        router.push('/dse')
      }
    } catch (error) {
      console.error('Error fetching DSE data:', error)
      router.push('/dse')
    } finally {
      setLoading(false)
    }
  }, [params.id, router])

  useEffect(() => {
    fetchDSE()
  }, [fetchDSE])

  // Prepare data for charts
  const yearPrefix = 24 // Assuming data is for 2024-2025
  const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May']

  const getDataForMetric = (prefix: string): MonthData[] => {
    return months.map((month, i) => {
      // For Jun 2024 (index 0) to May 2025 (index 11)
      const year = i <= 6 ? 24 : 25 // Dec now included in 2024
      const key = `${prefix}_${month.toLowerCase()}_${year}`
      const value = parseFloat(dse?.[key] as string || '0') || 0
      return {
        month: `${month} ${String(year).slice(-2)}`,
        value,
        rawValue: dse?.[key] as string || '0'
      }
    })
  }

  // Calculate yearly average for each metric (Jun24-May25)
  const calculateYearlyAverage = (data: MonthData[]): string => {
    if (data.length === 0) return '0'
    const sum = data.reduce((total, item) => total + item.value, 0)
    return (sum / data.length).toFixed(1)
  }

  // Calculate month-over-month growth for the current month
  const calculateCurrentMonthGrowth = (data: MonthData[]): number => {
    if (data.length < 2) return 0
    const current = data[currentMonthIndex]?.value || 0
    const previous = data[currentMonthIndex - 1]?.value || data[data.length - 1]?.value || 0
    if (previous === 0) return current === 0 ? 0 : 100
    return ((current - previous) / previous) * 100
  }

  // Get data for all metrics
  const retailingData = getDataForMetric('retailing')
  const dgpData = getDataForMetric('dgp')
  const baseFbData = getDataForMetric('base_fb')
  const productivityData = getDataForMetric('productivity')
  const wsIhrData = getDataForMetric('ws_ihr')

  // Calculate averages
  const retailingAvg = calculateYearlyAverage(retailingData)
  const dgpAvg = calculateYearlyAverage(dgpData)
  const baseFbAvg = calculateYearlyAverage(baseFbData)
  const productivityAvg = calculateYearlyAverage(productivityData)
  const wsIhrAvg = calculateYearlyAverage(wsIhrData)

  // Calculate growth percentages
  const retailingGrowth = calculateCurrentMonthGrowth(retailingData)
  const dgpGrowth = calculateCurrentMonthGrowth(dgpData)
  const baseFbGrowth = calculateCurrentMonthGrowth(baseFbData)
  const productivityGrowth = calculateCurrentMonthGrowth(productivityData)
  const wsIhrGrowth = calculateCurrentMonthGrowth(wsIhrData)

  // Enhanced performance analysis function
  const generatePerformanceAnalysis = useCallback(() => {
    if (!dse) return []
    
    const analysis: string[] = []
    
    // Helper function to find lowest month
    const findLowestMonth = (data: MonthData[]): MonthData => {
      let lowest = data[0]
      data.forEach(item => {
        if (item.value < lowest.value) {
          lowest = item
        }
      })
      return lowest
    }

    // Helper function to find highest month
    const findHighestMonth = (data: MonthData[]): MonthData => {
      let highest = data[0]
      data.forEach(item => {
        if (item.value > highest.value) {
          highest = item
        }
      })
      return highest
    }

    // Show analyzing message for 3 seconds
    setTimeout(() => setIsAnalyzing(false), 3000)

    if (isAnalyzing) {
      return ["Analyzing employee performance data..."]
    }

    // Overall summary
    analysis.push(`Employee Performance Summary (Jun24-May25):`)
    analysis.push(`- Average Score: ${((parseFloat(retailingAvg) + parseFloat(dgpAvg) + parseFloat(baseFbAvg) + parseFloat(productivityAvg) + parseFloat(wsIhrAvg)) / 5).toFixed(1)}/100`)

    // Retailing analysis
    const retailingLowest = findLowestMonth(retailingData)
    const retailingHighest = findHighestMonth(retailingData)
    analysis.push(`\nRetailing Performance (Avg: ${retailingAvg}):`)
    if (parseFloat(retailingAvg) < 50) {
      analysis.push(`- Critical area needing immediate improvement (${retailingAvg} avg)`)
      analysis.push(`- Lowest month: ${retailingLowest.month} (${retailingLowest.value})`)
      analysis.push(`- Action: Focus on customer engagement techniques and product knowledge training`)
    } else if (parseFloat(retailingAvg) < 75) {
      analysis.push(`- Below target (${retailingAvg} avg), needs improvement`)
      analysis.push(`- Lowest month: ${retailingLowest.month} (${retailingLowest.value})`)
      analysis.push(`- Action: Review sales strategies from ${retailingHighest.month} (highest at ${retailingHighest.value})`)
    } else {
      analysis.push(`- Strong performance (${retailingAvg} avg)`)
      analysis.push(`- Peak month: ${retailingHighest.month} (${retailingHighest.value})`)
    }

    // DGP analysis
    const dgpLowest = findLowestMonth(dgpData)
    const dgpHighest = findHighestMonth(dgpData)
    analysis.push(`\nDGP Performance (Avg: ${dgpAvg}):`)
    if (parseFloat(dgpAvg) < 50) {
      analysis.push(`- Significant opportunity for improvement (${dgpAvg} avg)`)
      analysis.push(`- Lowest month: ${dgpLowest.month} (${dgpLowest.value})`)
      analysis.push(`- Action: Review pricing strategies and value proposition`)
    } else if (parseFloat(dgpAvg) < 75) {
      analysis.push(`- Meeting basic expectations (${dgpAvg} avg)`)
      analysis.push(`- Action: Analyze successful month ${dgpHighest.month} (${dgpHighest.value}) for best practices`)
    } else {
      analysis.push(`- Excellent performance (${dgpAvg} avg)`)
      analysis.push(`- Consistent high month: ${dgpHighest.month} (${dgpHighest.value})`)
    }

    // Base FB analysis
    const baseFbLowest = findLowestMonth(baseFbData)
    const baseFbHighest = findHighestMonth(baseFbData)
    analysis.push(`\nBase FB Performance (Avg: ${baseFbAvg}):`)
    if (parseFloat(baseFbAvg) < 50) {
      analysis.push(`- Critical weakness identified (${baseFbAvg} avg)`)
      analysis.push(`- Lowest month: ${baseFbLowest.month} (${baseFbLowest.value})`)
      analysis.push(`- Action: Implement customer relationship building program`)
    } else if (parseFloat(baseFbAvg) < 75) {
      analysis.push(`- Room for growth (${baseFbAvg} avg)`)
      analysis.push(`- Action: Review strategies from ${baseFbHighest.month} (peak at ${baseFbHighest.value})`)
    } else {
      analysis.push(`- Strong customer relationships (${baseFbAvg} avg)`)
    }

    // Productivity analysis
    const productivityLowest = findLowestMonth(productivityData)
    const productivityHighest = findHighestMonth(productivityData)
    analysis.push(`\nProductivity (Avg: ${productivityAvg}):`)
    if (parseFloat(productivityAvg) < 50) {
      analysis.push(`- Major efficiency concerns (${productivityAvg} avg)`)
      analysis.push(`- Lowest month: ${productivityLowest.month} (${productivityLowest.value})`)
      analysis.push(`- Action: Time management training and process optimization needed`)
    } else if (parseFloat(productivityAvg) < 75) {
      analysis.push(`- Moderate productivity (${productivityAvg} avg)`)
      analysis.push(`- Action: Implement best practices from ${productivityHighest.month} (${productivityHighest.value})`)
    } else {
      analysis.push(`- Highly productive (${productivityAvg} avg)`)
      analysis.push(`- Peak efficiency: ${productivityHighest.month} (${productivityHighest.value})`)
    }

    // WS IHR analysis
    const wsIhrLowest = findLowestMonth(wsIhrData)
    const wsIhrHighest = findHighestMonth(wsIhrData)
    analysis.push(`\nWS IHR Compliance (Avg: ${wsIhrAvg}):`)
    if (parseFloat(wsIhrAvg) < 50) {
      analysis.push(`- Serious compliance issues (${wsIhrAvg} avg)`)
      analysis.push(`- Lowest month: ${wsIhrLowest.month} (${wsIhrLowest.value})`)
      analysis.push(`- Action: Mandatory standards retraining required`)
    } else if (parseFloat(wsIhrAvg) < 75) {
      analysis.push(`- Needs more consistency (${wsIhrAvg} avg)`)
      analysis.push(`- Action: Review procedures from ${wsIhrHighest.month} (best at ${wsIhrHighest.value})`)
    } else {
      analysis.push(`- Excellent compliance (${wsIhrAvg} avg)`)
    }

    // Final recommendations
    analysis.push(`\nKey Recommendations:`)
    if (parseFloat(retailingAvg) < 50 || parseFloat(dgpAvg) < 50) {
      analysis.push(`- Priority: Sales training program focusing on conversion techniques`)
    }
    if (parseFloat(baseFbAvg) < 50) {
      analysis.push(`- Priority: Customer relationship management workshop`)
    }
    if (parseFloat(productivityAvg) < 50) {
      analysis.push(`- Priority: Time management and efficiency training`)
    }
    if (parseFloat(wsIhrAvg) < 50) {
      analysis.push(`- Priority: Quality standards compliance review`)
    }

    return analysis
  }, [
    dse, 
    isAnalyzing, 
    retailingAvg, 
    dgpAvg, 
    baseFbAvg, 
    productivityAvg, 
    wsIhrAvg,
    retailingData,
    dgpData,
    baseFbData,
    productivityData,
    wsIhrData
  ])

  // Update the useEffect for performance analysis
  useEffect(() => {
    if (!dse) return
    const analysis = generatePerformanceAnalysis()
    setPerformanceAnalysis(analysis.join('\n'))
  }, [dse, currentMonthIndex, isAnalyzing, generatePerformanceAnalysis])

  // Chart options and data configurations
  // Update the ChartOptions interface to match Chart.js types
interface ChartOptions {
  responsive: boolean;
  maintainAspectRatio: boolean;
  plugins: {
    legend: {
      position: 'top' | 'bottom' | 'left' | 'right' | 'center' | 'chartArea' | {[scaleId: string]: number};
    };
    tooltip: {
      callbacks: {
        label: (context: TooltipItem<'bar' | 'line'>) => string;
      };
    };
  };
  scales: {
    y: {
      beginAtZero: boolean;
      ticks: {
        callback: (value: number | string) => string;
      };
      grid: {
        color: string;
      };
    };
    x: {
      grid: {
        display: boolean;
      };
    };
  };
  animation: {
    duration: number;
  };
}

// Then define your chart options like this:
const chartOptions: ChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const label = context.dataset.label || '';
          const value = context.parsed.y;
          return `${label}: ${value.toLocaleString()}`;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value) => {
          return typeof value === 'number' ? value.toLocaleString() : value;
        }
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.05)'
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  },
  animation: {
    duration: 1000
  }
};

// For Line charts, you might need a slightly different options object

  const retailingChartData = {
    labels: retailingData.map(d => d.month),
    datasets: [
      {
        label: 'Retailing',
        data: retailingData.map(d => d.value),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        borderRadius: 4,
        hoverBackgroundColor: 'rgba(59, 130, 246, 0.9)'
      }
    ]
  }

  const dgpChartData = {
    labels: dgpData.map(d => d.month),
    datasets: [
      {
        label: 'DGP',
        data: dgpData.map(d => d.value),
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
        borderRadius: 4,
        hoverBackgroundColor: 'rgba(16, 185, 129, 0.9)'
      }
    ]
  }

  const productivityChartData = {
    labels: productivityData.map(d => d.month),
    datasets: [
      {
        label: 'Productivity',
        data: productivityData.map(d => d.value),
        borderColor: 'rgba(245, 158, 11, 1)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderWidth: 3,
        tension: 0.3,
        fill: true,
        pointBackgroundColor: 'rgba(245, 158, 11, 1)',
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  }

  const baseFbChartData = {
    labels: baseFbData.map(d => d.month),
    datasets: [
      {
        label: 'Base FB',
        data: baseFbData.map(d => d.value),
        backgroundColor: 'rgba(139, 92, 246, 0.7)',
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 2,
        borderRadius: 4,
        hoverBackgroundColor: 'rgba(139, 92, 246, 0.9)'
      }
    ]
  }

  const wsIhrChartData = {
    labels: wsIhrData.map(d => d.month),
    datasets: [
      {
        label: 'WS IHR',
        data: wsIhrData.map(d => d.value),
        borderColor: 'rgba(236, 72, 153, 1)',
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        borderWidth: 3,
        tension: 0.3,
        fill: true,
        pointBackgroundColor: 'rgba(236, 72, 153, 1)',
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-10 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm p-6 h-40"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm p-6 h-96"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!dse) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-8 rounded-xl shadow-sm"
          >
            <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">DSE not found</h3>
            <p className="text-gray-600 mb-6">The DSE you are looking for does not exist or may have been removed.</p>
            <Link href="/dse" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
              Back to Dashboard
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <button
                onClick={() => router.back()}
                className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200 mb-4"
              >
                <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to DSE list
              </button>
              
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center shadow-md">
                  <span className="text-2xl font-bold text-blue-600">
                    {dse.dse_name?.charAt(0).toUpperCase() || 'D'}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{dse.dse_name}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {dse.dse_type}
                    </span>
                    <span className="text-sm text-gray-600">{dse.employee_code}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Edit Profile
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Supervisor Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <InfoCard 
            icon={
              <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
            title="CT"
            value={dse.ct || 'N/A'}
          />
          <InfoCard 
            icon={
              <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
            title="BE"
            value={dse.be || 'N/A'}
          />
          <InfoCard 
            icon={
              <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            title="TBE"
            value={dse.tbe || 'N/A'}
          />
          <InfoCard 
            icon={
              <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
            title="Branch"
            value={dse.branch || 'N/A'}
          />
        </motion.div>

        {/* Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
        >
          <StatCard 
            title="Retailing"
            value={String(retailingAvg)}
            change={retailingGrowth}
            icon={
              <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />
          <StatCard 
            title="DGP"
            value={String(dgpAvg)}
            change={dgpGrowth}
            icon={
              <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />
          <StatCard 
            title="Base FB"
            value={String(baseFbAvg)}
            change={baseFbGrowth}
            icon={
              <svg className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard 
            title="Productivity"
            value={String(productivityAvg)}
            change={productivityGrowth}
            icon={
              <svg className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V5a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />
          <StatCard 
            title="WS IHR"
            value={String(wsIhrAvg)}
            change={wsIhrGrowth}
            icon={
              <svg className="h-6 w-6 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
          />
        </motion.div>

        {/* Performance Analysis Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
          className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 mb-8 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              📊 Performance Analysis
            </h3>
            <span className="inline-flex items-center text-sm text-gray-500">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 16h-1v-4h-1m1-4h.01M12 18.5C6.753 18.5 2.5 14.247 2.5 9S6.753-.5 12-.5 21.5 3.753 21.5 9 17.247 18.5 12 18.5z"
                />
              </svg>
            </span>
          </div>

          <div className="flex items-start bg-blue-50 border-l-4 border-blue-500 rounded-md p-4 shadow-inner">
            <div className="flex-shrink-0 mt-1">
              <svg
                className="h-6 w-6 text-blue-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M12 20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z"
                />
              </svg>
            </div>

            <div className="ml-4 text-sm text-blue-800 leading-6">
              {isAnalyzing ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin mr-2 h-5 w-5 text-blue-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                  <p>Analyzing performance data...</p>
                </div>
              ) : (
                <div className="whitespace-pre-line">{performanceAnalysis}</div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Dashboard Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab('overview')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Overview
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab('performance')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'performance' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Performance
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab('trends')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'trends' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Trends
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab('details')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'details' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Detailed Data
              </motion.button>
            </nav>
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-xl shadow-sm p-6"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Retailing Performance</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Current: {months[currentMonthIndex]} {String(yearPrefix + (currentMonthIndex >= 6 ? 1 : 0)).slice(-2)}
                    </span>
                  </div>
                  <div className="h-80">
                    <Bar options={chartOptions} data={retailingChartData} />
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-xl shadow-sm p-6"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Productivity Trend</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      {productivityGrowth > 0 ? '↑' : productivityGrowth < 0 ? '↓' : '→'} {Math.abs(productivityGrowth).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-80">
                    <Line options={chartOptions} data={productivityChartData} />
                  </div>
                </motion.div>
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Performance Summary</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</th>
                        {months.slice(Math.max(0, currentMonthIndex - 2), currentMonthIndex + 1).reverse().map((month, i) => {
                          const monthIndex = currentMonthIndex - i
                          const yearSuffix = monthIndex < 6 ? yearPrefix : yearPrefix + 1
                          return (
                            <th key={monthIndex} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {month} {String(yearSuffix).slice(-2)}
                            </th>
                          )
                        })}
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Retailing</td>
                        {months.slice(Math.max(0, currentMonthIndex - 2), currentMonthIndex + 1).reverse().map((_, i) => {
                          const monthIndex = currentMonthIndex - i
                          return (
                            <td key={monthIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {retailingData[monthIndex]?.value.toLocaleString() || '0'}
                            </td>
                          )
                        })}
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            retailingGrowth > 0 ? 'bg-green-100 text-green-800' : 
                            retailingGrowth < 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {retailingGrowth > 0 ? '+' : ''}{retailingGrowth.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">DGP</td>
                        {months.slice(Math.max(0, currentMonthIndex - 2), currentMonthIndex + 1).reverse().map((_, i) => {
                          const monthIndex = currentMonthIndex - i
                          return (
                            <td key={monthIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {dgpData[monthIndex]?.value.toLocaleString() || '0'}
                            </td>
                          )
                        })}
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            dgpGrowth > 0 ? 'bg-green-100 text-green-800' : 
                            dgpGrowth < 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {dgpGrowth > 0 ? '+' : ''}{dgpGrowth.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Productivity</td>
                        {months.slice(Math.max(0, currentMonthIndex - 2), currentMonthIndex + 1).reverse().map((_, i) => {
                          const monthIndex = currentMonthIndex - i
                          return (
                            <td key={monthIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {productivityData[monthIndex]?.value.toLocaleString() || '0'}
                            </td>
                          )
                        })}
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            productivityGrowth > 0 ? 'bg-green-100 text-green-800' : 
                            productivityGrowth < 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {productivityGrowth > 0 ? '+' : ''}{productivityGrowth.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </motion.div>
          )}
          
          {activeTab === 'performance' && (
            <motion.div
              key="performance"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Retailing Performance</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {retailingGrowth > 0 ? '↑' : retailingGrowth < 0 ? '↓' : '→'} {Math.abs(retailingGrowth).toFixed(1)}%
                  </span>
                </div>
                <div className="h-96">
                  <Bar options={chartOptions} data={retailingChartData} />
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">DGP Performance</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {dgpGrowth > 0 ? '↑' : dgpGrowth < 0 ? '↓' : '→'} {Math.abs(dgpGrowth).toFixed(1)}%
                  </span>
                </div>
                <div className="h-96">
                  <Bar options={chartOptions} data={dgpChartData} />
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Base FB Performance</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {baseFbGrowth > 0 ? '↑' : baseFbGrowth < 0 ? '↓' : '→'} {Math.abs(baseFbGrowth).toFixed(1)}%
                  </span>
                </div>
                <div className="h-96">
                  <Bar options={chartOptions} data={baseFbChartData} />
                </div>
              </motion.div>
            </motion.div>
          )}
          
          {activeTab === 'trends' && (
            <motion.div
              key="trends"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Productivity Trend</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    {productivityGrowth > 0 ? '↑' : productivityGrowth < 0 ? '↓' : '→'} {Math.abs(productivityGrowth).toFixed(1)}%
                  </span>
                </div>
                <div className="h-96">
                  <Line options={chartOptions} data={productivityChartData} />
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">WS IHR Trend</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                    {wsIhrGrowth > 0 ? '↑' : wsIhrGrowth < 0 ? '↓' : '→'} {Math.abs(wsIhrGrowth).toFixed(1)}%
                  </span>
                </div>
                <div className="h-96">
                  <Line options={chartOptions} data={wsIhrChartData} />
                </div>
              </motion.div>
            </motion.div>
          )}
          
          {activeTab === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm p-6 overflow-x-auto"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Performance Data</h3>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Retailing</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DGP</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base FB</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Productivity</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">WS IHR</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {months.map((month, i) => {
                      const yearSuffix = i < 6 ? yearPrefix : yearPrefix + 1
                      const monthKey = `${month} ${String(yearSuffix).slice(-2)}`
                      return (
                        <tr key={monthKey} className={i === currentMonthIndex ? 'bg-blue-50' : ''}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{monthKey}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{retailingData[i]?.rawValue || '0'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dgpData[i]?.rawValue || '0'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{baseFbData[i]?.rawValue || '0'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{productivityData[i]?.rawValue || '0'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{wsIhrData[i]?.rawValue || '0'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// InfoCard component
interface InfoCardProps {
  icon: React.ReactNode
  title: string
  value: string
}

const InfoCard: React.FC<InfoCardProps> = ({ icon, title, value }) => {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="bg-white rounded-lg shadow-xs p-4 border border-gray-100"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 p-2 rounded-lg bg-opacity-10 bg-gray-900 mr-3">
          {icon}
        </div>
        <div>
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{title}</h4>
          <p className="text-lg font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </motion.div>
  )
}

// StatCard component
interface StatCardProps {
  title: string
  value: string
  change: number
  icon: React.ReactNode
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon }) => {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="bg-white rounded-lg shadow-xs p-4 border border-gray-100"
    >
      <div className="flex justify-between">
        <div>
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{title}</h4>
          <p className="text-xl font-bold text-gray-900 mb-1">{value}</p>
          <div className="flex items-center">
            <span className={`text-xs font-medium ${
              change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'
            }`}>
              {change > 0 ? '↑' : change < 0 ? '↓' : '→'} {change === 0 ? '0%' : Math.abs(change).toFixed(1) + '%'}
            </span>
            <span className="text-xs text-gray-500 ml-1">vs last month</span>
          </div>
        </div>
        <div className="flex-shrink-0 p-2 rounded-lg bg-opacity-10 bg-gray-900">
          {icon}
        </div>
      </div>
    </motion.div>
  )
}