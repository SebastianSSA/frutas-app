import { TablaAuxiliarDetalle } from '../../auxiliares/tabla-auxiliar/models/tabla-auxiliar-detalle';

export class Fruta {
  id: number;
  nombre: string;
  foto: string;
  estado: TablaAuxiliarDetalle;
  idUsuarioCrea: number;
  fechaCrea: string;
  idUsuarioModifica: number;
  fechaModifica: string;
}
