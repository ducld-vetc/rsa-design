import React from 'react';
import { Building2, ChevronRight, Home } from 'lucide-react';

const BRANCH = 'SÀI GÒN FORD — TRỤ SỞ CAO THẮNG';
const TASCO_USER = 'Tasco Demo';

interface CrmPreviewShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  toolbar?: React.ReactNode;
  footerExtra?: React.ReactNode;
  evaluationOpen?: boolean;
}

const CrmPreviewShell: React.FC<CrmPreviewShellProps> = ({
  children,
  title,
  subtitle,
  toolbar,
  footerExtra,
  evaluationOpen,
}) => (
  <div className="space-y-4 text-sm">
    <div className="bg-vetc-green text-white px-4 py-2 rounded shadow-sm flex justify-between items-center">
      <div className="flex items-center space-x-2 text-sm">
        <Home size={16} />
        <ChevronRight size={14} />
        <span>Chăm sóc khách hàng</span>
        <ChevronRight size={14} />
        <span>Tasco CRM</span>
        <ChevronRight size={14} />
        <span className="font-semibold">Báo cáo xe dịch vụ</span>
        {evaluationOpen && (
          <>
            <ChevronRight size={14} />
            <span className="font-semibold bg-white/20 px-2 py-0.5 rounded">Đánh giá KH</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1 opacity-90">
          <Building2 size={14} />
          {BRANCH}
        </span>
        <span className="font-bold">[{TASCO_USER}]</span>
      </div>
    </div>

    <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
      <div className="bg-vetc-green text-white px-4 py-2.5 flex flex-wrap justify-between items-center gap-2">
        <div>
          <h1 className="font-bold text-sm uppercase tracking-wide">{title}</h1>
          {subtitle && <p className="text-[11px] opacity-90 mt-0.5">{subtitle}</p>}
        </div>
      </div>

      {toolbar && (
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex flex-wrap gap-2 items-center">
          {toolbar}
        </div>
      )}

      <div className="p-4">{children}</div>

      <div className="px-4 py-2 bg-green-50 border-t border-green-100 text-[11px] text-gray-600 flex justify-between items-center">
        {footerExtra ?? <span>Chọn dòng → Detail / Đánh giá để mở form trên báo cáo</span>}
        <span className="text-vetc-green font-medium">VETC × Tasco</span>
      </div>
    </div>
  </div>
);

export default CrmPreviewShell;
