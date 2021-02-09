import { TablaAuxiliarDetalle } from '../../auxiliares/tabla-auxiliar/models/tabla-auxiliar-detalle';

export class Cliente {
  id: number;
  nombreCliente: string;
  estado: TablaAuxiliarDetalle;
  idUsuarioCrea: number;
  fechaCrea: string;
  idUsuarioModifica: number;
  fechaModifica: string;
}
