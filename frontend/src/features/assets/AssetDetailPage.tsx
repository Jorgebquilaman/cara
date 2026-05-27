import { useParams } from 'react-router-dom';
import { useAsset } from '@/hooks/useAssets';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';

export default function AssetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: asset, isLoading } = useAsset(id!);

  if (isLoading) return <p className="text-cara-500">Cargando...</p>;
  if (!asset) return <p className="text-danger">Activo no encontrado</p>;

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => window.history.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver
      </Button>

      <Card title={asset.name} subtitle={`Código: ${asset.code}`}>
        {asset.imageUrl && (
          <div className="mb-6">
            <img
              src={asset.imageUrl}
              alt={asset.name}
              className="w-full max-w-md rounded-xl border shadow-sm object-cover"
              style={{ maxHeight: 300 }}
            />
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-cara-500 uppercase">Categoría</label>
            <p className="text-cara-900">{asset.category}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-cara-500 uppercase">Estado</label>
            <Badge status={asset.status} />
          </div>
          <div>
            <label className="text-xs font-semibold text-cara-500 uppercase">Departamento</label>
            <p className="text-cara-900">{asset.department}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-cara-500 uppercase">Ubicación</label>
            <p className="text-cara-900">{asset.location}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-cara-500 uppercase">Días máx. préstamo</label>
            <p className="text-cara-900">{asset.maxLoanDays} días</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-cara-500 uppercase">Creado</label>
            <p className="text-cara-900">{new Date(asset.createdAt).toLocaleDateString()}</p>
          </div>
          {asset.description && (
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-cara-500 uppercase">Descripción</label>
              <p className="text-cara-900">{asset.description}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
