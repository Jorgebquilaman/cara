import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

interface ImportRow {
  code: string;
  name: string;
  location: string;
  department: string;
  description: string;
}

interface ImportResult {
  created: number;
  skipped: number;
  total: number;
  errors: string[];
}

export default function ImportAssetsPage() {
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [fileName, setFileName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const importMutation = useMutation({
    mutationFn: async (items: ImportRow[]) => {
      const { data } = await api.post<ImportResult>('/assets/import', items);
      return data;
    },
    onSuccess: (result) => {
      toast.success(`${result.created} activos importados, ${result.skipped} omitidos`);
      if (result.errors.length > 0) {
        result.errors.forEach((e) => toast.error(e));
      }
      setRows([]);
      setFileName('');
    },
    onError: () => {
      toast.error('Error al importar activos');
    },
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 }) as string[][];

        if (json.length < 2) {
          toast.error('El archivo no tiene datos');
          return;
        }

        const parsed: ImportRow[] = [];
        const startRow = isHeaderRow(json[0]) ? 1 : 0;

        for (let i = startRow; i < json.length; i++) {
          const row = json[i];
          if (!row || !row[1]?.trim()) continue;
          parsed.push({
            code: (row[0] ?? '').toString().trim(),
            name: (row[1] ?? '').toString().trim(),
            location: (row[2] ?? '').toString().trim(),
            department: (row[3] ?? '').toString().trim(),
            description: (row[5] ?? '').toString().trim(),
          });
        }

        if (parsed.length === 0) {
          toast.error('No se encontraron filas con datos válidos');
          return;
        }

        setRows(parsed);
        toast.success(`${parsed.length} activos leídos del archivo`);
      } catch {
        toast.error('Error al leer el archivo. Verificá que sea un .xlsx válido.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  function isHeaderRow(row: string[]): boolean {
    if (!row || row.length === 0) return false;
    const val = (row[0] ?? '').toString().toLowerCase();
    return val.includes('cod') || val === 'id' || val === 'nro' || val === 'código';
  }

  const columns = [
    { key: 'code', header: 'Código' },
    { key: 'name', header: 'Nombre' },
    { key: 'location', header: 'Ubicación' },
    { key: 'department', header: 'Departamento' },
    { key: 'description', header: 'Descripción' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-cara-900">Importar Activos</h1>
          <p className="text-sm text-cara-500 mt-1">Cargá un archivo Excel con los activos a importar</p>
        </div>
      </div>

      <Card>
        <div className="flex flex-col items-center gap-4 py-8">
          <FileSpreadsheet className="h-12 w-12 text-cara-400" />
          <p className="text-sm text-cara-500 text-center max-w-md">
            El archivo debe tener las columnas: <strong>A</strong> (código), <strong>B</strong> (nombre), <strong>C</strong> (ubicación), <strong>D</strong> (departamento), <strong>F</strong> (descripción).
            Columna A es informativa. Categoría se asigna como "General" y días máximos como 7.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleFile}
          />
          <Button onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            {fileName || 'Seleccionar archivo Excel'}
          </Button>
          {fileName && (
            <p className="text-xs text-cara-400">{fileName}</p>
          )}
        </div>
      </Card>

      {rows.length > 0 && (
        <>
          <Card>
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-cara-800">
                Vista previa — {rows.length} activo{rows.length !== 1 ? 's' : ''}
              </p>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => { setRows([]); setFileName(''); }}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => importMutation.mutate(rows)}
                  isLoading={importMutation.isPending}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Importar {rows.length} activo{rows.length !== 1 ? 's' : ''}
                </Button>
              </div>
            </div>
            <div className="rounded-lg border border-cara-200 bg-white overflow-hidden shadow-sm">
              <Table
                columns={columns}
                data={rows.slice(0, 50)}
                keyExtractor={(item: ImportRow) => item.code + item.name}
                emptyMessage="No hay datos"
              />
              {rows.length > 50 && (
                <p className="text-xs text-cara-400 text-center py-2 border-t">
                  Mostrando 50 de {rows.length} registros
                </p>
              )}
            </div>
          </Card>

          {importMutation.data && (
            <Card>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-700">
                    {importMutation.data.created} creados
                  </span>
                </div>
                {importMutation.data.skipped > 0 && (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    <span className="font-semibold text-amber-700">
                      {importMutation.data.skipped} omitidos
                    </span>
                  </div>
                )}
                {importMutation.data.errors.length > 0 && (
                  <ul className="text-xs text-cara-600 space-y-1 mt-2 max-h-40 overflow-y-auto">
                    {importMutation.data.errors.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                )}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}