import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { VariablesGlobales } from '../common/variables-globales';
import { CambioCategoria } from './models/cambio-categoria';

@Injectable({
  providedIn: 'root'
})
export class CambioCategoriaService {

  private urlEndPoint: string = VariablesGlobales.apiURL + 'api/producto/cambiocategoria';

  constructor(private http: HttpClient, private router: Router) { }

  create(cambioCategoria: CambioCategoria): Observable<CambioCategoria> {
    return this.http.post(this.urlEndPoint, cambioCategoria).pipe(
      map((response: any) => response.cambioCategoria as CambioCategoria),
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



}
