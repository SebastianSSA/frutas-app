import { Proveedor } from '../../maestros/proveedor/proveedor';
import { TablaAuxiliarDetalle } from '../../auxiliares/tabla-auxiliar/models/tabla-auxiliar-detalle';
import { OrdenCompraDetalle } from './orden-compra-detalle';

export class OrdenCompra {
  nro: number = 0;
  id: number;
  nroOrden: string='';
  comprador: string='';
  proveedor: Proveedor;
  tipoCompra: TablaAuxiliarDetalle;
  tipoOrden: TablaAuxiliarDetalle;
  moneda: TablaAuxiliarDetalle;
  indIgv: boolean = false;
  total: number=0.0;
  lugarCompra: string='';
  fechaCompra: Date;
  fechaCompraDate: Date = new Date();
  fechaCompraTime: string = '';
  detalle: Array<OrdenCompraDetalle>=[];
  estadoOrdenCompra: TablaAuxiliarDetalle;
  idUsuarioCrea: number;
  fechaCrea: string;
  idUsuarioModifica: number;
  fechaModifica: string;
}
