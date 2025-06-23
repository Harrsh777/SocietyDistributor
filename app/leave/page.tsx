"use client"

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import {
  FiRefreshCw, FiFilter, FiSearch, FiUser, FiCalendar,
  FiTrendingUp, FiAlertCircle, FiX, FiPlus, FiChevronDown,
  FiMail, FiPhone, FiAward
} from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const supabase: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Define a type for employee data
interface EmployeeData {
  id: string;
  dse_name: string;
  branch: string;
  dse_type: string;
  [key: string]: string | number; // For dynamic date and reason columns
}

// Utility function to format employee names
const formatEmployeeName = (name: string): string => {
  if (!name) return 'Unknown';

  // Remove S_ prefix if present
  let formatted = name.startsWith('S_') ? name.substring(2) : name;

  // Remove everything after the last dot (phone number)
  const lastDotIndex = formatted.lastIndexOf('.');
  if (lastDotIndex > 0) {
    formatted = formatted.substring(0, lastDotIndex);
  }

  // Remove any remaining numbers at the end
  formatted = formatted.replace(/\d+$/, '');

  return formatted.trim();
};

// Function to calculate total leaves for an employee
const calculateTotalLeaves = (employee: EmployeeData): number => {
  return Object.keys(employee).reduce((count, key) => {
    // Check if the key is a date column (not a reason column) and value is 'L'
    if (!key.includes('_reason') && employee[key] === 'L') {
      return count + 1;
    }
    return count;
  }, 0);
};

// Function to get leave details for an employee
const getLeaveDetails = (employee: EmployeeData): { date: string; reason: string }[] => {
  const leaves: { date: string; reason: string }[] = [];

  Object.keys(employee).forEach(key => {
    if (!key.includes('_reason') && employee[key] === 'L') {
      const reasonKey = `${key}_reason`;
      leaves.push({
        date: key,
        reason: (employee[reasonKey] as string) || 'No reason provided'
      });
    }
  });

  // Sort by date (newest first)
  return leaves.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export default function LeaveDashboard() {
  const [attendanceData, setAttendanceData] = useState<EmployeeData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterBranch, setFilterBranch] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [parent] = useAutoAnimate();
  const [selectedDSE, setSelectedDSE] = useState<EmployeeData | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showLeaveModal, setShowLeaveModal] = useState<boolean>(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [leaveDate, setLeaveDate] = useState<Date | null>(new Date());
  const [leaveReason, setLeaveReason] = useState<string>('');
  const [topLeaveFilter, setTopLeaveFilter] = useState<boolean>(false);
  const [notificationSent, setNotificationSent] = useState<Record<string, boolean>>({});
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());

  // Filter data based on search and filters
  const filteredData = attendanceData.filter((dse) => {
    const matchesSearch = formatEmployeeName(dse.dse_name).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = filterBranch ? dse.branch === filterBranch : true;
    const matchesType = filterType ? dse.dse_type === filterType : true;
    return matchesSearch && matchesBranch && matchesType;
  });

  // Sort by calculated leave count if topLeaveFilter is enabled
  const displayData = topLeaveFilter
    ? [...filteredData]
      .sort((a, b) => calculateTotalLeaves(b) - calculateTotalLeaves(a))
      .slice(0, 10)
    : filteredData;

  // Calculate statistics based on current month
  const calculateStatistics = useCallback(() => {
    const currentMonthData = attendanceData.map(employee => {
      const leavesThisMonth = getLeaveDetails(employee).filter(leave => {
        const leaveDate = new Date(leave.date);
        return leaveDate.getMonth() === currentMonth && leaveDate.getFullYear() === currentYear;
      }).length;

      return {
        ...employee,
        leavesThisMonth
      };
    });

    const totalEmployees = currentMonthData.length;
    const totalLeaves = currentMonthData.reduce((sum, dse) => sum + dse.leavesThisMonth, 0);
    const highLeaveEmployees = currentMonthData.filter((dse) => dse.leavesThisMonth > 3).length;
    const averageLeaves = totalEmployees > 0 ? (totalLeaves / totalEmployees).toFixed(1) : 0;

    return { totalEmployees, totalLeaves, highLeaveEmployees, averageLeaves };
  }, [attendanceData, currentMonth, currentYear]);

  const { totalEmployees, totalLeaves, highLeaveEmployees, averageLeaves } = calculateStatistics();

  // Prepare chart data
  const uniqueBranches = [...new Set(attendanceData.map((dse) => dse.branch))];

  const branchLeaveData = uniqueBranches.map((branch) => ({
    name: branch,
    leaves: attendanceData
      .filter((dse) => dse.branch === branch)
      .reduce((sum, dse) => sum + calculateTotalLeaves(dse), 0),
  }));

  const leaveDistributionData = [
    { name: '0-2 Leaves', value: attendanceData.filter((dse) => calculateTotalLeaves(dse) <= 2).length },
    { name: '3+ Leaves', value: attendanceData.filter((dse) => calculateTotalLeaves(dse) > 2).length },
  ];

  useEffect(() => {
    fetchAttendanceData();
    checkNotifications();
  }, []);

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('dse_attendance')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAttendanceData((data as EmployeeData[]) || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

const checkNotifications = async () => {
  try {
    const { data } = await supabase
      .from('notification_status')
      .select('employee_id');

    if (data) {
      const statusMap = data.reduce((acc: Record<string, boolean>, item: { employee_id: string }) => {
        acc[item.employee_id] = true;
        return acc;
      }, {} as Record<string, boolean>);

      setNotificationSent(statusMap);
    }
  } catch (error) {
    console.error('Error checking notifications:', error);
  }
};

// Call this in your useEffect
useEffect(() => {
  fetchAttendanceData();
  checkNotifications();
}, []);

 const sendLeaveNotification = async (employee: EmployeeData, totalLeaves: number) => {
  try {
    const leaveDetails = getLeaveDetails(employee);

    // Create notification email content
    const emailContent = `
      <h2>Leave Notification Alert</h2>
      <p>Employee ${formatEmployeeName(employee.dse_name)} from ${employee.branch} branch has reached ${totalLeaves} leaves this month.</p>
      <h3>Leave Details:</h3>
      <ul>
        ${leaveDetails.map(leave => `
          <li>
            <strong>${leave.date}:</strong> ${leave.reason}
          </li>
        `).join('')}
      </ul>
      <p>Please review this employee's leave pattern.</p>
    `;

    // Insert notification record
    const { error } = await supabase
      .from('leave_notifications')
      .insert([{
        employee_id: employee.id,
        employee_name: formatEmployeeName(employee.dse_name),
        branch: employee.branch || 'Unknown',
        total_leaves: totalLeaves,
        leave_dates: leaveDetails.map(leave => leave.date),
        leave_reasons: leaveDetails.map(leave => leave.reason),
        hr_email: 'hr@yourcompany.com',
        month: currentMonth + 1,
        year: currentYear
      }]);

    if (error) throw error;

    // Send email using Supabase function (requires setting up email service)
    const { error: emailError } = await supabase.functions.invoke('send-email', {
      body: JSON.stringify({
        to: 'harrshh077@gmail.com',
        subject: `Leave Alert: ${formatEmployeeName(employee.dse_name)} (${totalLeaves} leaves)`,
        html: emailContent
      })
    });

    if (emailError) throw emailError;

    console.log('Notification sent to HR for employee:', employee.dse_name);

  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

  const handleAddLeave = async () => {
    if (!selectedEmployee || !leaveDate || !leaveReason) {
      alert('Please fill all required fields');
      return;
    }

    // Check if the date is today or tomorrow
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const selectedDate = new Date(leaveDate);
    selectedDate.setHours(0, 0, 0, 0);

    // Allow today or tomorrow only
    if (selectedDate.getTime() !== today.getTime() &&
      selectedDate.getTime() !== tomorrow.getTime()) {
      alert('You can only apply leave for today or tomorrow.');
      return;
    }

    // Confirmation dialog
    const isConfirmed = window.confirm(`Are you sure you want to apply leave for ${formatEmployeeName(selectedEmployee)} on ${leaveDate.toLocaleDateString()}?`);
    if (!isConfirmed) return;

    setLoading(true);

    try {
      // Format date to match column name (e.g., "3-Jun-25")
      const formattedDate = leaveDate.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: '2-digit'
      }).replace(/ /g, '-');

      const formattedReasonColumn = `${formattedDate}_reason`;

      // First get the current employee data
      const { data: employeeData, error: fetchError } = await supabase
        .from('dse_attendance')
        .select('*')
        .eq('dse_name', selectedEmployee)
        .single();

      if (fetchError) throw new Error(fetchError.message);
      if (!employeeData) throw new Error('Employee not found');

      // Check if leave already exists for this date
      if ((employeeData as EmployeeData)[formattedDate] === 'L') {
        throw new Error('Leave already exists for this date');
      }

      // Update the specific leave date column and reason
      const { error: updateError } = await supabase
        .from('dse_attendance')
        .update({
          [formattedDate]: 'L',
          [formattedReasonColumn]: leaveReason
        })
        .eq('id', employeeData.id);

      if (updateError) throw new Error(updateError.message);

      // Refresh data
      await fetchAttendanceData();

      // Calculate new total leaves for notification check
      const updatedEmployee: EmployeeData = { ...employeeData as EmployeeData, [formattedDate]: 'L' };
      const newTotalLeave = calculateTotalLeaves(updatedEmployee);

      // Check if we need to send notification (only for current month)
      const isCurrentMonth = leaveDate.getMonth() === currentMonth && leaveDate.getFullYear() === currentYear;

      if (isCurrentMonth && newTotalLeave >= 3 && !notificationSent[employeeData.id]) {
        await sendLeaveNotification(updatedEmployee, newTotalLeave);

        // Mark as notified in notification_status table
        await supabase
          .from('notification_status')
          .insert([{
            employee_id: employeeData.id,
            employee_name: formatEmployeeName(employeeData.dse_name),
            leave_count: newTotalLeave,
            notified_at: new Date().toISOString(),
            month: currentMonth + 1,
            year: currentYear
          }]);

        setNotificationSent(prev => ({ ...prev, [employeeData.id]: true }));
      }

      // Show success feedback
      setShowLeaveModal(false);
      setSelectedEmployee('');
      setLeaveDate(new Date());
      setLeaveReason('');
      alert('Leave successfully added!');

 } catch (error: unknown) { // Changed 'any' to 'unknown'
      console.error('Error adding leave:', error);
      if (error instanceof Error) {
        alert(`Failed to add leave: ${error.message}`);
      } else {
        alert('Failed to add leave: An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const branches = [...new Set(attendanceData.map((dse) => dse.branch))].filter(Boolean);
  const dseTypes = [...new Set(attendanceData.map((dse) => dse.dse_type))].filter(Boolean);
  const employeeNames = [...new Set(attendanceData.map((dse) => dse.dse_name))].filter(Boolean);

  // Toggle employee details expansion
  const toggleEmployeeExpansion = (id: string) => {
    setExpandedEmployee(expandedEmployee === id ? null : id);
  };

  // Month/year navigation
  const handleMonthChange = (months: number) => {
    const newDate = new Date(currentYear, currentMonth + months, 1);
    setCurrentMonth(newDate.getMonth());
    setCurrentYear(newDate.getFullYear());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800">Employee Leave Dashboard</h1>
        <p className="text-gray-600">Monitor and analyze employee leave patterns</p>
        
        {/* Month Navigation */}
        <div className="flex items-center justify-center mt-4 gap-4">
          <button 
            onClick={() => handleMonthChange(-1)}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <h2 className="text-xl font-semibold text-gray-700">
            {new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <button 
            onClick={() => handleMonthChange(1)}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
            disabled={currentMonth >= new Date().getMonth() && currentYear >= new Date().getFullYear()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </motion.div>


      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div
          whileHover={{ y: -5 }}
          whileTap={{ scale: 0.98 }}
          className="bg-white rounded-xl shadow-md p-6 flex items-center border-l-4 border-indigo-500"
        >
          <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
            <FiUser className="text-2xl" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Employees</p>
            <h3 className="text-2xl font-bold text-gray-800">{totalEmployees}</h3>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          whileTap={{ scale: 0.98 }}
          className="bg-white rounded-xl shadow-md p-6 flex items-center border-l-4 border-green-500"
        >
          <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
            <FiCalendar className="text-2xl" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Leaves</p>
            <h3 className="text-2xl font-bold text-gray-800">{totalLeaves}</h3>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          whileTap={{ scale: 0.98 }}
          className="bg-white rounded-xl shadow-md p-6 flex items-center border-l-4 border-yellow-500"
        >
          <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
            <FiTrendingUp className="text-2xl" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Avg Leaves/Employee</p>
            <h3 className="text-2xl font-bold text-gray-800">{averageLeaves}</h3>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          whileTap={{ scale: 0.98 }}
          className="bg-white rounded-xl shadow-md p-6 flex items-center border-l-4 border-red-500"
        >
          <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
            <FiAlertCircle className="text-2xl" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">High Leave Employees</p>
            <h3 className="text-2xl font-bold text-gray-800">{highLeaveEmployees}</h3>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-xl shadow-md border border-gray-100"
        >
          <h3 className="font-semibold text-lg mb-4 text-gray-800">Leaves by Branch</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchLeaveData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{ fill: '#6B7280' }} />
                <YAxis tick={{ fill: '#6B7280' }} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#FFF',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    border: 'none'
                  }}
                />
                <Bar 
                  dataKey="leaves" 
                  fill="#6366F1" 
                  animationDuration={1500}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-xl shadow-md border border-gray-100"
        >
          <h3 className="font-semibold text-lg mb-4 text-gray-800">Leave Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leaveDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  animationDuration={1000}
                >
                  {leaveDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#FFF',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    border: 'none'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchAttendanceData}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
          >
            <FiRefreshCw className={`${loading ? 'animate-spin' : ''}`} />
            Refresh
          </motion.button>

          <div className="relative flex-1 md:flex-none md:w-64">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-normal">
          <div className="flex items-center gap-2">
            <FiFilter className="text-gray-500" />
            <select
              value={filterBranch || ''}
              onChange={(e) => setFilterBranch(e.target.value || null)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            >
              <option value="">All Branches</option>
              {branches.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
          </div>

          <select
            value={filterType || ''}
            onChange={(e) => setFilterType(e.target.value || null)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          >
            <option value="">All Types</option>
            {dseTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-md text-sm ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-600'}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-md text-sm ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-600'}`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Feature 1: Top Leave Filter Toggle */}
      <div className="flex items-center mb-6 gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setTopLeaveFilter(!topLeaveFilter)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors shadow-md ${
            topLeaveFilter 
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' 
              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          {topLeaveFilter ? (
            <>
              <FiAward className="text-yellow-300" />
              <span>Showing Top 10</span>
            </>
          ) : (
            <>
              <FiTrendingUp />
              <span>Show Top 10</span>
            </>
          )}
        </motion.button>
        
        {/* Feature 2: Add Leave Button */}
          <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowLeaveModal(true)}
          className="ml-auto flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors shadow-md"
        >
          <FiPlus />
          Add Leave
        </motion.button>
      </div>

      {/* Feature 2: Add Leave Modal */}
      <AnimatePresence>
        {showLeaveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md relative"
            >
              <button 
                onClick={() => {
                  setShowLeaveModal(false);
                  setSelectedEmployee('');
                  setLeaveDate(new Date());
                  setLeaveReason('');
                }}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FiX className="text-gray-500 hover:text-gray-700" size={20} />
              </button>

              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">Record Leave</h3>
                  <p className="text-gray-500">Add a new leave entry for an employee</p>
                </div>

                <motion.div 
                  layout
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Employee</label>
                    <motion.div
                      whileFocus={{ boxShadow: "0 0 0 2px rgba(99, 102, 241, 0.5)" }}
                      className="relative"
                    >
                      <select
                        value={selectedEmployee}
                        onChange={(e) => setSelectedEmployee(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
                        required
                      >
                        <option value="">Select Employee</option>
                        {employeeNames.map((name) => (
                          <option key={name} value={name}>
                            {formatEmployeeName(name)}
                          </option>
                        ))}
                      </select>
                      <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </motion.div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Leave Date</label>
                    <motion.div
                      whileFocus={{ boxShadow: "0 0 0 2px rgba(99, 102, 241, 0.5)" }}
                      className="relative"
                    >
                     <DatePicker
  selected={leaveDate}
  onChange={(date: Date | null) => setLeaveDate(date)}
  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
  dateFormat="dd-MMM-yy"
  minDate={new Date()} // Today is the minimum date
  maxDate={new Date(new Date().setDate(new Date().getDate() + 1))} // Tomorrow is the maximum date
  includeDates={[
    new Date(), // Today
    new Date(new Date().setDate(new Date().getDate() + 1)) // Tomorrow
  ]}
  required
/>
                      <FiCalendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </motion.div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Leave Reason</label>
                    <textarea
                      value={leaveReason}
                      onChange={(e) => setLeaveReason(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      rows={3}
                      placeholder="Enter reason for leave..."
                      required
                    />
                  </div>
                </motion.div>

                <div className="flex gap-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowLeaveModal(false);
                      setSelectedEmployee('');
                      setLeaveDate(new Date());
                      setLeaveReason('');
                    }}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddLeave}
                    disabled={!selectedEmployee || !leaveDate || !leaveReason}
                    className={`flex-1 px-4 py-2.5 text-white rounded-lg font-medium transition-colors ${
                      !selectedEmployee || !leaveDate || !leaveReason
                        ? 'bg-indigo-300 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <FiRefreshCw className="animate-spin mr-2" />
                        Processing...
                      </span>
                    ) : (
                      "Submit Leave"
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Employee Cards */}
      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center items-center h-64"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"
          ></motion.div>
        </motion.div>
      ) : (
        <>
          <AnimatePresence>
            {selectedDSE && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                onClick={() => setSelectedDSE(null)}
              >
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button 
                    onClick={() => setSelectedDSE(null)} 
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <FiX size={24} />
                  </button>

                  <div className="flex items-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-3xl font-bold mr-4">
                      {formatEmployeeName(selectedDSE.dse_name)?.charAt(0) || '?'}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">{formatEmployeeName(selectedDSE.dse_name) || 'Unknown'}</h3>
                      <p className="text-gray-600">{selectedDSE.dse_type || 'N/A'}</p>
                      <div className="flex items-center mt-1 text-sm text-gray-500">
                        <span className="mr-3">{selectedDSE.branch || 'No Branch'}</span>
                        <span>SM: {selectedDSE.sm || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-500 text-sm">Total Leaves</p>
                      <p className="text-xl font-semibold">{selectedDSE.total_leave || 0}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-500 text-sm">CT</p>
                      <p className="text-xl font-semibold">{selectedDSE.ct || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-500 text-sm">BE</p>
                      <p className="text-xl font-semibold">{selectedDSE.be || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-500 text-sm">TBE</p>
                      <p className="text-xl font-semibold">{selectedDSE.tbe || 'N/A'}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Recent Leaves with Reasons</h4>
                    <div className="space-y-2">
                      {Object.entries(selectedDSE)
                        .filter(([value]) => typeof value === 'string' && value.toUpperCase() === 'L')
                        .slice(0, 5)
                        .map(([date]) => {
                          const reasonKey = `${date}_reason`;
                          const reason = selectedDSE[reasonKey] || 'No reason provided';
                          return (
                            <div key={date} className="text-xs bg-gray-100 text-gray-700 px-3 py-2 rounded">
                              <div className="font-medium">{date}</div>
                              <div className="text-gray-600">{reason}</div>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-3 mt-4">Contact Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-600">
                        <FiMail className="mr-2" />
                        <span>{selectedDSE.email || 'No email provided'}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <FiPhone className="mr-2" />
                        <span>{selectedDSE.phone || 'No phone provided'}</span>
                      </div>
                    </div>
                  </div>

            {(Number(selectedDSE.total_leave) || 0) > 3 && (
  <div className="mt-6 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 flex items-start">
    <FiAlertCircle className="mt-1 mr-2 flex-shrink-0" />
    <div>
      <p className="font-medium">High Leave Alert</p>
      <p className="text-sm">This employee has exceeded 3 leaves. Notification has been sent to HR.</p>
    </div>
  </div>
)}
</motion.div>
</motion.div>
)}
          </AnimatePresence>

           <div
            ref={parent}
            className={`${
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }`}
          >
            {displayData.map((dse) => {
              const totalLeaves = calculateTotalLeaves(dse);
              const leaveDetails = getLeaveDetails(dse);
              const leavesThisMonth = leaveDetails.filter(leave => {
                const leaveDate = new Date(leave.date);
                return leaveDate.getMonth() === currentMonth && leaveDate.getFullYear() === currentYear;
              }).length;

              return (
                <motion.div
                  key={dse.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -5 }}
                  className={`bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transition-all ${
                    viewMode === 'list' ? 'flex flex-col' : ''
                  } ${expandedEmployee === dse.id ? 'ring-2 ring-indigo-500' : ''}`}
                >
                  <div 
                    className={`${viewMode === 'list' ? 'flex items-center p-6' : 'p-6'}`}
                    onClick={() => toggleEmployeeExpansion(dse.id)}
                  >
                    <div className={`${viewMode === 'list' ? 'mr-6' : 'mb-4'} relative`}>
                      <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold">
                        {formatEmployeeName(dse.dse_name)?.charAt(0) || '?'}
                      </div>
                      <div
                        className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          leavesThisMonth > 3
                            ? 'bg-red-500 text-white'
                            : 'bg-green-500 text-white'
                        }`}
                      >
                        {leavesThisMonth}
                      </div>
                    </div>

                    <div className={`${viewMode === 'list' ? 'flex-1' : ''}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-800">{formatEmployeeName(dse.dse_name) || 'Unknown'}</h3>
                          <p className="text-gray-600">{dse.dse_type || 'N/A'}</p>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDSE(dse);
                          }}
                          className="text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                          <FiUser />
                        </button>
                      </div>
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <span className="mr-3">{dse.branch || 'No Branch'}</span>
                        <span>SM: {dse.sm || 'N/A'}</span>
                      </div>

                      {viewMode === 'grid' && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Total Leaves</span>
                            <span className="font-medium">{totalLeaves}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">This Month</span>
                            <span className="font-medium">{leavesThisMonth}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Last Leave</span>
                            <span className="font-medium">
                              {leaveDetails.length > 0 
                                ? new Date(leaveDetails[0].date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                                : 'None'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {viewMode === 'list' && (
                      <div className="ml-8 grid grid-cols-3 gap-8">
                        <div className="text-center">
                          <p className="text-gray-500 text-sm">Total Leaves</p>
                          <p className="font-medium">{totalLeaves}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500 text-sm">This Month</p>
                          <p className="font-medium">{leavesThisMonth}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500 text-sm">Last Leave</p>
                          <p className="font-medium">
                            {leaveDetails.length > 0 
                              ? new Date(leaveDetails[0].date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                              : 'None'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <AnimatePresence>
                    {expandedEmployee === dse.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-6 pb-6"
                      >
                        <div className="border-t border-gray-200 pt-4">
                          <h4 className="text-sm font-medium text-gray-500 mb-2">Recent Leaves</h4>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {leaveDetails.slice(0, 5).map((leave) => (
                              <div key={leave.date} className="text-xs bg-gray-100 text-gray-700 px-3 py-2 rounded">
                                <div className="font-medium">{leave.date}</div>
                                <div className="text-gray-600">{leave.reason}</div>
                              </div>
                            ))}
                          </div>
                          {leavesThisMonth > 3 && (
                            <div className="mt-3 flex items-center text-sm text-red-600">
                              <FiAlertCircle className="mr-1" />
                              <span>High leave count this month (notification {notificationSent[dse.id] ? 'sent' : 'pending'})</span>
                            </div>
                          )}
                          <button
                            onClick={() => {
                              setSelectedEmployee(dse.dse_name);
                              setShowLeaveModal(true);
                            }}
                            className="mt-4 w-full text-center text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
                          >
                            Add new leave
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </>
      )}

      {!loading && displayData.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="text-gray-400 mb-4">
            <FiSearch className="text-5xl" />
          </div>
          <h3 className="text-xl font-medium text-gray-600">No employees found</h3>
          <p className="text-gray-500 mt-2">
            Try adjusting your search or filter criteria
          </p>
        </motion.div>
      )}
    </div>
  );
}