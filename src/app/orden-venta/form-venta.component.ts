import { Component, OnInit, ApplicationRef,Inject,AfterViewInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { OrdenVenta } from './models/orden-venta';
import { OrdenVentaService } from './orden-venta.service';
import { AuthService } from '../usuarios/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { TablaAuxiliarService } from '../auxiliares/tabla-auxiliar/tabla-auxiliar.service';
import { FrutaService } from '../maestros/fruta/fruta.service';
import { FrutaVariedadService } from '../maestros/fruta-variedad/fruta-variedad.service';
import { AlmacenService } from '../maestros/almacen/almacen.service';
import { TablaAuxiliarDetalle } from '../auxiliares/tabla-auxiliar/models/tabla-auxiliar-detalle';
import { Almacen } from '../maestros/almacen/almacen';
import { Cliente } from '../maestros/cliente/cliente';
import { ClienteService } from '../maestros/cliente/cliente.service';
import { OrdenVentaDetalle } from './models/orden-venta-detalle';
import { Observable } from 'rxjs';
import { Fruta } from '../maestros/fruta/fruta';
import { FrutaVariedad } from '../maestros/fruta-variedad/fruta-variedad';
import { OrdenVentaEmpaquetado } from './models/orden-venta-empaquetado';
import { OrdenCompraService } from '../orden-compra/orden-compra.service';
import swal from 'sweetalert2';
import { ProductoService } from '../productos/producto.service';

@Component({
  selector: 'app-form-venta',
  templateUrl: './form-venta.component.html',
  styleUrls: ['./form-venta.component.css']
})
export class FormVentaComponent implements OnInit {

  titulo: string = "Orden de Venta";
  ordenVenta: OrdenVenta = new OrdenVenta();
  errores: string[];

  usuarios: String[];
  tiposVenta: TablaAuxiliarDetalle[];
  tiposProducto: TablaAuxiliarDetalle[];
  tiposMoneda: TablaAuxiliarDetalle[];
  tiposEstadoVenta: TablaAuxiliarDetalle[];
  tiposCliente: TablaAuxiliarDetalle[];
  formasPago: TablaAuxiliarDetalle[];
  clientes: Cliente[];
  almacenes: Almacen[];

  contadorDetalle: number = 1;

  frutas: Observable<Fruta[]>;
  variedadFrutas: Observable<FrutaVariedad[]>;
  categorias: Observable<TablaAuxiliarDetalle[]>;
  tamanos: Observable<TablaAuxiliarDetalle[]>;
  codigoJaba: Observable<string[]>;

  autoFruta: string;
  autoFrutaVariedad: string;
  autoCategoria: string;
  autoTamano: string;
  autoCodigoJaba: string;

  estadoOrdenVenta: number = 0;
  altoPantalla: any;
  numAnio: string = new Date().getFullYear().toString().substr(-2);

  blnGuardando:boolean =false;

  constructor(private ordenVentaService: OrdenVentaService
              ,private tablaAuxiliarService: TablaAuxiliarService
              ,private frutaService: FrutaService
              ,private frutaVariedadService: FrutaVariedadService
              ,private clienteService: ClienteService
              ,private almacenService: AlmacenService
              ,private ordenCompraService: OrdenCompraService
              ,public _authService: AuthService
              ,private router: Router
              ,private activatedRoute: ActivatedRoute
              ,private productoService: ProductoService
              ,@Inject(DOCUMENT) document) { }

  ngOnInit(): void {
    this.altoPantalla = window.innerHeight|| document.documentElement.clientHeight|| document.body.clientHeight;
    this.altoPantalla = this.altoPantalla*0.67;
    this.altoPantalla = this.altoPantalla + "px";

    this._authService.getComboBox().subscribe(usu => this.usuarios = usu);
    this.tablaAuxiliarService.getComboBox("TIPOVE").subscribe(aux => this.tiposVenta = aux);
    this.tablaAuxiliarService.getComboBox("TIPOFE").subscribe(aux => this.tiposProducto = aux);
    this.tablaAuxiliarService.getComboBox("TIPMON").subscribe(aux => this.tiposMoneda = aux);
    this.tablaAuxiliarService.getComboBox("TIPCLI").subscribe(aux => this.tiposCliente = aux);
    this.tablaAuxiliarService.getComboBox("ESTOVE").subscribe(aux => this.tiposEstadoVenta = aux);
    this.tablaAuxiliarService.getComboBox("FORPGV").subscribe(aux => this.formasPago = aux);
    this.clienteService.getComboBox().subscribe(cli => this.clientes = cli);
    this.almacenService.getComboBox().subscribe(alm => this.almacenes = alm);

    this.cargarOrden();
  }

  // ngAfterViewInit() {
  // }

  cargarOrden(): void {
    this.activatedRoute.params.subscribe(params => {
      let id = params['id'];
      if (id) {
        this.ordenVentaService.getOrden(id).subscribe(
          (ordenVenta) => {
            this.ordenVenta = ordenVenta;
            this.ordenVenta.fechaVentaDate = this.ordenVenta.fechaVenta;
            let hora = new Date(this.ordenVenta.fechaVentaDate);
            let hours = ("0" + hora.getHours()).slice(-2);
            let minutes = ("0" + hora.getMinutes()).slice(-2);
            this.ordenVenta.fechaVentaTime = hours + ':' + minutes;

            this.estadoOrdenVenta = this.ordenVenta.estadoOrdenVenta.tablaAuxiliarDetalleId.id;
            if(this.estadoOrdenVenta > 1){
              this.tiposEstadoVenta.shift();
            }

            let cont: number = 1;
            this.ordenVenta.detalle.forEach(det => {
              det.nro = cont;
              cont++;
              let ct: number = 1;
              det.empaques.forEach(emp => {
                emp.nro = ct;
                ct++;
              })
            });
          }
        )
      } else {
        this.ordenVenta = new OrdenVenta();
        this.ordenVenta.id = 0;
        this.ordenVenta.vendedor = this._authService.usuario.username.toUpperCase();
        this.ordenVenta.fechaVenta = new Date();
        this.ordenVenta.fechaVentaDate = this.ordenVenta.fechaVenta;
        let hora = new Date(this.ordenVenta.fechaVentaDate);
        let hours = ("0" + hora.getHours().toString()).slice(-2);
        let minutes = ("0" + hora.getMinutes().toString()).slice(-2);
        this.ordenVenta.fechaVentaTime = hours + ':' + minutes;

        this.ordenVenta.idUsuarioCrea = this._authService.usuario.id;

        this.tablaAuxiliarService.obtenerPorNombre("TIPOVE", "NOTA VENTA").subscribe(aux => {
          this.ordenVenta.tipoOrdenVenta = aux;
        })

        this.tablaAuxiliarService.obtenerPorNombre("TIPOFE", "FRUTAS").subscribe(aux => {
          this.ordenVenta.tipoVenta = aux;
        })

        this.tablaAuxiliarService.obtenerPorNombre("TIPMON", "SOLES").subscribe(aux => {
          this.ordenVenta.moneda = aux;
        })

        this.tablaAuxiliarService.obtenerPorNombre("TIPCLI", "MINORISTA").subscribe(aux => {
          this.ordenVenta.tipoCliente = aux;
        })

        this.tablaAuxiliarService.obtenerPorNombre("FORPGV", "CONTADO").subscribe(aux => {
          this.ordenVenta.formaPagoVenta = aux;
        })

        this.almacenService.getAlmacen(3).subscribe(alm => {
          this.ordenVenta.almacen = alm;
        })

        this.tablaAuxiliarService.obtenerPorNombre("ESTOVE", "GENERADO").subscribe(aux => {
          this.ordenVenta.estadoOrdenVenta = aux;
        })



        this.estadoOrdenVenta = 1;
      }
    })
  }

  limpiarValor(): void {
    this.autoFruta = null;
    this.autoFrutaVariedad = null;
    this.autoCategoria = null;
    this.autoTamano = null;
    this.frutas = new Observable<Fruta[]>();
    this.variedadFrutas = new Observable<FrutaVariedad[]>();
    this.categorias = new Observable<TablaAuxiliarDetalle[]>();
    this.tamanos = new Observable<TablaAuxiliarDetalle[]>();
  }

  private _filterFruta(value: string): Observable<Fruta[]> {
    const filterValue = value.toUpperCase();
    return this.frutaService.autocompleteList(filterValue);
  }

  mostrarNombreFruta(fruta?: Fruta):string | undefined {
    return fruta?fruta.nombre:undefined;
  }

  cambiarValorFruta(event): void {
    if (event.keyCode != 38 && event.keyCode != 40) {
      this.autoFruta = event.target.value;
      this.frutas = this.autoFruta ? this._filterFruta(this.autoFruta): new Observable<Fruta[]>();
    }
  }

  validarFruta(event, deta: OrdenVentaDetalle) {
    this.frutaService.getFrutaByNombre(event.target.value).subscribe(fru => {
      for (let index = 0; index < this.ordenVenta.detalle.length; index++) {
        const element = this.ordenVenta.detalle[index];
        if (element.nro == deta.nro) {
          this.ordenVenta.detalle[index].fruta = fru;
          break;
        }
      }
    }, err => {
      console.log("valor nulo")
    })
    this.limpiarValor();
  }

  private _filterFrutaVariedad(value: string, id: number): Observable<FrutaVariedad[]> {
    const filterValue = value.toUpperCase();
    return this.frutaVariedadService.autocompleteList(filterValue, id);
  }

  mostrarNombreFrutaVariedad(frutaVariedad?: FrutaVariedad):string | undefined {
    return frutaVariedad?frutaVariedad.descripcion:undefined;
  }

  cambiarValorFrutaVariedad(event, id: number): void {
    if (event.keyCode != 38 && event.keyCode != 40) {
      this.autoFrutaVariedad = event.target.value;
      this.variedadFrutas = this.autoFrutaVariedad ? this._filterFrutaVariedad(this.autoFrutaVariedad, id): new Observable<FrutaVariedad[]>();
    }
  }

  validarFrutaVariedad(event, deta: OrdenVentaDetalle) {
    this.frutaVariedadService.getFrutaVariedadByDescripcion(event.target.value, deta.fruta.id).subscribe(fruV => {
      for (let index = 0; index < this.ordenVenta.detalle.length; index++) {
        const element = this.ordenVenta.detalle[index];
        if (element.nro == deta.nro) {
          this.ordenVenta.detalle[index].frutaVariedad = fruV;
          break;
        }
      }
    }, err => {
      console.log("valor nulo")
    })
    this.limpiarValor();
  }

  private _filterCategoria(value: string): Observable<TablaAuxiliarDetalle[]> {
    const filterValue = value.toUpperCase();
    return this.tablaAuxiliarService.autocompleteList("CATFRU", filterValue);
  }

  mostrarNombreCategoria(categoriaFruta?: TablaAuxiliarDetalle):string | undefined {
    return categoriaFruta?categoriaFruta.nombre:undefined;
  }

  cambiarValorCategoria(event): void {
    if (event.keyCode != 38 && event.keyCode != 40) {
      this.autoCategoria= event.target.value;
      this.categorias = this.autoCategoria ? this._filterCategoria(this.autoCategoria): new Observable<TablaAuxiliarDetalle[]>();
    }
  }

  validarCategoriaFruta(event, deta: OrdenVentaDetalle) {
    this.tablaAuxiliarService.obtenerPorNombre("CATFRU", event.target.value).subscribe(aux => {
      for (let index = 0; index < this.ordenVenta.detalle.length; index++) {
        const element = this.ordenVenta.detalle[index];
        if (element.nro == deta.nro) {
          this.ordenVenta.detalle[index].categoriaFruta = aux;
          break;
        }
      }
    }, err => {
      console.log("valor nulo")
    })
    this.limpiarValor();
  }

  private _filterTamano(value: string): Observable<TablaAuxiliarDetalle[]> {
    const filterValue = value.toUpperCase();
    return this.tablaAuxiliarService.autocompleteList("TAMFRU", filterValue);
  }

  mostrarNombreTamano(tamanoFruta?: TablaAuxiliarDetalle):string | undefined {
    return tamanoFruta?tamanoFruta.nombre:undefined;
  }

  cambiarValorTamano(event): void {
    if (event.keyCode != 38 && event.keyCode != 40) {
      this.autoTamano = event.target.value;
      this.tamanos = this.autoTamano ? this._filterTamano(this.autoTamano): new Observable<TablaAuxiliarDetalle[]>();
    }
  }

  validarTamanoFruta(event, deta: OrdenVentaDetalle) {
    this.tablaAuxiliarService.obtenerPorNombre("TAMFRU", event.target.value).subscribe(aux => {
      for (let index = 0; index < this.ordenVenta.detalle.length; index++) {
        const element = this.ordenVenta.detalle[index];
        if (element.nro == deta.nro) {
          this.ordenVenta.detalle[index].tamanoFruta = aux;
          break;
        }
      }
    }, err => {
      console.log("valor nulo")
    })
    this.limpiarValor();
  }

  private _filterCodigoJaba(value: string,det:OrdenVentaDetalle): Observable<string[]> {
    const filterValue = value.toUpperCase();
    if (filterValue.length > 3) {
      let id:number = 0;
      if(det.fruta && det.fruta.id ){
        id = det.fruta.id;
      }
      return this.ordenCompraService.autocompleteList(filterValue,id);
    } else {
      return new Observable<string[]>();
    }

  }

  mostrarNombreCodigoJaba(codigoJaba?: string):string | undefined {
    return codigoJaba?codigoJaba:undefined;
  }

  cambiarValorCodigoJaba(event,det:OrdenVentaDetalle): void {
    if (event.keyCode != 38 && event.keyCode != 40) {
      this.autoCodigoJaba = event.target.value;
      this.codigoJaba = this.codigoJaba ? this._filterCodigoJaba(this.autoCodigoJaba,det): new Observable<string[]>();
    }
  }

  compararUsu(u1:string, u2:string):boolean{
    if (u1 === undefined && u2 === undefined){
      return true;
    }

    return u1 === null || u2 === null || u1 === undefined || u2 === undefined? false: u1===u2;
  }

  compararAux(o1:TablaAuxiliarDetalle, o2:TablaAuxiliarDetalle):boolean {
    if (o1 === undefined && o2 === undefined){
      return true;
    }
    return o1 === null || o2 === null || o1 === undefined || o2 === undefined? false: o1.tablaAuxiliarDetalleId.id===o2.tablaAuxiliarDetalleId.id;
  }

  compararAlm(a1:Almacen, a2:Almacen):boolean {
    if (a1 === undefined && a2 === undefined){
      return true;
    }

    return a1 === null || a2 === null || a1 === undefined || a2 === undefined? false: a1.id===a2.id;
  }

  compararCli(c1:Cliente, c2:Cliente):boolean {
    if (c1 === undefined && c2 === undefined){
      return true;
    }

    return c1 === null || c2 === null || c1 === undefined || c2 === undefined? false: c1.id===c2.id;
  }

  guardar() {
    if(this.blnGuardando){
      return;
    }
    this.blnGuardando = true;

    let errores:any = undefined;
    // let elems = document.querySelectorAll(".widget.hover");
    // [].forEach.call(elems, function(el) {
    //     el.classList.remove("hover");
    // });

    this.validarCabecera(null,true);

    if(this.ordenVenta.detalle.length == 0){
      swal.fire('Error al guardar', 'No se han definido ningun detalle para la orden de venta', 'error');
      this.blnGuardando = false;
      return;
    }
    for(let i=0; i< this.ordenVenta.detalle.length ; i++){
        this.validarDetalleCabecera(null,this.ordenVenta.detalle[i],true);
        for(let j=0; j<this.ordenVenta.detalle[i].empaques.length ; j++){
          this.validarDetalleDetalle(null,this.ordenVenta.detalle[i].empaques[j],this.ordenVenta.detalle[i],true);
        }
    }
    errores = document.getElementsByClassName("focusRed");
    if(errores.length > 0){
      swal.fire('Error al guardar: ', 'Se han encontrado '+ errores.length +
                ' error(es) en la orden de venta', 'error');
      this.blnGuardando = false;
      return;
    }

    var fecha: Date = new Date(this.ordenVenta.fechaVentaDate);
    var day = fecha.getUTCDate();
    var month = fecha.getMonth() + 1;
    var year = fecha.getFullYear();
    let fechaVenta = year.toString() + '/' + ("0" + month.toString()).slice(-2) + '/' + ("0" + day.toString()).slice(-2);
    fechaVenta = fechaVenta + ' ' + this.ordenVenta.fechaVentaTime+':00.000';

    this.ordenVenta.fechaVenta = new Date(fechaVenta);

    if (this.ordenVenta.cliente) {
      if (this.ordenVenta.cliente.id > 0) {
        this.ordenVenta.nombreCliente = this.ordenVenta.cliente.nombreCliente;
      } else {
        this.ordenVenta.cliente = null;
      }
    }

    if (true) {
      if (this.ordenVenta.id === 0) {
        this.tablaAuxiliarService.obtenerPorNombre('ESTOVE', 'CERRADO').subscribe(
          (est) => {
            this.ordenVenta.estadoOrdenVenta = est;
            //this.ordenVentaOriginal = this.ordenVenta;
            this.crear();
          }
        );
      } else {
        this.actualizar();
      }
    }
  }

  crear() {
    this.ordenVenta.idUsuarioCrea = this._authService.usuario.id;
    this.ordenVentaService.create(this.ordenVenta).subscribe(
      ov => {
        this.router.navigate(['/orden_venta/page/0']);
      },
      err => {
        this.errores = err.error.errors as string[];
        console.error('Codigo del error: ' + err.status);
        console.error(err.error.errors);
        this.blnGuardando = false;
      }
    );
  }

  actualizar() {
    this.ordenVenta.idUsuarioModifica = this._authService.usuario.id;
    this.ordenVentaService.update(this.ordenVenta).subscribe(
      json => {
        this.router.navigate(['/orden_venta/page/0'])
      },
      err => {
        console.log(err);
        this.errores = err.error.errors as string[];
        console.error('Codigo del error: ' + err.status);
        console.error(err.error.errors);
        this.blnGuardando = false;
      }
    );
  }

  validarOrden(): boolean {
    if (!this.ordenVenta) {
      console.log("No existe orden");
      return false;
    }

    return true;
  }

  agregarCard() {
    let detalle: OrdenVentaDetalle = new OrdenVentaDetalle();
    detalle.nro = this.contadorDetalle;
    this.contadorDetalle++;

    this.tablaAuxiliarService.obtenerPorNombre('UNICOM', 'KG').subscribe(
      (cmp) => detalle.unidadVenta = cmp
    );

    this.tablaAuxiliarService.obtenerPorNombre('CATFRU', 'GENERICA').subscribe(
      (cat) => detalle.categoriaFruta = cat
    );

    this.ordenVenta.detalle.push(detalle);
  }

  quitarCard(det:OrdenVentaDetalle){
    let nroAux = det.nro;
    this.ordenVenta.detalle = this.ordenVenta.detalle.filter((deta: OrdenVentaDetalle) => det.nro != deta.nro);
    let nro: number = 1;
    this.ordenVenta.detalle.forEach(det => {
      det.nro = nro;
      nro++;
    });
    this.contadorDetalle--;
  }

  agregarEmpaque(det: OrdenVentaDetalle) {
    let blnAgregarEmpaque:boolean = true;
    this.ordenVenta.detalle.forEach(element => {
      if(element.nro != det.nro && element.empaques.length>0){
        if (element.frutaVariedad.id == det.frutaVariedad.id && 
            element.categoriaFruta.tablaAuxiliarDetalleId.id == det.categoriaFruta.tablaAuxiliarDetalleId.id){
            swal.fire('Error', 'Ya se ha registrado este tipo de producto con anterioridad', 'error');
            blnAgregarEmpaque = false;
        }
      }
    });
    if(blnAgregarEmpaque){
      this.productoService.getProductoPorVariedadAndCategoria(det.frutaVariedad.id,
        det.categoriaFruta.tablaAuxiliarDetalleId.id).subscribe(pro =>{
          pro.stock = Number(pro.stock.toFixed(2));
          det.producto = pro;
          let empaqueDetalle: OrdenVentaEmpaquetado = new OrdenVentaEmpaquetado();
          empaqueDetalle.nro = det.empaques.length + 1;
          empaqueDetalle.stockAntes = det.producto.stock;
          det.empaques.push(empaqueDetalle);
          this.validarDetalleCabecera(null,det,true);
        }, err => {
          swal.fire('Error', 'Producto no encontrado', 'error');
          this.validarDetalleCabecera(null,det,true);
        }
      );
    }
  }

  actualizarStock(emp:OrdenVentaEmpaquetado){
    let cantidadVendida:number = emp.cantidadVendida?emp.cantidadVendida:0;
    emp.stockAhora = emp.stockAntes -  cantidadVendida;
  }

  quitarEmpaque(emp: OrdenVentaEmpaquetado, det: OrdenVentaDetalle) {
    det.empaques = det.empaques.filter((empa: OrdenVentaEmpaquetado) => emp.nro != empa.nro);
    let nro: number = 1;
    det.empaques.forEach(emp => {
      emp.nro = nro;
      nro++;
    });
    this.sumarCantidad(det);
  }

  calcularSubTotal(detalle: OrdenVentaDetalle) {
    detalle.precioTotal = detalle.cantidadFruta*detalle.precioUnitario;

    if (isNaN(detalle.precioTotal)) {
      detalle.precioTotal = 0.0;
    }

    if (isNaN(detalle.descuento) || detalle.descuento === null || detalle.descuento < 0) {
      detalle.descuento = 0.0;
    }
    detalle.precioTotalDescuento = detalle.precioTotal - detalle.descuento;

    if (this.ordenVenta.indIgv) {
      detalle.igv = detalle.precioTotalDescuento*0.18;
      detalle.precioTotalIgv = detalle.precioTotalDescuento + detalle.igv;
    } else {
      detalle.igv = 0.0;
      detalle.precioTotalIgv = detalle.precioTotalDescuento;
    }

    if (isNaN(detalle.precioTotalIgv)) {
      detalle.precioTotalIgv = 0.0;
    }

    this.calcularTotal();
  }

  calcularTotal() {
    this.ordenVenta.total = 0.0;
    this.ordenVenta.totalDescuento = 0.0;
    this.ordenVenta.totalMasDescuento = 0.0;
    this.ordenVenta.totalIgv = 0.0;
    this.ordenVenta.totalMasIgv = 0.0;

    this.ordenVenta.detalle.forEach(det => {
      this.ordenVenta.total += +(det.precioTotal);
      this.ordenVenta.totalDescuento += +(det.descuento);
      this.ordenVenta.totalMasDescuento += +(det.precioTotalDescuento);
      this.ordenVenta.totalIgv += +(det.igv);
      this.ordenVenta.totalMasIgv += +(det.precioTotalIgv);
    });
    if (isNaN(this.ordenVenta.total)) {
      this.ordenVenta.total = 0.0;
      this.ordenVenta.totalDescuento = 0.0;
      this.ordenVenta.totalMasDescuento = 0.0;
      this.ordenVenta.totalIgv = 0.0;
      this.ordenVenta.totalMasIgv = 0.0;
    }
  }

  modificarIgv() {
    this.ordenVenta.indIgv = !this.ordenVenta.indIgv
    this.ordenVenta.detalle.forEach(det => {
      det.precioTotal = det.cantidadFruta*det.precioUnitario;

      if (isNaN(det.precioTotal)) {
        det.precioTotal = 0.0;
      }

      if (isNaN(det.descuento) || det.descuento === null || det.descuento < 0) {
        det.descuento = 0.0
      }
      det.precioTotalDescuento = det.precioTotal - det.descuento;

      if (this.ordenVenta.indIgv) {
        det.igv = det.precioTotalDescuento*0.18;
        det.precioTotalIgv = det.precioTotalDescuento + det.igv;
      } else {
        det.igv = 0.0;
        det.precioTotalIgv = det.precioTotalDescuento;
      }

      if (isNaN(det.precioTotalIgv)) {
        det.precioTotalIgv = 0.0;
      }
    })
    this.calcularTotal();
  }

  soloNumerosDecimales(event): void {
    if (((event.keyCode != 46 || (event.keyCode == 46 && event.target.value == '')) ||
            event.target.value.indexOf('.') != -1) && (event.keyCode < 48 || event.keyCode > 57)) {
        event.preventDefault();
    }
  }

  validarFecha(event) {
    let fechaAux: Date = event.target.value;
    if(fechaAux.toString() == ""){
      event.target.value = "";
    }
  }

  sumarCantidad(det:OrdenVentaDetalle){
    let total:number = 0;
    for(let i=0; i<det.empaques.length ; i++){
      if(!(det.empaques[i].cantidadVendida == null || det.empaques[i].cantidadVendida == undefined)){
        total = total + Number(Number(det.empaques[i].cantidadVendida).toFixed(2));
      }
    }
    det.cantidadFruta = total;
    this.calcularSubTotal(det)
  }

  validarCabecera(event,blnValidacionGeneral:boolean = false):void{
    let blnAccion:boolean = false;
    let elementId:string = '';
    let nombreElemennto:string = '';
    let nroElemento:string = '';

    if(!blnValidacionGeneral){
      elementId = (event.target as Element).id;
      nombreElemennto = elementId.split("_")[0];
      nroElemento = elementId.split("_")[1];
    }

    if(this.estadoOrdenVenta == 3){
      return;
    }

    if(this.estadoOrdenVenta == 1){
      if(this.ordenVenta.tipoCliente.nombre=='INTERNO' && (blnValidacionGeneral || nombreElemennto == "clienteInternoForm")){
        blnAccion = this.ordenVenta.cliente == null || this.ordenVenta.cliente == undefined;
        if(blnAccion){
          this.ordenVenta.cliente = undefined;
        }
        this.validarObjeto("clienteInternoForm",blnAccion,null,null,blnValidacionGeneral);
      }

      if(this.ordenVenta.tipoCliente.nombre!='INTERNO' && (blnValidacionGeneral || nombreElemennto == "clienteExternoForm")){
        blnAccion = this.ordenVenta.nombreCliente == null || this.ordenVenta.nombreCliente == undefined ||
                    this.ordenVenta.nombreCliente.length == 0;
        this.validarObjeto("clienteExternoForm",blnAccion,'CLIENTE INVALIDO','CLIENTE EXTERNO',blnValidacionGeneral);
      }
      if(blnValidacionGeneral || nombreElemennto == "fechaVentaForm"){
        blnAccion = false;
        blnAccion = this.ordenVenta.fechaVentaDate == null || this.ordenVenta.fechaVentaDate == undefined ||
                    this.ordenVenta.fechaVentaDate.toString() == '';
        this.validarObjeto("fechaVentaForm",blnAccion,null,null,blnValidacionGeneral);
      }
    }
    this.limpiarValor();
  }

  validarDetalleCabecera(event,detalle:OrdenVentaDetalle,blnValidacionGeneral:boolean = false){
    let blnAccion:boolean = false;
    let elementId:string = '';
    let nombreElemennto:string = '';
    let nroElemento:string = '';

    if(!blnValidacionGeneral){
      elementId = (event.target as Element).id;
      nombreElemennto = elementId.split("_")[0];
      nroElemento = elementId.split("_")[1];
    }

    if(this.estadoOrdenVenta == 3){
      return;
    }

    if(blnValidacionGeneral || nombreElemennto == "fruta"){
      blnAccion = false;
      blnAccion = typeof(detalle.fruta) == 'string' || typeof(detalle.fruta) == 'undefined';
      if(blnAccion){
        detalle.fruta = undefined;
        detalle.blnFrutaValida = false;
      }else{
        detalle.blnFrutaValida = true;
      }
      this.validarObjeto("fruta"+"_"+detalle.nro,blnAccion,'FRUTA INVALIDA','FRUTA',blnValidacionGeneral);
    }
    if(blnValidacionGeneral || nombreElemennto == "frutaVariedad"){
      blnAccion = false;
      blnAccion = ((typeof(detalle.frutaVariedad) == 'string') && detalle.frutaVariedad != '') &&
                  !(detalle.frutaVariedad == null || detalle.frutaVariedad == undefined);
      if(blnAccion){
        detalle.frutaVariedad = undefined;
        detalle.blnFrutaVariedadValida = false;
      }else {
        detalle.blnFrutaVariedadValida = true;
      }
      this.validarObjeto("frutaVariedad"+"_"+detalle.nro,blnAccion,'VAR. INVALIDA','VARIEDAD',blnValidacionGeneral);
    }
    if(blnValidacionGeneral || nombreElemennto == "frutaCategoria"){
      blnAccion = false;
      blnAccion = ((typeof(detalle.categoriaFruta) == 'string') && detalle.categoriaFruta != '') &&
                  !(detalle.categoriaFruta == null || detalle.categoriaFruta == undefined);
      if(blnAccion){
        detalle.categoriaFruta = undefined;
        detalle.blnCategoriaFrutaValida = false;
      } else {
        detalle.blnCategoriaFrutaValida = true;
      }
      this.validarObjeto("frutaCategoria"+"_"+detalle.nro,blnAccion,'CAT. INVALIDA','CATEGORIA',blnValidacionGeneral);
    }
    if(blnValidacionGeneral || nombreElemennto == "frutaTamanio"){
      blnAccion = false;
      blnAccion = ((typeof(detalle.tamanoFruta) == 'string') && detalle.tamanoFruta != '') &&
                  !(detalle.tamanoFruta == null || detalle.tamanoFruta == undefined);
      if(blnAccion){
        detalle.tamanoFruta = undefined;
      }
      this.validarObjeto("frutaTamanio"+"_"+detalle.nro,blnAccion,'TAM. INVALIDA','TAMAÑO',blnValidacionGeneral);
    }
    if(blnValidacionGeneral || nombreElemennto == "precioUnitario"){
      blnAccion = false;
      blnAccion = detalle.precioUnitario == null || detalle.precioUnitario == undefined ||
                  detalle.precioUnitario == 0;
      if(blnAccion){
        detalle.precioUnitario = undefined;
      }
      this.validarObjeto("precioUnitario"+"_"+detalle.nro,blnAccion,'0<P.U','PRECIO UNITARIO',blnValidacionGeneral);
    }
    if(blnValidacionGeneral || nombreElemennto == "descuento"){
      blnAccion = false;
      blnAccion = detalle.precioTotalIgv<0;
      if(detalle.descuento == null || detalle.descuento == undefined ||
        detalle.descuento.toString().length == 0){
        detalle.descuento = 0;
      }
      if(blnAccion){
        detalle.descuento = undefined;
      }
      this.validarObjeto("descuento"+"_"+detalle.nro,blnAccion,'PT<0','DESCUENTO',blnValidacionGeneral);
    }

    if(blnValidacionGeneral){
      blnAccion = false;
      blnAccion = detalle.empaques.length == 0;
      this.validarObjeto("agregarSubDetalle"+"_"+detalle.nro,blnAccion,null,null,blnValidacionGeneral);
    }
    this.limpiarValor();
  }

  validarDetalleDetalle(event,empaque:OrdenVentaEmpaquetado,detalle:OrdenVentaDetalle,blnValidacionGeneral:boolean = false){
    let blnAccion:boolean = false;
    let elementId:string = '';
    let nombreElemennto:string = '';
    let nroElemento:string = '';
    let nroElementoDetalle:string = '';
    if(this.estadoOrdenVenta == 3){
      return;
    }

    if(!blnValidacionGeneral){
      elementId = (event.target as Element).id;
      nombreElemennto = elementId.split("_")[0];
      nroElemento = elementId.split("_")[1];
      nroElementoDetalle = elementId.split("_")[2];
    }

    // if(blnValidacionGeneral || nombreElemennto == "codigoJava"){
    //   blnAccion = false;
    //   blnAccion = typeof(empaque.codigoJaba) == 'undefined' || empaque.codigoJaba == 'null'
    //               && empaque.codigoJaba.length == 0;
    //   if(!blnAccion && detalle.fruta != undefined){
    //     this.ordenCompraService.autocompleteList(empaque.codigoJaba,detalle.fruta.id).subscribe(aut =>{
    //       blnAccion = !(aut.length == 1 && aut[0]==empaque.codigoJaba);
    //       this.validarObjeto("codigoJava"+"_"+detalle.nro+"_"+empaque.nro,blnAccion,'COD. INVALIDO','CODIGO JAVA',blnValidacionGeneral);
    //     });
    //   }else{
    //     this.validarObjeto("codigoJava"+"_"+detalle.nro+"_"+empaque.nro,blnAccion,'COD. INVALIDO','CODIGO JAVA',blnValidacionGeneral);
    //   }
    // }
    if(blnValidacionGeneral || nombreElemennto == "cantidadVendida"){
      blnAccion = false;
      blnAccion = empaque.cantidadVendida == null || empaque.cantidadVendida == undefined ||
                  empaque.cantidadVendida <= 0 || empaque.cantidadVendida > empaque.stockAntes;
      if(blnAccion){
        empaque.cantidadVendida = undefined;
      }                  
      this.validarObjeto("cantidadVendida"+"_"+detalle.nro+"_"+empaque.nro,blnAccion,'0< CANT<'+empaque.stockAntes.toString(),'CANTIDAD',blnValidacionGeneral);
    }
    this.limpiarValor();
  }

  validarObjeto(elementId:string,blnAccion:boolean,mensaje:string=null,mensajeOriginal:string=null,blnValidacionGeneral:boolean=false){
    if(blnAccion){
      document.getElementById(elementId).classList.add('focusRed');
      if(!blnValidacionGeneral){
        document.getElementById(elementId).focus();
      }
      if(!blnValidacionGeneral && mensaje!=null){
        document.getElementById(elementId).classList.add('focusInput');
        //(document.getElementById(elementId) as HTMLInputElement).value = '';
        (document.getElementById(elementId) as HTMLInputElement).placeholder = mensaje;
      }
    }else {
      if(!blnValidacionGeneral && mensaje!=null){
        document.getElementById(elementId).classList.remove('focusInput');
        (document.getElementById(elementId) as HTMLInputElement).placeholder = mensajeOriginal;
      }
      document.getElementById(elementId).classList.remove('focusRed');
    }
  }

  saltarSiguienteElemento(event){
    let elementId:string = (event.target as Element).id;
    let nombreElemennto:string = elementId.split("_")[0];
    let nroElemento:string = elementId.split("_")[1];
    let nroElementoDetalle:string = elementId.split("_")[2];

    if (event.which == '13') {
      event.preventDefault();
    }

    //Cabecera
    if(nombreElemennto == "almacenForm"){
      document.getElementById("monedaForm").focus();
      return;
    }
    if(nombreElemennto == "monedaForm"){
      document.getElementById("tipoVentaForm").focus();
      return;
    }
    if(nombreElemennto == "tipoVentaForm"){
      document.getElementById("tipoOrdenForm").focus();
      return;
    }
    if(nombreElemennto == "tipoOrdenForm"){
      document.getElementById("tipoClienteForm").focus();
      return;
    }
    if(nombreElemennto == "tipoClienteForm"){
      if(this.ordenVenta.tipoCliente.nombre=='INTERNO'){
        document.getElementById("clienteInternoForm").focus();
      }else{
        document.getElementById("clienteExternoForm").focus();
      }
      return;
    }
    if(nombreElemennto == "clienteInternoForm"){
      document.getElementById("fechaVentaForm").focus();
      return;
    }
    if(nombreElemennto == "clienteExternoForm"){
      document.getElementById("fechaVentaForm").focus();
      return;
    }
    if(nombreElemennto == "fechaVentaForm"){
      document.getElementById("horaVentaForm").focus();
      return;
    }
    if(nombreElemennto == "horaVentaForm"){
      document.getElementById("btnAgregar").focus();
      return;
    }
    if(nombreElemennto == "btnAgregar"){
      if(this.ordenVenta.detalle.length > 0 && this.ordenVenta.detalle[0].empaques.length == 0){
          document.getElementById("fruta_1").focus();
      }else {
        document.getElementById("frutaVariedad_1").focus();
      }
      return;
    }
    //Detalle Cabecera
    if(nombreElemennto == "fruta"){
      document.getElementById("frutaVariedad"+"_"+nroElemento).focus();
      return;
    }
    if(nombreElemennto == "frutaVariedad"){
      document.getElementById("frutaCategoria"+"_"+nroElemento).focus();
      return;
    }
    if(nombreElemennto == "frutaCategoria"){
      document.getElementById("frutaTamanio"+"_"+nroElemento).focus();
      return;
    }
    if(nombreElemennto == "frutaTamanio"){
      document.getElementById("precioUnitario"+"_"+nroElemento).focus();
      return;
    }
    if(nombreElemennto == "precioUnitario"){
      document.getElementById("descuento"+"_"+nroElemento).focus();
      return;
    }
    if(nombreElemennto == "descuento"){
      document.getElementById("observacion"+"_"+nroElemento).focus();
      return;
    }
    if(nombreElemennto == "observacion" && nroElementoDetalle == undefined){
      if(this.ordenVenta.detalle[+nroElemento-1].empaques.length > 0){
//      document.getElementById("codigoJava"+"_"+nroElemento+"_1").focus();
        document.getElementById("cantidadVendida"+"_"+nroElemento+"_1").focus();
      } else {
        if(this.ordenVenta.detalle.length>+nroElemento){
          if(this.ordenVenta.detalle[+nroElemento].empaques.length > 0){
            let aux = Number(nroElemento)+1;
            document.getElementById("frutaVariedad"+"_"+aux).focus();
          } else {
            let aux = Number(nroElemento)+1;
            document.getElementById("fruta"+"_"+aux).focus();
          }
        }else{
          document.getElementById("btnGuardar").focus();
        }
      }
      return;
    }
    //Detalle del Detalle
    // if(nombreElemennto == "codigoJava"){
    //   document.getElementById("cantidadVendida"+"_"+nroElemento+"_"+nroElementoDetalle).focus();
    //   return;
    // }
    if(nombreElemennto == "cantidadVendida"){
      document.getElementById("observacion"+"_"+nroElemento+"_"+nroElementoDetalle).focus();
      return;
    }
    if(nombreElemennto == "observacion" && nroElementoDetalle != undefined){
      if(this.ordenVenta.detalle[+nroElemento-1].empaques.length > +nroElementoDetalle){
        let aux:number = Number(nroElementoDetalle) + 1
        // document.getElementById("codigoJava"+"_"+nroElemento+"_"+aux).focus();
        document.getElementById("cantidadVendida"+"_"+nroElemento+"_"+aux).focus();
      }else{
        if(this.ordenVenta.detalle.length > +nroElemento){
          if(this.ordenVenta.detalle[+nroElemento].empaques.length > 0){
            let aux = Number(nroElemento)+1;
            document.getElementById("frutaVariedad"+"_"+aux).focus();
          } else {
            let aux = Number(nroElemento)+1;
            document.getElementById("fruta"+"_"+aux).focus();
          }
        }else{
            document.getElementById("btnGuardar").focus();
        }
      }
      return;
    }
  }
}
