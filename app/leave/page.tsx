"use client"

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { useEffect, useState, useCallback, useMemo } from 'react';
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
import { formatDateForDB } from '@/lib/utils';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const supabase: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface EmployeeData {
  id: string;
  dse_name: string;
  branch: string;
  dse_type: string;
  [key: string]: string | number;
}

interface ProcessedEmployeeData extends EmployeeData {
  leavesThisMonth: number;
  totalLeaves: number;
}


const formatEmployeeName = (name: string): string => {
  if (!name) return 'Unknown';
  let formatted = name.startsWith('S_') ? name.substring(2) : name;
  const lastDotIndex = formatted.lastIndexOf('.');
  if (lastDotIndex > 0) {
    formatted = formatted.substring(0, lastDotIndex);
  }
  return formatted.replace(/\d+$/, '').trim();
};

const calculateTotalLeaves = (employee: EmployeeData): number => {
  return Object.keys(employee).reduce((count, key) => {
    if (!key.includes('_reason') && employee[key] === 'L') {
      return count + 1;
    }
    return count;
  }, 0);
};

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
    return leaves.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getEmployeesOnLeaveForDate = (date: Date, data: EmployeeData[]): EmployeeData[] => {
    const dateKey = formatDateForDB(date);
    return data.filter((emp: EmployeeData) => emp[dateKey] === 'L');
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
  const [leaveDate, setLeaveDate] = useState<Date | null>(null);
  const [leaveReason, setLeaveReason] = useState<string>('');
  const [topLeaveFilter, setTopLeaveFilter] = useState<boolean>(false);
  const [notificationSent, setNotificationSent] = useState<Record<string, boolean>>({});
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<number>(0);
  const [currentYear, setCurrentYear] = useState<number>(2025);

  // New state for filters
  const [showHighLeaveFilter, setShowHighLeaveFilter] = useState<boolean>(false);
  const [employeesOnLeaveToday, setEmployeesOnLeaveToday] = useState<EmployeeData[]>([]);
  const [showTodayLeaveList, setShowTodayLeaveList] = useState<boolean>(true);
  const [selectedDateForLeave, setSelectedDateForLeave] = useState<Date | null>(null);
  const [showDateLeaveModal, setShowDateLeaveModal] = useState<boolean>(false);

  const [todaysDateKey, setTodaysDateKey] = useState<string>('');

  useEffect(() => {
    // Set to current date or June 1, 2025 if current date is before database range
    const now = new Date();
    const dbStartDate = new Date(2025, 5, 1); // June 1, 2025
    const dbEndDate = new Date(2025, 11, 31); // December 31, 2025
    
    let defaultDate;
    if (now >= dbStartDate && now <= dbEndDate) {
      defaultDate = now;
    } else {
      defaultDate = dbStartDate;
    }
    
    setTodaysDateKey(formatDateForDB(defaultDate));
    setSelectedDateForLeave(defaultDate);
    setCurrentMonth(defaultDate.getMonth());
    setCurrentYear(defaultDate.getFullYear());
  }, []);

  useEffect(() => {
    if (attendanceData.length > 0 && todaysDateKey) {
      const onLeave = attendanceData.filter(emp => emp[todaysDateKey] === 'L');
      setEmployeesOnLeaveToday(onLeave);
    } else {
      setEmployeesOnLeaveToday([]);
    }
  }, [attendanceData, todaysDateKey]);

  // Memoized data processing for performance
  const processedData: ProcessedEmployeeData[] = useMemo(() => {
    return attendanceData.map(employee => {
      const leaveDetails = getLeaveDetails(employee);
      const leavesThisMonth = leaveDetails.filter(leave => {
        const leaveDate = new Date(leave.date);
        return leaveDate.getMonth() === currentMonth && leaveDate.getFullYear() === currentYear;
      }).length;
      const totalLeaves = calculateTotalLeaves(employee);
      return {
        ...employee,
        leavesThisMonth,
        totalLeaves
      };
    });
  }, [attendanceData, currentMonth, currentYear]);

  const filteredData = useMemo(() => {
    return processedData.filter((dse) => {
      const matchesSearch = formatEmployeeName(dse.dse_name).toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBranch = filterBranch ? dse.branch === filterBranch : true;
      const matchesType = filterType ? dse.dse_type === filterType : true;
      const matchesHighLeave = showHighLeaveFilter ? dse.leavesThisMonth > 2 : true;
      return matchesSearch && matchesBranch && matchesType && matchesHighLeave;
    });
  }, [processedData, searchTerm, filterBranch, filterType, showHighLeaveFilter]);

  const displayData = useMemo(() => {
  if (topLeaveFilter) {
    return [...filteredData]
      .sort((a, b) => b.leavesThisMonth - a.leavesThisMonth) // Changed from totalLeaves to leavesThisMonth
      .slice(0, 10);
  }
  return filteredData;
}, [filteredData, topLeaveFilter]);

  const calculateStatistics = useCallback(() => {
    const totalEmployees = processedData.length;
    const totalLeaves = processedData.reduce((sum, dse) => sum + dse.leavesThisMonth, 0);
    const highLeaveEmployees = processedData.filter((dse) => dse.leavesThisMonth > 3).length;
    const averageLeaves = totalEmployees > 0 ? (totalLeaves / totalEmployees).toFixed(1) : 0;
    return { totalEmployees, totalLeaves, highLeaveEmployees, averageLeaves };
  }, [processedData]);

  const { totalEmployees, totalLeaves, highLeaveEmployees, averageLeaves } = calculateStatistics();

  const uniqueBranches = useMemo(() => [...new Set(attendanceData.map((dse) => dse.branch))], [attendanceData]);

  const branchLeaveData = useMemo(() => uniqueBranches.map((branch) => ({
    name: branch,
    leaves: processedData
      .filter((dse) => dse.branch === branch)
      .reduce((sum, dse) => sum + dse.totalLeaves, 0),
  })), [uniqueBranches, processedData]);

  const leaveDistributionData = useMemo(() => [
    { name: '0-2 Leaves', value: processedData.filter((dse) => dse.totalLeaves <= 2).length },
    { name: '3+ Leaves', value: processedData.filter((dse) => dse.totalLeaves > 2).length },
  ], [processedData]);

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

  const sendLeaveNotification = async (employee: EmployeeData, totalLeaves: number) => {
    try {
      const leaveDetails = getLeaveDetails(employee);
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

    const selectedDate = new Date(leaveDate);
    selectedDate.setHours(0, 0, 0, 0);
    
    // Check if the selected date is within the database range
    const dbStartDate = new Date(2025, 5, 1); // June 1, 2025
    const dbEndDate = new Date(2025, 11, 31); // December 31, 2025
    
    if (selectedDate < dbStartDate || selectedDate > dbEndDate) {
      alert('Selected date is outside the available date range (June 2025 - December 2025).');
      return;
    }

    // Check if the selected date is within allowed range (yesterday, today, tomorrow)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (selectedDate.getTime() !== today.getTime() &&
        selectedDate.getTime() !== yesterday.getTime() &&
        selectedDate.getTime() !== tomorrow.getTime()) {
      alert('You can only apply leave for yesterday, today, or tomorrow.');
      return;
    }

    const isConfirmed = window.confirm(`Are you sure you want to apply leave for ${formatEmployeeName(selectedEmployee)} on ${leaveDate.toLocaleDateString()}?`);
    if (!isConfirmed) return;

    setLoading(true);

    try {
      // First find the employee by name
      const { data: employees, error: fetchError } = await supabase
        .from('dse_attendance')
        .select('*')
        .eq('dse_name', selectedEmployee);

      if (fetchError) {
        console.error('Fetch error:', fetchError);
        throw new Error(`Failed to find employee: ${fetchError.message}`);
      }
      if (!employees || employees.length === 0) throw new Error('Employee not found');
      if (employees.length > 1) throw new Error('Multiple employees found with that name');

      const employee = employees[0];
      
      // Format date to match database column format exactly: "02-Sep-25"
      const formattedDate = formatDateForDB(leaveDate);
      const formattedReasonColumn = `${formattedDate}_reason`;

      console.log('Formatted date:', formattedDate);
      console.log('Formatted reason column:', formattedReasonColumn);
      console.log('Available columns in employee data:', Object.keys(employee).filter(key => key.includes('Jun-25') || key.includes('Jul-25')));

      // Check if leave already exists for this date
      if ((employee as EmployeeData)[formattedDate] === 'L') {
        throw new Error('Leave already exists for this date');
      }

      // Update the attendance record
      const updateData = {
        [formattedDate]: 'L',
        [formattedReasonColumn]: leaveReason
      };

      console.log('Update data:', updateData);
      console.log('Employee ID:', employee.id);

      // First, let's check if the column exists by trying to read it
      const { error: testError } = await supabase
        .from('dse_attendance')
        .select(formattedDate)
        .eq('id', employee.id)
        .single();

      if (testError) {
        console.error('Column test error:', testError);
        throw new Error(`Column '${formattedDate}' does not exist in database. Available columns: ${Object.keys(employee).filter(key => key.includes('-25')).join(', ')}`);
      }

      const { error: updateError } = await supabase
        .from('dse_attendance')
        .update(updateData)
        .eq('id', employee.id);

      if (updateError) {
        console.error('Update error:', updateError);
        throw new Error(`Failed to update attendance: ${updateError.message}`);
      }

      await fetchAttendanceData();
      const updatedEmployee: EmployeeData = { ...employee as EmployeeData, [formattedDate]: 'L' };
      const newTotalLeave = calculateTotalLeaves(updatedEmployee);

      const isCurrentMonth = leaveDate.getMonth() === currentMonth && leaveDate.getFullYear() === currentYear;
      if (isCurrentMonth && newTotalLeave >= 3 && !notificationSent[employee.id]) {
        await sendLeaveNotification(updatedEmployee, newTotalLeave);

        await supabase
          .from('notification_status')
          .insert([{
            employee_id: employee.id,
            employee_name: formatEmployeeName(employee.dse_name),
            leave_count: newTotalLeave,
            notified_at: new Date().toISOString(),
            month: currentMonth + 1,
            year: currentYear
          }]);

        setNotificationSent(prev => ({ ...prev, [employee.id]: true }));
      }

      setShowLeaveModal(false);
      setSelectedEmployee('');
      setLeaveDate(null);
      setLeaveReason('');
      alert('Leave successfully added!');
    } catch (error: unknown) {
      console.error('Error adding leave:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      alert(`Failed to add leave: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const dseTypes = [...new Set(attendanceData.map((dse) => dse.dse_type))].filter(Boolean);
  const employeeNames = [...new Set(attendanceData.map((dse) => dse.dse_name))].filter(Boolean);

  const toggleEmployeeExpansion = (id: string) => {
    setExpandedEmployee(expandedEmployee === id ? null : id);
  };

  const handleMonthChange = (months: number) => {
    const newDate = new Date(currentYear, currentMonth + months, 1);
    const dbStartDate = new Date(2025, 5, 1); // June 1, 2025
    const dbEndDate = new Date(2025, 11, 31); // December 31, 2025
    
    // Ensure we don't go outside the database range
    if (newDate >= dbStartDate && newDate <= dbEndDate) {
      setCurrentMonth(newDate.getMonth());
      setCurrentYear(newDate.getFullYear());
    }
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
            disabled={currentMonth >= 11 && currentYear >= 2025} // December 2025 is the last month
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
            <p className="text-gray-500 text-sm">Total Leaves This Month</p>
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

      {/* NEW: Employees on Leave Today */}
      <motion.div className="mb-8" layout>
          <div
              className="flex justify-between items-center cursor-pointer bg-white p-4 rounded-xl shadow-md border border-gray-100 hover:bg-gray-50 transition-colors"
              onClick={() => setShowTodayLeaveList(!showTodayLeaveList)}
          >
              <div className="flex items-center">
              <FiCalendar className="mr-3 text-xl text-indigo-600" />
              <h3 className="font-semibold text-lg text-gray-800">
                  Employees on Leave Today ({employeesOnLeaveToday.length})
              </h3>
              </div>
              <FiChevronDown
              className={`transform transition-transform duration-300 ${showTodayLeaveList ? 'rotate-180' : ''}`}
              />
          </div>
          <AnimatePresence>
              {showTodayLeaveList && (
              <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
              >
                  <div className="bg-white border-l border-r border-b border-gray-200 rounded-b-xl p-4 mt-[-1px] shadow-inner-sm">
                  {employeesOnLeaveToday.length > 0 ? (
                      <ul className="space-y-3 max-h-60 overflow-y-auto">
                      {employeesOnLeaveToday.map(employee => (
                          <li key={employee.id} className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                          <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-sm font-bold mr-3 flex-shrink-0">
                              {formatEmployeeName(employee.dse_name)?.charAt(0) || '?'}
                              </div>
                              <div>
                              <p className="font-medium text-gray-800">{formatEmployeeName(employee.dse_name)}</p>
                              <p className="text-sm text-gray-500">{employee.branch}</p>
                              </div>
                          </div>
                          <span className="text-xs text-gray-700 bg-gray-200 px-2 py-1 rounded-full text-right ml-4 max-w-[50%] truncate">
                              {employee[`${todaysDateKey}_reason`] as string || 'No reason specified'}
                          </span>
                          </li>
                      ))}
                      </ul>
                  ) : (
                      <p className="text-center text-gray-500 py-4">No employees are on leave today.</p>
                  )}
                  </div>
              </motion.div>
              )}
          </AnimatePresence>
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-xl shadow-md border border-gray-100"
        >
          <h3 className="font-semibold text-lg mb-4 text-gray-800">Leaves by Branch (All Time)</h3>
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
          <h3 className="font-semibold text-lg mb-4 text-gray-800">Leave Distribution (All Time)</h3>
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
              {uniqueBranches.map((branch) => (
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

      {/* Advanced Filters & Actions */}
      <div className="flex flex-wrap items-center mb-6 gap-4">
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
      <span>Showing Top 10 This Month</span> {/* Updated text */}
    </>
  ) : (
    <>
      <FiTrendingUp />
      <span>Show Top 10 This Month</span> {/* Updated text */}
    </>
  )}
</motion.button>
        
        {/* NEW: Filter for >3 leaves */}
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowHighLeaveFilter(!showHighLeaveFilter)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors shadow-md ${
                showHighLeaveFilter 
                ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white' 
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
        >
            <FiAlertCircle />
            <span>{showHighLeaveFilter ? '' : 'More Than 2 Leaves'}</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setSelectedDateForLeave(new Date(currentYear, currentMonth, 1)); // Current month
            setShowDateLeaveModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-colors shadow-md"
        >
          <FiCalendar />
          View Leave by Date
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setLeaveDate(new Date());
            setShowLeaveModal(true);
          }}
          className="ml-auto flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors shadow-md"
        >
          <FiPlus />
          Add Leave
        </motion.button>
      </div>

      {/* Add Leave Modal */}
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
                  setLeaveDate(null);
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
                    <p className="text-xs text-gray-500 mb-2">You can only apply leave for yesterday, today, or tomorrow</p>
                    <motion.div
                      whileFocus={{ boxShadow: "0 0 0 2px rgba(99, 102, 241, 0.5)" }}
                      className="relative"
                    >
                      <DatePicker
                        selected={leaveDate}
                        onChange={(date: Date | null) => setLeaveDate(date)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        dateFormat="dd-MMM-yy"
                        minDate={new Date(2025, 5, 1)} // June 1, 2025
                        maxDate={new Date(2025, 11, 31)} // December 31, 2025
                        filterDate={(date) => {
                          // Only allow dates that exist in the database schema
                          const month = date.getMonth();
                          const year = date.getFullYear();
                          if (year !== 2025 || month < 5 || month > 11) {
                            return false; // June to December 2025 only
                          }
                          
                          // Only allow yesterday, today, and tomorrow
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const yesterday = new Date(today);
                          yesterday.setDate(today.getDate() - 1);
                          const tomorrow = new Date(today);
                          tomorrow.setDate(today.getDate() + 1);
                          
                          const selectedDate = new Date(date);
                          selectedDate.setHours(0, 0, 0, 0);
                          
                          return selectedDate.getTime() === today.getTime() ||
                                 selectedDate.getTime() === yesterday.getTime() ||
                                 selectedDate.getTime() === tomorrow.getTime();
                        }}
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
                      setLeaveDate(null);
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

      {/* View Leave by Date Modal */}
      <AnimatePresence>
        {showDateLeaveModal && (
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
              className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => {
                  setShowDateLeaveModal(false);
                  setSelectedDateForLeave(null);
                }}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FiX className="text-gray-500 hover:text-gray-700" size={20} />
              </button>

              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">View Leave by Date</h3>
                  <p className="text-gray-500">Select a date to see who was on leave</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Date</label>
                  <DatePicker
                    selected={selectedDateForLeave}
                    onChange={(date: Date | null) => setSelectedDateForLeave(date)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    dateFormat="dd-MMM-yy"
                    minDate={new Date(2025, 5, 1)} // June 1, 2025
                    maxDate={new Date(2025, 11, 31)} // December 31, 2025
                    filterDate={(date) => {
                      // Only allow dates that exist in the database schema
                      const month = date.getMonth();
                      const year = date.getFullYear();
                      return year === 2025 && month >= 5 && month <= 11; // June to December 2025
                    }}
                    required
                  />
                </div>

                {selectedDateForLeave && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">
                      Employees on Leave - {selectedDateForLeave.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </h4>
                    <div className="max-h-96 overflow-y-auto">
                      {getEmployeesOnLeaveForDate(selectedDateForLeave, attendanceData).length > 0 ? (
                        <div className="space-y-3">
                          {getEmployeesOnLeaveForDate(selectedDateForLeave, attendanceData).map(employee => {
                            const dateKey = formatDateForDB(selectedDateForLeave);
                            const reason = employee[`${dateKey}_reason`] as string || 'No reason specified';
                            return (
                              <div key={employee.id} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-sm font-bold mr-3 flex-shrink-0">
                                    {formatEmployeeName(employee.dse_name)?.charAt(0) || '?'}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-800">{formatEmployeeName(employee.dse_name)}</p>
                                    <p className="text-sm text-gray-500">{employee.branch} • {employee.dse_type}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="text-xs text-gray-700 bg-gray-200 px-3 py-1 rounded-full max-w-[200px] truncate block">
                                    {reason}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <FiCalendar className="mx-auto text-4xl text-gray-300 mb-2" />
                          <p className="text-gray-500">No employees were on leave on this date.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowDateLeaveModal(false);
                      setSelectedDateForLeave(null);
                    }}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Close
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
                      <p className="text-xl font-semibold">{calculateTotalLeaves(selectedDSE) || 0}</p>
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
                      {getLeaveDetails(selectedDSE)
                        .slice(0, 5)
                        .map((leave) => (
                          <div key={leave.date} className="text-xs bg-gray-100 text-gray-700 px-3 py-2 rounded">
                            <div className="font-medium">{leave.date}</div>
                            <div className="text-gray-600">{leave.reason}</div>
                          </div>
                        ))}
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

                  {(calculateTotalLeaves(selectedDSE) || 0) > 3 && (
                    <div className="mt-6 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 flex items-start">
                      <FiAlertCircle className="mt-1 mr-2 flex-shrink-0" />
                      <div>
                        <p className="font-medium">High Leave Alert</p>
                        <p className="text-sm">This employee has a high number of total leaves. Review may be needed.</p>
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
              const { totalLeaves, leavesThisMonth } = dse;
              const leaveDetails = getLeaveDetails(dse);
              
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
                        className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white ${
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
                                ? leaveDetails[0].date
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
                          <p className="font-medium text-lg">{totalLeaves}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500 text-sm">This Month</p>
                          <p className="font-medium text-lg">{leavesThisMonth}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500 text-sm">Last Leave</p>
                          <p className="font-medium text-lg">
                            {leaveDetails.length > 0 
                              ? leaveDetails[0].date
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
                            {leaveDetails.length > 0 ? leaveDetails.slice(0, 5).map((leave) => (
                              <div key={leave.date} className="text-xs bg-gray-100 text-gray-700 px-3 py-2 rounded">
                                <div className="font-medium">{leave.date}</div>
                                <div className="text-gray-600">{leave.reason}</div>
                              </div>
                            )) : <p className='text-xs text-gray-500'>No leave history found.</p>}
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
                              setLeaveDate(new Date());
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