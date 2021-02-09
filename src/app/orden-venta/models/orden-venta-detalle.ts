import { Fruta } from '../../maestros/fruta/fruta';
import { FrutaVariedad } from '../../maestros/fruta-variedad/fruta-variedad';
import { TablaAuxiliarDetalle } from '../../auxiliares/tabla-auxiliar/models/tabla-auxiliar-detalle';
import { OrdenVentaEmpaquetado } from './orden-venta-empaquetado';
import { Producto } from '../../productos/models/producto'

export class OrdenVentaDetalle {
  nro: number = 0;
  id: number;
  fruta: Fruta;
  blnFrutaValida:boolean = false;
  frutaVariedad: FrutaVariedad = undefined;
  blnFrutaVariedadValida:boolean = false
  categoriaFruta: TablaAuxiliarDetalle;
  blnCategoriaFrutaValida:boolean = false;
  tamanoFruta: TablaAuxiliarDetalle;
  unidadVenta: TablaAuxiliarDetalle;
  observacion: string='';
  precioUnitario: number = 0;
  cantidadFruta: number = 0;
  precioTotal: number = 0;
  descuento: number = 0;
  precioTotalDescuento: number = 0;
  igv: number=0;
  precioTotalIgv: number = 0;
  empaques: Array<OrdenVentaEmpaquetado> = [];
  producto:Producto;
}
