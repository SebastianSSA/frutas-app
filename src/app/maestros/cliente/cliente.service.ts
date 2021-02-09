import { Injectable } from '@angular/core';
import { VariablesGlobales } from '../../common/variables-globales';
import { Cliente } from './cliente';
import { Observable, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private urlEndPoint: string = VariablesGlobales.apiURL + 'api/cliente';

  constructor(private http: HttpClient, private router: Router) { }

  getComboBox(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.urlEndPoint}/combo_box`);
  }

  getCliente(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.urlEndPoint}/${id}`).pipe(
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
