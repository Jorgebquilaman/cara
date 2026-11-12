import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import toast from 'react-hot-toast';

export default function EmailConfigPage() {
  const [host, setHost] = useState('smtp.gmail.com');
  const [port, setPort] = useState(587);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [fromName, setFromName] = useState('CARA - IUPA');
  const [incidentsEmail, setIncidentsEmail] = useState('');
  const [useSsl, setUseSsl] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    api.get('/email-config').then(({ data }) => {
      setHost(data.host);
      setPort(data.port);
      setUsername(data.username);
      setFromEmail(data.fromEmail);
      setFromName(data.fromName);
      setIncidentsEmail(data.incidentsEmail ?? '');
      setUseSsl(data.useSsl);
    }).catch(() => {}).finally(() => setFetching(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/email-config', { host, port, username, password, fromEmail, fromName, incidentsEmail, useSsl });
      toast.success('Configuración guardada');
    } catch {
      toast.error('Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-6 text-cara-500">Cargando...</div>;

  return (
    <div className="mx-auto max-w-xl space-y-6 py-6">
      <h1 className="page-title">Configuración de Email</h1>
      <p className="text-sm text-cara-500">Configuración SMTP para Gmail (usá una contraseña de aplicación de Google).</p>

      <Card>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Servidor SMTP" value={host} onChange={(e) => setHost(e.target.value)} required />
          <Input label="Puerto" type="number" value={port} onChange={(e) => setPort(Number(e.target.value))} required />
          <Input label="Usuario (email)" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <Input label="Contraseña de aplicación" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Dejá vacío para no cambiar" />
          <Input label="Email desde" type="email" value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} required />
          <Input label="Nombre desde" value={fromName} onChange={(e) => setFromName(e.target.value)} required />
          <div>
            <Input
              label="Email para reportes de activos rotos o robados"
              type="email"
              value={incidentsEmail}
              onChange={(e) => setIncidentsEmail(e.target.value)}
              placeholder="Ej: aparato@iupa.edu.ar"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Cuando se reporte un incidente o se devuelva un activo con daños, se enviará un aviso a esta
              casilla con todos los datos del activo, la persona, el préstamo y la descripción.
            </p>
          </div>
          <Checkbox checked={useSsl} onChange={setUseSsl} label="Usar SSL/TLS" id="use-ssl" />
          <div className="flex justify-end">
            <Button type="submit" isLoading={loading}>Guardar configuración</Button>
          </div>
        </form>
      </Card>

      <Card className="p-4 bg-mist/50">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">¿Cómo obtener una contraseña de aplicación de Google?</h3>
        <ol className="text-xs text-blue-700 space-y-1 list-decimal ml-4">
          <li>Activá la verificación en dos pasos en tu cuenta de Google</li>
          <li>Andá a <strong>Seguridad → Contraseñas de aplicaciones</strong></li>
          <li>Generá una para "Correo" y "Otro" (nombre: CARA)</li>
          <li>Copiá la contraseña de 16 caracteres acá</li>
        </ol>
      </Card>
    </div>
  );
}
