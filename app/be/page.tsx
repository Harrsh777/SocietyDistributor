// app/leaderboard/page.tsx
'use client';

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Trophy, User, Users, BarChart2, Award, Star, Activity, Calendar, TrendingUp, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { createClient } from '@supabase/supabase-js';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DSEPerformance {
  dse_name: string;
  dse_type: string;
  employee_code: string;
  retailing: number;
  productivity: number;
  base_fb: number;
  ws_ihr: number;
}

interface TBEPerformance {
  tbe_name: string;
  dse_count: number;
  retailing: number;
  productivity: number;
  base_fb: number;
  ws_ihr: number;
  dses: DSEPerformance[];
}

interface BEPerformance {
  be_name: string;
  tbe_count: number;
  dse_count: number;
  retailing: number;
  productivity: number;
  base_fb: number;
  ws_ihr: number;
  total_score: number;
  tbes: TBEPerformance[];
  monthlyMetrics: {
    vol: number;
    billing: number;
    productivity: number;
    dgp: number;
    fb: number;
    ws_ihr: number;
    ccr: number;
  };
}

interface BEMonthlyMetrics {
  be_names: string;
  july_vol: string;
  aug_vol: string;
  sep_vol: string;
  oct_vol: string;
  nov_vol: string;
  dec_vol: string;
  jan_vol: string;
  feb_vol: string;
  mar_vol: string;
  apr_vol: string;
  may_vol: string;
  july_billing: string;
  aug_billing: string;
  sep_billing: string;
  oct_billing: string;
  nov_billing: string;
  dec_billing: string;
  jan_billing: string;
  feb_billing: string;
  mar_billing: string;
  apr_billing: string;
  may_billing: string;
  july_productivity: string;
  aug_productivity: string;
  sep_productivity: string;
  oct_productivity: string;
  nov_productivity: string;
  dec_productivity: string;
  jan_productivity: string;
  feb_productivity: string;
  mar_productivity: string;
  apr_productivity: string;
  may_productivity: string;
  july_dgp: string;
  aug_dgp: string;
  sep_dgp: string;
  oct_dgp: string;
  nov_dgp: string;
  dec_dgp: string;
  jan_dgp: string;
  feb_dgp: string;
  mar_dgp: string;
  apr_dgp: string;
  may_dgp: string;
  july_fb: string;
  aug_fb: string;
  sep_fb: string;
  oct_fb: string;
  nov_fb: string;
  dec_fb: string;
  jan_fb: string;
  feb_fb: string;
  mar_fb: string;
  apr_fb: string;
  may_fb: string;
  jul_ws_ihr: string;
  aug_ws_ihr: string;
  sep_ws_ihr: string;
  oct_ws_ihr: string;
  nov_ws_ihr: string;
  dec_ws_ihr: string;
  jan_ws_ihr: string;
  feb_ws_ihr: string;
  mar_ws_ihr: string;
  apr_ws_ihr: string;
  may_ws_ihr: string;
  july_ccr: string;
  aug_ccr: string;
  sep_ccr: string;
  oct_ccr: string;
  nov_ccr: string;
  dec_ccr: string;
  jan_ccr: string;
  feb_ccr: string;
  mar_ccr: string;
  apr_ccr: string;
  may_ccr: string;
}

interface DSEDatabaseRecord {
  be: string;
  tbe: string;
  dse_name: string;
  dse_type: string;
  employee_code: string;
  [key: string]: string | number | null;
}

const monthColumns = [
  'jul_24', 'aug_24', 'sep_24', 'oct_24', 'nov_24', 'dec_24',
  'jan_25', 'feb_25', 'mar_25', 'apr_25', 'may_25', 'jun_25'
];

const months = [
  'July', 'August', 'September', 'October', 'November', 'December',
  'January', 'February', 'March', 'April', 'May'
];

// Map month names to database column prefixes
const monthToDbPrefix = {
  'July': 'july',
  'August': 'aug',
  'September': 'sep',
  'October': 'oct',
  'November': 'nov',
  'December': 'dec',
  'January': 'jan',
  'February': 'feb',
  'March': 'mar',
  'April': 'apr',
  'May': 'may'
};

export default function LeaderboardPage() {
  const [beData, setBeData] = useState<BEPerformance[]>([]);
  const [monthlyMetrics, setMonthlyMetrics] = useState<BEMonthlyMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedBE, setExpandedBE] = useState<string | null>(null);
  const [expandedTBE, setExpandedTBE] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('performance');
  const [selectedMetric, setSelectedMetric] = useState('vol');

  const processBEData = useCallback((dseData: DSEDatabaseRecord[], metricsData: BEMonthlyMetrics[]): BEPerformance[] => {
    const beMap = new Map<string, BEPerformance>();
    const tbeMap = new Map<string, Map<string, TBEPerformance>>();

    // Initialize BEs with monthly metrics
    const uniqueBEs = [...new Set(dseData.map(item => item.be).filter((be): be is string => !!be))];
    uniqueBEs.forEach(be => {
      const beMetrics = metricsData.find(m => m.be_names === be);
      
      beMap.set(be, {
        be_name: be,
        tbe_count: 0,
        dse_count: 0,
        retailing: 0,
        productivity: 0,
        base_fb: 0,
        ws_ihr: 0,
        total_score: 0,
        tbes: [],
        monthlyMetrics: {
          vol: beMetrics ? parseFloat(beMetrics.may_vol || '0') : 0,
          billing: beMetrics ? parseFloat(beMetrics.may_billing || '0') : 0,
          productivity: beMetrics ? parseFloat(beMetrics.may_productivity || '0') : 0,
          dgp: beMetrics ? parseFloat(beMetrics.may_dgp || '0') : 0,
          fb: beMetrics ? parseFloat(beMetrics.may_fb || '0') : 0,
          ws_ihr: beMetrics ? parseFloat(beMetrics.may_ws_ihr || '0') : 0,
          ccr: beMetrics ? parseFloat(beMetrics.may_ccr || '0') : 0
        }
      });
      tbeMap.set(be, new Map());
    });

    // Process each DSE record
    dseData.forEach(dse => {
      if (!dse.be) return;

      const beData = beMap.get(dse.be);
      if (!beData) return;

      const tbeDataMap = tbeMap.get(dse.be)!;

      // Calculate metrics for this DSE
      let retailing = 0;
      let productivity = 0;
      let base_fb = 0;
      let ws_ihr = 0;

      monthColumns.forEach(month => {
        retailing += Number(dse[`retailing_${month}`] || 0);
        productivity += Number(dse[`productivity_${month}`] || 0);
        base_fb += Number(dse[`base_fb_${month}`] || 0);
        ws_ihr += Number(dse[`ws_ihr_${month}`] || 0);
      });

      // Update BE totals
      beData.retailing += retailing;
      beData.productivity += productivity;
      beData.base_fb += base_fb;
      beData.ws_ihr += ws_ihr;
      beData.total_score += retailing + productivity + base_fb + ws_ihr;
      beData.dse_count += 1;

      // Update TBE data if exists
      if (dse.tbe) {
        let tbeData = tbeDataMap.get(dse.tbe);
        if (!tbeData) {
          tbeData = {
            tbe_name: dse.tbe,
            dse_count: 0,
            retailing: 0,
            productivity: 0,
            base_fb: 0,
            ws_ihr: 0,
            dses: []
          };
          tbeDataMap.set(dse.tbe, tbeData);
          beData.tbe_count += 1;
        }

        tbeData.dse_count += 1;
        tbeData.retailing += retailing;
        tbeData.productivity += productivity;
        tbeData.base_fb += base_fb;
        tbeData.ws_ihr += ws_ihr;
        tbeData.dses.push({
          dse_name: dse.dse_name || 'Unknown',
          dse_type: dse.dse_type || 'Regular',
          employee_code: dse.employee_code || 'N/A',
          retailing,
          productivity,
          base_fb,
          ws_ihr
        });
      }
    });

    // Convert maps to arrays and sort
    return Array.from(beMap.values())
      .map(be => ({
        ...be,
        tbes: Array.from(tbeMap.get(be.be_name)?.values() || []
      )}))
      .sort((a, b) => {
        // Sort by current month's metrics first, then by total score
        const metricA = a.monthlyMetrics[selectedMetric as keyof typeof a.monthlyMetrics];
        const metricB = b.monthlyMetrics[selectedMetric as keyof typeof b.monthlyMetrics];
        
        if (metricB !== metricA) {
          return metricB - metricA;
        }
        return b.total_score - a.total_score;
      });
  }, [selectedMetric]);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      try {
        // Fetch DSE data
        const { data: dseData, error: dseError } = await supabase
          .from('dse_retailing_fundamentals')
          .select('*');
        
        if (dseError) throw dseError;

        // Fetch BE monthly metrics
        const { data: metricsData, error: metricsError } = await supabase
          .from('be_monthly_metrics')
          .select('*');
        
        if (metricsError) throw metricsError;

        // Process data
        const processedData = processBEData(dseData, metricsData);
        setBeData(processedData);
        setMonthlyMetrics(metricsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [processBEData]);

  const toggleBEExpand = (beName: string) => {
    setExpandedBE(expandedBE === beName ? null : beName);
    setExpandedTBE(null); // Collapse any open TBE when BE collapses
  };

  const toggleTBEExpand = (tbeName: string) => {
    setExpandedTBE(expandedTBE === tbeName ? null : tbeName);
  };

  const getRankBadge = (rank: number) => {
    const baseClass = "flex items-center justify-center rounded-full w-8 h-8 text-white font-bold";
    
    switch (rank) {
      case 1: return (
        <div className={`${baseClass} bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg`}>
          <Trophy className="w-5 h-5" />
        </div>
      );
      case 2: return (
        <div className={`${baseClass} bg-gradient-to-br from-gray-400 to-gray-600 shadow-md`}>
          <Award className="w-5 h-5" />
        </div>
      );
      case 3: return (
        <div className={`${baseClass} bg-gradient-to-br from-amber-600 to-amber-800 shadow-md`}>
          <Star className="w-5 h-5" />
        </div>
      );
      default: return (
        <div className={`${baseClass} bg-gradient-to-br from-blue-500 to-blue-700`}>
          {rank}
        </div>
      );
    }
  };

  const getMonthlyData = (beName: string, metricPrefix: string) => {
    const beMetrics = monthlyMetrics.find(metric => metric.be_names === beName);
    if (!beMetrics) return Array(months.length).fill(0);

    return months.map(month => {
      const dbPrefix = monthToDbPrefix[month as keyof typeof monthToDbPrefix];
      const metricKey = `${dbPrefix}_${metricPrefix}` as keyof BEMonthlyMetrics;
      const value = beMetrics[metricKey];
      
      // Handle special case for ws_ihr which has different prefix for July
      if (metricPrefix === 'ws_ihr' && month === 'July') {
        return parseFloat(beMetrics['jul_ws_ihr'] || '0');
      }
      
      return parseFloat(value as string) || 0;
    });
  };

  const getMetricDisplay = (value: number, metric: string) => {
    switch (metric) {
      case 'vol':
        return value >= 1000000 
          ? `₹${(value / 1000000).toFixed(1)}M` 
          : value >= 1000 
            ? `₹${(value / 1000).toFixed(1)}K` 
            : `₹${value.toFixed(1)}`;
      case 'billing':
        return value >= 10000000 
          ? `₹${(value / 10000000).toFixed(1)}Cr` 
          : value >= 100000 
            ? `₹${(value / 100000).toFixed(1)}L` 
            : `₹${value.toFixed(1)}`;
      case 'productivity':
      case 'dgp':
      case 'ccr':
        return `${value.toFixed(1)}%`;
      case 'fb':
      case 'ws_ihr':
        return value.toFixed(1);
      default:
        return value.toFixed(1);
    }
  };

  const getMetricTitle = (metric: string) => {
    switch (metric) {
      case 'vol': return 'Volume';
      case 'billing': return 'Billing';
      case 'productivity': return 'Productivity';
      case 'dgp': return 'DGP';
      case 'fb': return 'Freebies';
      case 'ws_ihr': return 'WS IHR';
      case 'ccr': return 'CCR';
      default: return metric;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="w-full h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart2 className="text-primary" size={28} />
          Business Executive Performance Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive view of BE performance including monthly metrics and team hierarchy
        </p>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-2 max-w-xs">
          <TabsTrigger value="performance">
            <Activity className="w-4 h-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="metrics">
            <Calendar className="w-4 h-4 mr-2" />
            Monthly Metrics
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === 'metrics' && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Monthly Metrics Analysis</h2>
            <div className="flex gap-2">
              {['vol', 'billing', 'productivity', 'dgp', 'fb', 'ws_ihr', 'ccr'].map(metric => (
                <Button
                  key={metric}
                  variant={selectedMetric === metric ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedMetric(metric)}
                >
                  {getMetricTitle(metric)}
                </Button>
              ))}
            </div>
          </div>

          <ScrollArea className="h-[500px] rounded-md border p-4">
            <div className="grid gap-6">
              {beData.map((be) => (
                <Card key={be.be_name} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{be.be_name}</CardTitle>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        {getMetricTitle(selectedMetric)} Trend
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-[200px]">
                      <MonthlyTrendChart 
                        data={getMonthlyData(be.be_name, selectedMetric)}
                        labels={months}
                        title={`${be.be_name} - ${getMetricTitle(selectedMetric)}`}
                        metric={selectedMetric}
                        getMetricDisplay={getMetricDisplay}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <div className="w-full overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Metric</TableHead>
                            {months.map(month => (
                              <TableHead key={month} className="text-center">{month}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">{getMetricTitle(selectedMetric)}</TableCell>
                            {getMonthlyData(be.be_name, selectedMetric).map((value, idx) => (
                              <TableCell key={idx} className="text-center">
                                {getMetricDisplay(value, selectedMetric)}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="grid gap-4">
          {beData.length === 0 && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-muted-foreground"
            >
              No performance data available
            </motion.div>
          )}

          {beData.map((be, index) => (
            <motion.div
              key={be.be_name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader 
                  className="cursor-pointer bg-gradient-to-r from-card to-gray-50 dark:to-gray-900"
                  onClick={() => toggleBEExpand(be.be_name)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getRankBadge(index + 1)}
                      <CardTitle className="text-lg">{be.be_name}</CardTitle>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <Tooltip>
                        <TooltipTrigger className="flex items-center gap-1 text-sm">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span>{be.tbe_count} TBEs</span>
                        </TooltipTrigger>
                        <TooltipContent>Team Business Executives</TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger className="flex items-center gap-1 text-sm">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span>{be.dse_count} DSEs</span>
                        </TooltipTrigger>
                        <TooltipContent>Direct Sales Executives</TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger className="flex items-center gap-1 text-sm">
                          <DollarSign className="w-4 h-4 text-green-500" />
                          <span>₹{(be.monthlyMetrics.vol / 10000000).toFixed(2)} Cr</span>
                        </TooltipTrigger>
                        <TooltipContent>Current Month Volume</TooltipContent>
                      </Tooltip>
                      
                      <div className="flex items-center gap-6">
                        <Badge variant="outline" className="flex items-center gap-1">
                          {be.monthlyMetrics.productivity.toFixed(1)}%
                          <span className="text-xs text-muted-foreground">Prod</span>
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          {be.monthlyMetrics.ws_ihr.toFixed(1)}
                          <span className="text-xs text-muted-foreground">WS</span>
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          {be.monthlyMetrics.fb.toFixed(1)}
                          <span className="text-xs text-muted-foreground">Base</span>
                        </Badge>
                      </div>
                      
                      {expandedBE === be.be_name ? (
                        <ChevronUp className="text-primary" />
                      ) : (
                        <ChevronDown className="text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <AnimatePresence>
                  {expandedBE === be.be_name && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CardContent className="pt-0">
                        <div className="space-y-4 mt-4">
                          {be.tbes.map(tbe => (
                            <motion.div
                              key={tbe.tbe_name}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.2 }}
                              className="ml-4 border-l-2 border-primary/20 pl-4"
                            >
                              <div 
                                className="flex items-center justify-between cursor-pointer py-2 hover:bg-muted/50 rounded-lg px-2"
                                onClick={() => toggleTBEExpand(tbe.tbe_name)}
                              >
                                <div className="font-medium flex items-center gap-2">
                                  <Users className="w-4 h-4 text-muted-foreground" />
                                  {tbe.tbe_name}
                                </div>
                                <div className="flex items-center gap-4 text-sm">
                                  <span className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {tbe.dse_count} DSEs
                                  </span>
                                  <span className="flex items-center gap-1">
                                    ₹{(tbe.retailing / 100000).toFixed(2)} L
                                  </span>
                                  {expandedTBE === tbe.tbe_name ? (
                                    <ChevronUp className="w-4 h-4 text-primary" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                  )}
                                </div>
                              </div>
                              
                              <AnimatePresence>
                                {expandedTBE === tbe.tbe_name && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="mt-2 ml-4"
                                  >
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>DSE Name</TableHead>
                                          <TableHead>Type</TableHead>
                                          <TableHead>ID</TableHead>
                                          <TableHead className="text-right">Retailing</TableHead>
                                          <TableHead className="text-right">Prod</TableHead>
                                          <TableHead className="text-right">WS</TableHead>
                                          <TableHead className="text-right">Base</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {tbe.dses.map((dse) => (
                                          <motion.tr
                                            key={dse.employee_code}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.1 }}
                                            className="hover:bg-muted/50"
                                          >
                                            <TableCell className="font-medium">{dse.dse_name}</TableCell>
                                            <TableCell>
                                              <Badge variant="outline">{dse.dse_type}</Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{dse.employee_code}</TableCell>
                                            <TableCell className="text-right font-medium">
                                              ₹{(dse.retailing / 1000).toFixed(1)}k
                                            </TableCell>
                                            <TableCell className="text-right">
                                              <Badge variant={dse.productivity/12 > 80 ? 'default' : 'secondary'}>
                                                {Math.round(dse.productivity / 12)}%
                                              </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                              {Math.round(dse.ws_ihr / 12)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                              {Math.round(dse.base_fb / 12)}
                                            </TableCell>
                                          </motion.tr>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

interface MonthlyTrendChartProps {
  data: number[];
  labels: string[];
  title: string;
  metric: string;
  getMetricDisplay: (value: number, metric: string) => string;
}

function MonthlyTrendChart({ data, labels, title, metric, getMetricDisplay }: MonthlyTrendChartProps) {
  const validData = data.filter(value => !isNaN(value));
  const maxValue = validData.length > 0 ? Math.max(...validData) : 1;
  const minValue = validData.length > 0 ? Math.min(...validData) : 0;
  const range = maxValue - minValue;
  
  return (
    <div className="h-full w-full flex flex-col">
      <div className="text-sm font-medium mb-2">{title}</div>
      <div className="flex-1 flex items-end gap-1">
        {data.map((value, index) => {
          // Skip rendering if data is invalid
          if (isNaN(value)) return null;
          
          const height = range > 0 ? ((value - minValue) / range * 100) : 50;
          const color = getColorForMetric(metric, value);
          
          return (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <div 
                  className={`flex-1 bg-gradient-to-t ${color} rounded-t-sm hover:opacity-80 transition-opacity`}
                  style={{ height: `${height}%` }}
                />
              </TooltipTrigger>
              <TooltipContent>
                <div className="flex flex-col items-center">
                  <span className="font-bold">{labels[index]}</span>
                  <span>{getMetricDisplay(value, metric)}</span>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
      <div className="flex justify-between mt-1 text-xs text-muted-foreground">
        {labels.length > 0 && (
          <>
            <span>{labels[0]}</span>
            <span>{labels[labels.length - 1]}</span>
          </>
        )}
      </div>
    </div>
  );
}

function getColorForMetric(metric: string, value: number): string {
  // Define different color schemes based on metric type
  switch (metric) {
    case 'productivity':
      return value > 80 
        ? 'from-green-600 to-green-400' 
        : value > 60 
          ? 'from-yellow-600 to-yellow-400' 
          : 'from-red-600 to-red-400';
    case 'dgp':
      return value > 15 
        ? 'from-purple-600 to-purple-400' 
        : value > 10 
          ? 'from-indigo-600 to-indigo-400' 
          : 'from-blue-600 to-blue-400';
    case 'ccr':
      return value > 90 
        ? 'from-teal-600 to-teal-400' 
        : value > 80 
          ? 'from-cyan-600 to-cyan-400' 
          : 'from-sky-600 to-sky-400';
    default:
      return 'from-blue-600 to-blue-400';
  }
}