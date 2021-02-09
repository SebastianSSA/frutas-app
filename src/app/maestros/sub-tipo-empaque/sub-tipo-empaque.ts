import { TablaAuxiliarDetalle } from '../../auxiliares/tabla-auxiliar/models/tabla-auxiliar-detalle';

export class SubTipoEmpaque {
  id: number;
  tipoEmpaque: TablaAuxiliarDetalle;
  nombre: string;
  capacidad: number;
  estado: TablaAuxiliarDetalle;
  idUsuarioCrea: number;
  fechaCrea: string;
  idUsuarioModifica: number;
  fechaModifica: string;
}
