import { Injectable } from '@angular/core';
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { OrdenCompra } from '../orden-compra/models/orden-compra';

@Injectable({
  providedIn: 'root'
})
export class IndexedDBService {

  private db: IDBPDatabase<MyDB>;

  constructor() {
    this.connectToDB();
  }

  async connectToDB() {
    this.db = await openDB<MyDB>('my-db', 1, {
      upgrade(db) {
        db.createObjectStore('db-frutas');
      }
    });
  }

  addOrdenCompra(ordenCompra: OrdenCompra) {
    return this.db.put('db-frutas', JSON.stringify(ordenCompra), 'orden-compra-guardada');
  }

  addToken(token: string) {
    return this.db.put('db-frutas', token, 'token-user');
  }

  deleteElement(key: string) {
    return this.db.delete('db-frutas', key);
  }
}

interface MyDB extends DBSchema {
  'db-frutas': {
    key: string;
    value: string;
  }
}
