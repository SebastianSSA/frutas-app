import { Departamento } from './departamento';

export class Pais {
  id: number;
  nombre: string;
  abreviatura: string;
  departamentos: Departamento[];
  idUsuarioCrea: number;
  fechaCrea: string;
}
