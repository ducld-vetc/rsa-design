import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { PERSONAS, ROLE_LABEL, orgName, type PartnerPersona } from '../data/partnerRescueMockData';

const STORAGE_KEY = 'partner-rescue-persona';

export const getStoredPersona = (): PartnerPersona => {
  try {
    const id = sessionStorage.getItem(STORAGE_KEY);
    return PERSONAS.find((p) => p.id === id) ?? PERSONAS[0];
  } catch {
    return PERSONAS[0];
  }
};

interface PartnerScopeBarProps {
  persona: PartnerPersona;
  onChange: (p: PartnerPersona) => void;
}

const PartnerScopeBar: React.FC<PartnerScopeBarProps> = ({ persona, onChange }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, persona.id);
    } catch {
      /* ignore */
    }
  }, [persona.id]);

  const scopeText =
    persona.stationIds.length === 0
      ? 'Toàn quốc'
      : persona.stationIds.length === 1
        ? orgName(persona.stationIds[0])
        : `${persona.stationIds.length} trạm trong ${orgName(persona.orgNodeId)}`;

  return (
    <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="font-bold uppercase tracking-wide text-[11px] text-amber-700">Demo đăng nhập</span>
          <p className="mt-1">
            <strong>{persona.title}</strong> · {ROLE_LABEL[persona.role]} · Phạm vi: {scopeText}
          </p>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded border border-amber-300 bg-white px-3 py-1.5 text-[11px] font-bold text-amber-900 hover:border-amber-500"
          >
            Đổi người đăng nhập (demo)
            <ChevronDown size={12} className={open ? 'rotate-180' : ''} />
          </button>
          {open && (
            <div className="absolute right-0 z-40 mt-1 w-72 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl">
              {PERSONAS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onChange(p);
                    setOpen(false);
                  }}
                  className={`flex w-full flex-col items-start px-3 py-2 text-left text-[11px] hover:bg-amber-50 ${
                    p.id === persona.id ? 'bg-amber-50' : ''
                  }`}
                >
                  <span className="font-bold text-gray-800">{p.label}</span>
                  <span className="text-gray-500">{p.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartnerScopeBar;
