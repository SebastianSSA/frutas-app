import { TablaAuxiliarDetalle } from '../../auxiliares/tabla-auxiliar/models/tabla-auxiliar-detalle';
import { OrdenVentaDetalle } from './orden-venta-detalle';
import { Almacen } from '../../maestros/almacen/almacen';
import { Cliente } from '../../maestros/cliente/cliente';

export class OrdenVenta {
  nro: number = 0;
  id: number;
  nroOrden: string='';
  vendedor: string='';
  tipoCliente: TablaAuxiliarDetalle;
  cliente: Cliente;
  nombreCliente: string='';
  tipoVenta: TablaAuxiliarDetalle;
  tipoOrdenVenta: TablaAuxiliarDetalle;
  moneda: TablaAuxiliarDetalle;
  indIgv: boolean = false;
  total: number=0.0;
  totalDescuento: number=0.0;
  totalMasDescuento: number=0.0;
  totalIgv: number=0.0;
  totalMasIgv: number=0.0;
  formaPagoVenta: TablaAuxiliarDetalle;
  fechaVenta: Date;
  fechaVentaDate: Date = new Date();
  fechaVentaTime: String = '';
  almacen: Almacen;
  detalle: Array<OrdenVentaDetalle>=[];
  estadoOrdenVenta: TablaAuxiliarDetalle;
  idUsuarioCrea: number;
  fechaCrea: string;
  idUsuarioModifica: number;
  fechaModifica: string;
}
