import { useState, useRef, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import Pagination from '@/components/ui/Pagination';
import { Search, Plus, FileSpreadsheet, FileText, Pencil } from 'lucide-react';
import { User } from '@/types';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Department { id: string; name: string; }
interface Career { id: string; name: string; departmentId: string; }

const userSchema = z.object({
  firstName: z.string().min(1, 'Requerido').max(100),
  lastName: z.string().min(1, 'Requerido').max(100),
  email: z.string().email('Email inválido'),
  dni: z.string().min(1, 'Requerido'),
  phoneNumber: z.string().optional(),
  careerId: z.string().optional(),
  role: z.string().min(1, 'Seleccioná un rol'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type UserForm = z.infer<typeof userSchema>;

const roleOptions = [
  { value: '', label: 'Todos' },
  { value: 'Admin', label: 'Admin' },
  { value: 'Staff', label: 'Staff' },
  { value: 'Teacher', label: 'Docente' },
  { value: 'Student', label: 'Estudiante' },
];

const roleCreateOptions = [
  { value: 'Staff', label: 'Staff' },
  { value: 'Teacher', label: 'Docente' },
  { value: 'Student', label: 'Estudiante' },
];

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editDni, setEditDni] = useState('');
  const [editPhoneNumber, setEditPhoneNumber] = useState('');
  const [editCareerId, setEditCareerId] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [formDepartmentId, setFormDepartmentId] = useState('');
  const [editDepartmentId, setEditDepartmentId] = useState('');
  const [formCareers, setFormCareers] = useState<Career[]>([]);
  const [editCareers, setEditCareers] = useState<Career[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const pageSize = 10;
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    api.get<Department[]>('/lookups/departments').then(({ data }) => setDepartments(data));
  }, []);

  useEffect(() => {
    if (!formDepartmentId) { setFormCareers([]); return; }
    api.get<Career[]>('/lookups/careers', { params: { departmentId: formDepartmentId } }).then(({ data }) => setFormCareers(data));
  }, [formDepartmentId]);

  useEffect(() => {
    if (!editDepartmentId) { setEditCareers([]); return; }
    api.get<Career[]>('/lookups/careers', { params: { departmentId: editDepartmentId } }).then(({ data }) => setEditCareers(data));
  }, [editDepartmentId]);

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get<User[]>('/users');
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (form: UserForm) => {
      await api.post('/users', {
        ...form,
        phoneNumber: form.phoneNumber || null,
        careerId: form.careerId || null,
      });
    },
    onSuccess: () => {
      form.reset();
      setIsCreateOpen(false);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuario creado exitosamente');
    },
    onError: () => {
      toast.error('Error al crear usuario');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (user: User) => {
      await api.put(`/users/${user.id}`, {
        id: user.id,
        firstName: editFirstName,
        lastName: editLastName,
        dni: editDni,
        phoneNumber: editPhoneNumber || null,
        careerId: editCareerId || null,
        role: editRole,
        isActive: editIsActive,
      });
    },
    onSuccess: () => {
      setEditUser(null);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuario actualizado exitosamente');
    },
    onError: () => {
      toast.error('Error al actualizar usuario');
    },
  });

  const form = useForm<UserForm>({
    resolver: zodResolver(userSchema),
  });

  const onSubmit = async (data: UserForm) => {
    await createMutation.mutateAsync(data);
  };

  const allUsers = users ?? [];

  const filtered = useMemo(() => {
    let result = allUsers;
    if (roleFilter) {
      result = result.filter((u) => u.role === roleFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.fullName.toLowerCase().includes(q) ||
          u.institutionalEmail.toLowerCase().includes(q) ||
          u.dni.toLowerCase().includes(q)
      );
    }
    if (sortKey) {
      result = [...result].sort((a, b) => {
        const aVal = String((a as any)[sortKey] ?? '');
        const bVal = String((b as any)[sortKey] ?? '');
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      });
    }
    return result;
  }, [allUsers, roleFilter, search, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSearch = (value: string) => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setSearch(value);
      setPage(1);
    }, 400);
  };

  const handleRoleChange = (value: string) => {
    setRoleFilter(value);
    setPage(1);
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const exportExcel = () => {
    if (!allUsers.length) return;
    const ws = XLSX.utils.json_to_sheet(
      allUsers.map((u) => ({
        Nombre: u.fullName,
        Email: u.institutionalEmail,
        DNI: u.dni,
        Teléfono: u.phoneNumber || '',
        'Carrera/Depto': u.careerName || u.departmentName || '',
        Rol: u.role,
        Activo: u.isActive ? 'Sí' : 'No',
        'Préstamos Activos': u.activeLoanCount,
        Sanciones: u.hasActiveSanctions ? 'Sí' : 'No',
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Usuarios');
    XLSX.writeFile(wb, 'usuarios.xlsx');
  };

  const exportPdf = () => {
    if (!allUsers.length) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Usuarios - CARA', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleDateString()}`, 14, 28);
    autoTable(doc, {
      startY: 34,
      head: [['Nombre', 'Email', 'DNI', 'Teléfono', 'Carrera/Depto', 'Rol', 'Activo', 'Préstamos', 'Sanciones']],
      body: allUsers.map((u) => [
        u.fullName,
        u.institutionalEmail,
        u.dni,
        u.phoneNumber || '',
        u.careerName || u.departmentName || '',
        u.role,
        u.isActive ? 'Sí' : 'No',
        u.activeLoanCount.toString(),
        u.hasActiveSanctions ? 'Sí' : 'No',
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [51, 51, 51] },
    });
    doc.save('usuarios.pdf');
  };

  const columns = [
    { key: 'fullName', header: 'Nombre', sortable: true },
    { key: 'institutionalEmail', header: 'Email', sortable: true },
    { key: 'dni', header: 'DNI', sortable: true },
    {
      key: 'phoneNumber',
      header: 'Teléfono',
      render: (u: User) => u.phoneNumber || <span className="text-cara-400">—</span>,
    },
    {
      key: 'careerName',
      header: 'Carrera / Depto',
      sortable: true,
      render: (u: User) => {
        if (u.careerName) return u.careerName;
        if (u.departmentName) return <span className="text-cara-400">{u.departmentName}</span>;
        return <span className="text-cara-400">—</span>;
      },
    },
    { key: 'role', header: 'Rol', sortable: true, render: (u: User) => <Badge status={u.role} /> },
    {
      key: 'isActive',
      header: 'Activo',
      sortable: true,
      render: (u: User) => (u.isActive ? 'Sí' : 'No'),
    },
    { key: 'activeLoanCount', header: 'Préstamos Activos', sortable: true },
    { key: 'hasActiveSanctions', header: 'Sanciones', sortable: true, render: (u: User) => (u.hasActiveSanctions ? 'Sí' : 'No') },
    {
      key: 'acciones',
      header: '',
      render: (u: User) => (
        <button
          onClick={() => {
            setEditUser(u);
            setEditFirstName(u.firstName);
            setEditLastName(u.lastName);
            setEditDni(u.dni);
            setEditPhoneNumber(u.phoneNumber || '');
            setEditCareerId(u.careerId || '');
            setEditRole(u.role);
            setEditIsActive(u.isActive);
            const dept = departments.find(d => d.name === u.departmentName);
            setEditDepartmentId(dept?.id || '');
          }}
          className="rounded-lg p-2 text-cara-500 hover:bg-cara-100 hover:text-cara-700 transition-colors"
        >
          <Pencil className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-cara-900">Usuarios</h1>
          <p className="text-sm text-cara-500 mt-1">Gestioná los usuarios del sistema</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={exportExcel}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button variant="secondary" onClick={exportPdf}>
            <FileText className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Usuario
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-cara-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              className="w-full rounded-lg border border-cara-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cara-500 focus:border-transparent transition-shadow"
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <Select
            options={roleOptions}
            value={roleFilter}
            onChange={(e) => handleRoleChange(e.target.value)}
            className="w-44"
          />
        </div>
      </Card>

      <div className="card-surface overflow-hidden">
        <Table
          columns={columns}
          data={paged}
          keyExtractor={(u) => u.id}
          isLoading={isLoading}
          emptyMessage="No se encontraron usuarios"
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
        />
        <Pagination
          pageNumber={page}
          totalPages={totalPages}
          totalCount={filtered.length}
          onPageChange={setPage}
        />
      </div>

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Nuevo Usuario">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nombre" error={form.formState.errors.firstName?.message} {...form.register('firstName')} />
            <Input label="Apellido" error={form.formState.errors.lastName?.message} {...form.register('lastName')} />
            <Input label="Email institucional" type="email" error={form.formState.errors.email?.message} {...form.register('email')} />
            <Input label="DNI" error={form.formState.errors.dni?.message} {...form.register('dni')} />
            <Input label="Teléfono (opcional)" type="tel" error={form.formState.errors.phoneNumber?.message} {...form.register('phoneNumber')} />
            <div>
              <label className="mb-1 block text-sm font-medium text-cara-700 dark:text-cara-300">Departamento</label>
              <select value={formDepartmentId} onChange={(e) => setFormDepartmentId(e.target.value)}
                className="w-full rounded-lg border border-cara-200 px-3 py-2 text-sm focus:border-cara-500 focus:outline-none dark:bg-neutral-800 dark:text-gray-200 dark:border-neutral-700"
              >
                <option value="">Sin departamento</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-cara-700 dark:text-cara-300">Carrera</label>
              <select disabled={!formDepartmentId}
                {...form.register('careerId')}
                className="w-full rounded-lg border border-cara-200 px-3 py-2 text-sm focus:border-cara-500 focus:outline-none disabled:opacity-50 dark:bg-neutral-800 dark:text-gray-200 dark:border-neutral-700"
              >
                <option value="">Sin carrera</option>
                {formCareers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <Select
              label="Rol"
              options={roleCreateOptions}
              placeholder="Seleccioná un rol"
              error={form.formState.errors.role?.message}
              {...form.register('role')}
            />
            <Input label="Contraseña" type="password" error={form.formState.errors.password?.message} {...form.register('password')} />
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
            <Button type="submit" isLoading={createMutation.isPending}>Crear</Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!editUser}
        onClose={() => setEditUser(null)}
        title={`Editar Usuario`}
      >
        <div className="space-y-4">
          <Input
            label="Nombre"
            value={editFirstName}
            onChange={(e) => setEditFirstName(e.target.value)}
          />
          <Input
            label="Apellido"
            value={editLastName}
            onChange={(e) => setEditLastName(e.target.value)}
          />
          <Input
            label="DNI"
            value={editDni}
            onChange={(e) => setEditDni(e.target.value)}
          />
          <Input
            label="Teléfono"
            value={editPhoneNumber}
            onChange={(e) => setEditPhoneNumber(e.target.value)}
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-cara-700">Departamento</label>
            <select value={editDepartmentId} onChange={(e) => { setEditDepartmentId(e.target.value); setEditCareerId(''); }}
              className="w-full rounded-lg border border-cara-200 px-3 py-2 text-sm focus:border-cara-500 focus:outline-none"
            >
              <option value="">Sin departamento</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-cara-700">Carrera</label>
            <select value={editCareerId} onChange={(e) => setEditCareerId(e.target.value)} disabled={!editDepartmentId}
              className="w-full rounded-lg border border-cara-200 px-3 py-2 text-sm focus:border-cara-500 focus:outline-none disabled:opacity-50"
            >
              <option value="">Sin carrera</option>
              {editCareers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <Select
            label="Rol"
            options={[
              { value: 'Admin', label: 'Admin' },
              { value: 'Staff', label: 'Staff' },
              { value: 'Teacher', label: 'Docente' },
              { value: 'Student', label: 'Estudiante' },
            ]}
            value={editRole}
            onChange={(e) => setEditRole(e.target.value)}
          />
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={editIsActive}
              onChange={(e) => setEditIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-cara-300 text-cara-600 focus:ring-cara-500"
            />
            Usuario activo
          </label>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setEditUser(null)}>Cancelar</Button>
            <Button onClick={() => editUser && updateMutation.mutate(editUser)} isLoading={updateMutation.isPending}>
              Guardar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
