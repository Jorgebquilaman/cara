import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

interface Department {
  id: string;
  name: string;
  careers: Career[];
}

interface Career {
  id: string;
  name: string;
  departmentId: string;
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Department state
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [deptName, setDeptName] = useState('');
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  
  // Selection state
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
  const [careers, setCareers] = useState<Career[]>([]);
  const [isLoadingCareers, setIsLoadingCareers] = useState(false);
  
  // Career state
  const [isCareerModalOpen, setIsCareerModalOpen] = useState(false);
  const [careerName, setCareerName] = useState('');
  const [editingCareer, setEditingCareer] = useState<Career | null>(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get<Department[]>('/departments');
      setDepartments(data);
    } catch (error) {
      toast.error('Error al cargar departamentos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDeptId) {
      fetchCareers(selectedDeptId);
    } else {
      setCareers([]);
    }
  }, [selectedDeptId]);

  const fetchCareers = async (departmentId: string) => {
    setIsLoadingCareers(true);
    try {
      const { data } = await api.get<Career[]>(`/departments/${departmentId}/careers`);
      setCareers(data);
    } catch (error) {
      toast.error('Error al cargar propuestas');
    } finally {
      setIsLoadingCareers(false);
    }
  };

  const handleOpenDeptModal = (dept: Department | null = null) => {
    setEditingDept(dept);
    setDeptName(dept ? dept.name : '');
    setIsDeptModalOpen(true);
  };

  const handleSaveDept = async () => {
    if (!deptName.trim()) return;

    try {
      if (editingDept) {
        await api.put(`/departments/${editingDept.id}`, { name: deptName });
        toast.success('Departamento actualizado');
      } else {
        await api.post('/departments', { name: deptName });
        toast.success('Departamento creado');
      }
      setIsDeptModalOpen(false);
      await fetchDepartments();
    } catch (error) {
      toast.error('Error al guardar departamento');
    }
  };

  const handleDeleteDept = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este departamento y todas sus propuestas?')) return;

    try {
      await api.delete(`/departments/${id}`);
      if (selectedDeptId === id) setSelectedDeptId(null);
      await fetchDepartments();
      toast.success('Departamento eliminado');
    } catch (error) {
      toast.error('Error al eliminar departamento');
    }
  };

  const handleOpenCareerModal = (career: Career | null = null) => {
    if (!selectedDeptId) return;
    setEditingCareer(career);
    setCareerName(career ? career.name : '');
    setIsCareerModalOpen(true);
  };

  const handleSaveCareer = async () => {
    if (!careerName.trim() || !selectedDeptId) return;

    try {
      if (editingCareer) {
        await api.put(`/departments/${selectedDeptId}/careers/${editingCareer.id}`, { name: careerName });
        toast.success('Propuesta actualizada');
      } else {
        await api.post(`/departments/${selectedDeptId}/careers`, { name: careerName });
        toast.success('Propuesta creada');
      }
      setIsCareerModalOpen(false);
      await fetchCareers(selectedDeptId);
      await fetchDepartments(); // Update counts
    } catch (error) {
      toast.error('Error al guardar propuesta');
    }
  };

  const handleDeleteCareer = async (id: string) => {
    if (!selectedDeptId) return;
    if (!window.confirm('¿Estás seguro de eliminar esta propuesta?')) return;

    try {
      await api.delete(`/departments/${selectedDeptId}/careers/${id}`);
      await fetchCareers(selectedDeptId);
      await fetchDepartments(); // Update counts
      toast.success('Propuesta eliminada');
    } catch (error) {
      toast.error('Error al eliminar propuesta');
    }
  };

  const selectedDept = departments.find(d => d.id === selectedDeptId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-cara-900">Departamentos y Propuestas</h1>
          <p className="text-sm text-cara-500 mt-1">
            Gestioná los departamentos académicos y las propuestas (carreras) que dictan
          </p>
        </div>
        <Button onClick={() => handleOpenDeptModal()}>
          Nuevo Departamento
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Departments List */}
        <Card>
          <h2 className="text-xl font-semibold text-cara-900 mb-4">Departamentos</h2>
          
          <Table
            isLoading={isLoading}
            columns={[
              { key: 'name', header: 'Nombre' },
              {
                key: 'careers',
                header: 'Propuestas',
                render: (d: Department) => (
                  <span className="text-sm text-cara-600">
                    {d.careers.length} {d.careers.length === 1 ? 'propuesta' : 'propuestas'}
                  </span>
                ),
              },
              {
                key: 'actions',
                header: 'Acciones',
                render: (d: Department) => (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={selectedDeptId === d.id ? 'primary' : 'secondary'}
                      onClick={() => setSelectedDeptId(d.id)}
                    >
                      Ver Propuestas
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenDeptModal(d)}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDeleteDept(d.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
                ),
              },
            ]}
            data={departments}
            keyExtractor={(d) => d.id}
            emptyMessage="No hay departamentos registrados"
          />
        </Card>

        {/* Careers Section */}
        <Card className={!selectedDeptId ? 'opacity-50' : ''}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-cara-900">
              {selectedDept ? `Propuestas de ${selectedDept.name}` : 'Propuestas'}
            </h2>
            {selectedDeptId && (
              <Button size="sm" onClick={() => handleOpenCareerModal()}>
                Nueva Propuesta
              </Button>
            )}
          </div>

          {!selectedDeptId ? (
            <div className="text-center py-12 text-cara-400">
              Seleccioná un departamento para ver y gestionar sus propuestas
            </div>
          ) : (
            <Table
              isLoading={isLoadingCareers}
              columns={[
                { key: 'name', header: 'Nombre' },
                {
                  key: 'actions',
                  header: 'Acciones',
                  render: (c: Career) => (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenCareerModal(c)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeleteCareer(c.id)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  ),
                },
              ]}
              data={careers}
              keyExtractor={(c) => c.id}
              emptyMessage="No hay propuestas en este departamento"
            />
          )}
        </Card>
      </div>

      {/* Department Modal */}
      <Modal
        title={editingDept ? 'Editar Departamento' : 'Nuevo Departamento'}
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
      >
        <div className="space-y-4 pt-4">
          <Input
            label="Nombre del Departamento"
            value={deptName}
            onChange={(e) => setDeptName(e.target.value)}
            placeholder="Ej: Artes Visuales"
            required
            autoFocus
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsDeptModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveDept} disabled={!deptName.trim()}>
              {editingDept ? 'Guardar Cambios' : 'Crear Departamento'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Career Modal */}
      <Modal
        title={editingCareer ? 'Editar Propuesta' : 'Nueva Propuesta'}
        isOpen={isCareerModalOpen}
        onClose={() => setIsCareerModalOpen(false)}
      >
        <div className="space-y-4 pt-4">
          <Input
            label="Nombre de la Propuesta"
            value={careerName}
            onChange={(e) => setCareerName(e.target.value)}
            placeholder="Ej: Licenciatura en Cinematografía"
            required
            autoFocus
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsCareerModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveCareer} disabled={!careerName.trim()}>
              {editingCareer ? 'Guardar Cambios' : 'Crear Propuesta'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}