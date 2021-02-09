import { Distrito } from '../../ubigeo/models/distrito';
import { Sede } from '../sede/sede';
import { TablaAuxiliarDetalle } from '../../auxiliares/tabla-auxiliar/models/tabla-auxiliar-detalle';

export class Empresa {
  id: number;
  ruc: string;
  razonSocial: string;
  nombreComercial: string;
  abreviatura: string;
  distrito: Distrito;
  direccionFiscal: string;
  telefono1: string;
  telefono2: string;
  correo: string;
  sedes: Sede[];
  estado: TablaAuxiliarDetalle;
  idUsuarioCrea: number;
  fechaCrea: string;
}
