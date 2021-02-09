import { Component, OnInit } from '@angular/core';
import { OrdenVenta } from './models/orden-venta';
import { OrdenVentaService } from './orden-venta.service';
import { AuthService } from '../usuarios/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Cliente } from '../maestros/cliente/cliente';
import { ClienteService } from '../maestros/cliente/cliente.service';
import { TablaAuxiliarDetalle } from '../auxiliares/tabla-auxiliar/models/tabla-auxiliar-detalle';
import { TablaAuxiliarService } from '../auxiliares/tabla-auxiliar/tabla-auxiliar.service';
import swal from 'sweetalert2';
import { DatePipe } from '@angular/common';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';


pdfMake.vfs = pdfFonts.pdfMake.vfs; 

@Component({
  selector: 'app-orden-venta',
  templateUrl: './orden-venta.component.html',
  styleUrls: ['./orden-venta.component.css']
})
export class OrdenVentaComponent implements OnInit {
  titulo:string = 'Orden de Venta';
  touchTime:number = 0;

  nroOrdenFiltro: string = '';
  fechaDesdeFiltro:Date = new Date(new Date().setDate(new Date().getDate() - 30));
  fechaHastaFiltro:Date = new Date(new Date().setDate(new Date().getDate() + 1));
  vendedorFiltro:string = undefined;
  tipoClienteFiltro: TablaAuxiliarDetalle = undefined;
  clienteNoInternoFiltro: string = '';
  clienteInternoFiltro: Cliente = undefined;
  tipoVentaFiltro: TablaAuxiliarDetalle = undefined;
  tipoOrdenFiltro: TablaAuxiliarDetalle = undefined;
  estadoOrdenFiltro: TablaAuxiliarDetalle = undefined;

  usuarios: String[];
  tiposCliente: TablaAuxiliarDetalle[];
  clientesInternos: Cliente[];
  tiposProducto: TablaAuxiliarDetalle[];
  tiposVenta: TablaAuxiliarDetalle[];
  tiposEstadoVenta: TablaAuxiliarDetalle[];

  columnaOrdenada: string = 'id';
  orden: number = 1;
  rutaPaginador:string = '';
  enlacePaginador:string = 'orden_venta/page';
  paginador: any;

  ordenes: OrdenVenta[];
  ordenSeleccionada: OrdenVenta;

  totalVenta: number = 0;
  monedaTotal: string = 'S/';

  constructor(private ordenVentaService: OrdenVentaService,
      private tablaAuxiliarService: TablaAuxiliarService,
      private clienteService: ClienteService,
      public _authService: AuthService,
      private router: Router,
      private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    //this.rutaPaginador = 'orden_venta/page/'+this.nroOrdenFiltro+'/'+this.columnaOrdenada+'/'+this.orden+'/';
    this._authService.getComboBox().subscribe(usu => this.usuarios = usu);
    this.tablaAuxiliarService.getComboBox("TIPCLI").subscribe(aux => this.tiposCliente = aux);
    this.clienteService.getComboBox().subscribe(cli => this.clientesInternos = cli);
    this.tablaAuxiliarService.getComboBox("TIPOFE").subscribe(aux => this.tiposProducto = aux);
    this.tablaAuxiliarService.getComboBox("TIPOVE").subscribe(aux => this.tiposVenta = aux);
    this.tablaAuxiliarService.getComboBox("ESTOVE").subscribe(aux => this.tiposEstadoVenta= aux);

    this.activatedRoute.paramMap.subscribe(params => {
      //let aux = params.get('page');
      let page:number = +params.get('page'); ;

      // if(aux == null){
      //   page = -1;
      // } else {
      //   page = + aux;
      // }
      // if(page==-1){
      //   page = 0;
      //   this.reiniciarFiltros();
      // } else {
      //   this.recuperarFiltros();
      // }
      this.filtrar(page);

    });
  }

  compararUsu(u1:string, u2:string):boolean{
    if (u1 === undefined && u2 === undefined){
      return true;
    }

    return u1 === null || u2 === null || u1 === undefined || u2 === undefined? false: u1===u2;
  }

  compararCli(c1: Cliente, c2: Cliente): boolean {
    if (c1 === undefined && c2 === undefined){
      return true;
    }

    return c1 === null || c2 === null || c1 === undefined || c2 === undefined? false: c1.id===c2.id;
  }

  compararAuxDet(o1:TablaAuxiliarDetalle, o2:TablaAuxiliarDetalle):boolean {
    if (o1 === undefined && o2 === undefined){
      return true;
    }

    return o1 === null || o2 === null || o1 === undefined || o2 === undefined? false: o1.tablaAuxiliarDetalleId.id===o2.tablaAuxiliarDetalleId.id;
  }

  filtrar(page:number = 0) {
    this.ordenVentaService.getOrdenes(
      this.nroOrdenFiltro,
      this.columnaOrdenada,this.orden,page,
      this.getFormattedDate(this.fechaDesdeFiltro),
      this.getFormattedDate(this.fechaHastaFiltro), this.vendedorFiltro,
      (this.tipoClienteFiltro != undefined)?this.tipoClienteFiltro.tablaAuxiliarDetalleId.id :undefined,
      (this.clienteInternoFiltro != undefined)?this.clienteInternoFiltro.id:undefined,this.clienteNoInternoFiltro,
      (this.tipoVentaFiltro!= undefined)?this.tipoVentaFiltro.tablaAuxiliarDetalleId.id :undefined,
      (this.tipoOrdenFiltro != undefined)?this.tipoOrdenFiltro.tablaAuxiliarDetalleId.id :undefined,
      (this.estadoOrdenFiltro != undefined)?this.estadoOrdenFiltro.tablaAuxiliarDetalleId.id :undefined

    )
    .subscribe(response => {
      this.ordenes = response.content as OrdenVenta[];
      this.paginador = response;
      this.calcularTotal();
    });
  }

  //0:excel,1:pdf
  generarReporte(idTipoReporte:number) {
    this.ordenVentaService.getAllOrdenes(
      this.nroOrdenFiltro,
      this.getFormattedDate(this.fechaDesdeFiltro),
      this.getFormattedDate(this.fechaHastaFiltro), this.vendedorFiltro,
      (this.tipoClienteFiltro != undefined)?this.tipoClienteFiltro.tablaAuxiliarDetalleId.id :undefined,
      (this.clienteInternoFiltro != undefined)?this.clienteInternoFiltro.id:undefined,this.clienteNoInternoFiltro,
      (this.tipoVentaFiltro!= undefined)?this.tipoVentaFiltro.tablaAuxiliarDetalleId.id :undefined,
      (this.tipoOrdenFiltro != undefined)?this.tipoOrdenFiltro.tablaAuxiliarDetalleId.id :undefined,
      (this.estadoOrdenFiltro != undefined)?this.estadoOrdenFiltro.tablaAuxiliarDetalleId.id :undefined)
    .subscribe(response => {
      let ordenes:OrdenVenta[] = response;

      try {
        switch (idTipoReporte) {
          case 0: 
            this.generarExcel(ordenes);
            break;
          case 1:
            this.generarPdf(ordenes);
            break;
        };       
      } catch (error) {
        swal.fire('Error al generar el archivo '+(idTipoReporte==0?'Excel':'Pdf') ,error.message, 'error');
      }  
    });
  }  

  generarExcel(ordenes:OrdenVenta[]){

    //Excel Title, Header, Data
    const title = 'Reporte de Ordenes de Venta';

    const header =["Nro Liq. Venta","Fecha de Venta","Producto","Variedad","Categoria","Peso",
                   "Unidad Compra","Moneda","Precio unit.","Descuento Tot.","Precio Antes de IGV",
                   "IGV","Precio Total","Tipo Cliente","Cliente","Almacen","Vendedor","Forma Pago"];                                  

    let datePipe = new DatePipe('es');
    let fecha:Date = new Date();
    let fechaCreacion = 'FECHA DE GENERACION : '+ datePipe.transform(fecha, 'EEEE dd \'de\' LLLL \'del\' yyyy HH:mm:ss').replace("'","").toUpperCase();                   

    let data = [];

    ordenes.forEach(ord => {
      ord.detalle.forEach(det =>{
        let row = [];
        row.push(ord.nroOrden);
        row.push(datePipe.transform(ord.fechaVenta,'dd/MM/yyyy  HH:mm:ss'));
        row.push(det.fruta.nombre);
        row.push(det.frutaVariedad.descripcion);
        row.push(det.categoriaFruta.nombre);
        row.push(Number(det.cantidadFruta.toFixed(2)));
        row.push(det.unidadVenta.nombre);
        row.push(ord.moneda.nombre);
        row.push(Number(det.precioUnitario.toFixed(2)));
        let dcto = det.descuento?det.descuento:0;
        Number(dcto.toFixed(2));
        row.push(dcto);
        let precioDespuesDescuento = det.precioTotal-dcto;
        row.push(Number(precioDespuesDescuento.toFixed(2)));
        let igv = det.precioTotalIgv - precioDespuesDescuento;
        row.push(Number(igv.toFixed(2)));
        row.push(Number(det.precioTotalIgv.toFixed(2)));
        row.push(ord.tipoCliente.nombre);
        row.push(ord.nombreCliente.substring(0,20).toUpperCase());
        row.push(ord.almacen.descripcion);
        row.push(ord.vendedor.substring(0,20).toUpperCase());
        row.push(ord.formaPagoVenta.nombre)

        data.push(row);
      });
    });
    
    //Create workbook and worksheet
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet('Ordenes de Venta');
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
      
      fs.saveAs(blob, 'Reporte de Ordenes de Venta.xlsx');
    })    
  }  

  generarPdf(ordenes:OrdenVenta[]){
    let datePipe = new DatePipe('es');
    let fecha:Date = new Date();
    let fechaCreacion = 'FECHA DE GENERACION : '+ datePipe.transform(fecha, 'EEEE dd \'de\' LLLL \'del\' yyyy HH:mm:ss').replace("'","").toUpperCase();
        
    const header =["Nro Liq.","F. Venta","Producto","Variedad","Categoria","Peso",
                   "Un.","Mon.","P. Unit.","Dcto. Tot.","S/IGV",
                   "IGV","P. Total","Tip. Cli.","Cliente"];

    let data = [];

    ordenes.forEach(ord => {
      ord.detalle.forEach(det =>{
        let row = [];
        row.push(ord.nroOrden);
        row.push(datePipe.transform(ord.fechaVenta,'dd MMM yyyy').replace('.','').toUpperCase());
        row.push(det.fruta.nombre);
        row.push(det.frutaVariedad.descripcion);
        row.push(det.categoriaFruta.nombre);
        row.push(Number(det.cantidadFruta.toFixed(2)));
        row.push(det.unidadVenta.nombre);
        row.push(ord.moneda.nombre);
        row.push(Number(det.precioUnitario.toFixed(2)));
        let dcto = det.descuento?det.descuento:0;
        Number(dcto.toFixed(2));
        row.push(dcto);
        let precioDespuesDescuento = det.precioTotal-dcto;
        row.push(Number(precioDespuesDescuento.toFixed(2)));
        let igv = det.precioTotalIgv - precioDespuesDescuento;
        row.push(Number(igv.toFixed(2)));
        row.push(Number(det.precioTotalIgv.toFixed(2)));
        row.push(ord.tipoCliente.nombre);
        row.push(ord.nombreCliente.substring(0,20).toUpperCase());

        data.push(row);
      });
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
      pageOrientation: 'landscape',
      defaultStyle: {
        fontSize: 10
      },      
      content: [
        {
          text: 'Reporte de Ordenes de Venta',
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
        this.fechaDesdeFiltro = new Date(fecha);
    } else if (idTipo == 2){
      if(fecha < this.fechaDesdeFiltro){
        event.target.value = datePipe.transform(this.fechaHastaFiltro, 'yyyy-MM-dd');
        return;
      }
      this.fechaHastaFiltro = new Date(fecha);
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
          this.router.navigate([`/orden_venta/form/${id}`]);
            this.touchTime = 0;
        } else {
            this.touchTime = new Date().getTime();
        }
    }    
  }

  tipoClienteChange(event){
    let selectElement = event.target;
    let optionIndex = selectElement.selectedIndex;
    if(optionIndex ==0){
      this.clienteNoInternoFiltro = '';
      this.clienteInternoFiltro = undefined;
    }else if(optionIndex == 1){
      this.clienteNoInternoFiltro = '';
    } else if(optionIndex > 1){
      this.clienteInternoFiltro = undefined;
    }
    this.filtrar();
  }

  getFormattedDate(date:Date):string {
    let year:string = date.getFullYear().toString();
    let month:string = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;

    let day:string = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;

    return day + month + year;
  }

  reiniciarFiltros():void{
    this.nroOrdenFiltro = '';
    this.fechaDesdeFiltro =  new Date(new Date().setDate(new Date().getDate() - 30));
    this.fechaHastaFiltro = new Date();
    this.vendedorFiltro = '';
    this.tipoClienteFiltro = undefined;
    this.clienteNoInternoFiltro = '';
    this.clienteInternoFiltro = undefined;
    this.tipoVentaFiltro = undefined;
    this.tipoOrdenFiltro = undefined;
    this.estadoOrdenFiltro = undefined;
  }

  calcularTotal():void{
    this.totalVenta=0;
    this.ordenes .forEach(element => {
      this.totalVenta = this.totalVenta + element.total;
    });
  }
}
