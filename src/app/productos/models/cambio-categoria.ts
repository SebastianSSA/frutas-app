import { TablaAuxiliarDetalle } from '../../auxiliares/tabla-auxiliar/models/tabla-auxiliar-detalle';
import { Producto } from './producto';

export class CambioCategoria{
    id:number
    productoInicio:Producto
    productoFin:Producto
    cantidad:number = 0;
    indDescarte:number = 0;
	estado:TablaAuxiliarDetalle;
	idUsuarioCrea:number;
    fechaCrea:Date;
    idUsuarioModifica:number;
    fechaModifica:Date;
    blnDescarte:boolean = false;
}