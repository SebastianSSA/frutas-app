import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { TablaAuxiliarDetalle } from '../auxiliares/tabla-auxiliar/models/tabla-auxiliar-detalle';
import { TablaAuxiliarService } from '../auxiliares/tabla-auxiliar/tabla-auxiliar.service';
import { FrutaVariedad } from '../maestros/fruta-variedad/fruta-variedad';
import { FrutaVariedadService } from '../maestros/fruta-variedad/fruta-variedad.service';
import { Fruta } from '../maestros/fruta/fruta';
import { FrutaService } from '../maestros/fruta/fruta.service';
import { Producto } from './models/producto';
import { ProductoService } from './producto.service';
import { CambioCategoria } from './models/cambio-categoria';
import swal from 'sweetalert2';
import { DatePipe, DOCUMENT } from '@angular/common';
import { AuthService } from '../usuarios/auth.service';
import { CambioCategoriaService } from './cambio-categoria.service';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-producto',
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.css']
})
export class ProductoComponent implements OnInit {
  titulo:string = "Stock Productos";
  
  frutaFiltro:Fruta = undefined;
  variedadFrutaFiltro:FrutaVariedad = undefined;
  categoriaFiltro:TablaAuxiliarDetalle = undefined;

  frutas:Observable<Fruta[]>;
  variedadFrutas:Observable<FrutaVariedad[]>;
  categoriasFruta:TablaAuxiliarDetalle[];
  categoriasFrutaCambioCategoria: TablaAuxiliarDetalle[];

  autoFruta:string;
  autoFrutaVariedad:string;

  columnaOrdenada: string = 'id';
  orden: number = 0;
  enlacePaginador:string = 'producto/page';
  paginador: any;
  page:number;

  productos:Producto[];

  cambioCategoria:CambioCategoria;
  blnGuardarCambioCategoria:boolean = false;

  constructor(private productoService : ProductoService,
              private tablaAuxiliarService: TablaAuxiliarService,
              private frutaService: FrutaService,
              private frutaVariedadService: FrutaVariedadService,
              private cambioCategoriaService: CambioCategoriaService,
              private router: Router,
              public _authService: AuthService,
              private activatedRoute: ActivatedRoute,
              @Inject(DOCUMENT) document) { }

  ngOnInit() {
    this.tablaAuxiliarService.getComboBox("CATFRU").subscribe(aux => {
      aux = aux.filter(c => c.tablaAuxiliarDetalleId.id != 5);
      this.categoriasFruta = aux;
    });
    this.activatedRoute.paramMap.subscribe(params => {
      this.page = +params.get('page'); ;
      this.filtrar();
    });    
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

  compararAuxDet(o1:TablaAuxiliarDetalle, o2:TablaAuxiliarDetalle):boolean {
    if (o1 === undefined && o2 === undefined){
      return true;
    }
    return o1 === null || o2 === null || o1 === undefined || o2 === undefined? false: o1.tablaAuxiliarDetalleId.id===o2.tablaAuxiliarDetalleId.id;
  }
  
  filtrar() {
    this.productoService.getProductos(
      this.frutaFiltro != undefined?this.frutaFiltro.id:undefined,
      this.variedadFrutaFiltro != undefined? this.variedadFrutaFiltro.id:undefined,
      this.categoriaFiltro != undefined? this.categoriaFiltro.tablaAuxiliarDetalleId.id: undefined,
      this.columnaOrdenada,this.orden,this.page
    )
    .subscribe(response => {
      this.productos = response.content as Producto[];
      this.paginador = response;
    });
  }

    //0:excel,1:pdf
  generarReporte(idTipoReporte:number){
    this.productoService.getAllProductos(
      this.frutaFiltro != undefined?this.frutaFiltro.id:undefined,
      this.variedadFrutaFiltro != undefined? this.variedadFrutaFiltro.id:undefined,
      this.categoriaFiltro != undefined? this.categoriaFiltro.tablaAuxiliarDetalleId.id: undefined,'id'
    ).subscribe(response => {
      let productos :Producto[] = response;
      switch (idTipoReporte) {
        case 0: 
          this.generarExcel(productos);
          break;
        case 1:
          this.generarPdf(productos);
          break;
      };
    });
  }

  generarExcel(productos:Producto[]){

    //Excel Title, Header, Data
    const title = 'Reporte de Stock de Productos';

    const header =["Nro","Fruta","Variedad","Categoria","Unidad","Stock",
                   "Fecha Ultima Compra","Fecha Ultima Venta"];                                  

    let datePipe = new DatePipe('es');
    let fecha:Date = new Date();
    let fechaCreacion = 'FECHA DE GENERACION : '+ datePipe.transform(fecha, 'EEEE dd \'de\' LLLL \'del\' yyyy HH:mm:ss').replace("'","").toUpperCase();                   

    let data = [];

    productos.forEach(pro => {
        let row = [];
        row.push(pro.nro);
        row.push(pro.frutaVariedad.fruta.nombre);
        row.push(pro.frutaVariedad.descripcion);
        row.push(pro.categoria.nombre);
        row.push("KG");
        row.push(Number(pro.stock.toFixed(2)));
        row.push(pro.fechaUltimaCompra?datePipe.transform(pro.fechaUltimaCompra,'dd/MM/yyyy  HH:mm:ss'):'');      
        row.push(pro.fechaUltimaVenta?datePipe.transform(pro.fechaUltimaVenta,'dd/MM/yyyy  HH:mm:ss'):''); 
        data.push(row);
    });
    
    //Create workbook and worksheet
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet('Stock de Productos');
    //Add Row and formatting
    let titleRow = worksheet.addRow([title]);
    titleRow.font = { size: 16, bold: true }
    worksheet.addRow([]);
    worksheet.addRow([fechaCreacion]);

    //Blank Row 
    worksheet.addRow([]);

    //Add Header Row
    let headerRow = worksheet.addRow(header);
    // Cell Style : Fill and Border
    headerRow.eachCell((cell, number) => {
      let color= 'FFFFFFFF';
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: color}
      }
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    })
    // Add Data
    data.forEach(d => {
      worksheet.addRow(d);
    }
    );

    //Generate Excel File with given name
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      fs.saveAs(blob, 'Reporte de Stock de Productos.xlsx');
    })    
  }

  generarPdf(productos:Producto[]){
    let datePipe = new DatePipe('es');
    let fecha:Date = new Date();
    let fechaCreacion = 'FECHA DE GENERACION : '+ datePipe.transform(fecha, 'EEEE dd \'de\' LLLL \'del\' yyyy HH:mm:ss').replace("'","").toUpperCase();
        
    const header =["Nro","Fruta","Variedad","Categoria","Unidad","Stock",
                   "Fecha Ultima Compra","Fecha Ultima Venta"];

    let data = [];

    productos.forEach(pro => {
        let row = [];
        row.push(pro.nro);
        row.push(pro.frutaVariedad.fruta.nombre);
        row.push(pro.frutaVariedad.descripcion);
        row.push(pro.categoria.nombre);        
        row.push("KG");
        row.push(Number(pro.stock.toFixed(2)));
        let fechaUltimaCompra:string = pro.fechaUltimaCompra?datePipe.transform(pro.fechaUltimaCompra,'dd MMM yyyy'):'';
        fechaUltimaCompra = fechaUltimaCompra.replace('.','').toUpperCase();
        row.push(fechaUltimaCompra); 
        let fechaUltimaVenta:string = pro.fechaUltimaVenta?datePipe.transform(pro.fechaUltimaVenta,'dd MMM yyyy'):'';
        fechaUltimaVenta = fechaUltimaVenta.replace('.','').toUpperCase();           
        row.push(fechaUltimaVenta); 
        data.push(row);
    });

    let Xwidths = [];
    header.forEach(hed => {
      Xwidths.push('auto');
    });
    //Xwidths= [16.03,25.17,23.66,19.96,19.83,11.13,8.42,11.22,13.92,18.27,12.38,8.85,14.37,29.91,20.07];

    let Xheader = []
    header.forEach(element => {
      Xheader.push({ text: element, bold: true,fillColor: '#A9D08E',color: '#FFFFFF'});
    });

    data.unshift(Xheader);

    const documentDefinition = {
      pageSize: 'A4',
      // pageOrientation: 'landscape',
      defaultStyle: {
        fontSize: 10
      },      
      content: [
        {
          text: 'Reporte de Stock de Productos',
          bold: true,
          fontSize: 20,
          alignment: 'center',
          margin: [0, 0, 0, 20]
        },
        {
          text: fechaCreacion,
          alignment: 'left',
          margin: [0, 0, 0, 10]
        },                       
        {
          table: {
            // headers are automatically repeated if the table spans over multiple pages
            // you can declare how many rows should be treated as headers
            headerRows: 1, 
            dontBreakRows: true,
            widths: Xwidths,
            body: data,
            fontSize: 8
          },    
        }
      ]
     };
    pdfMake.createPdf(documentDefinition).open();
  }

  ordenar(columna: string) {
    this.columnaOrdenada = columna;
    this.orden = 1 - this.orden;

    this.filtrar();
  }

  validarFruta(event:any):void{
    if(typeof(this.frutaFiltro) == "string" || typeof(this.frutaFiltro) == "undefined"){
      this.frutaFiltro = undefined;
      this.variedadFrutaFiltro = undefined;
      event.target.placeholder = "FRUTA INV.";
    }
    this.filtrar();
  }

  validarFrutaVariedad(event:any){
    if(typeof(this.variedadFrutaFiltro) == "string" || typeof(this.variedadFrutaFiltro) == "undefined"){
      this.variedadFrutaFiltro = undefined;
      event.target.placeholder = "FRUTA VAR. INV.";
    }  
    this.filtrar(); 
  }

  abrirModal(producto:Producto){
    this.blnGuardarCambioCategoria = false;
    let productoCopia:Producto = Object.assign({}, producto);
    let productoCopia2:Producto = Object.assign({}, producto);

    this.cambioCategoria = new CambioCategoria;
    this.cambioCategoria.id = undefined;
    this.cambioCategoria.productoInicio = productoCopia;
    this.cambioCategoria.productoFin = new Producto;
    this.cambioCategoria.productoFin.frutaVariedad = productoCopia2.frutaVariedad;  
    this.cambioCategoria.cantidad = 0.0;
    this.cambioCategoria.indDescarte = 0;

    
    this.categoriasFrutaCambioCategoria = this.categoriasFruta.filter(
          c => c.tablaAuxiliarDetalleId.id == 0 || c.tablaAuxiliarDetalleId.id >
          this.cambioCategoria.productoInicio.categoria.tablaAuxiliarDetalleId.id);
  }

  cerrarModal(event:any, type: number){
   if ((type == 1 && event.keyCode == 27) || type == 2) {
    let elementId = "categoriaFrutaFin";    
    document.getElementById(elementId).classList.remove('focusRed');
    document.getElementById(elementId).classList.remove('focusInput');
    elementId = "stockCambioCategoria";   
    document.getElementById(elementId).classList.remove('focusRed');
    document.getElementById(elementId).classList.remove('focusInput');         
    this.filtrar(); 
   }
  }

  modificarIndDescarte(){
    this.cambioCategoria.blnDescarte = !this.cambioCategoria.blnDescarte;
    this.cambioCategoria.indDescarte = this.cambioCategoria.blnDescarte?1:0; 
    if(this.cambioCategoria.blnDescarte){
      this.cambioCategoria.productoFin.id = undefined;
      this.cambioCategoria.productoFin.categoria = undefined;
      this.cambioCategoria.productoFin.stock = 0;
    } else {
      let productoCopia:Producto = Object.assign({}, this.cambioCategoria.productoInicio);
      this.cambioCategoria.productoFin = new Producto;
      this.cambioCategoria.productoFin.frutaVariedad = productoCopia.frutaVariedad;       
    }
    this.validarCategoriaProductoFin();
  }

  buscarProducto(){
    this.validarCategoriaProductoFin();
    if(this.cambioCategoria.productoFin.categoria == undefined){
      let productoCopia:Producto = Object.assign({}, this.cambioCategoria.productoInicio);
      this.cambioCategoria.productoFin = new Producto;
      this.cambioCategoria.productoFin.frutaVariedad = productoCopia.frutaVariedad;
      return;      
    }
    this.productoService.getProductoPorVariedadAndCategoria(
      this.cambioCategoria.productoFin.frutaVariedad.id,
      this.cambioCategoria.productoFin.categoria.tablaAuxiliarDetalleId.id).subscribe(
        pro => {
            this.cambioCategoria.productoFin = pro;
        }, err => {
          console.error(err.error.mensaje);
          //swal.fire('Error','Error al obtener el producto', 'error');
        }
      );
  }

  validarNuevoStock(){
    let elementId = "stockCambioCategoria";
    if(!(this.cambioCategoria.cantidad>0 && this.cambioCategoria.cantidad<= this.cambioCategoria.productoInicio.stock)){
      document.getElementById(elementId).classList.add('focusRed');
      this.cambioCategoria.cantidad = undefined;
      document.getElementById(elementId).classList.add('focusInput');      
      (document.getElementById(elementId) as HTMLInputElement).placeholder = "0<STC<"+Number(this.cambioCategoria.productoInicio.stock.toFixed(2));      
      document.getElementById(elementId).focus();
    }else {
      document.getElementById(elementId).classList.remove('focusRed');
      document.getElementById(elementId).classList.remove('focusInput');
    }     
  }

  validarCategoriaProductoFin(){
    let elementId = "categoriaFrutaFin";    
    if(!this.cambioCategoria.blnDescarte && (this.cambioCategoria.productoFin.categoria == undefined ||
        this.cambioCategoria.productoFin.categoria.tablaAuxiliarDetalleId.id == this.cambioCategoria.productoInicio.categoria.tablaAuxiliarDetalleId.id)){
      document.getElementById(elementId).classList.add('focusRed');
      this.cambioCategoria.productoFin.categoria = undefined; 
      document.getElementById(elementId).focus();    
    }else {
      document.getElementById(elementId).classList.remove('focusRed');

      document.getElementById(elementId).classList.remove('focusInput');
    }
  }

  guardarCambioCategoria(){
    if(this.blnGuardarCambioCategoria){
      return;
    }
    this.blnGuardarCambioCategoria = true;

    this.validarNuevoStock();
    this.validarCategoriaProductoFin();

    let errores:any = undefined;
    errores = document.getElementsByClassName("focusRed");
    if(errores.length > 0){
      swal.fire('Error al guardar', 'Se han encontrado '+ errores.length +
                ' error(es) en la orden de venta', 'error');
      this.blnGuardarCambioCategoria = false;
      return;
    }
    this.cambioCategoria.idUsuarioCrea = this._authService.usuario.id
    this.cambioCategoria.fechaCrea = new Date();

    //Guardar
    let cambioCategoriaGuardar:CambioCategoria = Object.assign({}, this.cambioCategoria);
    if(cambioCategoriaGuardar.blnDescarte){
      cambioCategoriaGuardar.productoFin = undefined;
    }

    this.cambioCategoriaService.create(cambioCategoriaGuardar).subscribe(
      cam => {
        //this.router.navigate(['/']);
        this.blnGuardarCambioCategoria = false;
        this.cambioCategoria.id = cam.id;
        swal.fire('Guardado exitoso','se guardaron los datos', 'success');
      },
      err => {
        let errores = err.error.errors as string[];
        console.error('Codigo del error: ' + err.status);
        console.error(err.error.errors);
        this.blnGuardarCambioCategoria = false;
        swal.fire('Error al guardar','Error al guardar', 'error');
      }
    );
  }
}
