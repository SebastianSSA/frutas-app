import { TablaAuxiliarDetalle } from '../../auxiliares/tabla-auxiliar/models/tabla-auxiliar-detalle';
import { OrdenVenta } from '../../orden-venta/models/orden-venta';
import { OrdenCompra } from '../../orden-compra/models/orden-compra';
import { Producto } from './producto';
import { CambioCategoria } from './cambio-categoria';

export class ProductoLog{
	id:number;
    producto:Producto;
    tipoOperacion:TablaAuxiliarDetalle;
    cantidad:number;
    ordenCompra:OrdenCompra;
    ordenVenta:OrdenVenta;
    cambioCategoria:CambioCategoria;
	idUsuarioCrea:number;
    fechaCrea:Date;  
}