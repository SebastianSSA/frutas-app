import { FrutaVariedad } from '../../maestros/fruta-variedad/fruta-variedad';
import { TablaAuxiliarDetalle } from '../../auxiliares/tabla-auxiliar/models/tabla-auxiliar-detalle';

export class Producto{
	id:number;
	nro:number;
	frutaVariedad:FrutaVariedad;	
    categoria:TablaAuxiliarDetalle;	
	stock:number = 0;
	fechaUltimaCompra:Date;
	fechaUltimaVenta:Date;		
	estado:TablaAuxiliarDetalle;
	idUsuarioCrea:number;
    fechaCrea:Date;
    idUsuarioModifica:number;
    fechaModifica:Date;
}