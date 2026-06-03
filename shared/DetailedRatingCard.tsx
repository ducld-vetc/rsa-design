import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronDown, Settings, MessageSquare } from 'lucide-react';

interface DetailedRatingCardProps {
  title: string;
  rating: number;
  category: string;
  note: string;
  isExpanded: boolean;
  isEditing: boolean;
  categories: string[];
  onToggle: () => void;
  onRatingChange: (rating: number) => void;
  onCategoryChange: (category: string) => void;
  onNoteChange: (note: string) => void;
}

const Label = ({ children, required = false, className = "" }: { children?: React.ReactNode, required?: boolean, className?: string }) => (
  <label className={`text-[11px] font-bold text-gray-600 uppercase mb-1 flex items-center ${className}`}>
    {children} {required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

const DetailedRatingCard: React.FC<DetailedRatingCardProps> = ({
  title,
  rating,
  category,
  note,
  isExpanded,
  isEditing,
  categories,
  feedback,
  onToggle,
  onRatingChange,
  onCategoryChange,
  onNoteChange,
}) => {
  return (
    <div className="border rounded-lg overflow-hidden bg-gray-50/30 transition-all">
      <div 
        className="p-3 flex items-center justify-between cursor-pointer hover:bg-gray-100/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center space-x-3">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wide">{title}</span>
          <div className="flex items-center space-x-0.5">
            {[1, 2, 3, 4, 5].map(i => (
              <Star 
                key={i} 
                size={12} 
                fill={i <= rating ? "#fbbf24" : "none"} 
                className={i <= rating ? "text-yellow-400" : "text-gray-200"} 
              />
            ))}
            <span className="ml-1 text-[11px] font-black text-yellow-600">{rating}.0</span>
          </div>
        </div>
        <ChevronDown 
          size={14} 
          className={`text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
        />
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 border-t bg-white space-y-3">
              {/* Phân loại - hidden */}
              <div>
                <Label className="flex items-center space-x-1">
                  <MessageSquare size={12} className="text-gray-400" />
                  <span>Ghi chú chi tiết</span>
                </Label>
                <textarea 
                  readOnly={!isEditing}
                  value={note}
                  onChange={(e) => onNoteChange(e.target.value)}
                  placeholder="Nhập ghi chú..."
                  className="w-full border rounded px-2 py-1 text-[11px] outline-none focus:border-vetc-green min-h-[60px] disabled:bg-gray-50 resize-none"
                />
              </div>
              {/* Phản hồi - hidden */}
              {/*{isEditing && (*/}
              {/*  <div className="flex items-center space-x-1">*/}
              {/*    {[1, 2, 3, 4, 5].map(i => (*/}
              {/*      <button */}
              {/*        key={i} */}
              {/*        onClick={() => onRatingChange(i)}*/}
              {/*        className="text-gray-200 hover:text-yellow-400 transition-all"*/}
              {/*      >*/}
              {/*        <Star size={16} fill={i <= rating ? "#fbbf24" : "none"} className={i <= rating ? "text-yellow-400" : "text-gray-200"} />*/}
              {/*      </button>*/}
              {/*    ))}*/}
              {/*  </div>*/}
              {/*)}*/}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DetailedRatingCard;
