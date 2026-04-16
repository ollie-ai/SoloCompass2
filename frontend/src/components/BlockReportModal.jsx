import { useEffect, useState } from 'react';
import { AlertTriangle, Flag, Shield, X } from 'lucide-react';

const REPORT_CATEGORIES = [
  { value: 'harassment', label: 'Harassment' },
  { value: 'spam', label: 'Spam' },
  { value: 'scam', label: 'Scam or fraud' },
  { value: 'inappropriate_content', label: 'Inappropriate content' },
  { value: 'safety_concern', label: 'Safety concern' },
  { value: 'other', label: 'Other' },
];

const BlockReportModal = ({ isOpen, onClose, targetName, onSubmit, loading = false }) => {
  const [mode, setMode] = useState('block');
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [category, setCategory] = useState('other');

  useEffect(() => {
    if (isOpen) {
      setMode('block');
      setReason('');
      setDetails('');
      setCategory('other');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const submit = async () => {
    await onSubmit?.({
      action: mode,
      reason: reason.trim(),
      details: details.trim(),
      category,
    });
  };

  const disabled = loading || (mode === 'report' && reason.trim().length < 5);

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-base-100 border border-base-300 shadow-2xl">
        <div className="p-5 border-b border-base-300 flex items-center justify-between">
          <h3 className="text-base font-black text-base-content">Safety actions</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-base-200">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-base-content/70">
            Manage your safety settings for <span className="font-bold">{targetName || 'this traveler'}</span>.
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setMode('block')}
              className={`px-3 py-2 rounded-xl text-sm font-bold border ${mode === 'block' ? 'bg-warning/10 border-warning/40 text-warning' : 'border-base-300 text-base-content/70'}`}
            >
              <Shield size={14} className="inline mr-1.5" />
              Block
            </button>
            <button
              onClick={() => setMode('report')}
              className={`px-3 py-2 rounded-xl text-sm font-bold border ${mode === 'report' ? 'bg-error/10 border-error/40 text-error' : 'border-base-300 text-base-content/70'}`}
            >
              <Flag size={14} className="inline mr-1.5" />
              Report
            </button>
          </div>

          {mode === 'report' && (
            <>
              <label className="form-control">
                <span className="label-text text-xs font-bold uppercase tracking-wide">Category</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-base-300 bg-base-100 px-3 py-2 text-sm"
                >
                  {REPORT_CATEGORIES.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </label>
              <label className="form-control">
                <span className="label-text text-xs font-bold uppercase tracking-wide">Reason</span>
                <input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Please describe what happened"
                  maxLength={500}
                  className="mt-1 w-full rounded-xl border border-base-300 bg-base-100 px-3 py-2 text-sm"
                />
              </label>
              <label className="form-control">
                <span className="label-text text-xs font-bold uppercase tracking-wide">Details (optional)</span>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={4}
                  maxLength={2000}
                  className="mt-1 w-full rounded-xl border border-base-300 bg-base-100 px-3 py-2 text-sm resize-none"
                />
              </label>
            </>
          )}

          {mode === 'block' && (
            <div className="rounded-xl border border-warning/30 bg-warning/10 p-3 text-xs text-warning flex gap-2">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              Blocking removes this traveler from discovery and future connection flows.
            </div>
          )}
        </div>

        <div className="p-5 border-t border-base-300 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-base-300 text-sm font-bold">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={disabled}
            className={`px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50 ${mode === 'report' ? 'bg-error' : 'bg-warning'}`}
          >
            {loading ? 'Saving...' : mode === 'report' ? 'Submit report' : 'Block user'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlockReportModal;
