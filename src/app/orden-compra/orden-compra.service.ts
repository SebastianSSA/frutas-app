import { Injectable } from '@angular/core';
import { VariablesGlobales } from '../common/variables-globales';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { OrdenCompra } from './models/orden-compra';
import { tap, map, catchError } from 'rxjs/operators';
import { AuthService } from '../usuarios/auth.service';

@Injectable({
  providedIn: 'root'
})
export class OrdenCompraService {
  private urlEndPoint: string = VariablesGlobales.apiURL + 'api/orden_compra';

  constructor(private http: HttpClient, private router: Router, private authService: AuthService) { }

  autocompleteList(term:string,id:number): Observable<string[]> {
    if(!term){
      term="inexistente";
    }
    if(!id){
      id = 0;
    }
    return this.http.get<string[]>(`${this.urlEndPoint}/autocomplete_empaquetado/${id}/${term}`);
  }

  getOrdenes(
    nroOrden:string = '', fechaDesde:string, fechaHasta:string, comprador:string,
    proveedorId:number, tipoCompraId:number, tipoOrdenId:number, estadoOrdenId:number,
    columnSort: string, order: number, page: number): Observable<any>{
    let i: number = 0;

    let url:string = `${this.urlEndPoint}/page2`;
    if(nroOrden!= undefined && nroOrden.length >0){
       url = url + `&nroOrden=${nroOrden}`;
    }
    if(fechaDesde!= undefined && fechaDesde.length >0){
       url = url + `&fechaDesde=${fechaDesde}`;
    }
    if(fechaHasta!= undefined && fechaHasta.length >0){
      url = url + `&fechaHasta=${fechaHasta}`;
    }
    if(comprador!= undefined && comprador.length >0){
       url = url + `&comprador=${comprador}`;
    }
    if(proveedorId!= undefined){
       url = url + `&proveedorId=${proveedorId}`;
    }
    if(tipoCompraId!= undefined){
      url = url + `&tipoCompraId=${tipoCompraId}`;
    }
    if(tipoOrdenId!= undefined){
      url = url + `&tipoOrdenId=${tipoOrdenId}`;
    }
    if(estadoOrdenId!= undefined){
      url = url + `&estadoOrdenId=${estadoOrdenId}`;
    }
    if(columnSort!= undefined){
       url = url + `&columnSort=${columnSort}`;
    }
    if(order!= undefined){
      url = url + `&order=${order}`;
    }
    if(page!= undefined){
       url = url + `&page=${page}`;
    }

    if (url.match(/&.*&/)) {
      url = url.replace('&', '?');
    }

    //console.log(url);
    return this.http.get<OrdenCompra[]>(url)
    .pipe(
      tap((response:any) => {
        i = (response.pageable.pageNumber)*response.size;
      }),
      map((response: any) => {
        (response.content as OrdenCompra[]).map(oco => {
          oco.nro = ++i;
          return oco;
        });
        return response;
      })
    );
  }

  getAllOrdenes(
    nroOrden:string = '', fechaDesde:string, fechaHasta:string, comprador:string,
    proveedorId:number, tipoCompraId:number, tipoOrdenId:number, estadoOrdenId:number): Observable<any>{
    let i: number = 0;

    let url:string = `${this.urlEndPoint}/all`;
    if(nroOrden!= undefined && nroOrden.length >0){
       url = url + `&nroOrden=${nroOrden}`;
    }
    if(fechaDesde!= undefined && fechaDesde.length >0){
       url = url + `&fechaDesde=${fechaDesde}`;
    }
    if(fechaHasta!= undefined && fechaHasta.length >0){
      url = url + `&fechaHasta=${fechaHasta}`;
    }
    if(comprador!= undefined && comprador.length >0){
       url = url + `&comprador=${comprador}`;
    }
    if(proveedorId!= undefined){
       url = url + `&proveedorId=${proveedorId}`;
    }
    if(tipoCompraId!= undefined){
      url = url + `&tipoCompraId=${tipoCompraId}`;
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
    return this.http.get<OrdenCompra[]>(url);
  }


  getOrden(id: number): Observable<OrdenCompra> {
    return this.http.get<OrdenCompra>(`${this.urlEndPoint}/${id}`).pipe(
      catchError(e => {
        if (e.status != 401 && e.error.mensaje) {
          this.router.navigate(['/']);
          console.error(e.error.mensaje);
        }

        return throwError(e);
      })
    );
  }

  create(ordenCompra: OrdenCompra): Observable<OrdenCompra> {
    return this.http.post(this.urlEndPoint, ordenCompra).pipe(
      map((response: any) => response.ordenCompra as OrdenCompra),
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

  update(ordenCompra: OrdenCompra): Observable<any> {
    return this.http.put<any>(`${this.urlEndPoint}/${ordenCompra.id}`, ordenCompra).pipe(
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

  subirFoto(archivos: File[], ids: number[], idOC) {
    let formData = new FormData();
    for (let index = 0; index < archivos.length; index++) {
      formData.append("archivos[]", archivos[index]);
      formData.append("ids[]", ids[index].toString());
    }
    formData.append("idOC", idOC);

    fetch(`${VariablesGlobales.apiURL}api/upload`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + this.authService.token
      },
      body: formData
    }).then(res => {
      console.log(res)
    }).catch(err => {
      console.log(err)
    });
    // const req = new HttpRequest('POST', `${VariablesGlobales.apiURL}api/upload`, formData, {
    //   reportProgress: true
    // });
    // return this.http.request(req);
  }
}
