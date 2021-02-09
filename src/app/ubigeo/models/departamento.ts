import { Pais } from './pais';
import { Provincia } from './provincia';

export class Departamento {
  id: number;
  nombre: string;
  abreviatura: string;
  pais: Pais;
  provincias: Provincia[];
  idUsuarioCrea: number;
  fechaCrea: string;
}
