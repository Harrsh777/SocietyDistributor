"use client"
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabase';
import { FiSearch, FiX, FiStar,FiHome } from 'react-icons/fi';

type DSE = {
  id: string;
  be: string;
  tbe: string;
  branch: string;
  dse_name: string;
  dse_type: 'small' | 'medium' | 'top';
  employee_code: string;
};

// Name formatting utility function
const formatDseName = (name: string) => {
  if (!name) return '';
  
  // Remove "S_" prefix
  let formatted = name.startsWith('S_') ? name.substring(2) : name;
  
  // Remove everything after and including the first "-" followed by numbers
  const dashNumberIndex = formatted.search(/-\d/);
  if (dashNumberIndex !== -1) {
    formatted = formatted.substring(0, dashNumberIndex);
  }
  
  // Replace underscores with spaces
  formatted = formatted.replace(/_/g, ' ');
  
  return formatted;
};

const SDPLogo = () => (
  <motion.div 
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: 'spring', stiffness: 300 }}
    className="flex items-center mb-6"
  >
    <motion.div 
      className="flex items-center"
      whileHover={{ scale: 1.05 }}
    >
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-yellow-500 rounded-lg blur opacity-75"></div>
        <div className="relative px-4 py-2 bg-white rounded-lg">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-[#0056b3]">S</span>
            <span className="text-[#ffd700]">D</span>
            <span className="text-black">P</span>
            <span className="text-[#e63946]">L</span>
          </h1>
        </div>
      </div>
      <motion.span 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="ml-3 text-lg font-medium text-gray-600"
      >
        Performance Dashboard
      </motion.span>
    </motion.div>
  </motion.div>
);

const PerformanceIndicator = ({ type }: { type: 'small' | 'medium' | 'top' }) => {
  const ratingConfig = {
    small: {
      class: 'bg-gradient-to-r from-green-100 to-green-50 text-green-800 border border-green-200',
      text: 'Small',
      icon: '🌱'
    },
    medium: {
      class: 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border border-blue-200',
      text: 'Medium',
      icon: '🚀'
    },
    top: {
      class: 'bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-800 border border-yellow-200',
      text: 'Top',
      icon: '🏆'
    }
  };

  const config = ratingConfig[type] || ratingConfig.small;

  return (
    <motion.div 
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${config.class}`}
    >
      <span>{config.icon}</span>
      <span>{config.text}</span>
    </motion.div>
  );
};

export default function DashboardPage() {
  const [dses, setDses] = useState<DSE[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dseTypeFilter, setDseTypeFilter] = useState<string>('all');
  const [branches, setBranches] = useState<string[]>([]);
  const [branchFilter, setBranchFilter] = useState<string>('all');

  useEffect(() => {
    const fetchDses = async () => {
      try {
        const { data, error } = await supabase
          .from('dse_retailing_fundamentals')
          .select('id, be, tbe, branch, dse_name, dse_type, employee_code');

        if (error) throw error;

        const normalizedData = data?.map(dse => {
          let normalizedType = dse.dse_type?.toLowerCase();
          
          if (!['small', 'medium', 'top'].includes(normalizedType)) {
            normalizedType = 'small';
          }

          return {
            ...dse,
            dse_type: normalizedType as 'small' | 'medium' | 'top'
          };
        }) || [];

        const uniqueBranches = [...new Set(normalizedData.map(dse => dse.branch).filter(Boolean))] as string[];
        setBranches(uniqueBranches);
        setDses(normalizedData);
      } catch (error) {
        console.error('Error fetching DSEs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDses();
  }, []);

  const filteredDses = dses
    .filter(dse => {
      if (!dse.dse_name || !dse.employee_code) return true;
      
      const matchesSearch = 
        searchTerm === '' ||
        dse.dse_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dse.employee_code.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDseType = 
        dseTypeFilter === 'all' || 
        dse.dse_type === dseTypeFilter;
      
      const matchesBranch = 
        branchFilter === 'all' || 
        dse.branch === branchFilter;
      
      return matchesSearch && matchesDseType && matchesBranch;
    });

  const clearSearch = () => setSearchTerm('');
  const clearFilters = () => {
    setDseTypeFilter('all');
    setBranchFilter('all');
  };

  if (loading) {
    return (
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Skeleton className="h-[220px] rounded-xl" />
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <SDPLogo />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, type: 'spring' }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6"
      >
        <div>
          <h2 className="text-xl font-bold text-gray-800">Sales Team Performance</h2>
          <p className="text-xs text-gray-600">Track and analyze your team metrics in real-time</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-[300px]">
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="relative"
            >
              <FiSearch className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-8 w-full h-11 text-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              {searchTerm && (
                <motion.button 
                  onClick={clearSearch}
                  whileHover={{ scale: 1.1 }}
                  className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <FiX className="h-5 w-5" />
                </motion.button>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-6 p-3 bg-white rounded-lg shadow-sm border border-gray-200"
      >
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700 flex items-center">
                <FiStar className="mr-2 text-blue-500 h-3 w-3" /> Performance Tier
              </label>
              <motion.select
                whileHover={{ scale: 1.01 }}
                value={dseTypeFilter}
                onChange={(e) => setDseTypeFilter(e.target.value)}
                className="w-full text-xs rounded-lg border border-gray-300 py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Tiers</option>
                <option value="top">Top</option>
                <option value="medium">Medium</option>
                <option value="small">Small</option>
              </motion.select>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700 flex items-center">
                <FiHome className="mr-2 text-blue-500 h-3 w-3" /> Branch
              </label>
              <motion.select
                whileHover={{ scale: 1.01 }}
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="w-full text-xs rounded-lg border border-gray-300 py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Branches</option>
                {branches.map(branch => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </motion.select>
            </div>

            <div className="flex items-end">
              {(dseTypeFilter !== 'all' || branchFilter !== 'all') && (
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="w-full"
                >
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={clearFilters}
                    className="w-full text-xs text-gray-700 hover:bg-gray-50 border-gray-300 h-[36px]"
                  >
                    Clear Filters
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {filteredDses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className="text-center space-y-2">
              <div className="p-3 inline-block rounded-full bg-gray-100">
                <FiSearch className="mx-auto h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-800">
                No team members found
              </h3>
              <p className="text-xs text-gray-600 max-w-md">
                Try adjusting your search or filter criteria
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="mt-3 border-gray-300 hover:bg-gray-50 h-8 text-xs"
                >
                  Reset Filters
                </Button>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredDses.map((dse, index) => (
              <motion.div
                key={dse.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: index * 0.05, 
                  type: 'spring', 
                  stiffness: 300,
                  damping: 15
                }}
                whileHover={{ 
                  y: -3, 
                  scale: 1.02,
                  boxShadow: '0 8px 20px -5px rgba(0, 0, 0, 0.1)'
                }}
                whileTap={{ scale: 0.98 }}
                layout
              >
                <Card className="relative overflow-hidden transition-all duration-300 border border-gray-200 hover:border-blue-300 group">
                  <Link href={`/dse/${dse.id}`} passHref>
                    <div className="cursor-pointer">
                      <CardHeader className="pb-2 px-4 pt-4">
                        <div className="flex justify-between items-start space-x-2">
                          <div className="space-y-1">
                            <CardTitle className="text-base font-semibold text-gray-900 leading-tight line-clamp-1">
                              {formatDseName(dse.dse_name)}
                            </CardTitle>
                            <div className="flex items-center space-x-1">
                              <span className="text-xs text-gray-500 font-mono">#{dse.employee_code}</span>
                            </div>
                          </div>
                          <PerformanceIndicator type={dse.dse_type} />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3 px-4 pb-4">
                        <div className="grid grid-cols-2 gap-2">
                          <motion.div 
                            whileHover={{ scale: 1.05 }}
                            className="bg-gradient-to-br from-blue-50 to-blue-100 p-2 rounded-lg border border-blue-200 shadow-sm"
                          >
                            <p className="text-[10px] uppercase tracking-wider text-blue-600 font-medium">BE</p>
                            <p className="text-lg font-bold text-blue-900">{dse.be || '--'}</p>
                          </motion.div>
                          <motion.div 
                            whileHover={{ scale: 1.05 }}
                            className="bg-gradient-to-br from-green-50 to-green-100 p-2 rounded-lg border border-green-200 shadow-sm"
                          >
                            <p className="text-[10px] uppercase tracking-wider text-green-600 font-medium">TBE</p>
                            <p className="text-lg font-bold text-green-900">{dse.tbe || '--'}</p>
                          </motion.div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <div className="flex items-center space-x-1 text-xs text-gray-600">
                            <FiHome className="flex-shrink-0 text-blue-500 h-3 w-3" />
                            <span className="truncate max-w-[100px]">{dse.branch || '--'}</span>
                          </div>
                          <Badge 
                            variant="outline" 
                            className="text-[10px] capitalize px-2 py-0.5 border-gray-300 text-gray-700"
                          >
                            {dse.dse_type === 'top' ? 'Top' : 
                             dse.dse_type === 'medium' ? 'Medium' : 'Small'}
                          </Badge>
                        </div>
                      </CardContent>
                    </div>
                  </Link>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 pt-6 border-t border-gray-200 text-center"
      >
        <p className="text-xs text-gray-600">
          Showing {filteredDses.length} of {dses.length} team members
          {(dseTypeFilter !== 'all' || branchFilter !== 'all') && (
            <span className="ml-1">
              (filtered by {[
                dseTypeFilter !== 'all' && (dseTypeFilter === 'top' ? 'Elite' : 
                                            dseTypeFilter === 'medium' ? 'Performing' : 'Emerging'),
                branchFilter !== 'all' && branchFilter
              ].filter(Boolean).join(', ')})
            </span>
          )}
        </p>
      </motion.div>
    </div>
  );
}