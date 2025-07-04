import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Calendar,
  AlertCircle,
  CheckCircle,
  Info,
  ArrowUpDown,
  Search
} from 'lucide-react';
import type { Log } from '../../../types/types';

interface DataTableProps {
  logs: Log[];
  countries: Array<{ id_country: number; name: string }>;
  loading: boolean;
  error: string | null;
}

type SortField = 'date' | 'status' | 'country' | 'error';
type SortDirection = 'asc' | 'desc';

export function DataTable({ logs, countries, loading, error }: DataTableProps) {
  const { t } = useTranslation();
  
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [displayBy, setDisplayBy] = useState<string>('all');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handleDisplayByChange = (value: string) => {
    setDisplayBy(value);
    setCurrentPage(1);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4" />;
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
  };

      const filteredAndSortedLogs = useMemo(() => {
      let filtered = logs.filter(log => {
        const matchesCountry = selectedCountry === 'all' || log.country.id_country.toString() === selectedCountry;
        const matchesStatus = statusFilter === 'all' || 
          (statusFilter === 'success' && log.is_success) ||
          (statusFilter === 'error' && !log.is_success);
        const matchesDisplayBy = displayBy === 'all' ||
          (displayBy === 'successOnly' && log.is_success) ||
          (displayBy === 'errorsOnly' && !log.is_success);
        const matchesSearch = searchTerm === '' || 
          log.country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (log.error_string || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesCountry && matchesStatus && matchesDisplayBy && matchesSearch;
      });

          // Tri rapide par "displayBy" si spécifié
      if (displayBy === 'recentFirst') {
        filtered.sort((a, b) => new Date(b._date).getTime() - new Date(a._date).getTime());
      } else if (displayBy === 'oldestFirst') {
        filtered.sort((a, b) => new Date(a._date).getTime() - new Date(b._date).getTime());
      } else {
        // Tri normal par colonne
        filtered.sort((a, b) => {
          let aValue: any;
          let bValue: any;

          switch (sortField) {
        case 'date':
          aValue = new Date(a._date).getTime();
          bValue = new Date(b._date).getTime();
          break;
        case 'status':
          aValue = a.is_success ? 1 : 0;
          bValue = b.is_success ? 1 : 0;
          break;
        case 'country':
          aValue = a.country.name.toLowerCase();
          bValue = b.country.name.toLowerCase();
          break;
        case 'error':
          aValue = (a.error_string || '').toLowerCase();
          bValue = (b.error_string || '').toLowerCase();
          break;
        default:
          return 0;
      }

      if (sortDirection === 'asc') {
        if (aValue < bValue) return -1;
        if (aValue > bValue) return 1;
        return 0;
      } else {
                 if (aValue > bValue) return -1;
         if (aValue < bValue) return 1;
         return 0;
       }
     });
      }

    return filtered;
  }, [logs, selectedCountry, statusFilter, searchTerm, sortField, sortDirection, displayBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedLogs.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentLogs = filteredAndSortedLogs.slice(startIndex, endIndex);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (isSuccess: boolean) => {
    return isSuccess ? (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
        <CheckCircle className="w-3 h-3 mr-1" />
        {t('monitoring.status.success')}
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
        <AlertCircle className="w-3 h-3 mr-1" />
        {t('monitoring.status.error')}
      </Badge>
    );
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">{t('monitoring.loading')}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center text-red-500">
            <AlertCircle className="w-6 h-6 mr-2" />
            {t('monitoring.error')}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('common.search')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t('monitoring.search')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder={t('monitoring.filterByCountry')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('monitoring.allCountries')}</SelectItem>
                {countries.map(country => (
                  <SelectItem key={country.id_country} value={country.id_country.toString()}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

                          <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder={t('monitoring.filterByStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('monitoring.showAll')}</SelectItem>
                  <SelectItem value="success">{t('monitoring.showSuccess')}</SelectItem>
                  <SelectItem value="error">{t('monitoring.showErrors')}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={displayBy} onValueChange={handleDisplayByChange}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder={t('monitoring.displayBy')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('monitoring.allEntries')}</SelectItem>
                  <SelectItem value="successOnly">{t('monitoring.successOnly')}</SelectItem>
                  <SelectItem value="errorsOnly">{t('monitoring.errorsOnly')}</SelectItem>
                  <SelectItem value="recentFirst">{t('monitoring.recentFirst')}</SelectItem>
                  <SelectItem value="oldestFirst">{t('monitoring.oldestFirst')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
        </CardContent>
      </Card>

      {/* Tableau */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">
              Logs {filteredAndSortedLogs.length > 0 && `(${filteredAndSortedLogs.length})`}
            </CardTitle>
                         <div className="flex items-center space-x-2">
               <span className="text-sm text-muted-foreground">{t('monitoring.rowsPerPage')}:</span>
               <Select value={pageSize.toString()} onValueChange={(value) => {
                 setPageSize(Number(value));
                 setCurrentPage(1);
               }}>
                 <SelectTrigger className="w-20">
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="10">10</SelectItem>
                   <SelectItem value="20">20</SelectItem>
                   <SelectItem value="50">50</SelectItem>
                   <SelectItem value="100">100</SelectItem>
                 </SelectContent>
               </Select>
             </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAndSortedLogs.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-gray-500">
              <Info className="w-6 h-6 mr-2" />
              {t('monitoring.noData')}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('date')}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{t('monitoring.columns.date')}</span>
                          {getSortIcon('date')}
                        </div>
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('status')}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        <div className="flex items-center space-x-2">
                          <span>{t('monitoring.columns.status')}</span>
                          {getSortIcon('status')}
                        </div>
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('country')}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        <div className="flex items-center space-x-2">
                          <span>{t('monitoring.columns.country')}</span>
                          {getSortIcon('country')}
                        </div>
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('error')}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        <div className="flex items-center space-x-2">
                          <span>{t('monitoring.columns.error')}</span>
                          {getSortIcon('error')}
                        </div>
                      </Button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentLogs.map((log) => (
                    <TableRow key={log.id_log}>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {formatDate(log._date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(log.is_success)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className="font-medium">{log.country.name}</span>
                          {log.country.iso_code && (
                            <span className="ml-2 text-sm text-gray-500">({log.country.iso_code})</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.error_string ? (
                          <div className="max-w-xs truncate" title={log.error_string}>
                            {log.error_string}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
                             <div className="flex items-center justify-between space-x-2 py-4">
                 <div className="text-sm text-muted-foreground">
                   {t('monitoring.showing')} {startIndex + 1} {t('monitoring.to')} {Math.min(endIndex, filteredAndSortedLogs.length)} {t('monitoring.of')} {filteredAndSortedLogs.length} {t('monitoring.entries')}
                 </div>
                 <div className="flex items-center space-x-2">
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={() => goToPage(1)}
                     disabled={currentPage === 1}
                   >
                     <ChevronsLeft className="w-4 h-4" />
                   </Button>
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={() => goToPage(currentPage - 1)}
                     disabled={currentPage === 1}
                   >
                     <ChevronLeft className="w-4 h-4" />
                   </Button>
                   <div className="flex items-center space-x-1">
                     <span className="text-sm font-medium">
                       {t('monitoring.page')} {currentPage} {t('monitoring.of')} {totalPages}
                     </span>
                   </div>
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={() => goToPage(currentPage + 1)}
                     disabled={currentPage === totalPages}
                   >
                     <ChevronRight className="w-4 h-4" />
                   </Button>
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={() => goToPage(totalPages)}
                     disabled={currentPage === totalPages}
                   >
                     <ChevronsRight className="w-4 h-4" />
                   </Button>
                 </div>
               </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 