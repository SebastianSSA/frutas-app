import { Injectable } from '@angular/core';
import { VariablesGlobales } from 'src/app/common/variables-globales';
import { Almacen } from './almacen';
import { Observable, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AlmacenService {
  private urlEndPoint: string = VariablesGlobales.apiURL + 'api/almacen';

  constructor(private http: HttpClient, private router: Router) { }

  getComboBox(): Observable<Almacen[]> {
    return this.http.get<Almacen[]>(`${this.urlEndPoint}/combo_box`);
  }

  getAlmacen(id: number): Observable<Almacen> {
    return this.http.get<Almacen>(`${this.urlEndPoint}/${id}`).pipe(
      catchError(e => {
        if (e.status != 401 && e.error.mensaje) {
          this.router.navigate(['/']);
          console.error(e.error.mensaje);
        }

        return throwError(e);
      })
    );
  }
}
