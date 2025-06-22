"use client"

import { createClient } from '@supabase/supabase-js';
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChevronDown,
  ChevronUp,
  Search,
  Download,
  Trophy,
  Medal,
  Award,
  X,
  Info,
  BarChart2,
  Crown,
  Star,
  Building2,
  MapPin
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

type MetricKey = 'retailing' | 'dgp' | 'base_fb' | 'productivity' | 'ws_ihr';

type MonthKey = 
  'jul_24' | 'aug_24' | 'sep_24' | 'oct_24' | 'nov_24' | 'dec_24' |
  'jan_25' | 'feb_25' | 'mar_25' | 'apr_25' | 'may_25' | 'jun_25';


type RawDSEData = {
  dse_name: string;
  branch?: string;
  dse_type?: string;
  district?: string;
  state?: string;
} & {
  // This indexed signature allows keys like 'retailing_jul_24' to be numbers or strings
  [K in `${MetricKey}_${MonthKey}`]?: string | number;
};

type DSEPerformance = {
  dse_name: string;
  branch: string;
  dse_type?: string;
  district: string;
  state: string;
  rank: number;
} & {
  // This index signature allows dynamic access to properties ending with '_avg'
  [K in `${MetricKey}_avg`]: number;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function LeaderboardDashboard() {
  const [data, setData] = useState<DSEPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof DSEPerformance; direction: 'asc' | 'desc' }>({
    key: 'retailing_avg',
    direction: 'desc'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDistrict] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [branches, setBranches] = useState<string[]>([]);
  const itemsPerPage = 15;

  const getMonthKey = useCallback((index: number) => {
    const months = ['jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'jan', 'feb', 'mar', 'apr', 'may', 'jun'];
    // First 6 months (Jul-Dec) are 24, next 6 (Jan-Jun) are 25
    const year = index < 6 ? '24' : '25';
    return `${months[index]}_${year}`;
  }, []);

  const processData = useCallback((rawData: RawDSEData[]) => {
    const dseMap = new Map<string, DSEPerformance>();

    rawData.forEach((row) => {
      if (!row.dse_name) return;

      // Initialize DSE entry
      if (!dseMap.has(row.dse_name)) {
        dseMap.set(row.dse_name, {
          dse_name: row.dse_name,
          retailing_avg: 0,
          dgp_avg: 0,
          base_fb_avg: 0,
          productivity_avg: 0,
          ws_ihr_avg: 0,
          branch: row.branch || 'Unknown',
          dse_type: row.dse_type || undefined,
          district: row.district || 'Unknown',
          state: row.state || 'UP',
          rank: 0
        });
      }

      const dse = dseMap.get(row.dse_name)!;

      // Calculate averages for each metric
      const metrics: MetricKey[] = ['retailing', 'dgp', 'base_fb', 'productivity', 'ws_ihr'];
 metrics.forEach(metric => {
        const metricValues: number[] = [];

        for (let i = 0; i < 12; i++) {
          const monthKey = `${metric}_${getMonthKey(i)}`;
          // Access the value using the type assertion, and then explicitly convert it to a string
          const rawValue = row[monthKey as `${MetricKey}_${MonthKey}`];
          const value = parseFloat(String(rawValue || '0')); // Explicitly convert to string
          if (!isNaN(value)) {
            metricValues.push(value);
          }
        }

        const avg = metricValues.length > 0 ?
          metricValues.reduce((sum, val) => sum + val, 0) / metricValues.length :
          0;
        dse[`${metric}_avg`] = avg;
      });
    });

    // Convert to array and calculate ranks based on current sort
    const dseArray = Array.from(dseMap.values());
    dseArray.sort((a, b) => {
      const aValue = a[sortConfig.key] as number;
      const bValue = b[sortConfig.key] as number;
      return sortConfig.direction === 'desc' ? bValue - aValue : aValue - bValue;
    });

    // Update ranks
    dseArray.forEach((dse, index) => (dse.rank = index + 1));

    setData(dseArray);
  }, [getMonthKey, sortConfig.key, sortConfig.direction]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: rawData, error } = await supabase
          .from('dse_retailing_fundamentals')
          .select('*');

        if (error) throw error;
        if (!rawData) throw new Error('No data received');

        // Extract unique branches
        const uniqueBranches = Array.from(new Set(rawData.map(item => item.branch || '').filter(b => b)));
        setBranches(uniqueBranches);

        processData(rawData);
      } catch (err) {
        setError('Failed to load data. Please try again later.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [processData]);

  const handleSort = (key: keyof DSEPerformance) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'desc' ? 'asc' : 'desc';
    setSortConfig({ key, direction });

    const sorted = [...data].sort((a, b) => {
      const aValue = a[key] as number;
      const bValue = b[key] as number;
      return direction === 'desc' ? bValue - aValue : aValue - bValue;
    });

    sorted.forEach((dse, index) => (dse.rank = index + 1));
    setData(sorted);
  };

  const filteredData = data.filter(dse => {
    const matchesSearch = dse.dse_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDistrict = selectedDistrict === 'all' || dse.district === selectedDistrict;
    const matchesBranch = selectedBranch === 'all' || dse.branch === selectedBranch;
    return matchesSearch && matchesDistrict && matchesBranch;
  });

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleExport = () => {
    const csvContent = [
      ['Rank', 'DSE Name', 'Branch', 'District', 'Retailing', 'DGP', 'Base FB', 'Productivity', 'WS IHR'],
      ...filteredData.map(dse => [
        dse.rank,
        dse.dse_name,
        dse.branch,
        dse.district,
        dse.retailing_avg.toFixed(2),
        dse.dgp_avg.toFixed(2),
        dse.base_fb_avg.toFixed(2),
        dse.productivity_avg.toFixed(2),
        dse.ws_ihr_avg.toFixed(2)
      ])
    ].map(e => e.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'dse_performance.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-5 w-5 text-yellow-500 inline-block mr-2" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400 inline-block mr-2" />;
      case 3: return <Award className="h-5 w-5 text-amber-600 inline-block mr-2" />;
      default: return null;
    }
  };

  const getTopPerformersDescription = () => {
    if (filteredData.length < 3) return null;

    const [first, second, third] = filteredData;
    const metric = sortConfig.key.replace('_avg', '');

    // Ensure we have valid numbers for calculations
    const firstValue = first[sortConfig.key] as number;
    const secondValue = second[sortConfig.key] as number;
    const thirdValue = third[sortConfig.key] as number;

    // Calculate percentages safely
    const firstPercentage = Math.min(Math.round((firstValue / 100) * 100), 100);
    const secondPercentage = Math.min(Math.round((secondValue / firstValue) * 100), 100);
    const thirdPercentage = Math.min(Math.round((thirdValue / firstValue) * 100), 100);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-lg border"
      >
        <div className="flex items-center mb-4">
          <BarChart2 className="h-5 w-5 mr-2 text-blue-500" />
          <h2 className="text-xl font-semibold">Top Performers Analysis</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* First Place */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg border shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
            <div className="flex items-center mb-2">
              <Crown className="h-5 w-5 mr-2 text-yellow-500" />
              <h3 className="font-medium">1st: {first.dse_name}</h3>
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
              <Building2 className="h-4 w-4 mr-1" />
              <span>{first.branch}</span>
              <MapPin className="h-4 w-4 ml-3 mr-1" />
              <span>{first.district}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Leads with {metric} at <span className="font-semibold">{firstValue.toFixed(2)}</span>
            </p>
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span>Performance</span>
                <span>{firstPercentage}%</span>
              </div>
              <Progress value={firstPercentage} className="h-2 bg-yellow-100" />
            </div>
          </motion.div>

          {/* Second Place */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg border shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-400 to-gray-600"></div>
            <div className="flex items-center mb-2">
              <Star className="h-5 w-5 mr-2 text-gray-400" />
              <h3 className="font-medium">2nd: {second.dse_name}</h3>
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
              <Building2 className="h-4 w-4 mr-1" />
              <span>{second.branch}</span>
              <MapPin className="h-4 w-4 ml-3 mr-1" />
              <span>{second.district}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Strong in {metric} at <span className="font-semibold">{secondValue.toFixed(2)}</span>
            </p>
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span>Performance</span>
                <span>{secondPercentage}% of 1st</span>
              </div>
              <Progress value={secondPercentage} className="h-2 bg-gray-100" />
            </div>
          </motion.div>

          {/* Third Place */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg border shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-600"></div>
            <div className="flex items-center mb-2">
              <Star className="h-5 w-5 mr-2 text-amber-600" />
              <h3 className="font-medium">3rd: {third.dse_name}</h3>
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
              <Building2 className="h-4 w-4 mr-1" />
              <span>{third.branch}</span>
              <MapPin className="h-4 w-4 ml-3 mr-1" />
              <span>{third.district}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Consistent with {metric} at <span className="font-semibold">{thirdValue.toFixed(2)}</span>
            </p>
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span>Performance</span>
                <span>{thirdPercentage}% of 1st</span>
              </div>
              <Progress value={thirdPercentage} className="h-2 bg-amber-100" />
            </div>
          </motion.div>
        </div>

        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 flex items-center">
          <Info className="h-4 w-4 mr-2" />
          <span>Currently sorted by: {sortConfig.key.replace('_avg', '')} ({sortConfig.direction === 'desc' ? 'high to low' : 'low to high'})</span>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with animated entrance */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          DSE Performance Leaderboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Ranked by {sortConfig.key.replace('_avg', '').replace('_', ' ')}
        </p>
      </motion.div>

      {/* Top Performers Analysis */}
      {getTopPerformersDescription()}

      {/* Leaderboard Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card className="p-6 mb-4">
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search DSEs..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-8 w-full"
                />
              </div>

              <Select
                value={selectedBranch}
                onValueChange={(value) => {
                  setSelectedBranch(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full">
                  <div className="flex items-center">
                    <Building2 className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Branch" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches.map(branch => (
                    <SelectItem key={branch} value={branch}>
                      {branch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              onClick={handleExport}
              className="w-full sm:w-auto"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {/* Active filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedBranch !== 'all' && (
              <Badge
                variant="outline"
                className="px-3 py-1 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center"
                onClick={() => setSelectedBranch('all')}
              >
                <Building2 className="h-3 w-3 mr-1" />
                {selectedBranch}
                <X className="h-3 w-3 ml-2" />
              </Badge>
            )}
          </div>

          {/* Responsive table container */}
          <div className="rounded-md border overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader className="sticky top-0 bg-gray-50 dark:bg-gray-800 z-10">
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>DSE Name</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead
                    className="text-right cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => handleSort('retailing_avg')}
                  >
                    <div className="flex items-center justify-end">
                      Retailing
                      {sortConfig.key === 'retailing_avg' && (
                        sortConfig.direction === 'desc' ? (
                          <ChevronDown className="ml-1 h-4 w-4" />
                        ) : (
                          <ChevronUp className="ml-1 h-4 w-4" />
                        )
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-right cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => handleSort('dgp_avg')}
                  >
                    <div className="flex items-center justify-end">
                      DGP
                      {sortConfig.key === 'dgp_avg' && (
                        sortConfig.direction === 'desc' ? (
                          <ChevronDown className="ml-1 h-4 w-4" />
                        ) : (
                          <ChevronUp className="ml-1 h-4 w-4" />
                        )
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-right cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => handleSort('base_fb_avg')}
                  >
                    <div className="flex items-center justify-end">
                      Base FB
                      {sortConfig.key === 'base_fb_avg' && (
                        sortConfig.direction === 'desc' ? (
                          <ChevronDown className="ml-1 h-4 w-4" />
                        ) : (
                          <ChevronUp className="ml-1 h-4 w-4" />
                        )
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-right cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => handleSort('productivity_avg')}
                  >
                    <div className="flex items-center justify-end">
                      Productivity
                      {sortConfig.key === 'productivity_avg' && (
                        sortConfig.direction === 'desc' ? (
                          <ChevronDown className="ml-1 h-4 w-4" />
                        ) : (
                          <ChevronUp className="ml-1 h-4 w-4" />
                        )
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-right cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => handleSort('ws_ihr_avg')}
                  >
                    <div className="flex items-center justify-end">
                      WS IHR
                      {sortConfig.key === 'ws_ihr_avg' && (
                        sortConfig.direction === 'desc' ? (
                          <ChevronDown className="ml-1 h-4 w-4" />
                        ) : (
                          <ChevronUp className="ml-1 h-4 w-4" />
                        )
                      )}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((dse) => (
                      <motion.tr
                        key={dse.dse_name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 group"
                        whileHover={{ scale: 1.005 }}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            {getRankIcon(dse.rank)}
                            {dse.rank}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium capitalize">
                          <span className="font-medium">{dse.dse_name}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Building2 className="h-4 w-4 mr-1 text-gray-500" />
                            {dse.branch}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                            {dse.district}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-block min-w-[60px] font-medium">
                                  {!isNaN(dse.retailing_avg) ? dse.retailing_avg.toFixed(2) : 'N/A'}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Retailing Average</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell className="text-right">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-block min-w-[60px] font-medium">
                                  {!isNaN(dse.dgp_avg) ? dse.dgp_avg.toFixed(2) : 'N/A'}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>DGP Average</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell className="text-right">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-block min-w-[60px] font-medium">
                                  {!isNaN(dse.base_fb_avg) ? dse.base_fb_avg.toFixed(2) : 'N/A'}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Base FB Average</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell className="text-right">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-block min-w-[60px] font-medium">
                                  {!isNaN(dse.productivity_avg) ? dse.productivity_avg.toFixed(2) : 'N/A'}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Productivity Average</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell className="text-right">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-block min-w-[60px] font-medium">
                                  {!isNaN(dse.ws_ihr_avg) ? dse.ws_ihr_avg.toFixed(2) : 'N/A'}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>WS IHR Average</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                      </motion.tr>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="h-24 text-center">
                        No results found. Try adjusting your filters.
                      </TableCell>
                    </TableRow>
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>

          {/* Pagination with animation */}
          {filteredData.length > itemsPerPage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4"
            >
              <div className="text-sm text-gray-500">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredData.length)} of{' '}
                {filteredData.length} entries
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center px-4">
                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </motion.div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}