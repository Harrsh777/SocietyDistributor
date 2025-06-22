"use client"

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import { FiSearch, FiX, FiUsers, FiUser, FiHome, FiPhone, FiCalendar, FiKey, FiChevronLeft, FiChevronRight, FiFilter, FiBarChart2, FiMapPin, FiPlus } from 'react-icons/fi';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and/or Anon Key are not defined in environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Type definitions
interface Employee {
   image_url: string | null;
  id: string;
  branch: string | null;
  employee_name: string | null;
  employee_code: string | null;
  designation: string | null;
  date_of_joining: string | null;
  date_of_birth: string | null;
  employee_personal_number: string | null;
  address: string | null;
  qualification: string | null;
  married_status: string | null;
  father_name: string | null;
  mother_name: string | null;
  wife_name: string | null;
  created_at: string | null;
}

interface BranchSummary {
  branch: string;
  totalEmployees: number;
  designations: {
    [key: string]: number;
  };
}

interface DesignationSummary {
  name: string;
  count: number;
  color: string;
}

const UP_BRANCHES = [
  'FARRUKHABAD', 'KANPUR', 'LUCKNOW', 'MAINPURI', 'AGRA', 'ALIGARH', 
  'ALLAHABAD', 'AZAMGARH', 'BAHRAICH', 'BALLIA', 'BANDA', 'BARABANKI',
  'BAREILLY', 'BASTI', 'BIJNOR', 'BUDAUN', 'BULANDSHAHR', 'CHANDAULI',
  'CHITRAKOOT', 'DEORIA', 'ETAH', 'ETAWAH', 'FAIZABAD', 'FATEHPUR',
  'FIROZABAD', 'GAUTAM BUDDHA NAGAR', 'GHAZIABAD', 'GHAZIPUR', 'GONDA',
  'GORAKHPUR', 'HAMIRPUR', 'HAPUR', 'HARDOI', 'HATHRAS', 'JALAUN',
  'JAUNPUR', 'JHANSI', 'KANNAUJ', 'KANPUR DEHAT', 'KANPUR NAGAR',
  'KASGANJ', 'KAUSHAMBI', 'KHERI', 'KUSHINAGAR', 'LALITPUR', 'MAHOBA',
  'MATHURA', 'MAU', 'MEERUT', 'MIRZAPUR', 'MORADABAD', 'MUZAFFARNAGAR',
  'PILIBHIT', 'PRATAPGARH', 'RAEBARELI', 'RAMPUR', 'SAHARANPUR',
  'SAMBHAL', 'SANT KABIR NAGAR', 'SHAHJAHANPUR', 'SHAMLI', 'SHRAVASTI',
  'SIDDHARTHNAGAR', 'SITAPUR', 'SONBHADRA', 'SULTANPUR', 'UNNAO', 'VARANASI'
];

const DESIGNATIONS = [
  'Branch Manager', 'DSE', 'TBE', 'DB', 'VC', 'DLO', 
  'SMALL', 'Helper', 'Security Guard', 'Peon'
];

const DESIGNATION_COLORS = [
  'bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
  'bg-indigo-500', 'bg-pink-500', 'bg-red-500', 'bg-orange-500',
  'bg-teal-500', 'bg-cyan-500'
];


export default function Dashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [branchSummaries, setBranchSummaries] = useState<BranchSummary[]>([]);
  const [designationSummaries, setDesignationSummaries] = useState<DesignationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({
    branch: '',
    employee_name: '',
    designation: '',
    employee_personal_number: ''
  });
  const [filters, setFilters] = useState({
    designation: '',
    branch: '',
    searchMode: 'all' // 'all', 'name', 'designation', 'branch'
  });
  const router = useRouter();

  // Animation controls
  const controls = useAnimation();

  // Fetch data
useEffect(() => {
  fetchData();
}, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('employees')
        .select('*');
      
      if (error) throw error;
      
      if (data) {
        setEmployees(data);
        generateSummaries(data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
      controls.start("visible");
    }
  };

  // Generate summaries from employee data
  const generateSummaries = (employees: Employee[]) => {
    const branchSummariesMap: { [key: string]: BranchSummary } = {};
    const designationCounts: { [key: string]: number } = {};
    
    employees.forEach(employee => {
      const branch = employee.branch || 'Unknown';
      const designation = employee.designation || 'Unknown';
      
      if (!branchSummariesMap[branch]) {
        branchSummariesMap[branch] = {
          branch,
          totalEmployees: 0,
          designations: {}
        };
      }
      branchSummariesMap[branch].totalEmployees++;
      branchSummariesMap[branch].designations[designation] = 
        (branchSummariesMap[branch].designations[designation] || 0) + 1;
      
      designationCounts[designation] = (designationCounts[designation] || 0) + 1;
    });
    
    const branchSummaryArray = Object.values(branchSummariesMap)
      .sort((a, b) => a.branch.localeCompare(b.branch));
    
    const designationSummaryArray = Object.entries(designationCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count], index) => ({
        name,
        count,
        color: DESIGNATION_COLORS[index % DESIGNATION_COLORS.length]
      }));
    
    setBranchSummaries(branchSummaryArray);
    setDesignationSummaries(designationSummaryArray);
  };

  // Enhanced search functionality
  const filteredEmployees = useMemo(() => {
    let filtered = employees;
    
    // Apply branch filter if selected
    if (selectedBranch) {
      filtered = filtered.filter(emp => emp.branch === selectedBranch);
    }
    
    // Apply designation filter if set
    if (filters.designation) {
      filtered = filtered.filter(emp => 
        emp.designation?.toLowerCase().includes(filters.designation.toLowerCase())
      );
    }
    
    // Apply branch filter if set
    if (filters.branch) {
      filtered = filtered.filter(emp => 
        emp.branch?.toLowerCase().includes(filters.branch.toLowerCase())
      );
    }
    
    // Apply search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(emp => {
        switch (filters.searchMode) {
          case 'name':
            return emp.employee_name?.toLowerCase().includes(searchLower);
          case 'designation':
            return emp.designation?.toLowerCase().includes(searchLower);
          case 'branch':
            return emp.branch?.toLowerCase().includes(searchLower);
          default: // 'all'
            return (
              emp.employee_name?.toLowerCase().includes(searchLower) ||
              emp.designation?.toLowerCase().includes(searchLower) ||
              emp.branch?.toLowerCase().includes(searchLower) ||
              emp.employee_code?.toLowerCase().includes(searchLower) ||
              emp.employee_personal_number?.includes(searchTerm)
            );
        }
      });
    }
    
    return filtered;
  }, [employees, selectedBranch, searchTerm, filters]);

  const filteredBranches = useMemo(() => {
    let filtered = branchSummaries;
    
    if (filters.branch) {
      filtered = filtered.filter(summary =>
        summary.branch.toLowerCase().includes(filters.branch.toLowerCase())
      );
    }
    
    if (searchTerm && !selectedBranch) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(summary => {
        switch (filters.searchMode) {
          case 'name':
            return false; // No names in branch summaries
          case 'designation':
            return Object.keys(summary.designations).some(designation => 
              designation.toLowerCase().includes(searchLower)
            );
          case 'branch':
            return summary.branch.toLowerCase().includes(searchLower);
          default: // 'all'
            return (
              summary.branch.toLowerCase().includes(searchLower) ||
              Object.keys(summary.designations).some(designation => 
                designation.toLowerCase().includes(searchLower)
            ));
        }
      });
    }
    
    return filtered;
  }, [branchSummaries, searchTerm, selectedBranch, filters]);

  // Admin functions
  const addEmployee = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .insert([newEmployee])
        .select();
      
      if (error) throw error;
      
      if (data) {
        toast.success('Employee added successfully');
        setEmployees([...employees, data[0] as Employee]);
        setShowAddEmployeeModal(false);
        setNewEmployee({
          branch: '',
          employee_name: '',
          designation: '',
          employee_personal_number: ''
        });
      }
    } catch (error) {
      console.error('Error adding employee:', error);
      toast.error('Failed to add employee');
    }
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Verify admin
  const verifyAdmin = () => {
    if (adminPassword === 'admin123') {
      setIsAdmin(true);
      setShowAdminModal(false);
      toast.success('Admin access granted');
    } else {
      toast.error('Incorrect admin password');
    }
    setAdminPassword('');
  };

  // Handle branch selection
  const handleBranchSelect = (branch: string) => {
    setSelectedBranch(selectedBranch === branch ? null : branch);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Clear filters
 

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  // Stats for the overview
  const totalEmployees = employees.length;
  const totalBranches = branchSummaries.length;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
      <Toaster position="top-right" />
      
      {/* Glassmorphism background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-blue-400 opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-indigo-400 opacity-10 blur-3xl"></div>
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={controls}
        variants={containerVariants}
        className="relative max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8"
      >
        {/* Header */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col md:flex-row justify-between items-center mb-12"
        >
          <div className="text-center md:text-left mb-6 md:mb-0">
            <motion.h1 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400"
            >
              SDPL 
            </motion.h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
              Company Dashboard
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <svg className="w-6 h-6 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </motion.button>
            
            {!isAdmin && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAdminModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg shadow-md flex items-center gap-2 hover:shadow-lg transition-all"
              >
                <FiKey className="h-5 w-5" />
                Admin
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Admin Password Modal */}
        <AnimatePresence>
          {showAdminModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowAdminModal(false)}
            >
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Admin Access</h3>
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">Enter Admin Password</label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Password"
                    onKeyDown={(e) => e.key === 'Enter' && verifyAdmin()}
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowAdminModal(false)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={verifyAdmin}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Verify
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search and Filters Section */}
              <AnimatePresence>
          {showAddEmployeeModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowAddEmployeeModal(false)}
            >
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Add New Employee</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                    <input
                      type="text"
                      value={newEmployee.employee_name || ''}
                      onChange={(e) => setNewEmployee({...newEmployee, employee_name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 dark:text-white"
                      placeholder="Employee Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Branch</label>
                    <select
                      value={newEmployee.branch || ''}
                      onChange={(e) => setNewEmployee({...newEmployee, branch: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 dark:text-white"
                    >
                      <option value="">Select Branch</option>
                      {UP_BRANCHES.map(branch => (
                        <option key={branch} value={branch}>{branch}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Designation</label>
                    <select
                      value={newEmployee.designation || ''}
                      onChange={(e) => setNewEmployee({...newEmployee, designation: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 dark:text-white"
                    >
                      <option value="">Select Designation</option>
                      {DESIGNATIONS.map(designation => (
                        <option key={designation} value={designation}>{designation}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={newEmployee.employee_personal_number || ''}
                      onChange={(e) => setNewEmployee({...newEmployee, employee_personal_number: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 dark:text-white"
                      placeholder="Phone Number"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowAddEmployeeModal(false)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addEmployee}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Employee
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Search and Filters Section */}
        <motion.div
          variants={itemVariants}
          className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-blue-500" />
              </div>
              <input
                type="text"
                placeholder="Search employees, branches, designations..."
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <FiX className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                </button>
              )}
            </div>
            
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <FiFilter className="h-5 w-5" />
                Filters
              </motion.button>
              
              {isAdmin && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddEmployeeModal(true)}
                  className="px-4 py-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg flex items-center gap-2 hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                >
                  <FiPlus className="h-5 w-5" />
                  Add Employee
                </motion.button>
              )}
            </div>
          </div>
          
          {/* Expanded Filters */}
         <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden mt-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Branch</label>
                    <select
                      value={filters.branch}
                      onChange={(e) => setFilters({...filters, branch: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 dark:text-white"
                    >
                      <option value="">All Branches</option>
                      {UP_BRANCHES.map(branch => (
                        <option key={branch} value={branch}>{branch}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Designation</label>
                    <select
                      value={filters.designation}
                      onChange={(e) => setFilters({...filters, designation: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 dark:text-white"
                    >
                      <option value="">All Designations</option>
                      {DESIGNATIONS.map(designation => (
                        <option key={designation} value={designation}>{designation}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search Mode</label>
                    <select
                      value={filters.searchMode}
                      onChange={(e) => setFilters({...filters, searchMode: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 dark:text-white"
                    >
                      <option value="all">Search All Fields</option>
                      <option value="name">Name Only</option>
                      <option value="designation">Designation Only</option>
                      <option value="branch">Branch Only</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-between mt-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {searchTerm && (
                      <span>Searching for: &quot;{searchTerm}&quot; in {filters.searchMode === 'all' ? 'all fields' : filters.searchMode}</span>
                    )}
                  </div>
                 
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          variants={itemVariants}
          className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Employees</p>
                <h3 className="text-3xl font-bold text-gray-800 dark:text-white">{totalEmployees}</h3>
              </div>
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                <FiUsers className="h-6 w-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Branches</p>
                <h3 className="text-3xl font-bold text-gray-800 dark:text-white">{totalBranches}</h3>
              </div>
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300">
                <FiHome className="h-6 w-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Designations</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {designationSummaries.slice(0, 10).map((designation, index) => (
                    <span 
                      key={index}
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${designation.color.replace('500', '100')} ${designation.color.replace('500', '800')}`}
                    >
                      {designation.name}: {designation.count}
                    </span>
                  ))}
                  {designationSummaries.length > 3 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                      +{designationSummaries.length - 3} more
                    </span>
                  )}
                </div>
              </div>
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300">
                <FiBarChart2 className="h-6 w-6" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        {selectedBranch ? (
          <motion.div
            key="employee-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mb-12"
          >
            {/* Branch Header */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80"
            >
              <div>
                <div className="flex items-center">
                  <motion.button
                    whileHover={{ x: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedBranch(null)}
                    className="mr-4 p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <FiChevronLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  </motion.button>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {selectedBranch}
                  </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  {filteredEmployees.length} employees
                </p>
              </div>
              
              <div className="mt-4 sm:mt-0">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(
                    branchSummaries.find(b => b.branch === selectedBranch)?.designations || {}
                  ).map(([designation, count], index) => (
                    <span 
                      key={designation}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${DESIGNATION_COLORS[index % DESIGNATION_COLORS.length].replace('500', '100')} ${DESIGNATION_COLORS[index % DESIGNATION_COLORS.length].replace('500', '800')}`}
                    >
                      {designation}: {count}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
            
            {/* Employee Cards */}
            {loading ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {[...Array(8)].map((_, i) => (
                  <EmployeeCardSkeleton key={i} />
                ))}
              </motion.div>
            ) : filteredEmployees.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-md backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80"
              >
                <div className="mx-auto h-32 w-32 text-gray-400">
                  <FiUser className="h-full w-full" />
                </div>
                <h3 className="mt-6 text-2xl font-medium text-gray-900 dark:text-white">
                  No employees found
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                  {searchTerm || filters.designation ? 
                    "Try adjusting your search or filter criteria." : 
                    "No employees are currently assigned to this branch."}
                </p>
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                <AnimatePresence>
                  {filteredEmployees.map((employee) => (
                    <EmployeeCard
                      key={employee.id}
                      employee={employee}
                      onClick={() => router.push(`/employe/${employee.id}`)}
                      isAdmin={isAdmin}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="branch-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mb-12"
          >
            {/* Branches Header */}
            <motion.div
              variants={itemVariants}
              className="flex justify-between items-center mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80"
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Branches</h2>
                <p className="text-gray-600 dark:text-gray-300">
                  {filteredBranches.length} branches across Uttar Pradesh
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Sort:</span>
                <select className="text-sm bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Alphabetical</option>
                  <option>Employee Count</option>
                </select>
              </div>
            </motion.div>
            
            {/* Branch Cards */}
            {loading ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {[...Array(8)].map((_, i) => (
                  <BranchCardSkeleton key={i} />
                ))}
              </motion.div>
            ) : filteredBranches.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-md backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80"
              >
                <div className="mx-auto h-32 w-32 text-gray-400">
                  <FiMapPin className="h-full w-full" />
                </div>
                <h3 className="mt-6 text-2xl font-medium text-gray-900 dark:text-white">
                  No branches found
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                  Try adjusting your search or filter criteria.
                </p>
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                <AnimatePresence>
                  {filteredBranches.map((summary) => (
                    <BranchCard
                      key={summary.branch}
                      summary={summary}
                      onClick={() => handleBranchSelect(summary.branch)}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

function BranchCard({ 
  summary,
  onClick
}: { 
  summary: BranchSummary;
  onClick: () => void;
}) {
  // Get top 3 designations by count
  const topDesignations = Object.entries(summary.designations)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, type: 'spring' }}
      whileHover={{ 
        y: -5,
        scale: 1.02,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}
      whileTap={{ scale: 0.98 }}
      className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300 cursor-pointer backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80"
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-start">
          <motion.div 
            whileHover={{ rotate: 5, scale: 1.1 }}
            className="flex-shrink-0 h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md"
          >
            <FiHome className="h-6 w-6 text-white" />
          </motion.div>
          
          <div className="ml-4 flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white truncate">
              {summary.branch}
            </h2>
            
            <div className="mt-3 space-y-2">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <FiUsers className="flex-shrink-0 mr-2 h-4 w-4 text-blue-500" />
                <span>{summary.totalEmployees} Employees</span>
              </div>
              
              <div className="space-y-1">
                {topDesignations.map(([designation, count]) => (
                  <div key={designation} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 truncate">{designation}</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">{count}</span>
                  </div>
                ))}
                {Object.keys(summary.designations).length > 3 && (
                                    <div className="text-sm text-blue-600 dark:text-blue-400">
                    +{Object.keys(summary.designations).length - 3} more
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-600">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            View details
          </span>
          <FiChevronRight className="h-5 w-5 text-blue-500" />
        </div>
      </div>
    </motion.div>
  );
}

function BranchCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700 backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80">
      <div className="p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0 h-14 w-14 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
          
          <div className="ml-4 flex-1 min-w-0">
            <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
            
            <div className="mt-3 space-y-2">
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              
              <div className="space-y-1">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-3 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-3 w-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-600">
        <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    </div>
  );
}

function EmployeeCard({ 
  employee,
  onClick,
}: { 
  employee: Employee;
  onClick: () => void;
  isAdmin: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Calculate age from date of birth
  const age = employee.date_of_birth ? 
    new Date().getFullYear() - new Date(employee.date_of_birth).getFullYear() : 
    null;
  
  // Calculate tenure from date of joining
  const tenure = employee.date_of_joining ? 
    new Date().getFullYear() - new Date(employee.date_of_joining).getFullYear() : 
    null;



  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, type: 'spring' }}
      whileHover={{ 
        y: -5,
        scale: 1.02,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}
      whileTap={{ scale: 0.98 }}
      className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300 cursor-pointer backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80"
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="p-6">
        <div className="flex items-start">
          <motion.div 
            animate={{
              rotate: isHovered ? 5 : 0,
              scale: isHovered ? 1.1 : 1
            }}
            transition={{ type: 'spring', stiffness: 500 }}
            className="flex-shrink-0 h-14 w-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md overflow-hidden"
          >
           {employee.image_url ? (
  <div className="relative h-full w-full"> {/* Add a relative parent for fill */}
    <Image
      src={employee.image_url}
      alt={employee.employee_name || 'Employee'}
      fill // Use fill to make the image take up the full parent's size
      style={{ objectFit: 'cover' }} // Equivalent to object-cover
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Optimize based on screen size (adjust as needed)
      className="rounded-full" // Add back any relevant original classes if needed
    />
  </div>
) : (
  <FiUser className="h-6 w-6 text-white" />
)}
          </motion.div>
          
          <div className="ml-4 flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white truncate">
              {employee.employee_name || 'Unknown'}
            </h2>
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium truncate">
              {employee.designation || 'No designation'}
            </p>
            
            <div className="mt-3 space-y-2">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <FiCalendar className="flex-shrink-0 mr-2 h-4 w-4 text-blue-500" />
                <span>
                  {age ? `${age} years` : 'Age not specified'} • {tenure ? `${tenure} years` : 'Tenure not specified'}
                </span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <FiPhone className="flex-shrink-0 mr-2 h-4 w-4 text-blue-500" />
                <span className="truncate">
                  {employee.employee_personal_number || 'Phone not specified'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-600">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {employee.employee_code || 'No ID'}
          </span>
          <div className="flex items-center">
           
            <FiChevronRight className="h-5 w-5 text-blue-500" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function EmployeeCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700 backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80">
      <div className="p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0 h-14 w-14 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
          
          <div className="ml-4 flex-1 min-w-0">
            <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1"></div>
            <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3"></div>
            
            <div className="mt-3 space-y-2">
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-600">
        <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    </div>
  );
}