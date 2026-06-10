/* eslint-disable @typescript-eslint/no-explicit-any */
 
import { useMemo, useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, ChevronRight, CheckCircle2, Users, Heart, Calendar, TrendingUp, ArrowUpRight, ChevronLeft, X, Loader2, Bot } from 'lucide-react';
import { useCustomerStore } from '@/store/customerStore';
import { cn } from '@/utils';
import type { Customer, CustomerStatus, AIFilters } from '@/types';
import { useNavigate } from 'react-router-dom';
import CustomerProfileModal from '@/components/customers/CustomerProfileModal';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const statusFilters: (CustomerStatus | 'All')[] = ['All', 'New Lead', 'Profile Review', 'Active Matching', 'Meeting Scheduled', 'Engaged'];

const SMART_SUGGESTIONS = [
  "Women from Ahmedabad",
  "Active matching customers in Pune",
  "Profiles awaiting verification",
  "Customers older than 30",
  "High compatibility profiles",
  "Engineers from Bangalore",
  "Meeting scheduled customers",
  "Hindu women aged 25-30",
];

const statLabels = [
  { label: 'Total Customers', icon: Users },
  { label: 'Active Matching', icon: Heart },
  { label: 'Meetings Scheduled', icon: Calendar },
  { label: 'Avg. Compatibility', icon: TrendingUp },
];

// Human-readable labels for filter pills
const FILTER_LABELS: Record<keyof AIFilters, string> = {
  gender: 'Gender',
  minAge: 'Min Age',
  maxAge: 'Max Age',
  city: 'City',
  state: 'State',
  status: 'Status',
  verified: 'Verified',
  minCompatibility: 'Min Compatibility',
  profession: 'Profession',
  religion: 'Religion',
};

function getFilterDisplayValue(key: keyof AIFilters, value: any): string {
  if (key === 'verified') return value ? 'Verified' : 'Unverified';
  if (key === 'minAge') return `Age ≥ ${value}`;
  if (key === 'maxAge') return `Age ≤ ${value}`;
  if (key === 'minCompatibility') return `Score ≥ ${value}%`;
  return String(value);
}

export default function Customers() {
  const { 
    customers, isLoading, searchQuery, statusFilter, 
    setSearchQuery, setStatusFilter, fetchCustomers,
    getFilteredCustomers,
    fetchDetailedCustomer,
    selectedCustomer,
    aiFilters, isParsingQuery, aiFilterConfidence,
    parseAndApplyAIFilter, removeAiFilter, clearAiFilters,
  } = useCustomerStore();
  
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (customers.length === 0) {
      fetchCustomers();
    }
  }, [customers.length, fetchCustomers]);

  const filtered = getFilteredCustomers();
  const hasAiFilters = Object.keys(aiFilters).length > 0;

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Reset to page 1 if search, status filter, or AI filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, aiFilters]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;

  // Handle out of bounds current page when rowsPerPage changes
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [rowsPerPage, totalPages, currentPage]);

  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, currentPage, rowsPerPage]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { All: customers.length };
    customers.forEach(c => {
      counts[c.status] = (counts[c.status] || 0) + 1;
    });
    return counts;
  }, [customers]);

  const stats = [
    { ...statLabels[0], value: String(customers.length), change: `+${Math.floor(customers.length * 0.1)} this week` },
    { ...statLabels[1], value: String(statusCounts['Active Matching'] || 0), change: '+8 this week' },
    { ...statLabels[2], value: String(statusCounts['Meeting Scheduled'] || 0), change: '+4 this week' },
    { ...statLabels[3], value: '82%', change: '+6% this week' },
  ];

  const handleSelectCustomer = (customer: Customer) => {
    fetchDetailedCustomer(customer.id);
  };

  const handleAISearch = useCallback((query?: string) => {
    const q = query || inputValue;
    if (q.trim().length < 3) return;
    parseAndApplyAIFilter(q);
    setShowSuggestions(false);
  }, [inputValue, parseAndApplyAIFilter]);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (isLoading && customers.length === 0) {
    return (
      <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-8 w-24 rounded-full" />)}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
        <Card className="shadow-sm border-slate-200">
          <div className="p-0">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-4 p-4 border-b border-slate-100 last:border-0">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-32 ml-auto" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-12" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col pb-20 lg:pb-0 max-w-[1400px] mx-auto w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 md:px-8 pt-8 pb-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              Customers
              <Badge variant="secondary" className="text-sm font-semibold bg-slate-100 text-slate-600 rounded-full px-3 py-0.5">
                {customers.length} Total
              </Badge>
            </h1>
            <p className="text-slate-500 mt-1.5">Manage and explore all your assigned customers</p>
          </div>
          
          {/* AI Search - Command Palette Style */}
          <div className="relative" ref={suggestionsRef}>
            <div className={cn(
              "flex items-center bg-white border rounded-xl shadow-sm overflow-hidden w-full md:w-auto transition-all",
              showSuggestions ? "border-primary/40 ring-2 ring-primary/10" : "border-slate-200"
            )}>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary/10 to-primary/5 text-primary font-semibold h-full border-r border-slate-200 shrink-0">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm">AI Filter</span>
              </div>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={e => {
                  setInputValue(e.target.value);
                  if (e.target.value.length > 0) setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAISearch();
                  }
                  if (e.key === 'Escape') {
                    setShowSuggestions(false);
                    inputRef.current?.blur();
                  }
                }}
                placeholder='"e.g. women from Ahmedabad aged 25-30"'
                className="w-full md:w-[320px] px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
              />
              {isParsingQuery && (
                <Loader2 className="w-4 h-4 text-primary animate-spin mr-3 shrink-0" />
              )}
              {inputValue && !isParsingQuery && (
                <button 
                  onClick={() => { setInputValue(''); clearAiFilters(); setSearchQuery(''); }}
                  className="mr-3 p-1 rounded-full hover:bg-slate-100 text-slate-400 shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Smart Suggestions Dropdown */}
            <AnimatePresence>
              {showSuggestions && !hasAiFilters && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute top-full right-0 mt-2 w-full md:w-[460px] bg-white border border-slate-200 rounded-xl shadow-lg z-30 overflow-hidden"
                >
                  <div className="p-3 border-b border-slate-100">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <Bot className="w-3.5 h-3.5" />
                      Smart Suggestions
                    </div>
                  </div>
                  <div className="p-2 max-h-64 overflow-y-auto">
                    {SMART_SUGGESTIONS.filter(s => 
                      !inputValue || s.toLowerCase().includes(inputValue.toLowerCase())
                    ).map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setInputValue(suggestion);
                          handleAISearch(suggestion);
                        }}
                        className="w-full text-left px-3 py-2.5 text-sm text-slate-700 hover:bg-primary/5 hover:text-primary rounded-lg transition-colors flex items-center gap-3"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-primary/60 shrink-0" />
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* AI Filter Pills & Summary */}
        <AnimatePresence>
          {hasAiFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5"
            >
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  AI Filters:
                </div>
                {(Object.entries(aiFilters) as [keyof AIFilters, any][]).map(([key, value]) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary rounded-full px-3 py-1 text-xs font-semibold"
                  >
                    {getFilterDisplayValue(key, value)}
                    <button
                      onClick={() => removeAiFilter(key)}
                      className="ml-0.5 p-0.5 rounded-full hover:bg-primary/20 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
                <button
                  onClick={clearAiFilters}
                  className="text-xs text-slate-500 hover:text-slate-900 font-medium underline underline-offset-2 ml-2"
                >
                  Clear all
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-900">
                  {filtered.length} customer{filtered.length !== 1 ? 's' : ''} match your AI filter
                </span>
                {aiFilterConfidence > 0 && (
                  <Badge variant="outline" className="text-[10px] font-bold border-emerald-200 text-emerald-700 bg-emerald-50 rounded-full">
                    {aiFilterConfidence}% confidence
                  </Badge>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters */}
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-4">
          {statusFilters.map(filter => (
            <button
              key={filter}
              onClick={() => {
                setStatusFilter(filter);
                clearAiFilters();
                setInputValue('');
              }}
              className={cn(
                'shrink-0 text-sm font-semibold px-5 py-2 rounded-full border transition-all duration-200 shadow-sm',
                statusFilter === filter && !hasAiFilters
                  ? 'bg-primary/5 text-primary border-primary/20'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50'
              )}
            >
              {filter} <span className="ml-1 opacity-60">({statusCounts[filter] || 0})</span>
            </button>
          ))}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-2">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.25 }}
            >
              <Card className="hover:shadow-md transition-shadow bg-white shadow-sm border-slate-200">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                    <stat.icon className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-500">{stat.label}</span>
                    <div className="text-3xl font-bold tracking-tight text-slate-900 mt-0.5">{stat.value}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-xs font-semibold text-emerald-600">{stat.change}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Content Table */}
      <div className="flex-1 overflow-hidden px-6 md:px-8 pb-8 flex flex-col">
        <Card className="flex-1 flex flex-col bg-white shadow-sm border-slate-200 overflow-hidden">
          <div className="flex-1 overflow-auto no-scrollbar">
            <Table>
              <TableHeader className="bg-white sticky top-0 z-10">
                <TableRow className="border-slate-100 hover:bg-white">
                  <TableHead className="w-[300px] text-xs font-bold text-slate-400 uppercase tracking-wider h-12 border-b border-slate-100 pl-6">CUSTOMER</TableHead>
                  <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider h-12 border-b border-slate-100">DETAILS</TableHead>
                  <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider h-12 border-b border-slate-100">STATUS</TableHead>
                  <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider h-12 border-b border-slate-100 text-center">SCORE</TableHead>
                  <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider h-12 border-b border-slate-100 text-center">LAST ACTIVITY</TableHead>
                  <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider h-12 border-b border-slate-100 text-right pr-8">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCustomers.map((customer, i) => {
                  const score = customer.matchPotential || customer.aiScore || 0;
                  const lastActivity = ['10m ago', '2h ago', '3h ago', '1d ago', '2d ago'][i % 5];
                  
                  return (
                    <TableRow
                      key={customer.id}
                      onClick={() => handleSelectCustomer(customer)}
                      className={cn(
                        'border-slate-100 transition-colors cursor-pointer group',
                        selectedCustomer?.id === customer.id ? 'bg-primary/5' : 'hover:bg-slate-50'
                      )}
                    >
                      <TableCell className="py-4 pl-6">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10 border border-slate-200 shadow-sm">
                            <AvatarImage src={customer.photo} alt={customer.name} />
                            <AvatarFallback className="bg-slate-100 text-slate-600 font-medium">
                              {customer.firstName?.charAt(0) || customer.name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[15px] font-bold text-slate-900">{customer.name}</span>
                            {customer.verified && <CheckCircle2 className="w-4 h-4 text-slate-300" />}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-semibold text-slate-900">{customer.designation || customer.profession || 'Professional'}</span>
                          <span className="text-xs text-slate-500">{customer.age} yrs • {customer.city}</span>
                        </div>
                      </TableCell>

                      <TableCell className="py-4">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            'text-[10px] font-bold uppercase tracking-wider py-1 px-3 border-opacity-50 rounded-full',
                            customer.status === 'New Lead' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                            customer.status === 'Engaged' ? 'border-pink-200 text-pink-700 bg-pink-50' :
                            customer.status === 'Meeting Scheduled' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' :
                            customer.status === 'Profile Review' ? 'border-amber-200 text-amber-700 bg-amber-50' :
                            'border-indigo-200 text-indigo-700 bg-indigo-50'
                          )}
                        >
                          {customer.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-4 text-center">
                        <span className={cn(
                          'text-[15px] font-bold',
                          score >= 90 ? 'text-emerald-600' :
                          score >= 70 ? 'text-amber-600' : 'text-slate-600'
                        )}>
                          {score}%
                        </span>
                      </TableCell>

                      <TableCell className="py-4 text-center">
                        <span className="text-sm text-slate-500 font-medium">
                          {lastActivity}
                        </span>
                      </TableCell>

                      <TableCell className="py-4 text-right pr-8">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-9 rounded-full px-4 text-sm font-semibold text-slate-600 bg-white shadow-sm border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                            onClick={(e) => { e.stopPropagation(); handleSelectCustomer(customer); }}
                          >
                            View Profile
                          </Button>
                          <Button 
                            size="sm" 
                            className="h-9 rounded-full px-4 text-sm font-semibold text-white bg-primary shadow-sm hover:bg-primary/90"
                            onClick={(e) => { e.stopPropagation(); navigate(`/ai-match-studio?customerId=${customer.id}`); }}
                          >
                            Find Matches
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Search className="w-12 h-12 text-slate-200 mb-4" />
                <h3 className="text-lg font-bold text-slate-900">No customers found</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-sm">
                  {hasAiFilters 
                    ? 'No customers match this filter. Try expanding the age range, removing a city filter, or using broader criteria.'
                    : 'Try adjusting your filters or search criteria.'}
                </p>
                <Button 
                  variant="outline" 
                  className="mt-6"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('All');
                    clearAiFilters();
                    setInputValue('');
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
          
          {/* Pagination Footer */}
          {filtered.length > 0 && (
            <div className="border-t border-slate-100 bg-white p-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
              <div>
                Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filtered.length)} of {filtered.length} results
              </div>
              
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-slate-400 hover:text-slate-900"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNumber = idx + 1;
                  if (
                    pageNumber === 1 || 
                    pageNumber === totalPages || 
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <Button 
                        key={pageNumber}
                        variant="ghost" 
                        className={cn(
                          "h-8 w-8 p-0 font-medium rounded-md",
                          currentPage === pageNumber 
                            ? "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary" 
                            : "hover:bg-slate-100"
                        )}
                        onClick={() => setCurrentPage(pageNumber)}
                      >
                        {pageNumber}
                      </Button>
                    );
                  } else if (
                    pageNumber === currentPage - 2 || 
                    pageNumber === currentPage + 2
                  ) {
                    return <span key={pageNumber} className="px-1 text-slate-400">...</span>;
                  }
                  return null;
                })}

                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-slate-400 hover:text-slate-900"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <span>Rows per page</span>
                <Select value={String(rowsPerPage)} onValueChange={(v) => setRowsPerPage(Number(v))}>
                  <SelectTrigger className="h-8 w-auto px-3 border-slate-200 text-xs font-medium" size="sm">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 rows</SelectItem>
                    <SelectItem value="20">20 rows</SelectItem>
                    <SelectItem value="50">50 rows</SelectItem>
                    <SelectItem value="100">100 rows</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </Card>
      </div>

    </div>
  );
}
