import { Component, OnInit, ApplicationRef,Inject,AfterViewInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { OrdenCompra } from './models/orden-compra';
import { OrdenCompraService } from './orden-compra.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../usuarios/auth.service';
import { Observable, interval } from 'rxjs';
import { FrutaService } from '../maestros/fruta/fruta.service';
import { Fruta } from '../maestros/fruta/fruta';
import { FrutaVariedad } from '../maestros/fruta-variedad/fruta-variedad';
import { FrutaVariedadService } from '../maestros/fruta-variedad/fruta-variedad.service';
import { OrdenCompraDetalle } from './models/orden-compra-detalle';
import { TablaAuxiliarDetalle } from '../auxiliares/tabla-auxiliar/models/tabla-auxiliar-detalle';
import { TablaAuxiliarService } from '../auxiliares/tabla-auxiliar/tabla-auxiliar.service';
import { OrdenCompraEmpaquetado } from './models/orden-compra-empaquetado';
import { SubTipoEmpaqueService } from '../maestros/sub-tipo-empaque/sub-tipo-empaque.service';
import { SubTipoEmpaque } from '../maestros/sub-tipo-empaque/sub-tipo-empaque';
import { Almacen } from '../maestros/almacen/almacen';
import { AlmacenService } from '../maestros/almacen/almacen.service';
import { Proveedor } from '../maestros/proveedor/proveedor';
import { ProveedorService } from '../maestros/proveedor/proveedor.service';
import { VariablesGlobales } from '../common/variables-globales';
import { SwUpdate } from '@angular/service-worker';
import { IndexedDBService } from '../common/indexed-db.service';
import swal from 'sweetalert2';

@Component({
  selector: 'app-form-compra',
  templateUrl: './form-compra.component.html',
  styleUrls: ['./form-compra.component.css']
})
export class FormCompraComponent implements OnInit {

  public urlFoto: string = VariablesGlobales.apiURL;
  titulo: string = "Orden de Compra";
  ordenCompra: OrdenCompra = new OrdenCompra();
  errores: string[];

  contadorDetalle: number = 1;

  frutas: Observable<Fruta[]>;
  variedadFrutas: Observable<FrutaVariedad[]>;
  categorias: Observable<TablaAuxiliarDetalle[]>;
  tamanos: Observable<TablaAuxiliarDetalle[]>;
  estadoFrutas: Observable<TablaAuxiliarDetalle[]>;

  autoFruta: string;
  autoFrutaVariedad: string;
  autoCategoria: string;
  autoTamano: string;
  autoEstadoFruta: string;

  usuarios: String[];
  proveedores: Proveedor[];
  unidadesCompra : TablaAuxiliarDetalle[];
  tiposAdicional: TablaAuxiliarDetalle[];
  formasPago: TablaAuxiliarDetalle[];
  tiposCompra: TablaAuxiliarDetalle[];
  tiposProducto: TablaAuxiliarDetalle[];
  tiposMoneda: TablaAuxiliarDetalle[];
  tiposEstadoCompra: TablaAuxiliarDetalle[];
  subTiposEmpaque: SubTipoEmpaque[];
  almacenes: Almacen[];
  categoriasMerma1: TablaAuxiliarDetalle[];
  categoriasMerma2: TablaAuxiliarDetalle[];
  motivosNoIngreso: TablaAuxiliarDetalle[];

  empaques: Array<OrdenCompraEmpaquetado>=[];
  indFinalizadoEmp: boolean = false;
  indIndividualizar: boolean = false;
  indMerma: boolean = false;
  nroDetalle: number;
  unidadMedida:string = "";

  fotoEmbalajeSeleccionada: string;
  ordenCompraOriginal: OrdenCompra;
  estadoOrdenCompra: number = 0;

  blnGuardando:boolean =  false;
  blnModalAbierto:boolean = false;
  numAnio: string = new Date().getFullYear().toString().substr(-2);

  totalCantidadMasAdicional:number = 0;
  totalPesoJavas:number =0;
  totalPesoNoIngreso:number=0;
  totalPesoRecepcion:number =0;
  totalPesoMerma1:number = 0;
  totalPesoMerma2:number = 0;
  totalDiferencia:number = 0;
 
  subTipoEmpaqueIntegral:SubTipoEmpaque;

  constructor(private ordenCompraService: OrdenCompraService
              ,private tablaAuxiliarService: TablaAuxiliarService
              ,private proveedorService: ProveedorService
              ,private frutaService: FrutaService
              ,private frutaVariedadService: FrutaVariedadService
              ,private subTipoEmpaqueService: SubTipoEmpaqueService
              ,private almacenService: AlmacenService
              ,public _authService: AuthService
              ,private router: Router
              ,private activatedRoute: ActivatedRoute
              ,private swUpdate: SwUpdate
              ,private appRef: ApplicationRef
              ,private indexedDBService: IndexedDBService
              ,@Inject(DOCUMENT) document) {
    this.reloadCache();
    this.checkUpdate();
  }

  ngOnInit(): void {
    this._authService.getComboBox().subscribe(usu => this.usuarios = usu);
    this.tablaAuxiliarService.getComboBox("UNICOM").subscribe(aux => this.unidadesCompra = aux);
    this.tablaAuxiliarService.getComboBox("TIPADI").subscribe(aux => this.tiposAdicional = aux);
    this.tablaAuxiliarService.getComboBox("FORPAG").subscribe(aux => this.formasPago = aux);
    this.tablaAuxiliarService.getComboBox("TIPOCO").subscribe(aux => this.tiposCompra = aux);
    this.tablaAuxiliarService.getComboBox("TIPOFE").subscribe(aux => this.tiposProducto = aux);
    this.tablaAuxiliarService.getComboBox("TIPMON").subscribe(aux => this.tiposMoneda = aux);
    this.tablaAuxiliarService.getComboBox("ESTOCO").subscribe(aux => this.tiposEstadoCompra = aux);
    this.tablaAuxiliarService.getComboBox("CATFRU").subscribe(aux => {
      aux = aux.filter(c => c.tablaAuxiliarDetalleId.id != 5);
      this.categoriasMerma1 = aux;
    });
    this.tablaAuxiliarService.getComboBox("CATFRU").subscribe(aux => {
      aux = aux.filter(c => c.tablaAuxiliarDetalleId.id != 5);
      this.categoriasMerma2 = aux;
    });
    this.tablaAuxiliarService.getComboBox("MOTNEM").subscribe(aux => this.motivosNoIngreso = aux);
    this.subTipoEmpaqueService.getComboBox(1).subscribe(sub => {
      this.subTiposEmpaque = sub;
      //Eliminar java integral      
      //this.subTiposEmpaque = sub.filter(e => e.id !== 3);
    });
    this.subTipoEmpaqueService.getSubTipoempaque(3).subscribe(sub => this.subTipoEmpaqueIntegral =sub);
    this.proveedorService.getComboBox().subscribe(pro => this.proveedores = pro);
    this.almacenService.getComboBox().subscribe(alm => this.almacenes = alm);

    this.cargarOrden();
  }

  // ngAfterViewInit() {
  //   if(this.estadoOrdenCompra == 1){
  //     document.getElementById("proveedorForm").focus();
  //   } else if(this.estadoOrdenCompra == 2){
  //     document.getElementById("fechaArribo_1").focus();
  //   }
  // }

  cargarOrden(): void {
    this.activatedRoute.params.subscribe(params => {
      let id = params['id']
      if(id){
        this.ordenCompraService.getOrden(id).subscribe(
          (ordenCompra) => {
            //console.log(ordenCompra);
            this.ordenCompra = ordenCompra;
            this.ordenCompra.fechaCompraDate = this.ordenCompra.fechaCompra;
            let hora = new Date(this.ordenCompra.fechaCompraDate);
            let hours = ("0" + hora.getHours()).slice(-2);
            let minutes = ("0" + hora.getMinutes()).slice(-2);
            this.ordenCompra.fechaCompraTime = hours + ':' + minutes;

            this.ordenCompra.detalle.forEach(det => {
              det.fechaArriboDate = det.fechaArribo;
              let horaA = new Date(det.fechaArribo);
              let hoursA = ("0" + hora.getHours()).slice(-2);
              let minutesA = ("0" + hora.getMinutes()).slice(-2);
              det.fechaArriboTime = hours + ':' + minutes;

              det.nro = this.contadorDetalle;
              this.contadorDetalle++;

              let tipoEmpaque: string = '';
              let esMixto: boolean = false;
              let nroEmpaques: number = 0;

              det.pesoEmpaque = 0.0;
              det.empaques.forEach(emp => {
                emp.nro = +(nroEmpaques) + 1;
                nroEmpaques++;
                det.pesoEmpaque += Number(Number(emp.pesoCompra).toFixed(2));
                if(emp.subTipoEmpaque== undefined){
                  tipoEmpaque = 'GENERICO'
                }
                if(emp.subTipoEmpaque!= undefined && tipoEmpaque !== emp.subTipoEmpaque.nombre) {
                  if (tipoEmpaque !== '') {
                    esMixto = true;
                  }
                  tipoEmpaque = emp.subTipoEmpaque.nombre;
                }
              });
              det.totalEmpaques = nroEmpaques;
              if (esMixto) {
                det.tipoEmpaque = 'MIXTO';
              } else {
                det.tipoEmpaque = tipoEmpaque;
              }
            })
            this.estadoOrdenCompra = this.ordenCompra.estadoOrdenCompra.tablaAuxiliarDetalleId.id;
            if(this.estadoOrdenCompra > 1){
              this.tiposEstadoCompra.shift();
            }
          });
      } else {
        this.ordenCompra = new OrdenCompra();
        this.ordenCompra.id = 0;
        this.ordenCompra.comprador = this._authService.usuario.username.toUpperCase();
        this.ordenCompra.fechaCompra = new Date();
        this.ordenCompra.fechaCompraDate = this.ordenCompra.fechaCompra;
        let hora = new Date(this.ordenCompra.fechaCompraDate);
        let hours = ("0" + hora.getHours().toString()).slice(-2);
        let minutes = ("0" + hora.getMinutes().toString()).slice(-2);
        this.ordenCompra.fechaCompraTime = hours + ':' + minutes;

        this.ordenCompra.idUsuarioCrea = this._authService.usuario.id;

        this.tablaAuxiliarService.obtenerPorNombre("TIPOCO", "LIQUIDACION DE COMPRA").subscribe(aux => {
          this.ordenCompra.tipoOrden = aux;
        })

        this.tablaAuxiliarService.obtenerPorNombre("TIPOFE", "FRUTAS").subscribe(aux => {
          this.ordenCompra.tipoCompra = aux;
        })

        this.tablaAuxiliarService.obtenerPorNombre("TIPMON", "SOLES").subscribe(aux => {
          this.ordenCompra.moneda = aux;
        })

        this.tablaAuxiliarService.obtenerPorNombre("ESTOCO", "GENERADO").subscribe(aux => {
          this.ordenCompra.estadoOrdenCompra = aux;
        })

        this.proveedorService.obtenerPorNombre("GENERICO OTRO").subscribe(prov => {
          this.ordenCompra.proveedor = prov;
        })

        this.estadoOrdenCompra = 1;
      }

    })
  }

  reloadCache() {
    if (!this.swUpdate.isEnabled) {
      console.log('Sin funcionamiento');
      return;
    }

    this.swUpdate.available.subscribe(() => {
      if (confirm('Nueva version, desea recargar la página?')) {
        this.swUpdate.activateUpdate().then(() => location.reload());
      }
    });

    this.swUpdate.activated.subscribe((event) => {
      console.log(`current`, event.previous, `available `, event.current);
    });
  }

  checkUpdate() {
    this.appRef.isStable.subscribe((isStable) => {
      if (isStable) {
        const timeInterval = interval(8 * 60 * 60 * 1000);

        timeInterval.subscribe(() => {
          this.swUpdate.checkForUpdate().then(() => console.log('Verificado'));
        });
      }
    });
  }

  bgSyncSaveOrdenCompra() {
    navigator.serviceWorker.ready.then((swRegistration) => swRegistration.sync.register('post-orden-compra'))
    .catch(console.log);
  }

  private _filterFruta(value: string): Observable<Fruta[]> {
    const filterValue = value.toUpperCase();
    return this.frutaService.autocompleteList(filterValue);
  }

  mostrarNombreFruta(fruta?: Fruta):string | undefined {
    return fruta?fruta.nombre:undefined;
  }

  cambiarValorFruta(event,detalle:OrdenCompraDetalle): void {
    if (event.keyCode != 38 && event.keyCode != 40) {
      this.autoFruta = event.target.value;
      this.frutas = this.autoFruta ? this._filterFruta(this.autoFruta): new Observable<Fruta[]>();
    }
  }

  validarFruta(event, deta: OrdenCompraDetalle) {
    this.frutaService.getFrutaByNombre(event.target.value).subscribe(fru => {
      for (let index = 0; index < this.ordenCompra.detalle.length; index++) {
        const element = this.ordenCompra.detalle[index];
        if (element.nro == deta.nro) {
          this.ordenCompra.detalle[index].fruta = fru;
          break;
        }
      }
    }, err => {
      //console.log("valor nulo")
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

  cambiarValorFrutaVariedad(event, det:OrdenCompraDetalle): void {
    if (event.keyCode != 38 && event.keyCode != 40) {
      if(!(typeof(det.fruta) == 'string' || typeof(det.fruta) == 'undefined')){
        this.autoFrutaVariedad = event.target.value;
        this.variedadFrutas = this.autoFrutaVariedad ? this._filterFrutaVariedad(this.autoFrutaVariedad, det.fruta.id): new Observable<FrutaVariedad[]>();
      }
    }
  }

  validarFrutaVariedad(event, deta: OrdenCompraDetalle) {
    this.frutaVariedadService.getFrutaVariedadByDescripcion(event.target.value, deta.fruta.id).subscribe(fruV => {
      for (let index = 0; index < this.ordenCompra.detalle.length; index++) {
        const element = this.ordenCompra.detalle[index];
        if (element.nro == deta.nro) {
          this.ordenCompra.detalle[index].frutaVariedad = fruV;
          break;
        }
      }
    }, err => {
      //console.log("valor nulo")
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

  validarCategoriaFruta(event, deta: OrdenCompraDetalle) {
    this.tablaAuxiliarService.obtenerPorNombre("CATFRU", event.target.value).subscribe(aux => {
      for (let index = 0; index < this.ordenCompra.detalle.length; index++) {
        const element = this.ordenCompra.detalle[index];
        if (element.nro == deta.nro) {
          this.ordenCompra.detalle[index].categoriaFruta = aux;
          break;
        }
      }
    }, err => {
      //console.log("valor nulo")
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

  validarTamanoFruta(event, deta: OrdenCompraDetalle) {
    this.tablaAuxiliarService.obtenerPorNombre("TAMFRU", event.target.value).subscribe(aux => {
      for (let index = 0; index < this.ordenCompra.detalle.length; index++) {
        const element = this.ordenCompra.detalle[index];
        if (element.nro == deta.nro) {
          this.ordenCompra.detalle[index].tamanoFruta = aux;
          break;
        }
      }
    }, err => {
      //console.log("valor nulo")
    })
    this.limpiarValor();
  }

  private _filterEstadoFruta(value: string): Observable<TablaAuxiliarDetalle[]> {
    const filterValue = value.toUpperCase();
    return this.tablaAuxiliarService.autocompleteList("ESTFRU", filterValue);
  }

  mostrarNombreEstadoFruta(estadoFruta?: TablaAuxiliarDetalle):string | undefined {
    return estadoFruta?estadoFruta.nombre:undefined;
  }

  cambiarValorEstadoFruta(event): void {
    if (event.keyCode != 38 && event.keyCode != 40) {
      this.autoEstadoFruta= event.target.value;
      this.estadoFrutas = this.autoEstadoFruta ? this._filterEstadoFruta(this.autoEstadoFruta): new Observable<TablaAuxiliarDetalle[]>();
    }
  }

  validarEstadoFruta(event, deta: OrdenCompraDetalle) {
    this.tablaAuxiliarService.obtenerPorNombre("ESTFRU", event.target.value).subscribe(aux => {
      for (let index = 0; index < this.ordenCompra.detalle.length; index++) {
        const element = this.ordenCompra.detalle[index];
        if (element.nro == deta.nro) {
          this.ordenCompra.detalle[index].estadoFruta = aux;
          break;
        }
      }
    }, err => {
      //console.log("valor nulo")
    })
    this.limpiarValor();
  }

  limpiarValor(): void {
    this.autoFruta = null;
    this.autoFrutaVariedad = null;
    this.autoCategoria = null;
    this.autoTamano = null;
    this.autoEstadoFruta = null;
    this.frutas = new Observable<Fruta[]>();
    this.variedadFrutas = new Observable<FrutaVariedad[]>();
    this.categorias = new Observable<TablaAuxiliarDetalle[]>();
    this.tamanos = new Observable<TablaAuxiliarDetalle[]>();
    this.estadoFrutas = new Observable<TablaAuxiliarDetalle[]>();
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

  compararProv(p1: Proveedor, p2: Proveedor): boolean {
    if (p1 === undefined && p2 === undefined){
      return true;
    }

    return p1 === null || p2 === null || p1 === undefined || p2 === undefined? false: p1.id===p2.id;
  }

  compararAuxDet(o1:TablaAuxiliarDetalle, o2:TablaAuxiliarDetalle):boolean {
    if (o1 === undefined && o2 === undefined){
      return true;
    }

    return o1 === null || o2 === null || o1 === undefined || o2 === undefined? false: o1.tablaAuxiliarDetalleId.id===o2.tablaAuxiliarDetalleId.id;
  }

  compararStemp(s1:SubTipoEmpaque, s2:SubTipoEmpaque):boolean {
    if (s1 === undefined && s2 === undefined){
      return true;
    }

    return s1 === null || s2 === null || s1 === undefined || s2 === undefined? false: s1.id===s2.id;
  }

  compararAlm(a1:Almacen, a2:Almacen):boolean {
    if (a1 === undefined && a2 === undefined){
      return true;
    }

    return a1 === null || a2 === null || a1 === undefined || a2 === undefined? false: a1.id===a2.id;
  }

  agregarCard() {
    let detalle: OrdenCompraDetalle = new OrdenCompraDetalle();
    detalle.nro = this.contadorDetalle;
    this.contadorDetalle++;

    this.tablaAuxiliarService.obtenerPorNombre('UNICOM', 'KG').subscribe(
      (cmp) => detalle.unidadCompra = cmp
    );

    this.tablaAuxiliarService.obtenerPorNombre('FORPAG', 'CONTADO').subscribe(
      (fpa) => detalle.formaPago = fpa
    );

    this.tablaAuxiliarService.obtenerPorNombre('CATFRU', 'GENERICA').subscribe(
      (cat) => detalle.categoriaFruta = cat
    );

    detalle.placeholderFruta = "Fruta";
    this.ordenCompra.detalle.push(detalle);
  }

  quitarCard(det: OrdenCompraDetalle) {
    let nroAux = det.nro;
    this.ordenCompra.detalle = this.ordenCompra.detalle.filter((deta: OrdenCompraDetalle) => det.nro != deta.nro);
    let nro: number = 1;
    this.ordenCompra.detalle.forEach(det => {
      det.nro = nro;
      nro++;
    });
    this.contadorDetalle--;
  }

  agregarEmpaque() {
    let empaqueDetalle: OrdenCompraEmpaquetado = new OrdenCompraEmpaquetado();
    empaqueDetalle.nro = this.empaques.length + 1;
    this.almacenService.getAlmacen(3).subscribe(alm => {
      empaqueDetalle.almacen = alm;
    })
    this.empaques.push(empaqueDetalle);
  }

  quitarEmpaque(emp: OrdenCompraEmpaquetado) {
    this.empaques = this.empaques.filter((empa: OrdenCompraEmpaquetado) => emp.nro != empa.nro);
    let nro: number = 1;
    this.empaques.forEach(emp => {
      emp.nro = nro;
      nro++;
    });
  }

  guardar() {
    if(this.blnGuardando){
      return;
    }
    this.blnGuardando = true;

    //Validaciones
    let errores:any = undefined;
    // let elems = document.querySelectorAll(".widget.hover");
    // [].forEach.call(elems, function(el) {
    //     el.classList.remove("hover");
    // });

    this.validarCabecera(null,true);

    if(this.ordenCompra.detalle.length == 0){
      swal.fire('Error al guardar', 'No se han definido ningun detalle para la orden de compra', 'error');
      this.blnGuardando = false;
      return;
    }

    for(let i=0; i< this.ordenCompra.detalle.length ; i++){
        if(this.estadoOrdenCompra == 1){
          this.validarDetalleBloqueFruta(null,this.ordenCompra.detalle[i],true);
          this.validarDetalleBloqueCompra(null,this.ordenCompra.detalle[i],true);
          this.validarDetalleBloqueJavasCompradas(null,this.ordenCompra.detalle[i],true);
        } else {
          this.validarDetalleBloqueRecepcion(null,this.ordenCompra.detalle[i],true);
        }
    }
    errores = document.getElementsByClassName("focusRed");
    if(errores.length > 0){
      swal.fire('Error al guardar: ', 'Se han encontrado '+ errores.length +
                ' error(es) en la orden de compra', 'error');
      this.blnGuardando = false;
      return;
    }

    var fecha: Date = new Date(this.ordenCompra.fechaCompraDate);
    var day = fecha.getUTCDate();
    var month = fecha.getMonth() + 1;
    var year = fecha.getFullYear();

    let fechaCompra = year.toString() + '/' + ("0" + month.toString()).slice(-2) + '/' + ("0" + day.toString()).slice(-2);
    fechaCompra = fechaCompra + ' ' + this.ordenCompra.fechaCompraTime+':00.000'

    this.ordenCompra.fechaCompra = new Date(fechaCompra);

    //if (this.validarOrden()) {
    if (true) {
      if (this.ordenCompra.id === 0) {
        this.tablaAuxiliarService.obtenerPorNombre('ESTOCO', 'COMPRADO').subscribe(
          (est) => {
            this.ordenCompra.estadoOrdenCompra = est;
            this.ordenCompraOriginal = this.ordenCompra;
            this.crear();
          }
        );

      } else {
        this.ordenCompra.detalle.forEach(det => {
          var fechaD: Date = new Date(det.fechaArriboDate);
          var dayD = fechaD.getUTCDate();
          var monthD = fechaD.getMonth() + 1;
          var yearD = fechaD.getFullYear();

          let fechaArribo = yearD.toString() + '/' + ("0" + monthD.toString()).slice(-2) + '/' + ("0" + dayD.toString()).slice(-2);
          fechaArribo = fechaArribo + ' ' + det.fechaArriboTime+':00.000'

          det.fechaArribo = new Date(fechaArribo);
        })
        this.actualizar();
      }
    } else {
      //this.blnGuardando = false;
    }
  }

  crear(): void {
    this.ordenCompra.idUsuarioCrea = this._authService.usuario.id;
    this.ordenCompraService.create(this.ordenCompra).subscribe(
      oc => {
        let archivos: File[] = [];
        let ids: number[] = [];

        for (let index = 0; index < this.ordenCompraOriginal.detalle.length; index++) {
          const element = this.ordenCompraOriginal.detalle[index];
          const el = oc.detalle[index];
          if (element.fotoEmbalaje && element.fotoEmbalaje !== '') {
            archivos.push(element.archivoFotoEmbalaje);
            ids.push(el.id);
          }
        }

        if (archivos.length > 0) {
          this.ordenCompraService.subirFoto(archivos, ids, oc.id);
        }
        this.blnGuardando = false;
        this.router.navigate(['/orden_compra/page/0']);
      },
      err => {
        this.blnGuardando = false;
        this.indexedDBService.addOrdenCompra(this.ordenCompra).then(this.bgSyncSaveOrdenCompra).catch(console.log);
        this.errores = err.error.errors as string[];
        console.error('Codigo del error: ' + err.status);
        console.error(err.error.errors);
      }
    );
  }

  actualizar(): void {
    this.ordenCompra.idUsuarioModifica = this._authService.usuario.id;
    this.ordenCompraService.update(this.ordenCompra).subscribe(
      json =>{
        this.blnGuardando = false;
        this.router.navigate(['/orden_compra/page/0'])
      },
      err => {
        console.log({err});
        this.blnGuardando = false;
        this.errores = err.error.errors as string[];
        console.error('Codigo del error: ' + err.status);
        console.error(err.error.errors);
      }
    )
  }

  validarOrden(): boolean {
    if (!this.ordenCompra) {
      //console.log("No existe orden");
      return false;
    }

    if (!this.ordenCompra.proveedor) {
      //console.log("Proveedor requerido");
      return false;
    }

    if (!this.ordenCompra.detalle || this.ordenCompra.detalle.length == 0) {
      //console.log("Debe haber al menos un registro");
      return false;
    }

    let validado: boolean = true;

    for (let index = 0; index < this.ordenCompra.detalle.length; index++) {
      const element = this.ordenCompra.detalle[index];

      if (!element.frutaVariedad || !element.frutaVariedad.id) {
        element.placeholderFruta = "OBLIGATORIO";
        //console.log("La variedad es obligatoria");
        validado = false;
      }

      if (!element.precioUnitario) {
        element.placeholderPrecioUnitario = "OBLIGATORIO";
        //console.log("El precio es requerido");
        validado = false;
      }

      if (!element.cantidadFruta) {
        element.placeholderCantidadFruta = "OBLIGATORIO";
        //console.log("La cantidad es requerida");
        validado = false;
      }
    }

    return validado;
  }

  calcularSubTotal(detalle: OrdenCompraDetalle) {
    this.ordenCompra.detalle.forEach(det => {
      if (det.nro === detalle.nro) {
        det.precioTotal = detalle.cantidadFruta*detalle.precioUnitario;

        if (isNaN(det.descuento) || det.descuento === null || det.descuento < 0) {
          det.descuento = 0.0
        }
        det.precioTotalDescuento = det.precioTotal - det.descuento;

        if (this.ordenCompra.indIgv) {
          det.igv = det.precioTotalDescuento*0.18;
          det.precioTotalIgv = det.precioTotalDescuento + det.igv;
        } else {
          det.igv = 0.0;
          det.precioTotalIgv = det.precioTotalDescuento;
        }

        if (isNaN(det.precioTotalIgv)) {
          det.precioTotalIgv = 0.0;
        } else {
          this.calcularTotal();
        }
      }
    });
    this.generarEmbalajeGenerico(detalle);
  }

  calcularTotal() {
    this.ordenCompra.total = 0.0;
    this.ordenCompra.detalle.forEach(det => {
      this.ordenCompra.total += det.precioTotalIgv
    });
    if (isNaN(this.ordenCompra.total)) {
      this.ordenCompra.total = 0.0;
    }
  }

  modificarIgv() {
    this.ordenCompra.indIgv = !this.ordenCompra.indIgv
    this.ordenCompra.detalle.forEach(det => {
      det.precioTotal = det.cantidadFruta*det.precioUnitario;

      if (isNaN(det.descuento) || det.descuento === null || det.descuento < 0) {
        det.descuento = 0.0
      }
      det.precioTotalDescuento = det.precioTotal - det.descuento;

      if (this.ordenCompra.indIgv) {
        det.igv = det.precioTotalDescuento*0.18;
        det.precioTotalIgv = det.precioTotalDescuento + det.igv;
      } else {
        det.igv = 0.0;
        det.precioTotalIgv = det.precioTotalDescuento;
      }
    })
    this.calcularTotal();
  }

  abrirModal(detalle: OrdenCompraDetalle) {
    this.blnModalAbierto = true;
    this.empaques = [];

    if(this.ordenCompra.detalle[detalle.nro-1].indIndividualizar != detalle.indIndividualizar){
      detalle.empaques = [];
    }

    this.empaques = detalle.empaques.slice();
    this.nroDetalle = detalle.nro;
    this.indFinalizadoEmp = detalle.indFinalizadoEmpaque;
    this.indIndividualizar = detalle.indIndividualizar;
    this.unidadMedida = detalle.unidadCompra.nombre;

    if (this.estadoOrdenCompra === 1) {
      if(detalle.totalEmpaques >= detalle.empaques.length){
        for (let index = 0; index < detalle.totalEmpaques - detalle.empaques.length; index++) {
          let empaqueDetalle: OrdenCompraEmpaquetado = new OrdenCompraEmpaquetado();
          empaqueDetalle.nro = index + detalle.empaques.length + 1;

          this.almacenService.getAlmacen(3).subscribe(alm => {
            empaqueDetalle.almacen = alm;
          })

          this.empaques.push(empaqueDetalle);
        }
      } else {
        this.empaques = detalle.empaques.slice(0,detalle.totalEmpaques);
      }
    }

    if (this.estadoOrdenCompra === 2) {
      this.indMerma = detalle.indMerma;

      if (detalle.categoriaFruta) {
        this.tablaAuxiliarService.getComboBoxMerma(detalle.categoriaFruta.tablaAuxiliarDetalleId.id).subscribe(aux => {
          aux = aux.filter(c => c.tablaAuxiliarDetalleId.id != 5);
          this.categoriasMerma1 = aux;
        });
        this.tablaAuxiliarService.getComboBoxMerma(detalle.categoriaFruta.tablaAuxiliarDetalleId.id).subscribe(aux => {
          aux = aux.filter(c => c.tablaAuxiliarDetalleId.id != 5);
          this.categoriasMerma2 = aux;
        });
      } else {
        this.tablaAuxiliarService.getComboBox("CATFRU").subscribe(aux => {
          aux = aux.filter(c => c.tablaAuxiliarDetalleId.id != 5);
          this.categoriasMerma1 = aux;
        });
        this.tablaAuxiliarService.getComboBox("CATFRU").subscribe(aux => {
          aux = aux.filter(c => c.tablaAuxiliarDetalleId.id != 5);
          this.categoriasMerma2 = aux;
        });
      }

      for (let index = 0; index < detalle.empaques.length; index++) {
        detalle.empaques[index].nro = index + 1;
        detalle.empaques[index] = this.generarIdentificadorEmbalaje(detalle, detalle.empaques[index]);

        if (detalle.empaques[index].motivoNoIngreso === null) {
          detalle.empaques[index].motivoNoIngreso = undefined;
        }
      }
    }

    if (this.estadoOrdenCompra === 3) {
      this.indMerma = detalle.indMerma;
      for (let index = 0; index < detalle.empaques.length; index++) {
        if (detalle.empaques[index].motivoNoIngreso === null) {
          detalle.empaques[index].motivoNoIngreso = undefined;
        }
      }
    }
    this.calcularTotalesModal(this.empaques);
  }

  cerrarModal(event, type: number) {
    if ((type == 1 && event.keyCode == 27) || type == 2) {
      this.blnModalAbierto = false;
      this.ordenCompra.detalle.forEach(det => {
        if (det.nro === this.nroDetalle) {
          let tipoEmpaque: string = '';
          // if(this.estadoOrdenCompra == 1 && !this.indIndividualizar){
          //   tipoEmpaque = 'GENERICO';
          // }
          let tipoMerma: string = '';
          let esMixto: boolean = false;
          let esMixtoMerma: boolean = false;
          let totalEmpaques: number = 0;

          det.indFinalizadoEmpaque = this.indFinalizadoEmp;
          det.empaques = [];
          det.empaques = this.empaques.slice();
          det.pesoEmpaque = 0.0;
          det.pesoMerma = 0.0;
          det.empaques.forEach(emp => {
            det.pesoEmpaque += Number(Number(emp.pesoCompra).toFixed(2));
            totalEmpaques++;
            if (emp.subTipoEmpaque !== undefined) {
              if(emp.subTipoEmpaque!=undefined && tipoEmpaque !== emp.subTipoEmpaque.nombre) {
                if (tipoEmpaque !== '') {
                  esMixto = true;
                }
                tipoEmpaque = emp.subTipoEmpaque.nombre;
              }
            }

            //det.pesoMerma = 0.0;
            if (this.ordenCompra.estadoOrdenCompra.tablaAuxiliarDetalleId.id > 1) {
              det.pesoMerma += +(emp.pesoMerma1);
              det.pesoMerma += +(emp.pesoMerma2);

              if (emp.categoriaMerma1 !== undefined && emp.categoriaMerma1 !== null) {
                if(tipoMerma !== emp.categoriaMerma1.nombre) {
                  if (tipoMerma !== '') {
                    esMixtoMerma = true;
                  }
                  tipoMerma = emp.categoriaMerma1.nombre;
                }
              }

              if (emp.categoriaMerma2 !== undefined  && emp.categoriaMerma2 !== null) {
                if(tipoMerma !== emp.categoriaMerma2.nombre) {
                  if (tipoMerma !== '') {
                    esMixtoMerma = true;
                  }
                  tipoMerma = emp.categoriaMerma2.nombre;
                }
              }

            }
          });

          det.pesoEmpaque = Number(det.pesoEmpaque.toFixed(2));

          if (isNaN(det.pesoEmpaque)) {
            det.pesoEmpaque = 0.0;
          }

          if (isNaN(det.pesoMerma)) {
            det.pesoMerma = 0.0;
          }

          if (esMixto) {
            det.tipoEmpaque = 'MIXTO';
          } else {
            det.tipoEmpaque = tipoEmpaque;
          }
          if (esMixtoMerma) {
            det.tipoMerma = 'MIXTO';
          } else {
            det.tipoMerma = tipoMerma;
          }

          det.totalEmpaques = totalEmpaques;
          //Validar empaques
          if(this.estadoOrdenCompra == 1){
            this.validarDetalleBloqueJavasCompradas(null,det,true);
          } else if(this.estadoOrdenCompra == 2){
            this.validarDetalleBloqueRecepcion(null,det,true);
          }
        }
      });
    }
  }

  generarIdentificadorEmbalaje(det: OrdenCompraDetalle, emp: OrdenCompraEmpaquetado): OrdenCompraEmpaquetado {
    emp.identificador = this.ordenCompra.nroOrden.substring(0, 4) + '-' + det.fruta.id + det.categoriaFruta.tablaAuxiliarDetalleId.id + '-'
        + ("0" + emp.nro).slice(-2) + "-" + this.ordenCompra.nroOrden.substring(5, 7);

    return emp;
  }

  soloNumeros(event): void {
    if (event.keyCode < 48 || event.keyCode > 57) {
      event.preventDefault();
    }
  }

  soloNumerosDecimales(event): void {
    if (((event.keyCode != 46 || (event.keyCode == 46 && event.target.value == '')) ||
            event.target.value.indexOf('.') != -1) && (event.keyCode < 48 || event.keyCode > 57)) {
        event.preventDefault();
    }
  }

  defaultNumeros(event): void {
    if (event.target.value === "") {
      event.target.value = 0.0;
    }
  }

  limpiarFormaPago(det: OrdenCompraDetalle) {
    if (det.formaPago.nombre == "CONTADO") {
      det.responsablePago = null;
      det.fechaPago = null;
    }
  }

  abrirExplorador(nro: number) {
    document.getElementById("file-"+ nro).click();
  }

  abrirExploradorM(nro: number) {
    document.getElementById("filem-"+ nro).click();
  }

  cargarFoto(event, det: OrdenCompraDetalle) {
    det.archivoFotoEmbalaje = event.target.files[0];
    det.fotoEmbalaje = event.target.files[0].name;
  }

  cargarFotoM(event, det: OrdenCompraDetalle) {
    det.archivoFotoMerma = event.target.files[0];
    det.fotoMerma = event.target.files[0].name;
  }

  cargarFotoModal(det: OrdenCompraDetalle) {
    if (this.estadoOrdenCompra == 1) {
      let reader = new FileReader();
      reader.readAsDataURL(det.archivoFotoEmbalaje);
      reader.onloadend = () => {
        this.fotoEmbalajeSeleccionada = reader.result as string;
      };
    } else {
      this.fotoEmbalajeSeleccionada = this.urlFoto + 'api/orden_compra/img/' + det.fotoEmbalaje;
    }
  }

  validarFecha(event,idTipo:number=0,detalle:OrdenCompraDetalle = null) {
    let fechaAux: Date = event.target.value;
    if(fechaAux.toString() == ""){
      event.target.value = "";
    }
  }

  tipoEmbalajeChange(event,empaqueNro:number){
    let selectElement = event.target;
    let optionIndex = selectElement.selectedIndex;
    let index = this.empaques.findIndex((obj => obj.nro == empaqueNro));
    if(optionIndex == 0){
      if(index>-1){
        this.empaques[index].pesoCompra = undefined;
      }
    }
  }
  noIngresoChange(event,empaqueNro:number){
    let selectElement = event.target;
    var optionIndex = selectElement.selectedIndex;
    if(optionIndex != 0){
      let index = this.empaques.findIndex((obj => obj.nro == empaqueNro));
      if(index>-1){
        this.empaques[index].pesoRecepcion = 0;
        this.empaques[index].pesoMerma1 = 0;
        this.empaques[index].categoriaMerma1 = undefined;
        this.empaques[index].pesoMerma2 = 0;
        this.empaques[index].categoriaMerma2 = undefined;
        this.empaques[index].almacen = undefined;
        this.validarEmpaque(null,this.empaques[index],true)
      }
    }
  }

  tipoMermaChange(event,empaqueNro:number,idTipo:number){
    let selectElement = event.target;
    let optionIndex = selectElement.selectedIndex;
    if(optionIndex == 0){
      let index = this.empaques.findIndex((obj => obj.nro == empaqueNro));
      if(index>-1){
        if(idTipo == 1){
          this.empaques[index].pesoMerma1 = 0;
          this.empaques[index].categoriaMerma2 = undefined;
          this.empaques[index].pesoMerma2 = 0;
          this.validarEmpaque(null,this.empaques[index],true)
        } else if(idTipo == 2){
          this.empaques[index].pesoMerma2 = 0;
          this.validarEmpaque(null,this.empaques[index],true)
        }
      }
    } else {
      let index = this.empaques.findIndex((obj => obj.nro == empaqueNro));
      if(index>-1){
        if(idTipo == 1){
          this.empaques[index].categoriaMerma2 = undefined;
          this.empaques[index].pesoMerma2 = 0;
          this.validarEmpaque(null,this.empaques[index],true)

          this.categoriasMerma2 = [];
          for(let i=optionIndex;i<this.categoriasMerma1.length;i++){
            this.categoriasMerma2.push(this.categoriasMerma1[i]);
          }

        }
      }
    }
  }

  limpiarComboAdicional(detalle:OrdenCompraDetalle){
    if(Number(detalle.cantidadAdicional) == 0){
      detalle.tipoAdicional = undefined;
    }
  }

  frutaChange(det:OrdenCompraDetalle){
    if(!(typeof(det.fruta) == 'string' || typeof(det.fruta) == 'undefined') &&
       !(typeof(det.frutaVariedad) == 'string' || typeof(det.frutaVariedad) == 'undefined')){
      if(det.fruta.id != det.frutaVariedad.fruta.id){
        det.frutaVariedad = undefined;
      }
    }
  }

  indMermaChange(det:OrdenCompraDetalle):void{
    det.indMerma = !det.indMerma;
    if(!det.indMerma){
      for(let i=0;i<det.empaques.length;i++){
        det.empaques[i].pesoMerma1 = 0;
        det.empaques[i].categoriaMerma1 = undefined;
        det.empaques[i].pesoMerma2 = 0;
        det.empaques[i].categoriaMerma2 = undefined;
      }
    }
  }

  indFinalizadoChange(event,empaques:OrdenCompraEmpaquetado[]){
    this.indFinalizadoEmp = !this.indFinalizadoEmp
    if(this.indFinalizadoEmp){
      for(let i=0;i<empaques.length;i++){
        this.validarEmpaque(null,empaques[i],true);
      }
    }
  }

  generarEmbalajeGenerico(detalle: OrdenCompraDetalle){
    if(detalle.cantidadFruta > 0 && detalle.totalEmpaques > 0 && !detalle.indIndividualizar){
      let empaques:OrdenCompraEmpaquetado[] = [];
      let cantidad:number = Number(detalle.cantidadFruta);
      let adicional:number =Number(detalle.cantidadAdicional);
      let totalEmpaques:number = Number(detalle.totalEmpaques);
      let pesoPorEmpaque:number = (cantidad + adicional) / totalEmpaques;
      pesoPorEmpaque = Number(pesoPorEmpaque.toFixed(2));
      let pesoTotal:number = 0;
      for (let index = 0; index < detalle.totalEmpaques; index++) {
        let empaqueDetalle: OrdenCompraEmpaquetado = new OrdenCompraEmpaquetado();
        empaqueDetalle.nro = index + 1;
        empaqueDetalle.almacen = undefined;
        empaqueDetalle.subTipoEmpaque = this.subTipoEmpaqueIntegral;
        empaqueDetalle.pesoCompra = pesoPorEmpaque;
        pesoTotal += empaqueDetalle.pesoCompra
        empaques.push(empaqueDetalle);
      }
      pesoTotal = Number(pesoTotal.toFixed(2));

      detalle.empaques = empaques;
      detalle.tipoEmpaque = detalle.empaques[0].subTipoEmpaque.nombre;
      detalle.tipoMerma = '';
      detalle.pesoEmpaque = pesoTotal;
      detalle.indFinalizadoEmpaque = true;

      this.empaques = [];
      this.empaques = detalle.empaques.slice();
      this.nroDetalle = detalle.nro;
      this.indFinalizadoEmp = detalle.indFinalizadoEmpaque;
      this.indIndividualizar = detalle.indIndividualizar;

      this.ordenCompra.detalle.forEach(det => {
        if (det.nro === this.nroDetalle){
          det = detalle;
        }
      });
    }
    if(Number(detalle.cantidadAdicional) == 0){
      detalle.tipoAdicional = undefined;
    }
  }

  individualizarEmbalaje(detalle:OrdenCompraDetalle){
    detalle.indIndividualizar = !detalle.indIndividualizar
    // this.ordenCompra.detalle[detalle.nro-1].indIndividualizar = detalle.indIndividualizar;
    if(detalle.indIndividualizar){
      detalle.empaques = [];
      detalle.tipoEmpaque = '';
      detalle.tipoMerma = '';
      detalle.pesoEmpaque = 0;
      detalle.indFinalizadoEmpaque = false;
      //detalle.totalEmpaques = 0;//////

      this.empaques = [];
      this.empaques = detalle.empaques.slice();
      this.nroDetalle = detalle.nro;
      this.indFinalizadoEmp = detalle.indFinalizadoEmpaque;
      this.indIndividualizar = detalle.indIndividualizar;

      this.ordenCompra.detalle.forEach(det => {
        if (det.nro === this.nroDetalle){
          det = detalle;
        }
      });
    } else {
        this.generarEmbalajeGenerico(detalle);
    }
    if(detalle.empaques.length > 0){
    this.validarDetalleBloqueJavasCompradas(null,detalle,true);
    }
  }

  validarCabecera(event, blnValidacionGeneral:boolean = false):void{
      let blnAccion:boolean = false;
      let elementId:string = ''
      let nombreElemennto:string = ''
      let nroElemento:string = ''
      if(!blnValidacionGeneral){
        elementId = (event.target as Element).id;
        nombreElemennto = elementId.split("_")[0];
        nroElemento = elementId.split("_")[1];
      }

      if(this.estadoOrdenCompra == 3){
        return;
      }

      if(this.estadoOrdenCompra ==1){
        if(blnValidacionGeneral || nombreElemennto == "proveedorForm"){
          blnAccion = this.ordenCompra.proveedor == null || this.ordenCompra.proveedor == undefined;
          if(blnAccion){
            this.ordenCompra.proveedor = undefined;
          }
          this.validarObjeto("proveedorForm",blnAccion,null,null,blnValidacionGeneral);
        }
        if(blnValidacionGeneral || nombreElemennto == "lugarCompraForm"){
          blnAccion = false;
          blnAccion = this.ordenCompra.lugarCompra == null || this.ordenCompra.lugarCompra == undefined
              || this.ordenCompra.lugarCompra.length == 0;
          if(blnAccion){
            this.ordenCompra.lugarCompra = undefined;
          }
          this.validarObjeto("lugarCompraForm",blnAccion,'LUGAR INVALIDO','LUGAR COMPRA',blnValidacionGeneral);
        }
        if(blnValidacionGeneral || nombreElemennto == "fechaCompraForm"){
          blnAccion = false;
          blnAccion = this.ordenCompra.fechaCompraDate == null ||
                      this.ordenCompra.fechaCompraDate == undefined || this.ordenCompra.fechaCompraDate.toString() == "";
          if(blnAccion){
            this.ordenCompra.fechaCompraDate = undefined;
          }
          this.validarObjeto("fechaCompraForm",blnAccion,null,null,blnValidacionGeneral);
        }
      }
  }

  validarDetalleBloqueFruta(event,detalle:OrdenCompraDetalle,blnValidacionGeneral:boolean = false){
    let blnAccion:boolean = false;
    let blnAux:boolean = true;
    let elementId:string = ''
    let nombreElemennto:string = ''
    let nroElemento:string = ''
    if(!blnValidacionGeneral){
      elementId = (event.target as Element).id;
      nombreElemennto = elementId.split("_")[0];
      nroElemento = elementId.split("_")[1];
    }

    if(this.estadoOrdenCompra == 3){
      return;
    }

    blnAccion = typeof(detalle.fruta) == 'string' || typeof(detalle.fruta) == 'undefined';
    blnAux = blnAux && !blnAccion;
    if(blnValidacionGeneral || nombreElemennto == "fruta"){
      if(blnAccion){
        detalle.fruta = undefined;
      }
      this.validarObjeto("fruta"+"_"+detalle.nro,blnAccion,'FRUTA INVALIDA','FRUTA',blnValidacionGeneral);
    }

    blnAccion = typeof(detalle.frutaVariedad) == 'string' || typeof(detalle.frutaVariedad) == 'undefined';
    blnAux = blnAux && !blnAccion;
    if(blnValidacionGeneral || nombreElemennto == "frutaVariedad"){
      if(blnAccion){
        detalle.frutaVariedad = undefined;
      }
      this.validarObjeto("frutaVariedad"+"_"+detalle.nro,blnAccion,'VARIEDAD INVALIDA','VARIEDAD',blnValidacionGeneral);
    }

    blnAccion = typeof(detalle.categoriaFruta) == 'string' || typeof(detalle.categoriaFruta) == 'undefined';
    blnAux = blnAux && !blnAccion;
    if(blnValidacionGeneral || nombreElemennto == "frutaCategoria"){
      if(blnAccion){
        detalle.categoriaFruta = undefined;
      }
      this.validarObjeto("frutaCategoria"+"_"+detalle.nro,blnAccion,'CATEG. INVALIDA','CATEGORIA',blnValidacionGeneral);
    }

    blnAccion = ((typeof(detalle.tamanoFruta) == 'string') && detalle.tamanoFruta != '') &&
                !(detalle.tamanoFruta == null || detalle.tamanoFruta == undefined);
    blnAux = blnAux && !blnAccion;
    if(blnValidacionGeneral || nombreElemennto == "frutaTamanio"){
      this.validarObjeto("frutaTamanio"+"_"+detalle.nro,blnAccion,'TAMAÑO INVALIDO','TAMAÑO',blnValidacionGeneral);
    }
    blnAccion = ((typeof(detalle.estadoFruta) == 'string') && detalle.estadoFruta != '') &&
                !(detalle.estadoFruta == null || detalle.estadoFruta == undefined);
    blnAux = blnAux && !blnAccion;
    if(blnValidacionGeneral || nombreElemennto == "frutaEstado"){
      this.validarObjeto("frutaEstado"+"_"+detalle.nro,blnAccion,'ESTADO INVALIDO','ESTADO',blnValidacionGeneral);
    }

    if(!blnValidacionGeneral){
      //!detalle.blnHabilitarBloqueCompra
      detalle.blnHabilitarBloqueCompra = blnAux;
    }
  }

  validarDetalleBloqueCompra(event,detalle:OrdenCompraDetalle,blnValidacionGeneral:boolean = false){
    let blnAccion:boolean = false;
    let blnAux:boolean = true;
    let elementId:string = ''
    let nombreElemennto:string = ''
    let nroElemento:string = ''
    if(!blnValidacionGeneral){
      elementId = (event.target as Element).id;
      nombreElemennto = elementId.split("_")[0];
      nroElemento = elementId.split("_")[1];
    }

    if(this.estadoOrdenCompra == 3){
      return;
    }
    if(!blnValidacionGeneral){
      detalle.blnHabilitarBloqueFruta = false;
    }

    blnAccion = detalle.precioUnitario == null || detalle.precioUnitario == undefined ||
                detalle.precioUnitario == 0;
    blnAux = blnAux && !blnAccion;
    if(blnValidacionGeneral || nombreElemennto == "precioUnitario"){
      if(blnAccion){
        detalle.precioUnitario = undefined;
      }
      this.validarObjeto("precioUnitario"+"_"+detalle.nro,blnAccion,'P.UNIT>0','P. UNITARIO',blnValidacionGeneral);
    }

    blnAccion = detalle.cantidadFruta == null || detalle.cantidadFruta == undefined ||
                detalle.cantidadFruta == 0;
    blnAux = blnAux && !blnAccion;
    if(blnValidacionGeneral || nombreElemennto == "cantidadCompra"){
      if(blnAccion){
        detalle.cantidadFruta = undefined;
      }
      this.validarObjeto("cantidadCompra"+"_"+detalle.nro,blnAccion,'Q.COM.>0','Q.COMPRA',blnValidacionGeneral);
    }

    if(nombreElemennto == "adicional"){
      if(detalle.cantidadAdicional == null || detalle.cantidadAdicional == undefined ||
              detalle.cantidadAdicional.toString().length == 0){
        detalle.cantidadAdicional = 0;
      }
    }

    blnAccion = detalle.precioTotalIgv<0;
    blnAux = blnAux && !blnAccion;
    if(blnValidacionGeneral || nombreElemennto == "descuento"){
      if(detalle.descuento == null || detalle.descuento == undefined ||
              detalle.descuento.toString().length == 0){
          detalle.descuento = 0;
      }
      if(blnAccion){
        detalle.descuento = undefined;
      }
      this.validarObjeto("descuento"+"_"+detalle.nro,blnAccion,'P.TOTAL>0','DESCUENTO',blnValidacionGeneral);
    }

    blnAccion = detalle.formaPago.nombre ==  'CREDITO' &&
                !(detalle.fechaPago == null || detalle.fechaPago == undefined || detalle.fechaPago.toString() == "") &&
                detalle.fechaPago < this.ordenCompra.fechaCompraDate;
    blnAux = blnAux && !blnAccion;
    if(blnValidacionGeneral || nombreElemennto == "fechaPago"){
      if(blnAccion){
        detalle.fechaPago = undefined;
      }
      this.validarObjeto("fechaPago"+"_"+detalle.nro,blnAccion,null,null,blnValidacionGeneral);
    }

    blnAccion = detalle.formaPago.nombre ==  'CREDITO' &&
                (detalle.responsablePago == null || detalle.responsablePago == undefined ||
                 detalle.responsablePago.length == 0);
    blnAux = blnAux && !blnAccion;
    if(blnValidacionGeneral || nombreElemennto == "responsablePago"){
      if(blnAccion){
        detalle.responsablePago = undefined;
      }
      this.validarObjeto("responsablePago"+"_"+detalle.nro,blnAccion,'RESPON. INVALIDO','RESPONSABLE',blnValidacionGeneral);
    }

    blnAccion = Number(detalle.cantidadAdicional) > 0 &&
                (detalle.tipoAdicional == null || detalle.tipoAdicional == undefined);
    blnAux = blnAux && !blnAccion;
    if(blnValidacionGeneral || nombreElemennto == "tipoAdicional"){
      // if(blnAccion){
      //   detalle.tipoAdicional = undefined;
      // }
      this.validarObjeto("tipoAdicional"+"_"+detalle.nro,blnAccion,null,null,blnValidacionGeneral);
    }
    if(!blnValidacionGeneral){
      //!detalle.blnHabilitarBloqueJavasCompradas &&
      detalle.blnHabilitarBloqueJavasCompradas = blnAux;
    }
  }

  validarDetalleBloqueJavasCompradas(event,detalle:OrdenCompraDetalle,blnValidacionGeneral:boolean = false){
    let blnAccion:boolean = false;
    let elementId:string = ''
    let nombreElemennto:string = ''
    let nroElemento:string = ''
    if(!blnValidacionGeneral){
      elementId = (event.target as Element).id;
      nombreElemennto = elementId.split("_")[0];
      nroElemento = elementId.split("_")[1];
    }
    if(!blnValidacionGeneral){
      detalle.blnHabilitarBloqueCompra = false;
    }
    if(this.estadoOrdenCompra == 3){
      return;
    }
    if(blnValidacionGeneral || nombreElemennto == "nroJavas"){
      blnAccion = false;
      blnAccion = detalle.totalEmpaques == null || detalle.totalEmpaques == undefined|| detalle.totalEmpaques==0 || detalle.totalEmpaques >20;
      if(blnAccion){
        detalle.totalEmpaques = undefined;
      }
      this.validarObjeto("nroJavas"+"_"+detalle.nro,blnAccion,'0<Q<20','CANT.',blnValidacionGeneral);
    }
    if(blnValidacionGeneral){
      blnAccion = false;
      if(detalle.totalEmpaques != detalle.empaques.length){
        blnAccion = true;
      }

      this.validarObjeto("indFinalizadoEmpaque"+"_"+detalle.nro,!detalle.indFinalizadoEmpaque,null,null,blnValidacionGeneral);

      let aux:{ value: boolean } = { value: false };

      this.empaques = [];
      this.empaques = detalle.empaques.slice();
      this.nroDetalle = detalle.nro;
      this.indFinalizadoEmp = detalle.indFinalizadoEmpaque;
      this.indIndividualizar = detalle.indIndividualizar;

      let pesoCompra:number =  0;      
      for(let i =0;i<detalle.empaques.length;i++){
        aux.value = false;
        this.validarEmpaque(null,detalle.empaques[i],blnValidacionGeneral,aux);
        if(aux.value == false){
          blnAccion = true;
          break;
        }
        if(detalle.empaques[i].pesoCompra != null && detalle.empaques[i].pesoCompra != undefined){
          pesoCompra += Number(detalle.empaques[i].pesoCompra);
        }
      }
      let total:number = Number(detalle.cantidadFruta) + Number(detalle.cantidadAdicional);
      if(!blnAccion && (total>pesoCompra || total<pesoCompra-0.5)){
        blnAccion = true;
      }
      this.validarObjeto("modalNroJavas"+"_"+detalle.nro,blnAccion,null,null,blnValidacionGeneral);
    }
  }

  validarDetalleBloqueRecepcion(event,detalle:OrdenCompraDetalle,blnValidacionGeneral:boolean = false){
    let blnAccion:boolean = false;
    let elementId:string = ''
    let nombreElemennto:string = ''
    let nroElemento:string = ''
    if(!blnValidacionGeneral){
      elementId = (event.target as Element).id;
      nombreElemennto = elementId.split("_")[0];
      nroElemento = elementId.split("_")[1];
    }

    if(this.estadoOrdenCompra == 3){
      return;
    }
    if(blnValidacionGeneral || nombreElemennto == "fechaArribo"){
      blnAccion = false;
      blnAccion = detalle.fechaArriboDate == undefined || detalle.fechaArriboDate == null || detalle.fechaArriboDate.toString() == '';
                  //|| !(detalle.fechaArriboDate < this.ordenCompra.fechaCompra);
      if(blnAccion){
        detalle.fechaArriboDate = undefined;
      }
      this.validarObjeto("fechaArribo"+"_"+detalle.nro,blnAccion,null,null,blnValidacionGeneral);
    }
    if(blnValidacionGeneral || nombreElemennto == "horaArribo"){
      blnAccion = false;
      blnAccion = detalle.fechaArriboTime == undefined || detalle.fechaArriboTime == null;
      if(blnAccion){
        detalle.fechaArriboTime = undefined;
      }
      this.validarObjeto("horaArribo"+"_"+detalle.nro,blnAccion,null,null,blnValidacionGeneral);
    }
    if(blnValidacionGeneral){
      blnAccion = false;
      if(detalle.totalEmpaques != detalle.empaques.length){
        blnAccion = true;
      }

      this.validarObjeto("indFinalizadoRecepcion"+"_"+detalle.nro,!detalle.indFinalizadoEmpaque,null,null,blnValidacionGeneral);

      let aux:{ value: boolean } = { value: false };

      this.empaques = [];
      this.empaques = detalle.empaques.slice();
      this.nroDetalle = detalle.nro;
      this.indFinalizadoEmp = detalle.indFinalizadoEmpaque;
      this.indIndividualizar = detalle.indIndividualizar;

      let pesoCompra:number =  0;
      let pesoRecepcion:number = 0;
      let pesoNoIngreso:number = 0;
      let pesoMerma1:number = 0;
      let pesoMerma2:number = 0;
      for(let i =0;i<detalle.empaques.length;i++){
        aux.value = false
        this.validarEmpaque(null,detalle.empaques[i],blnValidacionGeneral,aux);
        if(aux.value == false){
          blnAccion = true;
          break;
        }
        if(detalle.empaques[i].pesoCompra != null && detalle.empaques[i].pesoCompra != undefined){
          pesoCompra += Number(detalle.empaques[i].pesoCompra);
        }
        if(detalle.empaques[i].pesoRecepcion != null && detalle.empaques[i].pesoRecepcion != undefined && detalle.empaques[i].pesoRecepcion > 0 ){
          pesoRecepcion += Number(detalle.empaques[i].pesoRecepcion);
        }
        if(detalle.empaques[i].motivoNoIngreso != null && detalle.empaques[i].motivoNoIngreso != undefined){
          pesoNoIngreso += Number(detalle.empaques[i].pesoCompra)
        }
        if(detalle.empaques[i].pesoMerma1 != null && detalle.empaques[i].pesoMerma1 != undefined && detalle.empaques[i].pesoMerma1 > 0){
          pesoMerma1 += Number(detalle.empaques[i].pesoMerma1)
        }
        if(detalle.empaques[i].pesoMerma2 != null && detalle.empaques[i].pesoMerma2 != undefined && detalle.empaques[i].pesoMerma2 > 0){
          pesoMerma2 += Number(detalle.empaques[i].pesoMerma2)
        }
      }
      let total:number = pesoRecepcion + pesoNoIngreso + pesoMerma1 + pesoMerma2;
      if(!blnAccion && (total>pesoCompra || total<pesoCompra-0.5)){
        blnAccion = true;
      }
      this.validarObjeto("modalRecepcion"+"_"+detalle.nro,blnAccion,null,null,blnValidacionGeneral);
    }
  }

  validarEmpaque(event,empaque:OrdenCompraEmpaquetado,
    blnValidacionGeneral:boolean = false, blnResultadoValidacion:{ value: boolean } = { value: true }):void{
    let blnAccion:boolean = false;

    let elementId:string = ''
    let nombreElemennto:string = ''
    let nroElemento:string = ''
    if(!blnValidacionGeneral){
      elementId = (event.target as Element).id;
      nombreElemennto = elementId.split("_")[0];
      nroElemento = elementId.split("_")[1];
    }

    let blnAux:boolean = true;
    let pesoMerma1:number = 0;
    let pesoMerma2:number = 0;

    if(this.estadoOrdenCompra == 3){
      return;
    }

    if(this.estadoOrdenCompra == 1){
      if(blnValidacionGeneral || nombreElemennto == "tipoEmpaque"){
        blnAccion = false;
        blnAccion = this.ordenCompra.detalle[this.nroDetalle-1].indIndividualizar &&
                    (empaque.subTipoEmpaque == null || empaque.subTipoEmpaque == undefined || empaque.subTipoEmpaque.id ==3);
        // if(blnAccion){
        //   empaque.subTipoEmpaque = undefined;
        // }
        if(blnResultadoValidacion.value){
          this.validarObjeto("tipoEmpaque"+"_"+empaque.nro,blnAccion,null,null,blnValidacionGeneral);
        }
        blnAux = blnAux && !blnAccion;
      }
      if(blnValidacionGeneral || nombreElemennto == "empaquePeso"){
        blnAccion = false;
        blnAccion = this.ordenCompra.detalle[this.nroDetalle-1].indIndividualizar &&
                    !(empaque.subTipoEmpaque == undefined || empaque.subTipoEmpaque == undefined || empaque.subTipoEmpaque.id ==3) &&
                    ((empaque.pesoCompra == undefined || empaque.pesoCompra == undefined || empaque.pesoCompra == 0) ||
                    ( this.ordenCompra.detalle[this.nroDetalle-1].unidadCompra.nombre=="KG" && (Number(empaque.pesoCompra) > empaque.subTipoEmpaque.capacidad + 0.5)));
        if(blnAccion){
          empaque.pesoCompra = undefined;
        }
        let aux:number = 0;
        let msg:string='';
        if(this.ordenCompra.detalle[this.nroDetalle-1].indIndividualizar){
          if(empaque.subTipoEmpaque!=undefined && empaque.subTipoEmpaque.id !=3){
            aux = empaque.subTipoEmpaque.capacidad + 0.5;
          }
        }
        if(this.ordenCompra.detalle[this.nroDetalle-1].unidadCompra.nombre=="KG"){
          msg = '0<PESO';
        }else{
          '0<PESO<'+(aux==0?'MAX':aux.toString())
        }
        if(blnResultadoValidacion.value){
          this.validarObjeto("empaquePeso"+"_"+empaque.nro,blnAccion,msg,'PESO JAVA',blnValidacionGeneral);
        }
        blnAux = blnAux && !blnAccion;
      }
    } else {
      if(empaque.pesoMerma1 != null && empaque.pesoMerma1 != null && empaque.pesoMerma1 != 0){
          pesoMerma1 = Number(Number(empaque.pesoMerma1).toFixed(2))
      }
      if(empaque.pesoMerma2 != null && empaque.pesoMerma2 != null && empaque.pesoMerma2 != 0){
          pesoMerma2= Number(Number(empaque.pesoMerma2).toFixed(2))
      }

      //Recepcion - Modal
      if(blnValidacionGeneral || nombreElemennto == "empaquePesoRecepcion"){
        blnAccion = false;
        blnAccion = (empaque.motivoNoIngreso == undefined || empaque.motivoNoIngreso == null) &&
                    ((empaque.pesoRecepcion == null || empaque.pesoRecepcion == undefined || empaque.pesoRecepcion == 0) ||
                    (this.ordenCompra.detalle[this.nroDetalle-1].unidadCompra.nombre=="KG" && Number(empaque.pesoRecepcion) > Number(empaque.pesoCompra))) ;
        if(blnAccion){
          empaque.pesoRecepcion = undefined;
        }
        if(blnResultadoValidacion.value){
          this.validarObjeto("empaquePesoRecepcion"+"_"+empaque.nro,blnAccion,'0<PESO<'+Number(empaque.pesoCompra),'PESO COMPRA',blnValidacionGeneral);
        }
        blnAux = blnAux && !blnAccion;
      }

      if(this.ordenCompra.detalle[this.nroDetalle-1].indMerma){
        if(blnValidacionGeneral || nombreElemennto == "empaquePesoMerma1"){
          blnAccion = false;
          blnAccion = (empaque.motivoNoIngreso == undefined || empaque.motivoNoIngreso == null) &&
                      !(empaque.categoriaMerma1 == undefined || empaque.categoriaMerma1 == null) &&
                      ((empaque.pesoMerma1 == null || empaque.pesoMerma1 == undefined || empaque.pesoMerma1 == 0) ||
                      (this.ordenCompra.detalle[this.nroDetalle-1].unidadCompra.nombre=="KG" && Number(empaque.pesoMerma1) > Number(empaque.pesoCompra)));
          if(blnAccion){
            empaque.pesoMerma1 = undefined;
          }
          if(blnResultadoValidacion.value){
            this.validarObjeto("empaquePesoMerma1"+"_"+empaque.nro,blnAccion,'M1<'+Number(empaque.pesoCompra),'MERMA 1',blnValidacionGeneral);
          }
          blnAux = blnAux && !blnAccion;
        }
        if(blnValidacionGeneral || nombreElemennto == "empaquePesoMerma2"){
          blnAccion = false;
          blnAccion = (empaque.motivoNoIngreso == undefined || empaque.motivoNoIngreso == null) &&
                      !(empaque.categoriaMerma2 == undefined || empaque.categoriaMerma2 == null) &&
                      ((empaque.pesoMerma2 == null || empaque.pesoMerma2 == undefined || empaque.pesoMerma2== 0) ||
                      (this.ordenCompra.detalle[this.nroDetalle-1].unidadCompra.nombre=="KG" && Number(empaque.pesoMerma2) > Number(empaque.pesoCompra))) ;
          if(blnAccion){
            empaque.pesoMerma2 = undefined;
          }
          if(blnResultadoValidacion.value){
            this.validarObjeto("empaquePesoMerma2"+"_"+empaque.nro,blnAccion,'M2<'+Number(empaque.pesoCompra),'MERMA 2',blnValidacionGeneral);
          }blnAux = blnAux && !blnAccion;
        }
      }
      if(blnValidacionGeneral || nombreElemennto == "empaqueAlmacen"){
        blnAccion = false;
        blnAccion = (empaque.motivoNoIngreso == undefined || empaque.motivoNoIngreso == null) &&
                    (empaque.almacen == undefined || empaque.almacen == null) ;
        // if(blnAccion){
        //   empaque.almacen = undefined;
        // }
        if(blnResultadoValidacion.value){
          this.validarObjeto("empaqueAlmacen"+"_"+empaque.nro,blnAccion,null,null,blnValidacionGeneral);
        }
        blnAux = blnAux && !blnAccion;
      }
      if(blnValidacionGeneral || nombreElemennto == "empaquePesoRecepcion" || nombreElemennto == "empaquePesoMerma1" || nombreElemennto == "empaquePesoMerma2"){
        blnAccion = false;
        blnAccion = (empaque.motivoNoIngreso == undefined || empaque.motivoNoIngreso == null) &&
                    !(empaque.pesoRecepcion == null || empaque.pesoRecepcion == undefined) &&
                    this.ordenCompra.detalle[this.nroDetalle-1].unidadCompra.nombre=="KG" &&
                    (Number(empaque.pesoRecepcion)+ pesoMerma1 + pesoMerma2) < (Number(empaque.pesoCompra) -0.5) &&
                    (Number(empaque.pesoRecepcion)+ pesoMerma1 + pesoMerma2) > Number(empaque.pesoCompra);
        if(blnResultadoValidacion.value){
          this.validarObjeto("empaquePeso"+"_"+empaque.nro,blnAccion,null,null,true);
        }
        blnAux = blnAux && !blnAccion;
      }
    }
    if(blnValidacionGeneral){
      blnResultadoValidacion.value = blnAux;
    }
    this.calcularTotalesModal(this.empaques);
  }

  validarObjeto(elementId:string,blnAccion:boolean,mensaje:string=null,mensajeOriginal:string=null,blnValidacionGeneral:boolean=false){
    //console.log(elementId);
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

  calcularTotalesModal(empaques:OrdenCompraEmpaquetado[]){
    let _totalCantidadMasAdicional:number = 0;
    let _totalPesoJavas:number = 0;
    let _totalPesoNoIngreso:number=0;
    let _totalPesoRecepcion:number =0;
    let _totalPesoMerma1:number = 0;
    let _totalPesoMerma2:number = 0;

    if(this.ordenCompra.detalle[this.nroDetalle-1].cantidadFruta != null && this.ordenCompra.detalle[this.nroDetalle-1].cantidadFruta != undefined ){
      _totalCantidadMasAdicional += Number(this.ordenCompra.detalle[this.nroDetalle-1].cantidadFruta);
    }
    if(this.ordenCompra.detalle[this.nroDetalle-1].cantidadAdicional != null && this.ordenCompra.detalle[this.nroDetalle-1].cantidadAdicional != undefined ){
      _totalCantidadMasAdicional += Number(this.ordenCompra.detalle[this.nroDetalle-1].cantidadAdicional );
    }

    if(this.estadoOrdenCompra == 1){
      for(let i=0;i<empaques.length; i++){
        if(!(empaques[i].pesoCompra == null || empaques[i].pesoCompra == undefined)){
          _totalPesoJavas += Number(empaques[i].pesoCompra);
        }
      }
    }else {
      for(let i=0;i<empaques.length; i++){
        if(!(empaques[i].pesoCompra == null || empaques[i].pesoCompra == undefined)){
          _totalPesoJavas += Number(empaques[i].pesoCompra);
        }
        if(!(empaques[i].pesoRecepcion == null || empaques[i].pesoRecepcion == undefined)){
          _totalPesoRecepcion += Number(empaques[i].pesoRecepcion);
        }
        if(!(empaques[i].motivoNoIngreso == null || empaques[i].motivoNoIngreso == undefined)){
          _totalPesoNoIngreso += Number(empaques[i].pesoCompra);
        }
        if(!(empaques[i].pesoMerma1 == null || empaques[i].pesoMerma1 == undefined)){
          _totalPesoMerma1 += Number(empaques[i].pesoMerma1);
        }
        if(!(empaques[i].pesoMerma2 == null || empaques[i].pesoMerma2 == undefined)){
          _totalPesoMerma2 += Number(empaques[i].pesoMerma2);
        }
      }
    }
    this.totalCantidadMasAdicional=_totalCantidadMasAdicional;
    this.totalPesoJavas=_totalPesoJavas;
    this.totalPesoNoIngreso=_totalPesoNoIngreso;
    this.totalPesoRecepcion=_totalPesoRecepcion;
    this.totalPesoMerma1=_totalPesoMerma1;
    this.totalPesoMerma2=_totalPesoMerma2;

    if (this.estadoOrdenCompra==1) {
      this.totalDiferencia = this.totalCantidadMasAdicional - this.totalPesoJavas;
    } else {
      this.totalDiferencia = this.totalPesoJavas - this.totalPesoNoIngreso -this.totalPesoRecepcion -this.totalPesoMerma1 -this.totalPesoMerma2;
    }
  }

  saltarSiguienteElemento(event){
    let elementId:string = (event.target as Element).id;
    let nombreElemennto:string = elementId.split("_")[0];
    let nroElemento:string = elementId.split("_")[1];

    if (event.which == '13') {
      event.preventDefault();
    }

    //Cabecera
    if(nombreElemennto == "proveedorForm"){
      document.getElementById("monedaForm").focus();
      return;
    }
    if(nombreElemennto == "monedaForm"){
      document.getElementById("tipoCompraForm").focus();
      return;
    }
    if(nombreElemennto == "tipoCompraForm"){
      document.getElementById("tipoOrdenForm").focus();
      return;
    }
    if(nombreElemennto == "tipoOrdenForm"){
      document.getElementById("lugarCompraForm").focus();
      return;
    }
    if(nombreElemennto == "lugarCompraForm"){
      document.getElementById("fechaCompraForm").focus();
      return;
    }
    if(nombreElemennto == "fechaCompraForm"){
      document.getElementById("horaCompraForm").focus();
      return;
    }
    if(nombreElemennto == "horaCompraForm"){
      document.getElementById("btnAgregar").focus();
      return;
    }
    if(nombreElemennto == "btnAgregar"){
      if(this.ordenCompra.detalle.length > 0){
        document.getElementById("fruta_1").focus();
      }
      return;
    }
    //Fruta
    if(nombreElemennto == "fruta"){
      document.getElementById("frutaVariedad"+"_"+nroElemento).focus();
      return;
    }
    if(nombreElemennto == "frutaVariedad"){
      document.getElementById("frutaCategoria"+"_"+nroElemento).focus();
      this.limpiarValor();
      return;
    }
    if(nombreElemennto == "frutaCategoria"){
      document.getElementById("frutaProcedencia"+"_"+nroElemento).focus();
      this.limpiarValor();
      return;
    }
    if(nombreElemennto == "frutaProcedencia"){
      document.getElementById("frutaTamanio"+"_"+nroElemento).focus();
      return;
    }
    if(nombreElemennto == "frutaTamanio"){
      document.getElementById("frutaEstado"+"_"+nroElemento).focus();
      return;
    }
    if(nombreElemennto == "frutaEstado"){
      document.getElementById("frutaObservacion"+"_"+nroElemento).focus();
      return;
    }
    if(nombreElemennto == "frutaObservacion"){
      //document.getElementById("unidadMedida"+"_"+nroElemento).focus();
      document.getElementById("precioUnitario"+"_"+nroElemento).focus();
      return;
    }
    //Compra
    if(nombreElemennto == "unidadMedida"){
      document.getElementById("precioUnitario"+"_"+nroElemento).focus();
      return;
    }
    if(nombreElemennto == "precioUnitario"){
      document.getElementById("cantidadCompra"+"_"+nroElemento).focus();
      return;
    }
    if(nombreElemennto == "cantidadCompra"){
      document.getElementById("adicional"+"_"+nroElemento).focus();
      return;
    }
    if(nombreElemennto == "adicional"){
      document.getElementById("descuento"+"_"+nroElemento).focus();
      return;
    }
    if(nombreElemennto == "descuento"){
      document.getElementById("formaPago"+"_"+nroElemento).focus();
      return;
    }
    if(nombreElemennto == "formaPago"){
      document.getElementById("fechaPago"+"_"+nroElemento).focus();
      return;
    }
    if(nombreElemennto == "fechaPago"){
      document.getElementById("responsablePago"+"_"+nroElemento).focus();
      return;
    }
    if(nombreElemennto == "responsablePago"){
      if(Number(this.ordenCompra.detalle[+nroElemento-1].cantidadAdicional)>0){
        document.getElementById("tipoAdicional"+"_"+nroElemento).focus();
      }else {
        document.getElementById("nroJavas"+"_"+nroElemento).focus();
      }
      return;
    }
    if(nombreElemennto == "tipoAdicional"){
      document.getElementById("nroJavas"+"_"+nroElemento).focus();
      return;
    }
    //Javas compradas
    if(nombreElemennto == "nroJavas"){
      document.getElementById("indIndividualizarEmbalaje"+"_"+nroElemento).focus();
      return;
    }
    if(nombreElemennto == "indIndividualizarEmbalaje"){
      document.getElementById("modalNroJavas"+"_"+nroElemento).focus();
      return;
    }
    if(nombreElemennto == "modalNroJavas"){
      document.getElementById("fotoJavasCompradas"+"_"+nroElemento).focus();
      return;
    }
    if(nombreElemennto == "fotoJavasCompradas"){
      if(this.ordenCompra.detalle.length  > Number(nroElemento)){
        let aux:number = Number(nroElemento)+1;
        document.getElementById("fruta"+"_"+aux).focus();
      } else {
        document.getElementById("btnGuardar").focus();
      }
      return;
    }
    //Recepcion
    if(nombreElemennto == "fechaArribo"){
      document.getElementById("horaArribo"+"_"+nroElemento).focus();
    }
    if(nombreElemennto == "horaArribo"){
      document.getElementById("indMerma"+"_"+nroElemento).focus();
    }
    if(nombreElemennto == "indMerma"){
      document.getElementById("modalRecepcion"+"_"+nroElemento).focus();
    }
    if(nombreElemennto == "modalRecepcion"){
      document.getElementById("fotoRecepcion"+"_"+nroElemento).focus();
    }
    if(nombreElemennto == "fotoRecepcion"){
      if(this.ordenCompra.detalle.length  > Number(nroElemento)){
        let aux:number = Number(nroElemento)+1;
        document.getElementById("fechaArribo"+"_"+aux).focus();
      } else {
        document.getElementById("btnGuardar").focus();
      }
      return;
    }
    if(nombreElemennto == "registroFinalizado"){
      if(this.ordenCompra.detalle[this.nroDetalle-1].indIndividualizar){
        if(this.estadoOrdenCompra ==1){
          document.getElementById("tipoEmpaque_1").focus();
        } else {
          document.getElementById("empaqueMotivoNoIngreso_1").focus();
        }
      }
      return;
    }
    if(nombreElemennto == "tipoEmpaque"){
      document.getElementById("empaquePeso"+"_"+nroElemento).focus();
      return;
    }
    if(nombreElemennto == "empaquePeso"){
      if(this.empaques.length > Number(nroElemento)){
        let aux:number = Number(nroElemento)+1;
        document.getElementById("tipoEmpaque"+"_"+aux).focus();
      }else{
        document.getElementById("registroFinalizado").focus();
      }
      return;
    }
    if(nombreElemennto == "empaqueMotivoNoIngreso"){
      if(this.empaques[+nroElemento-1].motivoNoIngreso != undefined && this.empaques[+nroElemento-1].motivoNoIngreso != null){
        if(this.empaques.length > Number(nroElemento)){
          let aux:number = Number(nroElemento)+1;
          document.getElementById("empaqueMotivoNoIngreso"+"_"+aux).focus();
        } else {
          document.getElementById("btnCerrarModal").focus();
        }
      }else {
        document.getElementById("empaquePesoRecepcion"+"_"+nroElemento).focus();
      }
      return;
    }
    if(nombreElemennto == "empaquePesoRecepcion"){
      if(this.indMerma  == true){
        document.getElementById("empaqueTipoMerma1"+"_"+nroElemento).focus();
      } else {
          document.getElementById("empaqueAlmacen"+"_"+nroElemento).focus();
      }
      return;
    }
    if(nombreElemennto == "empaqueTipoMerma1"){
      if(this.empaques[+nroElemento-1].categoriaMerma1 == undefined || this.empaques[+nroElemento-1].categoriaMerma1 == null){
        document.getElementById("empaqueAlmacen"+"_"+nroElemento).focus();
      }else {
        document.getElementById("empaquePesoMerma1"+"_"+nroElemento).focus();
      }
      return;
    }
    if(nombreElemennto == "empaquePesoMerma1"){
      document.getElementById("empaqueTipoMerma2"+"_"+nroElemento).focus();
      return;
    }
    if(nombreElemennto == "empaqueTipoMerma2"){
      if(this.empaques[+nroElemento-1].categoriaMerma2 == undefined || this.empaques[+nroElemento-1].categoriaMerma2 == null){
        document.getElementById("empaqueAlmacen"+"_"+nroElemento).focus();
      }else{
        document.getElementById("empaquePesoMerma2"+"_"+nroElemento).focus();
      }
      return;
    }
    if(nombreElemennto == "empaquePesoMerma2"){
      document.getElementById("empaqueAlmacen" +"_"+nroElemento).focus();
      return;
    }
    if(nombreElemennto == "empaqueAlmacen"){
      if(this.empaques.length > Number(nroElemento)){
        let aux:number = Number(nroElemento)+1;
        document.getElementById("empaqueMotivoNoIngreso"+"_"+aux).focus();
      }else{
          document.getElementById("btnCerrarModal").focus();
      }
      return;
    }
  }

}
