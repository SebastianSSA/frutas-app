import { Injectable } from '@angular/core';
import { VariablesGlobales } from 'src/app/common/variables-globales';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { FrutaVariedad } from './fruta-variedad';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FrutaVariedadService {
  private urlEndPoint: string = VariablesGlobales.apiURL + 'api/variedad_fruta';

  constructor(private http: HttpClient, private router: Router) { }

  autocompleteList(term:string, idFruta:number): Observable<FrutaVariedad[]> {
    if(!term){
      term="inexistente";
    }

    return this.http.get<FrutaVariedad[]>(`${this.urlEndPoint}/autocomplete/${term}/${idFruta}`);
  }

  getFrutaVariedad(id: number): Observable<FrutaVariedad> {
    return this.http.get<FrutaVariedad>(`${this.urlEndPoint}/${id}`).pipe(
      catchError(e => {
        if (e.status != 401 && e.error.mensaje) {
          this.router.navigate(['/']);
          console.error(e.error.mensaje);
        }

        return throwError(e);
      })
    );
  }

  getFrutaVariedadByDescripcion(descripcion: string, idFruta: number): Observable<FrutaVariedad> {
    if(!descripcion){
      descripcion="inexistente";
    }

    return this.http.get<FrutaVariedad>(`${this.urlEndPoint}/nombre/${descripcion}/${idFruta}`).pipe(
      catchError(e => {
        if (e.status != 401 && e.error.mensaje) {
          console.error(e.error.mensaje);
        }

        return throwError(e);
      })
    );
  }
}
