import { Injectable } from '@angular/core';
import { VariablesGlobales } from '../common/variables-globales';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Departamento } from './models/departamento';
import { Provincia } from './models/provincia';
import { Distrito } from './models/distrito';

@Injectable({
  providedIn: 'root'
})
export class UbigeoService {
  private urlEndPoint: string = VariablesGlobales.apiURL + 'api/ubigeo';

  constructor(private http: HttpClient) { }

  autocompleteDepartamento(term: string): Observable<Departamento[]> {
    if(!term){
      term="inexistente";
    }

    return this.http.get<Departamento[]>(`${this.urlEndPoint}/autocomplete/departamento/${term}`);
  }

  autocompleteProvincia(term: string, idDepartamento: number): Observable<Provincia[]> {
    if(!term){
      term="inexistente";
    }

    return this.http.get<Provincia[]>(`${this.urlEndPoint}/autocomplete/provincia/${term}/${idDepartamento}`);
  }

  autocompleteDistrito(term: string, idProvincia: number): Observable<Distrito[]> {
    if(!term){
      term="inexistente";
    }

    return this.http.get<Distrito[]>(`${this.urlEndPoint}/autocomplete/distrito/${term}/${idProvincia}`);
  }
}
