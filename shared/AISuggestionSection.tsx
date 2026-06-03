
import React, { useState } from 'react';
import { Sparkles, BrainCircuit, X, Zap, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { analyzeIncident, AISuggestion } from '../data/aiDataMock';

interface AISuggestionSectionProps {
  description: string;
  onApply: (suggestion: AISuggestion) => void;
  variant?: 'primary' | 'ghost';
}

const AISuggestionSection: React.FC<AISuggestionSectionProps> = ({ description, onApply, variant = 'primary' }) => {
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);

  const handleAIAnalyze = () => {
    if (!description || description.trim() === '') {
      alert('Vui lòng nhập mô tả sự cố để AI có thể phân tích.');
      return;
    }

    setIsAIAnalyzing(true);
    setTimeout(() => {
      const result = analyzeIncident(description);
      setAiSuggestion(result);
      setIsAIAnalyzing(false);
      setIsAIDialogOpen(true);
    }, 1500);
  };

  return (
    <>
      <button 
        type="button"
        onClick={handleAIAnalyze}
        disabled={isAIAnalyzing}
        className={`hidden flex items-center space-x-2 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all active:scale-95 disabled:opacity-50 ${
          variant === 'primary' 
            ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-lg' 
            : 'text-indigo-600 border border-indigo-200 hover:bg-indigo-50'
        }`}
      >
        {isAIAnalyzing ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <Sparkles size={12} className="animate-pulse" />
        )}
        <span>AI Phân tích & Gợi ý</span>
      </button>

      {/* AI Suggestion Modal */}
      {isAIDialogOpen && aiSuggestion && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border-t-4 border-indigo-500">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-4 flex items-center justify-between text-white">
              <div className="flex items-center space-x-3">
                <BrainCircuit size={24} className="animate-pulse" />
                <h3 className="font-bold text-lg">AI Assistant - Phân tích & Gợi ý</h3>
              </div>
              <button 
                type="button"
                onClick={() => setIsAIDialogOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 bg-gray-50/50 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar text-left">
              {/* Analysis Text */}
              <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm text-left">
                <div className="flex items-center space-x-2 mb-2 text-indigo-600">
                  <Zap size={16} fill="currentColor" />
                  <span className="text-xs font-black uppercase tracking-widest">Phân tích hệ thống</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed font-medium">
                  {aiSuggestion.analysis}
                </p>
              </div>

              {/* Recommended Services */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-gray-600 uppercase mb-1 flex items-center">Dịch vụ thực tế đề xuất</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {aiSuggestion.recommendedServices.map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                       <div className="flex items-center space-x-2 text-left">
                          <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                          <span className="text-xs font-bold text-gray-800">{s.name}</span>
                       </div>
                       <span className="text-xs font-black text-indigo-600 whitespace-nowrap">{s.price} đ</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Solution Steps */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-gray-600 uppercase mb-1 flex items-center">Hướng dẫn giải quyết sự cố</label>
                <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 text-sm text-gray-700 leading-relaxed italic border-l-4 border-l-indigo-500 text-left">
                  {aiSuggestion.solutionSteps}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-white border-t flex items-center justify-between">
              <div className="flex items-center space-x-2 text-[10px] text-gray-400 font-bold uppercase">
                <Sparkles size={12} />
                <span>Powered by VETC RSA-AI v2.0</span>
              </div>
              <div className="flex space-x-3">
                <button 
                  type="button"
                  onClick={() => setIsAIDialogOpen(false)}
                  className="px-6 py-2 rounded-xl text-gray-500 font-bold hover:bg-gray-100 transition-colors text-xs"
                >
                  Bỏ qua
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    onApply(aiSuggestion);
                    setIsAIDialogOpen(false);
                  }}
                  className="flex items-center space-x-2 px-8 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold shadow-lg hover:shadow-indigo-200 transition-all active:scale-95 text-xs"
                >
                  <span>Áp dụng gợi ý</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AISuggestionSection;
