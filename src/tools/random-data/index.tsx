import { useState, useCallback, useMemo } from 'react';
import { SEOHelmet } from '../../components/SEOHelmet';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CopyButton } from '../../components/ui/CopyButton';
import {
  Database, RefreshCw, Plus, Trash2, ChevronDown, ChevronRight,
  Table2, Code2, FileText, Download
} from 'lucide-react';
import {
  FIELD_TYPES, generateRecord, toCSV, toSQL
} from './generators';
import type { FieldDef, FieldType } from './generators';

let _id = 0;
const nextId = () => `field-${++_id}`;

const DEFAULT_FIELDS: FieldDef[] = [
  { id: nextId(), name: 'id',    type: 'uuid',     config: {} },
  { id: nextId(), name: 'name',  type: 'fullName',  config: {} },
  { id: nextId(), name: 'email', type: 'email',     config: {} },
  { id: nextId(), name: 'age',   type: 'integer',   config: { min: 18, max: 65 } },
];

type OutputFormat = 'json' | 'csv' | 'sql';
type ViewMode = 'raw' | 'table';

// ── Type selector drop-down ───────────────────────────────────────────────────
function TypeSelect({ value, onChange }: { value: FieldType; onChange: (t: FieldType) => void }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value as FieldType)}
        className="w-full text-xs appearance-none pl-2 pr-6 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
      >
        {FIELD_TYPES.map(ft => (
          <option key={ft.id} value={ft.id}>{ft.label}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400" />
    </div>
  );
}

// ── Config panel for types that need it ──────────────────────────────────────
function FieldConfig({ field, onChange }: { field: FieldDef; onChange: (c: Record<string, any>) => void }) {
  if (field.type === 'integer' || field.type === 'float') {
    return (
      <div className="flex gap-2 mt-1">
        <input type="number" placeholder="min" value={field.config.min ?? ''} onChange={e => onChange({ ...field.config, min: +e.target.value })}
          className="w-full text-xs px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none" />
        <input type="number" placeholder="max" value={field.config.max ?? ''} onChange={e => onChange({ ...field.config, max: +e.target.value })}
          className="w-full text-xs px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none" />
        {field.type === 'float' && (
          <input type="number" placeholder="dp" value={field.config.decimals ?? 2} onChange={e => onChange({ ...field.config, decimals: +e.target.value })}
            className="w-16 text-xs px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none" />
        )}
      </div>
    );
  }
  return null;
}

// ── Single field row ──────────────────────────────────────────────────────────
function FieldRow({
  field, depth = 0, onChange, onDelete,
}: {
  field: FieldDef;
  depth?: number;
  onChange: (updated: FieldDef) => void;
  onDelete: () => void;
  onAddNested?: () => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const isNested = field.isNested;

  return (
    <div className={`rounded-lg border ${depth > 0 ? 'border-brand-200 dark:border-brand-800/50 bg-brand-50/30 dark:bg-brand-900/10' : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900'}`}>
      <div className={`flex items-center gap-2 px-3 py-2 ${isNested ? 'cursor-pointer' : ''}`}
        onClick={isNested ? () => setExpanded(v => !v) : undefined}>
        {isNested && (
          <button className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 shrink-0">
            {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        )}
        {/* Name */}
        <input
          value={field.name}
          onChange={e => onChange({ ...field, name: e.target.value })}
          onClick={e => e.stopPropagation()}
          className="flex-1 min-w-0 text-sm font-medium px-2 py-1 rounded border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-brand-400"
          placeholder="field name"
        />
        {!isNested && (
          <div className="w-40 shrink-0" onClick={e => e.stopPropagation()}>
            <TypeSelect value={field.type} onChange={type => onChange({ ...field, type })} />
          </div>
        )}
        {isNested && (
          <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
            <label className="flex items-center gap-1 text-xs text-zinc-500">
              <input type="checkbox" checked={field.isArray ?? false}
                onChange={e => onChange({ ...field, isArray: e.target.checked })} />
              Array
            </label>
            {field.isArray && (
              <input type="number" min="1" max="20" value={field.arrayCount ?? 2}
                onChange={e => onChange({ ...field, arrayCount: +e.target.value })}
                className="w-14 text-xs px-1.5 py-1 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100" />
            )}
          </div>
        )}
        <button onClick={e => { e.stopPropagation(); onDelete(); }}
          className="text-zinc-300 hover:text-red-500 dark:text-zinc-600 dark:hover:text-red-400 shrink-0 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {!isNested && (
        <div className="px-3 pb-2">
          <FieldConfig field={field} onChange={c => onChange({ ...field, config: c })} />
        </div>
      )}

      {isNested && expanded && field.nestedFields && (
        <div className="px-3 pb-3 space-y-2">
          {field.nestedFields.map((nf, ni) => (
            <FieldRow
              key={nf.id}
              field={nf}
              depth={depth + 1}
              onChange={updated => {
                const next = [...field.nestedFields!];
                next[ni] = updated;
                onChange({ ...field, nestedFields: next });
              }}
              onDelete={() => {
                onChange({ ...field, nestedFields: field.nestedFields!.filter((_, ii) => ii !== ni) });
              }}
            />
          ))}
          <button
            onClick={() => onChange({
              ...field,
              nestedFields: [
                ...field.nestedFields!,
                { id: nextId(), name: 'field', type: 'fullName', config: {} }
              ]
            })}
            className="flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 hover:underline"
          >
            <Plus className="w-3 h-3" /> Add sub-field
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function RandomData() {
  const [fields, setFields] = useState<FieldDef[]>(DEFAULT_FIELDS);
  const [count, setCount] = useState(10);
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [format, setFormat] = useState<OutputFormat>('json');
  const [view, setView] = useState<ViewMode>('raw');

  const generate = useCallback(() => {
    setData(Array.from({ length: count }, () => generateRecord(fields)));
  }, [count, fields]);

  const outputStr = useMemo(() => {
    if (!data.length) return '';
    if (format === 'json') return JSON.stringify(data, null, 2);
    if (format === 'csv')  return toCSV(data);
    return toSQL(data);
  }, [data, format]);

  const flatHeaders = useMemo(() => {
    if (!data.length) return [];
    const first: Record<string, any> = {};
    const flattenObject = (obj: any, prefix = '') => {
      Object.keys(obj).forEach(key => {
        const val = obj[key];
        const k = prefix ? `${prefix}.${key}` : key;
        if (val && typeof val === 'object' && !Array.isArray(val)) flattenObject(val, k);
        else first[k] = val;
      });
    };
    flattenObject(data[0]);
    return Object.keys(first);
  }, [data]);

  const flatData = useMemo(() => {
    return data.map(row => {
      const out: Record<string, any> = {};
      const flatten = (obj: any, prefix = '') => {
        Object.keys(obj).forEach(key => {
          const val = obj[key];
          const k = prefix ? `${prefix}.${key}` : key;
          if (val && typeof val === 'object' && !Array.isArray(val)) flatten(val, k);
          else out[k] = Array.isArray(val) ? JSON.stringify(val) : val;
        });
      };
      flatten(row);
      return out;
    });
  }, [data]);

  const addField = () => {
    setFields(prev => [...prev, { id: nextId(), name: `field${prev.length + 1}`, type: 'word', config: {} }]);
  };
  const addNested = () => {
    setFields(prev => [...prev, {
      id: nextId(), name: 'nested', type: 'uuid', config: {},
      isNested: true, nestedFields: [
        { id: nextId(), name: 'id', type: 'uuid', config: {} },
        { id: nextId(), name: 'label', type: 'word', config: {} },
      ]
    }]);
  };

  const downloadFile = () => {
    const ext = format === 'json' ? 'json' : format === 'csv' ? 'csv' : 'sql';
    const mime = format === 'json' ? 'application/json' : 'text/plain';
    const blob = new Blob([outputStr], { type: mime });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `random-data.${ext}`;
    a.click();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <SEOHelmet title="Random Data Generator" description="Generate custom mock JSON, CSV and SQL data with 23+ field types, nested objects, and instant export." />
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Random Data</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">Add fields, configure types, and generate dummy records.</p>
        </div>
        <Button onClick={generate} className="gap-2" size="lg">
          <RefreshCw className="w-4 h-4" /> Generate {count} Records
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
        {/* ── Config Panel ── */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Database className="w-5 h-5" />Schema Builder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Count slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Rows</label>
                <span className="text-sm font-mono text-brand-600 dark:text-brand-400">{count}</span>
              </div>
              <input type="range" min="1" max="500" value={count}
                onChange={e => setCount(+e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-brand-600" />
              <div className="flex justify-between text-xs text-zinc-400"><span>1</span><span>500</span></div>
            </div>

            {/* Fields */}
            <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Fields</label>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {fields.map((f, i) => (
                  <FieldRow
                    key={f.id}
                    field={f}
                    onChange={updated => {
                      const next = [...fields];
                      next[i] = updated;
                      setFields(next);
                    }}
                    onDelete={() => setFields(fields.filter((_, ii) => ii !== i))}
                  />
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={addField} className="flex-1 flex items-center justify-center gap-1 text-xs py-2 rounded-lg border-2 border-dashed border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-brand-400 hover:text-brand-600 dark:hover:border-brand-600 dark:hover:text-brand-400 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Add Field
                </button>
                <button onClick={addNested} className="flex-1 flex items-center justify-center gap-1 text-xs py-2 rounded-lg border-2 border-dashed border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-brand-400 hover:text-brand-600 dark:hover:border-brand-600 dark:hover:text-brand-400 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Nested Object
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Output Panel ── */}
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
            <CardTitle>Output</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Format */}
              <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1 gap-0.5">
                {(['json', 'csv', 'sql'] as OutputFormat[]).map(f => (
                  <button key={f} onClick={() => setFormat(f)}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors uppercase ${format === f ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'}`}>
                    {f}
                  </button>
                ))}
              </div>
              {/* View */}
              <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1 gap-0.5">
                <button onClick={() => setView('raw')}
                  className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-md transition-colors ${view === 'raw' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}>
                  <Code2 className="w-3.5 h-3.5" />Raw
                </button>
                {format === 'json' && (
                  <button onClick={() => setView('table')}
                    className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-md transition-colors ${view === 'table' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}>
                    <Table2 className="w-3.5 h-3.5" />Table
                  </button>
                )}
              </div>
              {data.length > 0 && <>
                <CopyButton value={outputStr} />
                <button onClick={downloadFile} className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-brand-600 hover:border-brand-300 transition-colors">
                  <Download className="w-3.5 h-3.5" /> Export
                </button>
              </>}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {!data.length ? (
              <div className="min-h-[400px] flex flex-col items-center justify-center text-gray-400 gap-3">
                <FileText className="w-12 h-12 opacity-30" />
                <p className="text-sm">Configure the schema above and click <strong>Generate</strong></p>
              </div>
            ) : view === 'table' && format === 'json' ? (
              <div className="overflow-auto max-h-[500px]">
                <table className="w-full text-xs text-left">
                  <thead className="sticky top-0 bg-zinc-100 dark:bg-zinc-800">
                    <tr>
                      {flatHeaders.map(h => (
                        <th key={h} className="px-3 py-2 font-semibold text-zinc-600 dark:text-zinc-400 whitespace-nowrap border-b border-zinc-200 dark:border-zinc-700">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {flatData.map((row, i) => (
                      <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/60 border-b border-zinc-100 dark:border-zinc-800/60">
                        {flatHeaders.map(h => (
                          <td key={h} className="px-3 py-2 text-zinc-800 dark:text-zinc-200 whitespace-nowrap max-w-[200px] truncate" title={String(row[h] ?? '')}>
                            {String(row[h] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-zinc-50 dark:bg-zinc-900 min-h-[400px] max-h-[600px] overflow-auto p-4 font-mono text-sm text-zinc-800 dark:text-zinc-200">
                <pre className="whitespace-pre-wrap break-all">{outputStr}</pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
