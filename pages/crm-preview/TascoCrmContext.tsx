import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  evaluationCriteria,
  serviceVehicleRows,
  type ServiceVehicleRow,
  TOTAL_RECORDS,
} from './mockData';
import {
  ContactFilterTab,
  RepairOrderEvaluation,
  matchesContactFilter,
  rowToEvaluation,
  validateEvaluationSave,
} from './tascoLogic';

interface TascoCrmContextValue {
  rows: ServiceVehicleRow[];
  totalRecords: number;
  selectedRow: ServiceVehicleRow | null;
  selectRow: (stt: number) => void;
  contactFilter: ContactFilterTab;
  setContactFilter: (tab: ContactFilterTab) => void;
  plateFilter: string;
  setPlateFilter: (v: string) => void;
  filteredRows: ServiceVehicleRow[];
  evaluationPanelOpen: boolean;
  evaluation: RepairOrderEvaluation | null;
  updateEvaluation: (patch: Partial<RepairOrderEvaluation>) => void;
  updateContact: (attemptNo: 1 | 2 | 3, patch: Partial<RepairOrderEvaluation['contacts'][0]>) => void;
  updateCriterion: (code: string, patch: { rating?: string; note?: string }) => void;
  openEvaluationForSelected: () => void;
  openEvaluationForRow: (stt: number) => void;
  closeEvaluationPanel: () => void;
  saveEvaluation: () => { ok: boolean; message: string };
  saveMessage: string | null;
  clearSaveMessage: () => void;
}

const TascoCrmContext = createContext<TascoCrmContextValue | null>(null);

export const TascoCrmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rows, setRows] = useState(serviceVehicleRows);
  const [selectedStt, setSelectedStt] = useState<number | null>(1);
  const [contactFilter, setContactFilter] = useState<ContactFilterTab>('ALL');
  const [plateFilter, setPlateFilter] = useState('');
  const [evaluationPanelOpen, setEvaluationPanelOpen] = useState(false);
  const [evaluation, setEvaluation] = useState<RepairOrderEvaluation | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const selectedRow = useMemo(
    () => rows.find((r) => r.stt === selectedStt) ?? null,
    [rows, selectedStt],
  );

  const filteredRows = useMemo(() => {
    const q = plateFilter.trim().toLowerCase();
    return rows.filter((r) => {
      if (q && !r.bienKiemSoat.toLowerCase().includes(q) && !r.soRO.toLowerCase().includes(q)) {
        return false;
      }
      return matchesContactFilter(r, contactFilter);
    });
  }, [rows, plateFilter, contactFilter]);

  const selectRow = useCallback((stt: number) => {
    setSelectedStt(stt);
    setSaveMessage(null);
  }, []);

  const openEvaluationForRow = useCallback(
    (stt: number) => {
      const row = rows.find((r) => r.stt === stt);
      if (!row) return;
      setSelectedStt(stt);
      setEvaluation(rowToEvaluation(row, evaluationCriteria));
      setSaveMessage(null);
      setEvaluationPanelOpen(true);
    },
    [rows],
  );

  const openEvaluationForSelected = useCallback(() => {
    if (selectedStt != null) openEvaluationForRow(selectedStt);
  }, [selectedStt, openEvaluationForRow]);

  const closeEvaluationPanel = useCallback(() => {
    setEvaluationPanelOpen(false);
    setSaveMessage(null);
  }, []);

  const updateEvaluation = useCallback((patch: Partial<RepairOrderEvaluation>) => {
    setEvaluation((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const updateContact = useCallback(
    (attemptNo: 1 | 2 | 3, patch: Partial<RepairOrderEvaluation['contacts'][0]>) => {
      setEvaluation((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          contacts: prev.contacts.map((c) => (c.attemptNo === attemptNo ? { ...c, ...patch } : c)),
        };
      });
    },
    [],
  );

  const updateCriterion = useCallback((code: string, patch: { rating?: string; note?: string }) => {
    setEvaluation((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        criteria: prev.criteria.map((c) => (c.code === code ? { ...c, ...patch } : c)),
      };
    });
  }, []);

  const syncRowFromEvaluation = useCallback((form: RepairOrderEvaluation) => {
    const c1 = form.contacts.find((c) => c.attemptNo === 1);
    const c2 = form.contacts.find((c) => c.attemptNo === 2);
    const c3 = form.contacts.find((c) => c.attemptNo === 3);
    setRows((prev) =>
      prev.map((r) =>
        r.soRO === form.soRO
          ? {
              ...r,
              call1: c1?.date ?? r.call1,
              call2: c2?.date ?? r.call2,
              call3: c3?.date ?? r.call3,
              ketQuaLienHe: c1?.result || r.ketQuaLienHe,
              lyDoLienHe: c1?.reason || r.lyDoLienHe,
              ghiChuLan1: c1?.note ?? r.ghiChuLan1,
              ghiChuLan2: c2?.note ?? r.ghiChuLan2,
              ghiChuLan3: c3?.note ?? r.ghiChuLan3,
              danhGiaKH: form.danhGia,
            }
          : r,
      ),
    );
  }, []);

  const saveEvaluation = useCallback(() => {
    if (!evaluation) {
      return { ok: false, message: 'Không có dữ liệu đánh giá' };
    }
    const errors = validateEvaluationSave(evaluation);
    if (errors.length > 0) {
      const msg = errors.join(' • ');
      setSaveMessage(msg);
      return { ok: false, message: msg };
    }
    syncRowFromEvaluation(evaluation);
    const msg = `Đã lưu đánh giá R/O ${evaluation.soRO} — đồng bộ về báo cáo`;
    setSaveMessage(msg);
    return { ok: true, message: msg };
  }, [evaluation, syncRowFromEvaluation]);

  const value = useMemo(
    (): TascoCrmContextValue => ({
      rows,
      totalRecords: TOTAL_RECORDS,
      selectedRow,
      selectRow,
      contactFilter,
      setContactFilter,
      plateFilter,
      setPlateFilter,
      filteredRows,
      evaluationPanelOpen,
      evaluation,
      updateEvaluation,
      updateContact,
      updateCriterion,
      openEvaluationForSelected,
      openEvaluationForRow,
      closeEvaluationPanel,
      saveEvaluation,
      saveMessage,
      clearSaveMessage: () => setSaveMessage(null),
    }),
    [
      rows,
      selectedRow,
      selectRow,
      contactFilter,
      plateFilter,
      filteredRows,
      evaluationPanelOpen,
      evaluation,
      updateEvaluation,
      updateContact,
      updateCriterion,
      openEvaluationForSelected,
      openEvaluationForRow,
      closeEvaluationPanel,
      saveEvaluation,
      saveMessage,
    ],
  );

  return <TascoCrmContext.Provider value={value}>{children}</TascoCrmContext.Provider>;
};

export function useTascoCrm(): TascoCrmContextValue {
  const ctx = useContext(TascoCrmContext);
  if (!ctx) throw new Error('useTascoCrm must be used within TascoCrmProvider');
  return ctx;
}
