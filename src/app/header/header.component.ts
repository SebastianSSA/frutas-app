import { Component, OnInit } from '@angular/core';
import { AuthService } from '../usuarios/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  title: string = "Frutas";
  navbarCollapsed:boolean = true;

  constructor(public _authService: AuthService, private router: Router) { }

  ngOnInit(): void {}

  logout(): void {
    this._authService.logout();
    this.router.navigate(['/login']);
  }

  navegarPagina(pagina){
    this.navbarCollapsed = true;
    this.router.navigate([pagina]);    
  }
}
