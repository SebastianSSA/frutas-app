//import { OrdenCompraDetalle } from './orden-compra-detalle';
import { SubTipoEmpaque } from '../../maestros/sub-tipo-empaque/sub-tipo-empaque';
import { Almacen } from '../../maestros/almacen/almacen';
import { TablaAuxiliarDetalle } from '../../auxiliares/tabla-auxiliar/models/tabla-auxiliar-detalle';

export class OrdenCompraEmpaquetado {
  nro: number = 0;
  id: number;
  //ordenCompraDetalle: OrdenCompraDetalle;
  subTipoEmpaque: SubTipoEmpaque;
  pesoCompra: number=0;
  identificador: string='';
  observacion: string='';
  pesoRecepcion: number=0;
  almacen: Almacen;
  motivoNoIngreso: TablaAuxiliarDetalle;
  categoriaMerma1: TablaAuxiliarDetalle;
  pesoMerma1: number=0;
  categoriaMerma2: TablaAuxiliarDetalle;
  pesoMerma2: number=0;
  idUsuarioCrea: number;
  fechaCrea: string;
  idUsuarioModifica: number;
  fechaModifica: string;
}
