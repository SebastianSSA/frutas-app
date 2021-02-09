import { Provincia } from './provincia';

export class Distrito {
  id: number;
  nombre: string;
  abreviatura: string;
  provincia: Provincia;
  idUsuarioCrea: number;
  fechaCrea: string;
}
