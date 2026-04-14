import { useState, useRef } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import {
  Upload,
  FileSpreadsheet,
  Download,
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import AdminModal from './AdminModal';
import Button from '../Button';

const CSV_HEADERS = [
  'name',
  'country',
  'city',
  'description',
  'budget_level',
  'safety_rating',
  'solo_friendly_rating',
  'image_url'
];

const VALID_BUDGET_LEVELS = ['low', 'moderate', 'high'];
const VALID_SAFETY_RATINGS = ['low', 'medium', 'high'];

const sampleData = [
  ['name', 'country', 'city', 'description', 'budget_level', 'safety_rating', 'solo_friendly_rating', 'image_url'],
  ['Paris', 'France', 'Paris', 'The city of lights and romance', 'high', 'medium', '5', 'https://example.com/paris.jpg'],
  ['Tokyo', 'Japan', 'Tokyo', 'Modern metropolis with rich culture', 'moderate', 'high', '5', 'https://example.com/tokyo.jpg'],
  ['Bangkok', 'Thailand', 'Bangkok', 'Vibrant city with amazing street food', 'low', 'medium', '4', '']
];

const BulkImport = ({ onImportComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState('upload');
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [validatedData, setValidatedData] = useState([]);
  const [errors, setErrors] = useState({});
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef(null);

  const parseCSV = (text) => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }
    return data;
  };

  const validateRow = (row, index) => {
    const rowErrors = {};
    
    if (!row.name || row.name.trim() === '') {
      rowErrors.name = 'Name is required';
    }
    
    if (!row.country || row.country.trim() === '') {
      rowErrors.country = 'Country is required';
    }
    
    if (row.budget_level && !VALID_BUDGET_LEVELS.includes(row.budget_level.toLowerCase())) {
      rowErrors.budget_level = `Must be one of: ${VALID_BUDGET_LEVELS.join(', ')}`;
    }
    
    if (row.safety_rating && !VALID_SAFETY_RATINGS.includes(row.safety_rating.toLowerCase())) {
      rowErrors.safety_rating = `Must be one of: ${VALID_SAFETY_RATINGS.join(', ')}`;
    }
    
    if (row.solo_friendly_rating) {
      const rating = parseInt(row.solo_friendly_rating);
      if (isNaN(rating) || rating < 1 || rating > 5) {
        rowErrors.solo_friendly_rating = 'Must be a number between 1 and 5';
      }
    }
    
    return {
      ...row,
      _errors: rowErrors,
      _isValid: Object.keys(rowErrors).length === 0
    };
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }
    
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = parseCSV(event.target.result);
        if (data.length === 0) {
          toast.error('CSV file is empty');
          return;
        }
        setParsedData(data);
        
        const validated = data.map((row, index) => validateRow(row, index));
        setValidatedData(validated);
        
        const errorCount = validated.filter(r => !r._isValid).length;
        if (errorCount > 0) {
          setStep('preview');
          toast.error(`${errorCount} rows have validation errors`);
        } else {
          setStep('preview');
        }
      } catch (err) {
        toast.error('Failed to parse CSV file');
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(droppedFile);
      fileInputRef.current.files = dataTransfer.files;
      handleFileSelect({ target: { files: dataTransfer.files } });
    } else {
      toast.error('Please drop a CSV file');
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = sampleData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'destinations_template.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Template downloaded');
  };

  const handleImport = async () => {
    const validRows = validatedData.filter(row => row._isValid);
    if (validRows.length === 0) {
      toast.error('No valid rows to import');
      return;
    }

    setImporting(true);
    setProgress(0);
    
    try {
      const destinations = validRows.map(row => ({
        name: row.name,
        country: row.country,
        city: row.city || '',
        description: row.description || '',
        budget_level: row.budget_level || 'moderate',
        safety_rating: row.safety_rating || 'medium',
        solo_friendly_rating: row.solo_friendly_rating ? parseInt(row.solo_friendly_rating) : 4,
        image_url: row.image_url || ''
      }));

      const response = await api.post('/admin/destinations/bulk-import', { destinations });
      
      setImportResult({
        success: true,
        imported: response.data.imported || validRows.length,
        failed: response.data.failed || 0,
        errors: response.data.errors || []
      });
      setStep('result');
      
      if (onImportComplete) {
        onImportComplete();
      }
    } catch (error) {
      const failedCount = validatedData.filter(r => !r._isValid).length;
      const successCount = validatedData.length - failedCount;
      
      setImportResult({
        success: false,
        imported: successCount,
        failed: failedCount,
        errors: error.response?.data?.errors || []
      });
      setStep('result');
    } finally {
      setImporting(false);
      setProgress(100);
    }
  };

  const reset = () => {
    setStep('upload');
    setFile(null);
    setParsedData([]);
    setValidatedData([]);
    setErrors({});
    setProgress(0);
    setImportResult(null);
  };

  const validCount = validatedData.filter(r => r._isValid).length;
  const invalidCount = validatedData.filter(r => !r._isValid).length;

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <Upload size={16} />
        Bulk Import
      </Button>
      
      <AdminModal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setTimeout(reset, 300);
        }}
        title="Bulk Import Destinations"
        size="xl"
      >
        {step === 'upload' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleDownloadTemplate}
                className="gap-2"
              >
                <Download size={16} />
                Download Template
              </Button>
            </div>
            
            <div 
              className="border-2 border-dashed border-base-300 rounded-2xl p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileSpreadsheet size={32} className="text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold text-base-content">
                    Drop your CSV file here
                  </p>
                  <p className="text-base-content/50 text-sm">
                    or click to browse
                  </p>
                </div>
                <p className="text-xs text-base-content/40">
                  Supported format: .csv
                </p>
              </div>
            </div>
            
            <div className="bg-base-200 rounded-xl p-4">
              <h4 className="text-sm font-bold text-base-content mb-2">CSV Columns</h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-base-content/60">
                {CSV_HEADERS.map(header => (
                  <div key={header} className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded ${header === 'name' || header === 'country' ? 'bg-error/20 text-error' : 'bg-base-300 text-base-content/80'}`}>
                      {header}
                    </span>
                    {header === 'name' || header === 'country' && (
                      <span className="text-[10px]">(required)</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-success" />
                  <span className="text-sm font-bold text-base-content">{validCount} valid</span>
                </div>
                {invalidCount > 0 && (
                  <div className="flex items-center gap-2">
                    <XCircle size={18} className="text-error" />
                    <span className="text-sm font-bold text-base-content">{invalidCount} with errors</span>
                  </div>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={handleDownloadTemplate} className="gap-2">
                <Download size={14} />
                Template
              </Button>
            </div>
            
            {importing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-base-content/60">Importing...</span>
                  <span className="text-primary font-bold">{progress}%</span>
                </div>
                <div className="w-full bg-base-300 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
            
            <div className="overflow-x-auto max-h-96 overflow-y-auto rounded-xl border border-base-300">
              <table className="table table-xs w-full">
                <thead className="sticky top-0 bg-base-200">
                  <tr>
                    <th className="w-8">#</th>
                    <th>Name</th>
                    <th>Country</th>
                    <th>City</th>
                    <th>Budget</th>
                    <th>Safety</th>
                    <th>Rating</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {validatedData.map((row, idx) => (
                    <tr key={idx} className={row._isValid ? '' : 'bg-error/10'}>
                      <td className="text-base-content/40">{idx + 1}</td>
                      <td className={row._errors.name ? 'text-error' : ''}>
                        {row.name || '-'}
                        {row._errors.name && (
                          <div className="text-[10px] text-error">{row._errors.name}</div>
                        )}
                      </td>
                      <td className={row._errors.country ? 'text-error' : ''}>
                        {row.country || '-'}
                        {row._errors.country && (
                          <div className="text-[10px] text-error">{row._errors.country}</div>
                        )}
                      </td>
                      <td>{row.city || '-'}</td>
                      <td className={row._errors.budget_level ? 'text-error' : ''}>
                        {row.budget_level || '-'}
                        {row._errors.budget_level && (
                          <div className="text-[10px] text-error">{row._errors.budget_level}</div>
                        )}
                      </td>
                      <td className={row._errors.safety_rating ? 'text-error' : ''}>
                        {row.safety_rating || '-'}
                        {row._errors.safety_rating && (
                          <div className="text-[10px] text-error">{row._errors.safety_rating}</div>
                        )}
                      </td>
                      <td className={row._errors.solo_friendly_rating ? 'text-error' : ''}>
                        {row.solo_friendly_rating || '-'}
                        {row._errors.solo_friendly_rating && (
                          <div className="text-[10px] text-error">{row._errors.solo_friendly_rating}</div>
                        )}
                      </td>
                      <td>
                        {row._isValid ? (
                          <span className="flex items-center gap-1 text-success text-xs font-bold">
                            <CheckCircle size={12} />
                            Valid
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-error text-xs font-bold">
                            <XCircle size={12} />
                            Invalid
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={reset}>
                Start Over
              </Button>
              <Button 
                variant="primary" 
                onClick={handleImport}
                disabled={validCount === 0 || importing}
                className="gap-2"
              >
                {importing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Import {validCount} Destinations
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 'result' && (
          <div className="space-y-6 text-center py-8">
            {importResult?.success ? (
              <div className="space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle size={40} className="text-success" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-base-content">Import Complete!</h3>
                  <p className="text-base-content/60">Your destinations have been imported successfully</p>
                </div>
                <div className="flex justify-center gap-8">
                  <div className="text-center">
                    <p className="text-3xl font-black text-success">{importResult.imported}</p>
                    <p className="text-sm text-base-content/60">Imported</p>
                  </div>
                  {importResult.failed > 0 && (
                    <div className="text-center">
                      <p className="text-3xl font-black text-error">{importResult.failed}</p>
                      <p className="text-sm text-base-content/60">Failed</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-warning/10 flex items-center justify-center">
                  <AlertCircle size={40} className="text-warning" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-base-content">Import Finished</h3>
                  <p className="text-base-content/60">Some destinations may not have been imported</p>
                </div>
                <div className="flex justify-center gap-8">
                  <div className="text-center">
                    <p className="text-3xl font-black text-success">{importResult.imported}</p>
                    <p className="text-sm text-base-content/60">Successful</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-black text-error">{importResult.failed}</p>
                    <p className="text-sm text-base-content/60">Failed</p>
                  </div>
                </div>
              </div>
            )}
            
            <Button 
              variant="primary" 
              onClick={() => {
                setIsOpen(false);
                setTimeout(reset, 300);
              }}
              className="w-full"
            >
              Done
            </Button>
          </div>
        )}
      </AdminModal>
    </>
  );
};

export default BulkImport;