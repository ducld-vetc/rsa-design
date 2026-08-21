import React from 'react';
import StationCoverageReport from '../../pages/station-coverage/StationCoverageReport';

/** Domain riêng: chỉ nội dung Độ phủ trạm — không Sidebar / Header portal */
const App: React.FC = () => (
  <div className="min-h-screen w-full bg-gray-100 p-4 sm:p-6">
    <div className="mx-auto w-full max-w-none rounded-lg bg-white p-4 shadow-md sm:p-6">
      <StationCoverageReport />
    </div>
  </div>
);

export default App;
