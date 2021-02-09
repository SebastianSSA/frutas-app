import { TablaAuxiliarDetalle } from './tabla-auxiliar-detalle'

export class TablaAuxiliar {
  codTablaAuxiliar: string;
  nombre: string;
  observacion: string;
  detalleAuxiliar: Array<TablaAuxiliarDetalle>=[];
  idUsuarioCrea: string;
  fechaCrea: string;
}
