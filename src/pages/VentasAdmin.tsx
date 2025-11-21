import { useEffect, useState } from 'react';
import '../styles/VentaAdmin.css';
import { API_URL } from '../config';

interface VentaDetalle {
  id: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  producto: { nombre: string };
}

interface Usuario {
  id: number;
  nombre: string;
}

interface Venta {
  id: number;
  fecha: string;
  total: number;
  metodoPago: string;
  estado: string; // nuevo campo
  usuario: Usuario;
  detalles: VentaDetalle[];
}

export default function VentasAdmin() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [filteredVentas, setFilteredVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVenta, setSelectedVenta] = useState<Venta | null>(null);
  const [filtroCajero, setFiltroCajero] = useState('');
  const [fiiltroFecha, setFiltroFecha] = useState('');
  
  useEffect(() => {
    fetch(`${API_URL}/api/ventas`, {
      headers: { 'Content-Type': 'application/json' },
    })
      .then(res => res.json())
      .then(data => {
        setVentas(data);
        setFilteredVentas(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Error al cargar las ventas.');
        setLoading(false);
      });
  }, []);

  // 🔹 Filtrado por cajero y fecha
  useEffect(() => {
    let filtered = [...ventas];
    if (filtroCajero.trim() !== '') {
      filtered = filtered.filter(v =>
        v.usuario.nombre.toLowerCase().includes(filtroCajero.toLowerCase())
      );
    }
    if (fiiltroFecha.trim() !== '') {
      filtered = filtered.filter(v =>
      new Date(v.fecha).toISOString().slice(0, 10) === fiiltroFecha
    );
    }
    setFilteredVentas(filtered);
  }, [filtroCajero, fiiltroFecha, ventas]);

  if (loading) return <div className="loading">Cargando ventas...</div>;
  if (error) return <div className="error-msg">{error}</div>;

  const anularVenta = async (ventaId: number) => {
    if (!window.confirm('¿Seguro que deseas anular esta venta?')) return;
    try {
      const res = await fetch(`${API_URL}/api/ventas/Anular/${ventaId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Error al anular la venta');
      alert('Venta anulada correctamente');
      // Actualizar la lista
      setVentas(prev =>
        prev.map(v => (v.id === ventaId ? { ...v, estado: 'cancelada' } : v))
      );
      if (selectedVenta?.id === ventaId) {
        setSelectedVenta({ ...selectedVenta, estado: 'cancelada' });
      }
    } catch (err) {
      alert('No se pudo anular la venta');
    }
  };

  return (
    <div className="ventas-page">
      <h2>Ventas</h2>

      {/* Filtros */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Filtrar por cajero"
          value={filtroCajero}
          onChange={e => setFiltroCajero(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '0.5rem', border: 'none', minWidth: '200px' }}
        />
        <input
          type="date"
          value={fiiltroFecha}
          onChange={e => setFiltroFecha(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '0.5rem', border: 'none' }}
        />
      </div>

      {/* Grid de ventas */}
      <div className="ventas-grid">
        {filteredVentas.map(venta => (
          <div
            key={venta.id}
            className={`venta-card ${venta.estado === 'cancelada' ? 'cancelada' : ''}`}
            onClick={() => setSelectedVenta(venta)}
          >
            <div className="venta-info">
              <div className="venta-id">Venta #{venta.id}</div>
              <div className="venta-total">Total: ${venta.total}</div>
              <div className="venta-detalle">Método: {venta.metodoPago}</div>
              <div className="venta-detalle">Cajero: {venta.usuario.nombre}</div>
              <div className="venta-detalle">Estado: {venta.estado}</div>
            </div>
          </div>
        ))}
        {filteredVentas.length === 0 && (
          <div className="loading">No se encontraron ventas con los filtros aplicados.</div>
        )}
      </div>

      {/* Modal de detalle */}
      {selectedVenta && (
        <div className="modal-backdrop" onClick={() => setSelectedVenta(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Venta #{selectedVenta.id}</h3>
            <p><strong>Cajero:</strong> {selectedVenta.usuario.nombre}</p>
            <p><strong>Método de Pago:</strong> {selectedVenta.metodoPago}</p>
            

            <p><strong>Fecha:</strong> {new Date(selectedVenta.fecha).toLocaleString()}</p>
            <p><strong>Total:</strong> ${selectedVenta.total}</p>
            <p><strong>Estado:</strong> {selectedVenta.estado}</p>
            <h4>Productos:</h4>
            <ul>
              {selectedVenta.detalles.map(d => (
                <li key={d.id}>{d.producto.nombre} x{d.cantidad} - ${d.precioUnitario}</li>
              ))}
            </ul>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button className="modal-close" onClick={() => setSelectedVenta(null)}>Cerrar</button>
              {selectedVenta.estado !== 'cancelada' && (
                <button
                  className="modal-close"
                  style={{ background: '#ef4444' }}
                  onClick={() => anularVenta(selectedVenta.id)}
                >
                  Anular Venta
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}