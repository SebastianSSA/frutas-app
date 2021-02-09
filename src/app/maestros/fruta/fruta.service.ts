import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { Fruta } from './fruta';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { VariablesGlobales } from 'src/app/common/variables-globales';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FrutaService {
  private urlEndPoint: string = VariablesGlobales.apiURL + 'api/fruta';

  constructor(private http: HttpClient, private router: Router) { }

  autocompleteList(term:string): Observable<Fruta[]> {
    if(!term){
      term="inexistente";
    }

    return this.http.get<Fruta[]>(`${this.urlEndPoint}/autocomplete/${term}`);
  }

  getFrutaByNombre(nombre: string): Observable<Fruta> {
    return this.http.get<Fruta>(`${this.urlEndPoint}/nombre/${nombre}`).pipe(
      catchError(e => {
        if (e.status != 401 && e.error.mensaje) {
          console.error(e.error.mensaje);
        }

        return throwError(e);
      })
    );
  }
}
