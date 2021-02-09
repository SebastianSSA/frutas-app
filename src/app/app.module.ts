import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID  } from '@angular/core';

import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import localeES from '@angular/common/locales/es';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TokenInterceptor } from './usuarios/interceptors/token.interceptor';
import { AuthInterceptor } from './usuarios/interceptors/auth.interceptor';
import { AgGridModule } from 'ag-grid-angular';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

import { LoginComponent } from './usuarios/login.component';
import { HeaderComponent } from './header/header.component';
import { PaginatorComponent } from './paginator/paginator.component';
import { TablaAuxiliarComponent } from './auxiliares/tabla-auxiliar/tabla-auxiliar.component';
import { UbigeoComponent } from './ubigeo/ubigeo.component';
import { EmpresaComponent } from './maestros/empresa/empresa.component';
import { ProveedorComponent } from './maestros/proveedor/proveedor.component';
import { FrutaComponent } from './maestros/fruta/fruta.component';
import { FrutaVariedadComponent } from './maestros/fruta-variedad/fruta-variedad.component';
import { AlmacenComponent } from './maestros/almacen/almacen.component';
import { SubTipoEmpaqueComponent } from './maestros/sub-tipo-empaque/sub-tipo-empaque.component';
import { OrdenCompraComponent } from './orden-compra/orden-compra.component';
import { FormCompraComponent } from './orden-compra/form-compra.component';

import { ProveedorService } from './maestros/proveedor/proveedor.service';
import { ClienteService } from './maestros/cliente/cliente.service';
import { TablaAuxiliarService } from './auxiliares/tabla-auxiliar/tabla-auxiliar.service';
import { OrdenCompraService } from './orden-compra/orden-compra.service';
import { OrdenVentaService } from './orden-venta/orden-venta.service';
import { IndexedDBService } from './common/indexed-db.service';
import { OrdenVentaComponent } from './orden-venta/orden-venta.component';
import { FormVentaComponent } from './orden-venta/form-venta.component';
import { ClienteComponent } from './maestros/cliente/cliente.component';
import { ProductoComponent } from './productos/producto.component'

import { AuthGuard } from './usuarios/guards/auth.guard';
import { RoleGuard } from './usuarios/guards/role.guard';
import { NumbersTwoDecimalsDirective } from './common/numbers-two-decimals.directive';
import { OnlyNumbersDirective } from './common/only-numbers.directive';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { ProductoService } from './productos/producto.service'
import { CambioCategoriaService } from './productos/cambio-categoria.service'


registerLocaleData(localeES, 'es');

const routes: Routes = [
  {path: 'login', component: LoginComponent},
  {path: 'proveedor', component: ProveedorComponent},
  {path: 'orden_compra', component: OrdenCompraComponent, canActivate: [AuthGuard, RoleGuard], data: {role: 'ROLE_ADMIN'}},
  {path: 'orden_compra/page/:page', component: OrdenCompraComponent, canActivate: [AuthGuard, RoleGuard], data: {role: 'ROLE_ADMIN'}},
  {path: 'orden_compra/form', component: FormCompraComponent},
  {path: 'orden_compra/form/:id', component: FormCompraComponent},
  {path: 'orden_venta', component: OrdenVentaComponent, canActivate: [AuthGuard, RoleGuard], data: {role: 'ROLE_ADMIN'}},
  {path: 'orden_venta/page/:page', component: OrdenVentaComponent, canActivate: [AuthGuard, RoleGuard], data: {role: 'ROLE_ADMIN'}},
  {path: 'orden_venta/form', component: FormVentaComponent, canActivate: [AuthGuard, RoleGuard], data: {role: 'ROLE_ADMIN'}},
  {path: 'orden_venta/form/:id', component: FormVentaComponent, canActivate: [AuthGuard, RoleGuard], data: {role: 'ROLE_ADMIN'}},
  {path: 'producto/page/:page', component: ProductoComponent, canActivate: [AuthGuard, RoleGuard], data: {role: 'ROLE_ADMIN'}},
];

@NgModule({
  declarations: [	
    AppComponent,
    LoginComponent,
    HeaderComponent,
    PaginatorComponent,
    TablaAuxiliarComponent,
    UbigeoComponent,
    EmpresaComponent,
    ProveedorComponent,
    FrutaComponent,
    FrutaVariedadComponent,
    AlmacenComponent,
    SubTipoEmpaqueComponent,
    OrdenCompraComponent,
    FormCompraComponent,
    OrdenVentaComponent,
    FormVentaComponent,
    ClienteComponent,
    NumbersTwoDecimalsDirective,
    OnlyNumbersDirective,
    ProductoComponent,
   ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot(routes),
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatAutocompleteModule, MatInputModule, MatFormFieldModule,
    AgGridModule.withComponents([]),
    ServiceWorkerModule.register('service-worker.js', { enabled: environment.production })
  ],
  providers: [
    ProveedorService,
    ClienteService,
    OrdenCompraService,
    OrdenVentaService,
    TablaAuxiliarService,
    ProductoService,
    CambioCategoriaService,
    IndexedDBService,
    { provide: LOCALE_ID, useValue: 'es' },
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
