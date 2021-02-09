import { TablaAuxiliarDetalle } from '../../auxiliares/tabla-auxiliar/models/tabla-auxiliar-detalle';

export class Almacen {
  id: number;
  tipoAlmacen: TablaAuxiliarDetalle;
  descripcion: string;
  estado: TablaAuxiliarDetalle;
  idUsuarioCrea: number;
  fechaCrea: string;
  idUsuarioModifica: number;
  fechaModifica: string;
}
