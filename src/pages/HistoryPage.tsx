/**
 * 历史记录页面
 * 显示和管理用户的历史查询记录
 */

import { HistoryList } from '@/components/History';
import type { HistoryRecord } from '@/services/historyService';

export function HistoryPage() {
  const handleRecordClick = (record: HistoryRecord) => {
    // 导航到详情页面，暂时使用 alert
    alert(`查看记录: ${record.birthData.name || '匿名'} - ${record.birthData.birthDate}`);
    // TODO: 实现记录详情页面
    // navigate(`/history/${record.id}`);
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 text-gradient">
            历史记录
          </h1>
          <HistoryList onRecordClick={handleRecordClick} />
        </div>
      </div>
    </div>
  );
}

export default HistoryPage;
