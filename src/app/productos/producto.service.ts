import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { VariablesGlobales } from '../common/variables-globales';
import { Producto } from './models/producto';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private urlEndPoint: string = VariablesGlobales.apiURL + 'api/producto';

  constructor(private http: HttpClient, private router: Router) { }

  getProducto(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.urlEndPoint}/${id}`).pipe(
      catchError(e => {
        if (e.status != 401 && e.error.mensaje) {
          this.router.navigate(['/']);
          console.error(e.error.mensaje);
        }

        return throwError(e);
      })
    );
  }

  getProductoPorVariedadAndCategoria(frutaVariedadId:number,categoriaId:number): Observable<Producto> {
    let url:string = `${this.urlEndPoint}/find`;
    url = url + `?frutaVariedadId=${frutaVariedadId}`;
    url = url + `&categoriaId=${categoriaId}`;

    return this.http.get<Producto>(url).pipe(
      catchError(e => {
        if (e.status != 401 && e.error.mensaje) {
          this.router.navigate(['/']);
          console.error(e.error.mensaje);
        }
        return throwError(e);
      })
    );
  }

  getProductos(frutaId:number,frutaVariedadId:number,categoriaId:number,columnSort:string,order:number,page:number): Observable<any>{
    let i: number = 0;
    let url:string = `${this.urlEndPoint}/page`;

    if(frutaId!= undefined){
       url = url + `&frutaId=${frutaId}`;
    }
    if(frutaVariedadId!= undefined){
       url = url + `&frutaVariedadId=${frutaVariedadId}`;
    }
    if(categoriaId!= undefined){
       url = url + `&categoriaId=${categoriaId}`;
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

    return this.http.get<Producto[]>(url)    
    .pipe(
      tap((response:any) => {
        i = (response.pageable.pageNumber)*response.size;
      }),
      map((response: any) => {
        (response.content as Producto[]).map(pro => {
          pro.nro = ++i;
          return pro;
        });
        return response;
      })
    );
  } 
  
  getAllProductos(frutaId:number,frutaVariedadId:number,categoriaId:number,columnSort:string): Observable<any>{
    let i: number = 0;
    let url:string = `${this.urlEndPoint}/all`;

    if(frutaId!= undefined){
       url = url + `&frutaId=${frutaId}`;
    }
    if(frutaVariedadId!= undefined){
       url = url + `&frutaVariedadId=${frutaVariedadId}`;
    }
    if(categoriaId!= undefined){
       url = url + `&categoriaId=${categoriaId}`;
    }
    if(columnSort!= undefined && columnSort.length > 0){
       url = url + `&columnSort=${columnSort}`;
    }

    // if (url.match(/&.*&/)) {
    //   url = url.replace('&', '?');
    // }
    url = url.replace('&', '?');

    return this.http.get<Producto[]>(url)
    .pipe(
      map((response: any) => {
        (response as Producto[]).map(pro => {
          pro.nro = ++i;
          return pro;
        });
        return response;
      })
    );    
  }    

}
