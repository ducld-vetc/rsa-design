import React, { useState } from 'react';
import { ChevronRight, GitBranch } from 'lucide-react';
import PartnerScopeBar, { getStoredPersona } from '../components/PartnerScopeBar';
import { ORG_NODES, PARTNER_STAFF, ROLE_LABEL, type OrgNode, type PartnerPersona } from '../data/partnerRescueMockData';

const LEVEL_LABEL: Record<number, string> = {
  1: 'Ban điều hành',
  2: 'Giám đốc Miền',
  3: 'Giám đốc Chi nhánh',
  4: 'Quản lý Vùng chi nhánh',
  5: 'GĐ Trung tâm = Điều phối = Trạm',
};

const childrenOf = (id: string) => ORG_NODES.filter((n) => n.parentId === id);

const PartnerOrgConfig: React.FC = () => {
  const [persona, setPersona] = useState<PartnerPersona>(getStoredPersona);
  const [open, setOpen] = useState<string[]>(ORG_NODES.map((n) => n.id));
  const [selected, setSelected] = useState<OrgNode>(ORG_NODES[0]);

  const canEdit = persona.role === 'BDH';
  const heads = PARTNER_STAFF.filter((s) => s.orgNodeId === selected.id);

  const NodeRow: React.FC<{ node: OrgNode; depth: number }> = ({ node, depth }) => {
    const kids = childrenOf(node.id);
    const expanded = open.includes(node.id);
    return (
      <div>
        <button
          type="button"
          onClick={() => {
            setSelected(node);
            if (kids.length) {
              setOpen((prev) => (prev.includes(node.id) ? prev.filter((id) => id !== node.id) : [...prev, node.id]));
            }
          }}
          className={`flex w-full items-center gap-1 rounded-md py-1.5 pr-2 text-left text-[12px] ${
            selected.id === node.id ? 'bg-emerald-50 font-black text-[#00A859]' : 'font-semibold text-gray-700 hover:bg-gray-50'
          }`}
          style={{ paddingLeft: 8 + depth * 16 }}
        >
          {kids.length > 0 ? (
            <ChevronRight size={12} className={expanded ? 'rotate-90' : ''} />
          ) : (
            <span className="w-3" />
          )}
          <span>{node.name}</span>
          {node.isStation && (
            <span className="ml-1 rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-black uppercase text-emerald-800">Trạm</span>
          )}
        </button>
        {expanded && kids.map((c) => <NodeRow key={c.id} node={c} depth={depth + 1} />)}
      </div>
    );
  };

  return (
    <div>
      <PartnerScopeBar persona={persona} onChange={setPersona} />
      <h1 className="mb-1 text-lg font-black uppercase tracking-wide text-gray-800">Cấu hình tổ chức</h1>
      <p className="mb-4 text-[12px] text-gray-500">
        6 cấp. GĐ Chi nhánh và QL Vùng là hai cấp khác nhau nhưng quản lý cùng phạm vi chi nhánh. Cấp lá: NV cứu hộ và KT ngang hàng.
      </p>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="overflow-hidden rounded-lg border border-gray-200 lg:col-span-2">
          <div className="flex items-center gap-2 bg-[#00A859] px-3 py-2 text-sm font-bold text-white">
            <GitBranch size={14} /> Cây đơn vị
          </div>
          <div className="max-h-[560px] overflow-y-auto py-2">
            <NodeRow node={ORG_NODES[0]} depth={0} />
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 p-4 lg:col-span-3">
          <div className="text-[10px] font-black uppercase tracking-wider text-gray-400">{LEVEL_LABEL[selected.level]}</div>
          <h2 className="mt-1 text-base font-black text-gray-900">{selected.name}</h2>
          {selected.isStation && (
            <p className="mt-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-[11px] text-emerald-800">
              Entity này = <strong>Trạm cứu hộ Carpla = Trung tâm = Xưởng</strong>. Xe điều chuyển chỉ giữa các trạm.
            </p>
          )}
          {(selected.level === 3 || selected.level === 4) && (
            <p className="mt-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-[11px] text-blue-800">
              GĐ Chi nhánh và QL Vùng xem/sửa cùng dữ liệu chi nhánh; khác nhau ở cấp trên cây.
            </p>
          )}

          <div className="mt-4">
            <div className="text-[10px] font-bold uppercase text-gray-400">Người đứng đầu / nhân sự gắn nút</div>
            <ul className="mt-2 space-y-1">
              {heads.length === 0 && <li className="text-[12px] text-gray-400">Chưa gắn</li>}
              {heads.map((h) => (
                <li key={h.id} className="text-[12px] font-semibold text-gray-800">
                  {h.fullname} · {ROLE_LABEL[h.role]}
                </li>
              ))}
            </ul>
          </div>

          {selected.level === 5 && (
            <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 p-3 text-[12px]">
              <div className="font-bold text-gray-700">Cấp lá tại trạm</div>
              <div className="mt-1 text-gray-600">Nhân viên cứu hộ · Kế toán (ngang hàng, KT quản lý tiền)</div>
              <div className="mt-1 text-gray-600">GĐ Trung tâm = Điều phối trạm</div>
            </div>
          )}

          {canEdit ? (
            <button type="button" className="mt-4 rounded-lg bg-[#00A859] px-3 py-2 text-[11px] font-bold uppercase text-white">
              Sửa nút
            </button>
          ) : (
            <p className="mt-4 text-[11px] text-gray-400">Chỉ BDH được CRUD cây (demo). Người khác xem phạm vi của mình.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartnerOrgConfig;
