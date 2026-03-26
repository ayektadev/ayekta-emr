/**
 * Bulk Actions Component
 * 
 * Actions toolbar for selected patients.
 */

interface BulkActionsProps {
  selectedCount: number;
  onDeselectAll: () => void;
  onExportJson: () => void;
  onExportCsv: () => void;
  onPrintLabels: () => void;
  onPrintSummary: () => void;
}

export default function BulkActions({
  selectedCount,
  onDeselectAll,
  onExportJson,
  onExportCsv,
  onPrintLabels,
  onPrintSummary,
}: BulkActionsProps) {
  return (
    <div className="bg-ayekta-orange text-white">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-semibold">
              {selectedCount} patient{selectedCount > 1 ? 's' : ''} selected
            </span>
            <button
              onClick={onDeselectAll}
              className="text-sm text-white/80 hover:text-white transition-colors underline"
            >
              Deselect all
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onExportJson}
              className="px-3 py-1.5 bg-white/20 rounded hover:bg-white/30 transition-colors text-sm"
              title="Export as JSON files"
            >
              📄 JSON
            </button>
            <button
              onClick={onExportCsv}
              className="px-3 py-1.5 bg-white/20 rounded hover:bg-white/30 transition-colors text-sm"
              title="Export as CSV"
            >
              📊 CSV
            </button>
            <button
              onClick={onPrintLabels}
              className="px-3 py-1.5 bg-white/20 rounded hover:bg-white/30 transition-colors text-sm"
              title="Print patient labels"
            >
              🏷️ Labels
            </button>
            <button
              onClick={onPrintSummary}
              className="px-3 py-1.5 bg-white/20 rounded hover:bg-white/30 transition-colors text-sm"
              title="Print summary"
            >
              📋 Summary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
