import { RefreshCw } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import useLogs from '../../hooks/useLogs';
import Layout from '../Layout/Layout';
import { useCountries } from '../Predictions/hooks/useCountries';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

import { DataTable } from './components/DataTable';

export default function Monitoring() {
  const { t } = useTranslation();
  const { logs, loading, error, refetchLogs } = useLogs();
  const { countries } = useCountries();

  const stats = useMemo(() => {
    const totalLogs = logs.length;
    const successfulLogs = logs.filter(log => log.is_success).length;
    const errorLogs = logs.filter(log => !log.is_success).length;
    
    return {
      totalLogs,
      successfulLogs,
      errorLogs,
      successRate: totalLogs > 0 ? ((successfulLogs / totalLogs) * 100).toFixed(0) : '0'
    };
  }, [logs]);

  const handleRefresh = () => {
    refetchLogs();
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">{t('monitoring.title')}</h1>
              <p className="text-gray-600 dark:text-gray-300">{t('monitoring.description')}</p>
            </div>
            <Button onClick={handleRefresh} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              {t('monitoring.refresh')}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t('monitoring.totalLogs')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLogs}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t('monitoring.successfulLogs')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.successfulLogs}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t('monitoring.errorLogs')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.errorLogs}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t('monitoring.successRate')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.successRate}%</div>
            </CardContent>
          </Card>
        </div>

        <DataTable 
          logs={logs}
          countries={countries}
          loading={loading}
          error={error}
        />
      </div>
    </Layout>
  );
}