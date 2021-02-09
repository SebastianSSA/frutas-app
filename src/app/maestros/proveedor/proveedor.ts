import { TablaAuxiliarDetalle } from '../../auxiliares/tabla-auxiliar/models/tabla-auxiliar-detalle';
import { Distrito } from '../../ubigeo/models/distrito';

export class Proveedor {
  nro: number = 0;
  id: number;
  tipoProveedor: TablaAuxiliarDetalle;
  nickname: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombres: string;
  dni: string;
  telefono1: string;
  telefono2: string;
  tipoVia: TablaAuxiliarDetalle;
  direccion: string;
  nroDireccion: string;
  urbanizacion: string;
  distrito: Distrito;
  zona: string;
  ruc: string;
  razonSocial: string;
  tipoOferta: TablaAuxiliarDetalle;
  subTipoOferta: string;
  observacion: string;
  foto: string;
  fechaRegistro: Date;
  fechaBaja: Date;
  estadoProveedor: TablaAuxiliarDetalle;
  idUsuarioCrea: number;
  idUsuarioModifica: number;
}
