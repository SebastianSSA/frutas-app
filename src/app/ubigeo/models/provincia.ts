import { Departamento } from './departamento';
import { Distrito } from './distrito';

export class Provincia {
  id: number;
  nombre: string;
  abreviatura: string;
  departamento: Departamento;
  distritos: Distrito[];
  idUsuarioCrea: number;
  fechaCrea: string;
}
