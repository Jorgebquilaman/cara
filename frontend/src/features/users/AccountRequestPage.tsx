import { useState, useRef, useEffect, type ReactNode } from 'react';
import api from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

interface Department { id: string; name: string; }
interface Career { id: string; name: string; departmentId: string; }

const ContentWrapper = ({ children }: { children: ReactNode }) => (
  <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-[#121212] p-4">
    <div className="flex w-full max-w-4xl flex-col md:flex-row overflow-hidden rounded-3xl bg-white dark:bg-[#1E1E1E] shadow-2xl">
      <div className="hidden md:flex md:w-1/3 bg-cara-900 items-center justify-center p-12 relative">
        <div className="absolute inset-0 bg-cara-950/20" />
        <div className="relative z-10 text-white text-center">
          <img
            src="/imagenes/logo%20cara.png"
            alt="CARA Logo"
            className="w-40 h-40 object-contain mb-8 mx-auto bg-white rounded-full p-4"
          />
          <h1 className="text-3xl font-bold mb-2">Solicitar Alta</h1>
          <p className="text-cara-200">Completá el formulario para acceder al sistema.</p>
        </div>
      </div>
      <div className="w-full md:w-2/3 p-8 md:p-12 flex flex-col justify-center">
        <div className="md:hidden text-center mb-6">
          <img
            src="/imagenes/logo%20cara.png"
            alt="CARA Logo"
            className="w-20 h-20 object-contain mx-auto"
          />
        </div>
        {children}
      </div>
    </div>
  </div>
);

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
      <ContentWrapper>
        <div className="text-center space-y-4">
          <div className="text-5xl">✅</div>
          <h1 className="text-2xl font-bold text-cara-900 dark:text-cara-400">¡Solicitud enviada!</h1>
          <p className="text-sm text-cara-500">
            Tu cuenta ha sido creada exitosamente. Revisá tu correo institucional para instrucciones sobre cómo establecer tu contraseña.
          </p>
          <a href="/login" className="block text-sm text-cara-600 hover:underline">Ir al inicio de sesión</a>
        </div>
      </ContentWrapper>
    );
  }

  return (
    <ContentWrapper>
      <h2 className="text-2xl font-bold text-cara-900 dark:text-cara-400 mb-6 text-center md:text-left">Alta de usuario</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Nombre" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          <Input label="Apellido" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </div>
        
        <Input label="Email institucional" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="DNI" value={dni} onChange={(e) => setDni(e.target.value)} required />
          <Input label="Teléfono (opcional)" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <label className="mb-1 block text-sm font-medium text-cara-700">Certificado (opcional)</label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-cara-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-cara-50 file:text-cara-700 hover:file:bg-cara-100"
          />
        </div>

        <Button type="submit" className="w-full" isLoading={loading || uploading}>
          Enviar solicitud
        </Button>
        
        <a href="/login" className="block text-center text-sm text-cara-600 hover:underline">Volver al inicio de sesión</a>
      </form>
    </ContentWrapper>
  );
}
