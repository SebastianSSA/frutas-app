import { Injectable } from '@angular/core';
import { VariablesGlobales } from 'src/app/common/variables-globales';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { SubTipoEmpaque } from './sub-tipo-empaque';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SubTipoEmpaqueService {
  private urlEndPoint: string = VariablesGlobales.apiURL + 'api/sub_tipo_empaque';

  constructor(private http: HttpClient, private router: Router) { }

  getSubTipoempaque(id: number): Observable<SubTipoEmpaque> {
    return this.http.get<SubTipoEmpaque>(`${this.urlEndPoint}/${id}`).pipe(
      catchError(e => {
        if (e.status != 401 && e.error.mensaje) {
          this.router.navigate(['/']);
          console.error(e.error.mensaje);
        }

        return throwError(e);
      })
    );
  }  

  autocompleteList(term:string): Observable<SubTipoEmpaque[]> {
    if(!term){
      term="inexistente";
    }

    return this.http.get<SubTipoEmpaque[]>(`${this.urlEndPoint}/autocomplete/${term}/1`);
  }

  getComboBox(idTipoEmpaque: number): Observable<SubTipoEmpaque[]> {
    return this.http.get<SubTipoEmpaque[]>(`${this.urlEndPoint}/combo_box/${idTipoEmpaque}`);
  }
}
