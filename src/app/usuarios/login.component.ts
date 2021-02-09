import { Component, OnInit } from '@angular/core';
import { Usuario } from './usuario';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { IndexedDBService } from '../common/indexed-db.service';
import swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {

  titulo: string = "Inicie Sesion";
  usuario: Usuario;

  constructor(private authService: AuthService, private router: Router, private indexedDBService: IndexedDBService) {
    this.usuario = new Usuario();
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      swal.fire('Login', `${this.authService.usuario.username}, sesion ya iniciada`, 'info');
      this.router.navigate(['/']);
    }
  }

  login(): void {
    //console.log(this.usuario);
    if(this.usuario.username == null || this.usuario.password == null) {
      swal.fire('Error Login', 'Usuario o Password vacios', 'error');
      return;
    }

    this.authService.login(this.usuario).subscribe(response => {
      this.authService.guardarUsuario(response.access_token);
      this.authService.guardarToken(response.access_token);

      let usuario = this.authService.usuario;

      this.indexedDBService.deleteElement('token-user');
      this.indexedDBService.addToken(this.authService.token).then(() => this.router.navigate(['/']));
    }, err => {
      if (err.status == 400) {
        swal.fire('Error Login', 'Error al iniciar sesion', 'error');
        console.log(err);
      }
    });
  }
}
