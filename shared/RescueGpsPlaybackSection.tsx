import React, { useState } from 'react';
import { Clock, MapPin, Navigation, Route, Square } from 'lucide-react';
import {
  GPS_PLAYBACK_DEMO_CASES,
  GPS_SEGMENT_TYPE_LABELS,
  getRescueGpsPlaybackMock,
  type GpsPlaybackDemoCaseId,
  type GpsPlaybackSegment,
} from '../data/rescueGpsPlaybackMockData';

const RescueGpsPlaybackSection: React.FC = () => {
  const [demoCase, setDemoCase] = useState<GpsPlaybackDemoCaseId>('with_data');
  const data = getRescueGpsPlaybackMock(demoCase);
  const hasSegments = data.segments.length > 0;

  return (
    <div className="flex flex-col h-full text-left">
      <div className="p-3 border-b bg-gray-50/80 space-y-2">
        <div className="rounded-lg border border-blue-100 bg-blue-50/60 px-2.5 py-1.5 flex flex-wrap items-center gap-1.5">
          <span className="text-[9px] font-black text-blue-700 uppercase tracking-widest shrink-0">Demo</span>
          {GPS_PLAYBACK_DEMO_CASES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setDemoCase(item.id)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${
                demoCase === item.id
                  ? 'bg-white border-blue-200 text-blue-800 shadow-sm'
                  : 'bg-transparent border-transparent text-blue-600 hover:bg-white/60'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-gray-600">
          <span>
            <span className="text-gray-400">device_id:</span>{' '}
            <strong className="font-mono text-gray-800">{data.deviceId}</strong>
          </span>
          <span className="text-gray-300">|</span>
          <span>
            <span className="text-gray-400">Cửa sổ:</span>{' '}
            <strong>{data.windowStart}</strong> → <strong>{data.windowEnd}</strong>
          </span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-500">Tài xế đi {data.driverDepartAt} (±{data.bufferMinutes}p)</span>
        </div>
        <p className="text-[9px] text-gray-500">
          Nguồn: <code className="font-mono bg-gray-100 px-1 rounded">GET /map/playback</code> · {data.syncMessage}
        </p>
      </div>

      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        {!hasSegments ? (
          <div className="py-10 px-4 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50/80">
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-gray-100 text-gray-400 mb-3">
              <Route size={20} />
            </div>
            <p className="text-sm font-bold text-gray-600">Không có dữ liệu hành trình</p>
            <p className="text-[11px] text-gray-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
              API <code className="font-mono text-[10px]">map/playback</code> trả về{' '}
              <code className="font-mono text-[10px]">result: []</code> trong cửa sổ thời gian đã chọn.
            </p>
          </div>
        ) : (
          <div className="relative border-l-2 border-gray-100 ml-3 pl-8 space-y-6">
            {data.segments.map((segment) => (
              <SegmentRow key={segment.id} segment={segment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function SegmentRow({ segment }: { segment: GpsPlaybackSegment }) {
  const isRoute = segment.type === 'route';
  const Icon = isRoute ? Navigation : Square;
  const dotClass = isRoute ? 'bg-blue-500' : 'bg-amber-500';
  const titleClass = isRoute ? 'text-blue-600' : 'text-amber-600';

  return (
    <div className="relative">
      <div
        className={`absolute -left-[44px] top-0 w-6 h-6 rounded-full ${dotClass} border-4 border-white shadow-md flex items-center justify-center`}
      >
        <Icon size={11} className="text-white" />
      </div>
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <p className={`text-xs font-black uppercase ${titleClass}`}>
            {GPS_SEGMENT_TYPE_LABELS[segment.type]}
          </p>
          <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
            {segment.totalDistanceKm.toFixed(2)} km
          </span>
          <span className="text-[9px] text-gray-400 flex items-center gap-0.5">
            <Clock size={9} />
            {segment.statusDuration}
          </span>
        </div>
        <p className="text-[10px] text-gray-500 mt-1.5 flex items-start gap-1">
          <MapPin size={11} className="shrink-0 mt-0.5 text-gray-400" />
          <span>
            <strong className="text-gray-700">{segment.startTime}</strong> — {segment.startAddress}
          </span>
        </p>
        {segment.type === 'route' && (
          <p className="text-[10px] text-gray-500 mt-1 flex items-start gap-1">
            <MapPin size={11} className="shrink-0 mt-0.5 text-gray-400" />
            <span>
              <strong className="text-gray-700">{segment.endTime}</strong> — {segment.endAddress}
            </span>
          </p>
        )}
        {segment.type === 'stop' && segment.endTime !== segment.startTime && (
          <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
            <Clock size={10} />
            đến {segment.endTime}
          </p>
        )}
      </div>
    </div>
  );
}

export default RescueGpsPlaybackSection;
