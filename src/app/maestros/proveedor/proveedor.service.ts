import { Injectable } from '@angular/core';
import { VariablesGlobales } from 'src/app/common/variables-globales';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { Proveedor } from './proveedor';

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {
  private urlEndPoint: string = VariablesGlobales.apiURL + 'api/proveedor';

  constructor(private http: HttpClient, private router: Router) { }

  autocompleteList(nickname:string): Observable<Proveedor[]> {
    if(!nickname){
      nickname="inexistente";
    }

    return this.http.get<Proveedor[]>(`${this.urlEndPoint}/autocomplete/${nickname}`);
  }

  getComboBox(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(`${this.urlEndPoint}/combo_box`);
  }

  getProveedores(nickname: string, columnSort: string, order: number, page: number): Observable<any>{
    let i: number = 0;
    let url:string = `${this.urlEndPoint}/page2`;

    if(nickname!= undefined && nickname.length > 0){
       url = url + `&nickname=${nickname}`;
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
    if (url.match(/&.*&/)) {
      url = url.replace('&', '?');
    }
    //console.log(url);

    return this.http.get<Proveedor[]>(url)
    .pipe(
      tap((response:any) => {
        i = (response.pageable.pageNumber)*response.size;
      }),
      map((response: any) => {
        (response.content as Proveedor[]).map(cc => {
          cc.nro = ++i;
          return cc;
        });
        return response;
      })
    );
  }

  getProveedor(id: number): Observable<Proveedor> {
    return this.http.get<Proveedor>(`${this.urlEndPoint}/${id}`).pipe(
      catchError(e => {
        if (e.status != 401 && e.error.mensaje) {
          this.router.navigate(['/']);
          console.error(e.error.mensaje);
        }

        return throwError(e);
      })
    );
  }
  obtenerPorNombre(nombre: string): Observable<Proveedor> {
    return this.http.get<Proveedor>(`${this.urlEndPoint}/nombre/${nombre}`).pipe(
      catchError(e => {
        if (e.status != 401 && e.error.mensaje) {
          this.router.navigate(['/']);
          console.error(e.error.mensaje);
        }
        return throwError(e);
      })
    );
  }

  create(proveedor: Proveedor): Observable<Proveedor> {
    return this.http.post(this.urlEndPoint, proveedor).pipe(
      map((response: any) => response.proveedor as Proveedor),
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

  update(proveedor: Proveedor): Observable<any> {
    return this.http.put<any>(`${this.urlEndPoint}/${proveedor.id}`, proveedor).pipe(
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
