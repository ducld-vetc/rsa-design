import React from 'react';
import CrmPreviewApp from '../../pages/crm-preview/CrmPreviewApp';

const App: React.FC = () => (
  <div className="min-h-screen bg-gray-100">
    <header className="bg-vetc-green text-white shadow-md">
      <div className="max-w-[1600px] mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white rounded flex items-center justify-center text-vetc-green font-black italic text-lg shadow">
            V
          </div>
          <div>
            <p className="font-bold text-sm tracking-wide">VETC × Tasco CRM</p>
            <p className="text-[11px] opacity-90">Báo cáo chi tiết xe dịch vụ</p>
          </div>
        </div>
        <span className="text-[10px] bg-white/15 px-2 py-1 rounded">Preview · Dữ liệu mẫu</span>
      </div>
    </header>

    <main className="max-w-[1600px] mx-auto p-4">
      <CrmPreviewApp />
    </main>
  </div>
);
//hahahahhaha
export default App;
