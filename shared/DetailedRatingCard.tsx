import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  ChevronDown,
  MessageSquare,
  Pencil,
  History,
  Save,
  X,
  Upload,
  Paperclip,
  Trash2,
} from 'lucide-react';
import { RatingAttachment, RatingVersion } from './ratingTypes';

const Label = ({
  children,
  required = false,
  className = '',
}: {
  children?: React.ReactNode;
  required?: boolean;
  className?: string;
}) => (
  <label className={`text-[11px] font-bold text-gray-600 uppercase mb-1 flex items-center ${className}`}>
    {children} {required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

const StarRow: React.FC<{
  stars: number;
  interactive?: boolean;
  onChange?: (stars: number) => void;
  size?: number;
  emptyLabel?: string;
}> = ({ stars, interactive, onChange, size = 12, emptyLabel }) => {
  if (stars === 0 && !interactive) {
    return (
      <span className="text-[10px] font-bold text-gray-400 italic uppercase tracking-wide">
        {emptyLabel ?? 'Chưa đánh giá'}
      </span>
    );
  }

  return (
    <div className="flex items-center space-x-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(i)}
          className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
        >
          <Star
            size={size}
            fill={i <= stars ? '#fbbf24' : 'none'}
            className={i <= stars ? 'text-yellow-400' : 'text-gray-200'}
          />
        </button>
      ))}
      <span className={`ml-1 text-[11px] font-black ${stars > 0 ? 'text-yellow-600' : 'text-gray-400 italic'}`}>
        {stars > 0 ? `${stars}.0` : 'Chọn sao'}
      </span>
    </div>
  );
};

type SavePayload = {
  stars: number;
  category: string;
  content: string;
  attachments: RatingAttachment[];
  targetLabel?: string;
};

interface VersionedProps {
  versions: RatingVersion[];
  onSaveVersion: (data: SavePayload) => void;
  onViewHistory: () => void;
  /** Danh sách đối tượng đánh giá (vd. xưởng dịch vụ) */
  targetOptions?: string[];
  targetSelectLabel?: string;
  defaultTarget?: string;
}

interface LegacyProps {
  rating: number;
  category: string;
  note: string;
  isEditing: boolean;
  onRatingChange: (rating: number) => void;
  onCategoryChange: (category: string) => void;
  onNoteChange: (note: string) => void;
}

type DetailedRatingCardProps = {
  title: string;
  isExpanded: boolean;
  categories: string[];
  feedback?: boolean;
  onToggle: () => void;
} & (VersionedProps | (LegacyProps & { versions?: never }));

function isVersioned(props: DetailedRatingCardProps): props is DetailedRatingCardProps & VersionedProps {
  return Array.isArray((props as VersionedProps).versions);
}

const DetailedRatingCard: React.FC<DetailedRatingCardProps> = (props) => {
  const { title, isExpanded, categories, onToggle } = props;

  const versioned = isVersioned(props);
  const latest = versioned ? props.versions[props.versions.length - 1] : null;
  const hasRating = versioned ? props.versions.length > 0 : true;

  const displayRating = versioned ? (latest?.stars ?? 0) : props.rating;
  const displayNote = versioned ? (latest?.content ?? '') : props.note;
  const displayCategory = versioned ? (latest?.category ?? 'Bình thường') : props.category;
  const displayAttachments = versioned ? (latest?.attachments ?? []) : [];
  const currentVersion = versioned ? (latest?.version ?? 0) : 0;
  const targetOptions = versioned ? props.targetOptions ?? [] : [];
  const targetSelectLabel = versioned ? props.targetSelectLabel ?? 'Đối tượng đánh giá' : '';
  const defaultTarget = versioned ? props.defaultTarget ?? '' : '';
  const displayTarget =
    versioned && targetOptions.length > 0
      ? latest?.targetLabel && targetOptions.includes(latest.targetLabel)
        ? latest.targetLabel
        : defaultTarget || targetOptions[0] || ''
      : latest?.targetLabel ?? '';

  const [isEditingLocal, setIsEditingLocal] = useState(false);
  const [draftStars, setDraftStars] = useState(displayRating);
  const [draftCategory, setDraftCategory] = useState(displayCategory);
  const [draftContent, setDraftContent] = useState(displayNote);
  const [draftAttachments, setDraftAttachments] = useState<RatingAttachment[]>(displayAttachments);
  const [draftTarget, setDraftTarget] = useState(displayTarget);

  useEffect(() => {
    if (!isEditingLocal) {
      setDraftStars(displayRating);
      setDraftCategory(displayCategory);
      setDraftContent(displayNote);
      setDraftAttachments(displayAttachments);
      setDraftTarget(displayTarget);
    }
  }, [displayRating, displayCategory, displayNote, displayAttachments, displayTarget, isEditingLocal]);

  const isEditing = versioned ? isEditingLocal : props.isEditing;

  const handleStartEdit = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!versioned) return;
    setDraftStars(hasRating ? displayRating : 0);
    setDraftCategory(displayCategory);
    setDraftContent(displayNote);
    setDraftAttachments([...displayAttachments]);
    setDraftTarget(displayTarget || defaultTarget || targetOptions[0] || '');
    setIsEditingLocal(true);
    if (!isExpanded) onToggle();
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingLocal(false);
    setDraftStars(displayRating);
    setDraftCategory(displayCategory);
    setDraftContent(displayNote);
    setDraftAttachments(displayAttachments);
    setDraftTarget(displayTarget);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!versioned || draftStars < 1) return;
    if (targetOptions.length > 0 && !draftTarget) return;
    props.onSaveVersion({
      stars: draftStars,
      category: draftCategory,
      content: draftContent,
      attachments: draftAttachments,
      ...(targetOptions.length > 0 ? { targetLabel: draftTarget } : {}),
    });
    setIsEditingLocal(false);
  };

  const handleViewHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (versioned) props.onViewHistory();
  };

  const handleAddAttachment = () => {
    const name = `file-dinh-kem-${draftAttachments.length + 1}.pdf`;
    setDraftAttachments((prev) => [...prev, { name }]);
  };

  const handleRemoveAttachment = (idx: number) => {
    setDraftAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className={`border rounded-lg overflow-hidden transition-all ${hasRating ? 'bg-gray-50/30' : 'bg-gray-50/60 border-dashed border-gray-300'}`}>
      <div
        className="p-3 flex items-center justify-between cursor-pointer hover:bg-gray-100/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wide truncate">{title}</span>
          <StarRow stars={hasRating ? displayRating : 0} />
          {versioned && hasRating && currentVersion > 0 && (
            <span className="shrink-0 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-green-100 text-green-700">
              v{currentVersion}
            </span>
          )}
          {versioned && !hasRating && (
            <span className="shrink-0 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-gray-200 text-gray-500">
              Mới
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1 shrink-0 ml-2">
          {versioned && (
            <>
              <button
                type="button"
                disabled={!hasRating}
                onClick={handleViewHistory}
                className={`p-1.5 rounded-md transition-colors ${
                  hasRating
                    ? 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                    : 'text-gray-300 cursor-not-allowed'
                }`}
                title={hasRating ? 'Xem lịch sử đánh giá' : 'Chưa có lịch sử'}
              >
                <History size={14} />
              </button>
              <button
                type="button"
                onClick={(e) => handleStartEdit(e)}
                className="p-1.5 rounded-md text-gray-400 hover:text-vetc-green hover:bg-green-50 transition-colors"
                title={hasRating ? 'Chỉnh sửa đánh giá' : 'Thêm đánh giá'}
              >
                <Pencil size={14} />
              </button>
            </>
          )}
          <ChevronDown
            size={14}
            className={`text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 border-t bg-white space-y-3" onClick={(e) => e.stopPropagation()}>
              {isEditing ? (
                versioned ? (
                  <>
                    <div>
                      <Label>Số sao đánh giá</Label>
                      <StarRow
                        stars={draftStars}
                        interactive
                        onChange={setDraftStars}
                        size={18}
                      />
                    </div>

                    {targetOptions.length > 0 && (
                      <div>
                        <Label required>{targetSelectLabel}</Label>
                        <select
                          value={draftTarget}
                          onChange={(e) => setDraftTarget(e.target.value)}
                          className="w-full border rounded px-2 py-1.5 text-[11px] outline-none focus:border-vetc-green bg-white font-medium text-gray-800"
                        >
                          <option value="">-- Chọn xưởng dịch vụ --</option>
                          {targetOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {categories.length > 0 && (
                      <div>
                        <Label>Phân loại</Label>
                        <select
                          value={draftCategory}
                          onChange={(e) => setDraftCategory(e.target.value)}
                          className="w-full border rounded px-2 py-1.5 text-[11px] outline-none focus:border-vetc-green bg-white font-medium text-gray-800"
                        >
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <Label className="flex items-center space-x-1">
                        <MessageSquare size={12} className="text-gray-400" />
                        <span>Nội dung đánh giá</span>
                      </Label>
                      <textarea
                        value={draftContent}
                        onChange={(e) => setDraftContent(e.target.value)}
                        placeholder="Nhập nội dung đánh giá..."
                        className="w-full border rounded px-2 py-1 text-[11px] outline-none focus:border-vetc-green min-h-[60px] resize-none"
                      />
                    </div>

                    <div>
                      <Label className="flex items-center space-x-1">
                        <Paperclip size={12} className="text-gray-400" />
                        <span>File đính kèm</span>
                      </Label>
                      <div className="space-y-2">
                        {draftAttachments.map((file, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between px-2 py-1.5 bg-gray-50 border rounded text-[11px]"
                          >
                            <span className="flex items-center space-x-1 text-blue-600 truncate">
                              <Paperclip size={10} />
                              <span className="truncate">{file.name}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveAttachment(idx)}
                              className="text-gray-400 hover:text-red-500 p-0.5"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={handleAddAttachment}
                          className="flex items-center space-x-1 text-[10px] font-bold text-vetc-green hover:text-green-700 border border-dashed border-green-200 rounded px-2 py-1.5 w-full justify-center hover:bg-green-50 transition-colors"
                        >
                          <Upload size={12} />
                          <span>Thêm file đính kèm</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-2 pt-1">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="flex items-center space-x-1 px-3 py-1.5 rounded text-[11px] font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                      >
                        <X size={12} />
                        <span>Hủy</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={draftStars < 1 || (targetOptions.length > 0 && !draftTarget)}
                        className={`flex items-center space-x-1 px-3 py-1.5 rounded text-[11px] font-bold transition-colors shadow-sm ${
                          draftStars < 1 || (targetOptions.length > 0 && !draftTarget)
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-vetc-green text-white hover:bg-green-700'
                        }`}
                      >
                        <Save size={12} />
                        <span>{hasRating ? 'Lưu (tạo version mới)' : 'Lưu đánh giá'}</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label className="flex items-center space-x-1">
                        <MessageSquare size={12} className="text-gray-400" />
                        <span>Ghi chú chi tiết</span>
                      </Label>
                      <textarea
                        value={props.note}
                        onChange={(e) => props.onNoteChange(e.target.value)}
                        placeholder="Nhập ghi chú..."
                        className="w-full border rounded px-2 py-1 text-[11px] outline-none focus:border-vetc-green min-h-[60px] resize-none"
                      />
                    </div>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => props.onRatingChange(i)}
                          className="text-gray-200 hover:text-yellow-400 transition-all"
                        >
                          <Star
                            size={16}
                            fill={i <= props.rating ? '#fbbf24' : 'none'}
                            className={i <= props.rating ? 'text-yellow-400' : 'text-gray-200'}
                          />
                        </button>
                      ))}
                    </div>
                  </>
                )
              ) : (
                <>
                  {!hasRating ? (
                    <div className="flex flex-col items-center justify-center py-4 px-2 text-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <Star size={18} className="text-gray-300" />
                      </div>
                      <p className="text-[11px] font-bold text-gray-500">Chưa có đánh giá</p>
                      <p className="text-[10px] text-gray-400 leading-relaxed max-w-[240px]">
                        Mục này chưa được đánh giá. Bấm nút bút chì hoặc nút bên dưới để nhập lần đầu.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleStartEdit()}
                        className="flex items-center space-x-1 px-3 py-1.5 rounded bg-vetc-green text-white text-[10px] font-bold hover:bg-green-700 transition-colors shadow-sm"
                      >
                        <Pencil size={11} />
                        <span>Thêm đánh giá</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      {targetOptions.length > 0 && displayTarget && (
                        <div>
                          <Label>Xưởng dịch vụ</Label>
                          <p className="text-[11px] font-bold text-gray-800">{displayTarget}</p>
                        </div>
                      )}

                      {displayNote ? (
                        <div>
                          <Label className="flex items-center space-x-1">
                            <MessageSquare size={12} className="text-gray-400" />
                            <span>Nội dung</span>
                          </Label>
                          <p className="text-[11px] text-gray-700 leading-relaxed">{displayNote}</p>
                        </div>
                      ) : (
                        <p className="text-[11px] text-gray-400 italic">Không có nội dung mô tả</p>
                      )}

                      {versioned && displayAttachments.length > 0 ? (
                        <div>
                          <Label className="flex items-center space-x-1">
                            <Paperclip size={12} className="text-gray-400" />
                            <span>File đính kèm</span>
                          </Label>
                          <ul className="space-y-1">
                            {displayAttachments.map((file, idx) => (
                              <li
                                key={idx}
                                className="flex items-center space-x-1 text-[11px] text-blue-600"
                              >
                                <Paperclip size={10} />
                                <span>{file.name}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        versioned && (
                          <p className="text-[10px] text-gray-400 italic">Không có file đính kèm</p>
                        )
                      )}

                      {versioned && latest && (
                        <p className="text-[9px] text-gray-400">
                          Cập nhật lần cuối: {latest.ratedAt}
                          {latest.updatedBy ? ` · ${latest.updatedBy}` : ''}
                        </p>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DetailedRatingCard;
