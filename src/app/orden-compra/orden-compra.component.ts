import { Component, OnInit } from '@angular/core';
import { OrdenCompra } from './models/orden-compra';
import { OrdenCompraService } from './orden-compra.service';
import { AuthService } from '../usuarios/auth.service';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Proveedor } from '../maestros/proveedor/proveedor';
import { ProveedorService } from '../maestros/proveedor/proveedor.service';
import { TablaAuxiliarDetalle } from '../auxiliares/tabla-auxiliar/models/tabla-auxiliar-detalle';
import { TablaAuxiliarService } from '../auxiliares/tabla-auxiliar/tabla-auxiliar.service';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import { DatePipe } from '@angular/common';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = pdfFonts.pdfMake.vfs;  

@Component({
  selector: 'app-orden-compra',
  templateUrl: './orden-compra.component.html',
  styleUrls: ['./orden-compra.component.css']
})
export class OrdenCompraComponent implements OnInit {

  titulo:string = 'Orden de Compra';
  touchTime:number = 0;

  nroOrdenFiltro:     string ='';
  fechaDesdeFiltro:   Date = new Date(new Date().setDate(new Date().getDate() - 30));
  fechaHastaFiltro:   Date = new Date(new Date().setDate(new Date().getDate() + 1));
  compradorFiltro:    string = undefined;
  proveedorFiltro:    Proveedor = undefined;
  tipoCompraFiltro:   TablaAuxiliarDetalle = undefined;
  tipoOrdenFiltro:    TablaAuxiliarDetalle = undefined;
  estadoOrdenFiltro:  TablaAuxiliarDetalle = undefined;

  usuarios: String[];
  proveedores: Proveedor[];
  tiposProducto: TablaAuxiliarDetalle[];
  tiposCompra: TablaAuxiliarDetalle[];
  tiposEstadoCompra: TablaAuxiliarDetalle[];

  columnaOrdenada: string = 'id';
  orden: number = 1;
  enlacePaginador:string = 'orden_compra/page';
  rutaPaginada = '';
  paginador: any;

  ordenes: OrdenCompra[];
  ordenSeleccionada: OrdenCompra;

  constructor(
    private ordenCompraService: OrdenCompraService,
    private tablaAuxiliarService: TablaAuxiliarService,
    private proveedorService: ProveedorService,
    public _authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute){ }

  ngOnInit(): void {
    this._authService.getComboBox().subscribe(usu => this.usuarios = usu);
    this.proveedorService.getComboBox().subscribe(pro => this.proveedores = pro);
    this.tablaAuxiliarService.getComboBox("TIPOFE").subscribe(aux => {
      aux = aux.filter(prod => prod.nombre!='FLORES');
      this.tiposProducto = aux
    });
    this.tablaAuxiliarService.getComboBox("TIPOCO").subscribe(aux => this.tiposCompra = aux);
    this.tablaAuxiliarService.getComboBox("ESTOCO").subscribe(aux => this.tiposEstadoCompra = aux);

    this.activatedRoute.paramMap.subscribe(params => {
      let page:number = + params.get('page');
      this.filtrar(page);
    });
  }

  compararUsu(u1:string, u2:string):boolean{
    if (u1 === undefined && u2 === undefined){
      return true;
    }

    return u1 === null || u2 === null || u1 === undefined || u2 === undefined? false: u1===u2;
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

  filtrar(page:number = 0) {
    this.ordenCompraService.getOrdenes(
      this.nroOrdenFiltro,
      this.getFormattedDate(this.fechaDesdeFiltro),
      this.getFormattedDate(this.fechaHastaFiltro), this.compradorFiltro,
      (this.proveedorFiltro != undefined)?this.proveedorFiltro.id:undefined,
      (this.tipoCompraFiltro != undefined)?this.tipoCompraFiltro.tablaAuxiliarDetalleId.id :undefined,
      (this.tipoOrdenFiltro != undefined)?this.tipoOrdenFiltro.tablaAuxiliarDetalleId.id :undefined,
      (this.estadoOrdenFiltro != undefined)?this.estadoOrdenFiltro.tablaAuxiliarDetalleId.id :undefined,
      this.columnaOrdenada,this.orden,page)
    .subscribe(response => {
      this.ordenes = response.content as OrdenCompra[];
      this.ordenes.forEach(ord => {
        ord.total = Number(Number(ord.total).toFixed(2));
      });
      this.paginador = response;
    });
  }

  //0:excel,1:pdf
  generarReporte(idTipoReporte:number){
    this.ordenCompraService.getAllOrdenes(
      this.nroOrdenFiltro,
      this.getFormattedDate(this.fechaDesdeFiltro),
      this.getFormattedDate(this.fechaHastaFiltro), this.compradorFiltro,
      (this.proveedorFiltro != undefined)?this.proveedorFiltro.id:undefined,
      (this.tipoCompraFiltro != undefined)?this.tipoCompraFiltro.tablaAuxiliarDetalleId.id :undefined,
      (this.tipoOrdenFiltro != undefined)?this.tipoOrdenFiltro.tablaAuxiliarDetalleId.id :undefined,
      (this.estadoOrdenFiltro != undefined)?this.estadoOrdenFiltro.tablaAuxiliarDetalleId.id :undefined
    ).subscribe(response => {
      let ordenes:OrdenCompra[] = response;
      switch (idTipoReporte) {
        case 0: 
          this.generarExcel(ordenes);
          break;
        case 1:
          this.generarPdf(ordenes);
          break;
      };
    });
  }

  generarExcel(ordenes:OrdenCompra[]){

    //Excel Title, Header, Data
    const title = 'Reporte de Ordenes de Compra';

    const header =["Nro Liq. Compra","Fecha de Compra","Producto","Variedad","Categoria","Peso",
                   "Unidad Compra","Moneda","Precio unit.","Adicional","Descuento Tot.","Precio Antes de IGV",
                   "IGV","Precio Total","Proveedor","Procedencia","Comprador","Tipo Docuemnto","Forma de Pago",
                   "Fecha de Pago","Responsable Pago"];

    let datePipe = new DatePipe('es');
    let fecha:Date = new Date();
    let fechaCreacion = 'FECHA DE GENERACION : '+ datePipe.transform(fecha, 'EEEE dd \'de\' LLLL \'del\' yyyy HH:mm:ss').replace("'","").toUpperCase();                   

    let data = [];

    ordenes.forEach(ord => {
      ord.detalle.forEach(det =>{
        let row = [];
        row.push(ord.nroOrden);
        row.push(datePipe.transform(ord.fechaCompra,'dd/MM/yyyy  HH:mm:ss'));
        row.push(det.fruta.nombre);
        row.push(det.frutaVariedad.descripcion);
        row.push(det.categoriaFruta.nombre);
        row.push(Number(det.cantidadFruta.toFixed(2)));
        row.push(det.unidadCompra.nombre);
        row.push(ord.moneda.nombre);
        row.push(Number(det.precioUnitario.toFixed(2)));
        row.push(Number(det.cantidadAdicional.toFixed(2)));
        let dcto = det.descuento?det.descuento:0;
        Number(dcto.toFixed(2));
        row.push(dcto);
        let precioDespuesDescuento = det.precioTotal-dcto;
        row.push(Number(precioDespuesDescuento.toFixed(2)));
        let igv = det.precioTotalIgv - precioDespuesDescuento;
        row.push(Number(igv.toFixed(2)));
        row.push(Number(det.precioTotalIgv.toFixed(2)));
        row.push(ord.proveedor.nickname);
        row.push(ord.lugarCompra);
        row.push(ord.comprador);
        row.push(ord.tipoOrden.nombre);
        row.push(det.formaPago.nombre);
        row.push(det.formaPago.nombre!="CONTADO"?det.fechaPago:'');
        row.push(det.formaPago.nombre!="CONTADO"?det.responsablePago:'');
        data.push(row);
      });
    });
    
    //Create workbook and worksheet
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet('Ordenes de Compra');
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
      if(number>17){
        color = 'FFFFC000';
      }
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
      
      fs.saveAs(blob, 'Reporte de Ordenes de Compra.xlsx');
    })    
  }

  generarPdf(ordenes:OrdenCompra[]){
    let datePipe = new DatePipe('es');
    let fecha:Date = new Date();
    let fechaCreacion = 'FECHA DE GENERACION : '+ datePipe.transform(fecha, 'EEEE dd \'de\' LLLL \'del\' yyyy HH:mm:ss').replace("'","").toUpperCase();
        
    const header =["Nro Liq.","F. Compra","Producto","Variedad","Categoria","Peso",
                   "Un.","Mon.","P. Unit.","Adic.","Dcto. Tot.","S/IGV",
                   "IGV","P. Total","Prov.","Proced."];

    let data = [];

    ordenes.forEach(ord => {
      ord.detalle.forEach(det =>{
        let row = [];
        row.push(ord.nroOrden);
        row.push(datePipe.transform(ord.fechaCompra,'dd MMM yyyy').replace('.','').toUpperCase());
        row.push(det.fruta.nombre);
        row.push(det.frutaVariedad.descripcion);
        row.push(det.categoriaFruta.nombre);
        row.push(Number(det.cantidadFruta.toFixed(2)));
        row.push(det.unidadCompra.nombre);
        row.push(ord.moneda.valor);
        row.push(Number(det.precioUnitario.toFixed(2)));
        row.push(Number(det.cantidadAdicional.toFixed(2)));
        let dcto = det.descuento?det.descuento:0;
        Number(dcto.toFixed(2));
        row.push(dcto);
        let precioDespuesDescuento = det.precioTotal-dcto;
        row.push(Number(precioDespuesDescuento.toFixed(2)));
        let igv = det.precioTotalIgv - precioDespuesDescuento;
        row.push(Number(igv.toFixed(2)));
        row.push(Number(det.precioTotalIgv.toFixed(2)));
        row.push(ord.proveedor.nickname.toUpperCase());
        let procedencia = ord.lugarCompra?ord.lugarCompra:'';
        row.push(procedencia.substring(0,20).toUpperCase());
        data.push(row);
      });
    });

    let Xwidths = [];
    header.forEach(hed => {
      Xwidths.push('auto');
    });
    //Xwidths= [16.03,25.17,23.66,19.96,19.83,11.13,8.42,11.22,13.92,11.25,18.27,12.38,8.85,14.37,29.91,20.07];

    let Xheader = []
    header.forEach(element => {
      Xheader.push({ text: element, bold: true,fillColor: '#A9D08E',color: '#FFFFFF'});
    });

    data.unshift(Xheader);

    const documentDefinition = {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      defaultStyle: {
        fontSize: 10
      },      
      content: [
        {
          text: 'Reporte de Ordenes de Compra',
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

  verificarfecha(event,idTipo:number):void{
    let datePipe = new DatePipe('es');        
    let fecha:Date = undefined;
    let cadena:string = event.target.value;
    let separador:string = [...new Set(cadena.replace(/[0-9]/g, ''))].join('');
    let anio:number,mes:number,dia:number;
    anio = Number(cadena.split(separador)[0]);
    mes = Number(cadena.split(separador)[1])-1;
    dia = Number(cadena.split(separador)[2]);

    fecha  = new Date(anio,mes,dia);
    if(idTipo == 1){
        if(fecha > this.fechaHastaFiltro){
          event.target.value = datePipe.transform(this.fechaDesdeFiltro, 'yyyy-MM-dd');
          return;
        }
        this.fechaDesdeFiltro = fecha;
    } else if (idTipo == 2){
      if(fecha < this.fechaDesdeFiltro){
        event.target.value = datePipe.transform(this.fechaHastaFiltro, 'yyyy-MM-dd');
        return;
      }
      this.fechaHastaFiltro = fecha;
    }
    this.filtrar();
  }

  ordenar(columna: string) {
    this.columnaOrdenada = columna;
    this.orden = 1 - this.orden;
    this.filtrar();
  }

  abrirOrden(id: number) {
    if (this.touchTime == 0) {
        this.touchTime = new Date().getTime();
    } else {
        if (((new Date().getTime()) - this.touchTime) < 800) {
            this.router.navigate([`/orden_compra/form/${id}`]); 
            this.touchTime = 0;
        } else {
            this.touchTime = new Date().getTime();
        }
    }
  }

  getFormattedDate(date:Date):string {
    let year:string = date.getFullYear().toString();
    let month:string = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;

    let day:string = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;

    return day + month + year;
  }
}
