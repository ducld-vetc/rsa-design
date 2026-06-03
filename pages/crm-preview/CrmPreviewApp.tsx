import React from 'react';
import { TascoCrmProvider } from './TascoCrmContext';
import ServiceVehicleReportPreview from './ServiceVehicleReportPreview';

/** Một màn hình: Báo cáo + panel Đánh giá (chức năng con) */
const CrmPreviewApp: React.FC = () => (
  <TascoCrmProvider>
    <ServiceVehicleReportPreview />
  </TascoCrmProvider>
);

export default CrmPreviewApp;
