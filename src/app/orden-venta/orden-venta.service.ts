import { Injectable } from '@angular/core';
import { VariablesGlobales } from '../common/variables-globales';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { OrdenVenta } from './models/orden-venta';

@Injectable({
  providedIn: 'root'
})
export class OrdenVentaService {
  private urlEndPoint: string = VariablesGlobales.apiURL + 'api/orden_venta';

  constructor(private http: HttpClient, private router: Router) { }

  getOrdenes( nroVenta:string, columnSort:string, order:number, page:number, fechaDesde:string,
              fechaHasta:string, vendedor:string, tipoClienteId:number, clienteId:number, nombreCliente:string,
              tipoVentaId:number, tipoOrdenId:number, estadoOrdenId:number ): Observable<any>{
    let i: number = 0;
    let url:string = `${this.urlEndPoint}/page2`;

    if(nroVenta!= undefined && nroVenta.length > 0){
       url = url + `&nroVenta=${nroVenta}`;
    }
    if(columnSort!= undefined && columnSort.length > 0){
       url = url + `&columnSort=${columnSort}`;
    }
    if(order!= undefined){
      url = url + `&order=${order}`;
    }
    if(page!= undefined){
      url = url + `&page=${page}`;
    }
    if(fechaDesde!= undefined && fechaDesde.length > 0){
       url = url + `&fechaDesde=${fechaDesde}`;
    }
    if(fechaHasta!= undefined && fechaHasta.length > 0){
       url = url + `&fechaHasta=${fechaHasta}`;
    }
    if(vendedor!= undefined && vendedor.length > 0){
       url = url + `&vendedor=${vendedor}`;
    }
    if(tipoClienteId!= undefined){
       url = url + `&tipoClienteId=${tipoClienteId}`;
    }
    if(clienteId!= undefined){
       url = url + `&clienteId=${clienteId}`;
    }
    if(nombreCliente!= undefined && nombreCliente.length > 0){
       url = url + `&nombreCliente=${nombreCliente}`;
    }
    if(tipoVentaId!= undefined){
       url = url + `&tipoVentaId=${tipoVentaId}`;
    }
    if(tipoOrdenId!= undefined){
       url = url + `&tipoOrdenId=${tipoOrdenId}`;
    }
    if(estadoOrdenId!= undefined){
       url = url + `&estadoOrdenId=${estadoOrdenId}`;
    }

    if (url.match(/&.*&/)) {
      url = url.replace('&', '?');
    }
    //console.log(url);

    return this.http.get<OrdenVenta[]>(url)
    .pipe(
      tap((response:any) => {
        i = (response.pageable.pageNumber)*response.size;
      }),
      map((response: any) => {
        (response.content as OrdenVenta[]).map(ove => {
          ove.nro = ++i;
          return ove;
        });
        return response;
      })
    );
  }

  getAllOrdenes( nroVenta:string,fechaDesde:string,fechaHasta:string, vendedor:string, tipoClienteId:number,
                 clienteId:number, nombreCliente:string,tipoVentaId:number, tipoOrdenId:number, estadoOrdenId:number ): Observable<any>{
    let i: number = 0;
    let url:string = `${this.urlEndPoint}/all`;

    if(nroVenta!= undefined && nroVenta.length > 0){
       url = url + `&nroVenta=${nroVenta}`;
    }
    if(fechaDesde!= undefined && fechaDesde.length > 0){
       url = url + `&fechaDesde=${fechaDesde}`;
    }
    if(fechaHasta!= undefined && fechaHasta.length > 0){
       url = url + `&fechaHasta=${fechaHasta}`;
    }
    if(vendedor!= undefined && vendedor.length > 0){
       url = url + `&vendedor=${vendedor}`;
    }
    if(tipoClienteId!= undefined){
       url = url + `&tipoClienteId=${tipoClienteId}`;
    }
    if(clienteId!= undefined){
       url = url + `&clienteId=${clienteId}`;
    }
    if(nombreCliente!= undefined && nombreCliente.length > 0){
       url = url + `&nombreCliente=${nombreCliente}`;
    }
    if(tipoVentaId!= undefined){
       url = url + `&tipoVentaId=${tipoVentaId}`;
    }
    if(tipoOrdenId!= undefined){
       url = url + `&tipoOrdenId=${tipoOrdenId}`;
    }
    if(estadoOrdenId!= undefined){
       url = url + `&estadoOrdenId=${estadoOrdenId}`;
    }

    if (url.match(/&.*&/)) {
      url = url.replace('&', '?');
    }

    return this.http.get<OrdenVenta[]>(url);
  }  

  getOrden(id: number): Observable<OrdenVenta> {
    return this.http.get<OrdenVenta>(`${this.urlEndPoint}/${id}`).pipe(
      catchError(e => {
        if (e.status != 401 && e.error.mensaje) {
          this.router.navigate(['/']);
          console.error(e.error.mensaje);
        }

        return throwError(e);
      })
    );
  }

  create(ordenVenta: OrdenVenta): Observable<OrdenVenta> {
    return this.http.post(this.urlEndPoint, ordenVenta).pipe(
      map((response: any) => response.ordenCompra as OrdenVenta),
      catchError(e => {
        if (e.status==400){
          return throwError(e);
        }

        if (e.error.mensaje) {
          console.error(e.error.mensaje);
        }

        return throwError(e);
      })
    )
  }

  update(ordenVenta: OrdenVenta): Observable<any> {
    return this.http.put<any>(`${this.urlEndPoint}/${ordenVenta.id}`, ordenVenta).pipe(
      catchError(e => {
        if (e.status==400){
          return throwError(e);
        }

        if (e.error.mensaje) {
          console.error(e.error.mensaje);
        }

        return throwError(e);
      })
    );
  }
}
