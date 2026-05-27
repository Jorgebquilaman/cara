import { useState, useRef, useEffect } from 'react';
import api from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

interface Department { id: string; name: string; }
interface Career { id: string; name: string; departmentId: string; }

export default function AccountRequestPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [dni, setDni] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [careerId, setCareerId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [role, setRole] = useState('Student');
  const [reason, setReason] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get<Department[]>('/lookups/departments').then(({ data }) => setDepartments(data));
  }, []);

  useEffect(() => {
    if (!departmentId) { setCareers([]); setCareerId(''); return; }
    api.get<Career[]>('/lookups/careers', { params: { departmentId } }).then(({ data }) => setCareers(data));
    setCareerId('');
  }, [departmentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let attachmentUrl: string | undefined;

    if (selectedFile) {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      try {
        const { data } = await api.post<{ url: string }>('/auth/upload-attachment', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        attachmentUrl = data.url;
      } catch {
        toast.error('Error al subir el archivo');
        setUploading(false);
        setLoading(false);
        return;
      }
      setUploading(false);
    }

    try {
      await api.post('/auth/request-account', {
        firstName, lastName, email, dni,
        phoneNumber: phoneNumber || null,
        careerId: careerId || null,
        role, reason, attachmentUrl
      });
      setSent(true);
    } catch {
      toast.error('Error al enviar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm text-center space-y-4 rounded-xl border bg-white p-8 shadow-sm">
          <div className="text-4xl">✅</div>
          <h1 className="text-xl font-bold text-cara-900">¡Cuenta Creada!</h1>
          <p className="text-sm text-cara-500">
            Tu usuario ha sido activado automáticamente. Revisá tu correo institucional para establecer tu contraseña y comenzar a usar el sistema.
          </p>
          <a href="/login" className="block text-sm text-cara-600 hover:underline">Ir al inicio de sesión</a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <img src="/imagenes/logo%20cara.png" alt="CARA" className="w-full object-contain rounded-xl border bg-white p-6 shadow-sm" />
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-cara-900 text-center">Solicitar alta de usuario</h2>
          <Input label="Nombre" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          <Input label="Apellido" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          <Input label="Email institucional" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="DNI" value={dni} onChange={(e) => setDni(e.target.value)} required />
          <Input label="Teléfono (opcional)" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
          <div>
            <label className="mb-1 block text-sm font-medium text-cara-700">Departamento (opcional)</label>
            <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full rounded-lg border border-cara-200 px-3 py-2 text-sm focus:border-cara-500 focus:outline-none"
            >
              <option value="">Seleccioná un departamento</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-cara-700">Carrera (opcional)</label>
            <select value={careerId} onChange={(e) => setCareerId(e.target.value)} disabled={!departmentId}
              className="w-full rounded-lg border border-cara-200 px-3 py-2 text-sm focus:border-cara-500 focus:outline-none disabled:opacity-50"
            >
              <option value="">Seleccioná una carrera</option>
              {careers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-cara-700">Rol solicitado</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-lg border border-cara-200 px-3 py-2 text-sm focus:border-cara-500 focus:outline-none"
            >
              <option value="Student">Estudiante</option>
              <option value="Teacher">Docente</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-cara-700">Motivo</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-cara-200 px-3 py-2 text-sm focus:border-cara-500 focus:outline-none"
              placeholder="Contanos por qué necesitás acceso..."
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-cara-700">Certificado de alumno regular (opcional)</label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-cara-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-cara-50 file:text-cara-700 hover:file:bg-cara-100"
            />
            {selectedFile && (
              <p className="text-xs text-cara-500 mt-1">Seleccionado: {selectedFile.name}</p>
            )}
          </div>
          <Button type="submit" className="w-full" isLoading={loading || uploading}>Enviar solicitud</Button>
          <a href="/login" className="block text-center text-sm text-cara-600 hover:underline">Volver al inicio de sesión</a>
        </form>
      </div>
    </div>
  );
}
