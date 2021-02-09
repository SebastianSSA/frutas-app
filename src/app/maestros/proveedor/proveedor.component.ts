import { Component, OnInit } from '@angular/core';
import { Proveedor } from './proveedor';
import { ProveedorService } from './proveedor.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../usuarios/auth.service';
import { TablaAuxiliarDetalle } from 'src/app/auxiliares/tabla-auxiliar/models/tabla-auxiliar-detalle';
import { Observable } from 'rxjs';
import { TablaAuxiliarService } from 'src/app/auxiliares/tabla-auxiliar/tabla-auxiliar.service';

@Component({
  selector: 'app-proveedor',
  templateUrl: './proveedor.component.html',
  styleUrls: ['./proveedor.component.css']
})
export class ProveedorComponent implements OnInit {
  titulo:string = 'Proveedor';
  nicknameFiltro: string = '';
  columnaOrdenada: string = 'id';
  orden: number = 0;
  enlacePaginador:string = 'proveedor/page';
  paginador: any;

  idProveedor:number = undefined;
  proveedores: Proveedor[];
  proveedorSeleccionado: Proveedor = new Proveedor();
  errores: string[];
  //editable: number = -1;

  tiposProveedor: Observable<TablaAuxiliarDetalle[]>;
  autoTipoProveedor: string;

  constructor(private proveedorService: ProveedorService,
              private tablaAuxiliarService: TablaAuxiliarService,
              private router: Router,
              public _authService: AuthService,
              private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.enlacePaginador = 'proveedor/page/'+this.nicknameFiltro+'/'+this.columnaOrdenada+'/'+this.orden+'/';
    this.activatedRoute.paramMap.subscribe(params => {
      let nickname:string = this.nicknameFiltro;
      let columnSort:string = this.columnaOrdenada
      let order:number = this.orden
      let page:number = +params.get('page');

      this.filtrar(page);
    });
  }

  filtrar(page:number = 0){
    this.proveedorService.getProveedores(
      this.nicknameFiltro,
      this.columnaOrdenada,
      this.orden,
      page
    )
    .subscribe(response => {
      this.proveedores = response.content as Proveedor[];
      this.paginador = response;
    });    
  }

  guardar(proveedor: Proveedor): void {
    if (proveedor.id === -1) {
      this.crear(proveedor);
    } else {
      this.actualizar(proveedor);
    }
  }

  crear(proveedor: Proveedor): void {
    this.proveedorService.create(proveedor).subscribe(
      proveedor => {
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        this.router.onSameUrlNavigation = 'reload';
        this.router.navigate(['/proveedor']);
      },
      err => {
        this.errores = err.error.errors as string[];
        console.error('Codigo del error: ' + err.status);
        console.error(err.error.errors);
      }
    );
  }

  actualizar(proveedor: Proveedor): void {
    this.proveedorService.update(proveedor).subscribe(
      json => {
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        this.router.onSameUrlNavigation = 'reload';
        this.router.navigate(['/proveedor']);
      },
      err => {
        this.errores = err.error.errors as string[];
        console.error('Codigo del error: ' + err.status);
        console.error(err.error.errors);
      }
    );
  }

  nuevo():void{
    let nuevoProveedor:Proveedor = new Proveedor
    nuevoProveedor.id = -1;
    this.idProveedor = -1;
    this.proveedores.splice(0,0,nuevoProveedor);
  }

  modificar(id:number):void{
    this.idProveedor = id;  
  }

  cancelar():void{
    this.idProveedor=undefined;
    this.filtrar();
  }

  cambiarValorTipoProveedor(event): void {
    if (event.keyCode != 38 && event.keyCode != 40) {
      this.autoTipoProveedor = event.target.value;
      this.tiposProveedor = this.autoTipoProveedor ? this._filterTipoProveedor(this.autoTipoProveedor): new Observable<TablaAuxiliarDetalle[]>();
    }
  }

  private _filterTipoProveedor(value: string): Observable<TablaAuxiliarDetalle[]> {
    const filterValue = value.toUpperCase();
    return this.tablaAuxiliarService.autocompleteList("TIPPRV", filterValue);
  }

  mostrarNombreTipoProveedor(tipoProveedor?: TablaAuxiliarDetalle):string | undefined {
    return tipoProveedor?tipoProveedor.nombre:undefined;
  }

}
