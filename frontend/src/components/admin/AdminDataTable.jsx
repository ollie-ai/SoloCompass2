import { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  Trash2,
  Users,
  CheckSquare,
  Square
} from 'lucide-react';
import Button from '../Button';

const AdminDataTable = ({
  data = [],
  columns = [],
  loading = false,
  total = 0,
  page = 1,
  limit = 10,
  onPageChange,
  onSort,
  sortBy,
  sortOrder = 'asc',
  onSearch,
  searchPlaceholder = 'Search...',
  onFilter,
  filterOptions = [],
  onExport,
  onRefresh,
  emptyMessage = 'No data available',
  emptyIcon: EmptyIcon,
  onSelectionChange,
  showCheckboxes = false,
  bulkActions = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState('');

  useEffect(() => {
    onSelectionChange?.(selectedRows);
  }, [selectedRows, onSelectionChange]);

  const totalPages = Math.ceil(total / limit) || 1;

  const handleSearch = (e) => {
    e?.preventDefault?.();
    onSearch?.(searchTerm);
  };

  const handleSort = (columnKey) => {
    if (!onSort) return;
    const newOrder = sortBy === columnKey && sortOrder === 'asc' ? 'desc' : 'asc';
    onSort(columnKey, newOrder);
  };

  const handleSelectAll = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(data.map((_, idx) => idx)));
    }
  };

  const handleSelectRow = (idx) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(idx)) {
      newSelected.delete(idx);
    } else {
      newSelected.add(idx);
    }
    setSelectedRows(newSelected);
  };

  const handleFilterApply = (filter) => {
    setActiveFilter(filter);
    onFilter?.(filter);
    setShowFilters(false);
  };

  const handleExport = () => {
    if (onExport) {
      onExport(data);
    } else {
      const headers = columns.map(col => col.label).join(',');
      const rows = data.map(row => 
        columns.map(col => {
          const value = col.render ? col.render(row[row[col.key]], row) : row[col.key];
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        }).join(',')
      ).join('\n');
      const csv = `${headers}\n${rows}`;
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const getSortIcon = (columnKey) => {
    if (sortBy !== columnKey) return <ArrowUpDown size={14} className="opacity-30" />;
    return sortOrder === 'asc' 
      ? <ArrowUp size={14} className="text-primary" />
      : <ArrowDown size={14} className="text-primary" />;
  };

  const renderCell = (row, column) => {
    if (column.render) {
      return column.render(row[row[column.key]], row);
    }
    return row[column.key] ?? '-';
  };

  const hasSelection = selectedRows.size > 0;

  return (
    <div className="bg-base-100 rounded-2xl border border-base-300 shadow-xl overflow-hidden">
      {/* Bulk Actions Toolbar */}
      {hasSelection && bulkActions.length > 0 && (
        <div className="px-4 py-3 bg-gradient-to-r from-sky-500/10 to-emerald-500/10 border-b border-sky-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-bold text-sky-600">
              {selectedRows.size} selected
            </span>
            <button
              onClick={() => setSelectedRows(new Set())}
              className="text-xs text-base-content/60 hover:text-base-content"
            >
              Clear
            </button>
          </div>
          <div className="flex items-center gap-2">
            {bulkActions.map((action, idx) => (
              <Button
                key={idx}
                variant={action.variant || 'outline'}
                size="sm"
                onClick={() => action.onClick?.(Array.from(selectedRows))}
                disabled={action.disabled}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="p-4 border-b border-base-300 bg-base-200/30 flex flex-wrap gap-4 items-center justify-between">
        <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 min-w-[200px]">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" size={16} />
            <input 
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-base-300 bg-base-100 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all text-sm"
            />
          </div>
          <Button type="submit" variant="outline" size="sm">
            Search
          </Button>
        </form>

        <div className="flex items-center gap-2">
          {filterOptions.length > 0 && (
            <div className="relative">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowFilters(!showFilters)}
                className={activeFilter ? 'border-primary text-primary' : ''}
              >
                <Filter size={14} className="mr-1" />
                {activeFilter || 'Filter'}
              </Button>
              {showFilters && (
                <div className="absolute top-full right-0 mt-1 w-56 bg-base-100 border border-base-300 rounded-xl shadow-xl z-50 overflow-hidden max-h-80 overflow-y-auto">
                  <button
                    onClick={() => handleFilterApply('')}
                    className="w-full px-4 py-2 text-left hover:bg-base-200 transition-colors text-sm border-b border-base-300"
                  >
                    All / Clear
                  </button>
                  {filterOptions.map((opt, idx) => {
                    if (opt.group === undefined && !opt.value) {
                      return null;
                    }
                    if (opt.group) {
                      return (
                        <div key={`group-${idx}`} className="px-4 py-1.5 bg-base-200/50 text-xs font-black text-base-content/60 uppercase tracking-widest">
                          {opt.group}
                        </div>
                      );
                    }
                    return (
                      <button
                        key={opt.value}
                        onClick={() => handleFilterApply(opt.value)}
                        className="w-full px-4 py-2 text-left hover:bg-base-200 transition-colors text-sm"
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {onExport && (
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download size={14} className="mr-1" />
              Export
            </Button>
          )}

          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw size={14} className="mr-1" />
              Refresh
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-base-200 text-base-content/40 text-[10px] font-black uppercase tracking-widest border-b border-base-300">
              {showCheckboxes && (
                <th className="px-4 py-4 w-10">
                  <button
                    onClick={handleSelectAll}
                    className="p-1 hover:bg-base-100 rounded"
                  >
                    {selectedRows.size === data.length && data.length > 0 ? (
                      <CheckSquare size={18} className="text-primary" />
                    ) : (
                      <Square size={18} className="text-base-content/30" />
                    )}
                  </button>
                </th>
              )}
              {columns.map(column => (
                <th 
                  key={column.key}
                  className={`px-4 py-4 ${column.sortable ? 'cursor-pointer hover:text-primary transition-colors' : ''} ${column.className || ''}`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-base-300/50">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (showCheckboxes ? 1 : 0)} className="px-4 py-20 text-center">
                  <RefreshCw className="animate-spin text-primary mx-auto" size={32} />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (showCheckboxes ? 1 : 0)} className="px-4 py-20 text-center text-base-content/40">
                  {EmptyIcon && <EmptyIcon size={48} className="mx-auto mb-2 opacity-30" />}
                  <p className="font-bold">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-base-200/30 transition-colors">
                  {showCheckboxes && (
                    <td className="px-4 py-4 w-10">
                      <button
                        onClick={() => handleSelectRow(rowIdx)}
                        className="p-1 hover:bg-base-100 rounded"
                      >
                        {selectedRows.has(rowIdx) ? (
                          <CheckSquare size={18} className="text-primary" />
                        ) : (
                          <Square size={18} className="text-base-content/30" />
                        )}
                      </button>
                    </td>
                  )}
                  {columns.map(column => (
                    <td key={column.key} className={`px-4 py-4 ${column.className || ''}`}>
                      {renderCell(row, column)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 bg-base-200/50 border-t border-base-300 flex items-center justify-between">
          <div className="text-xs text-base-content/50">
            Showing {((page - 1) * limit) + 1} - {Math.min(page * limit, total)} of {total} entries
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="outline" 
              size="sm"
              disabled={page === 1}
              onClick={() => onPageChange(1)}
            >
              <ChevronsLeft size={14} />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              disabled={page === 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft size={14} />
            </Button>
            <span className="px-3 text-sm font-medium">
              Page {page} of {totalPages}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight size={14} />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(totalPages)}
            >
              <ChevronsRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDataTable;