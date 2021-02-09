import { Fruta } from '../fruta/fruta';
import { TablaAuxiliarDetalle } from '../../auxiliares/tabla-auxiliar/models/tabla-auxiliar-detalle';

export class FrutaVariedad {
  id: number;
  fruta: Fruta;
  descripcion: string;
  estado: TablaAuxiliarDetalle;
  idUsuarioCrea: number;
  fechaCrea: string;
  idUsuarioModifica: number;
  fechaModifica: string;
}
