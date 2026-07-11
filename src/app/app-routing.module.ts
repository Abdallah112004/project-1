import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { AdministrationComponent } from './components/administration/administration.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AuthGuard } from './guards/auth.guard';
import { LoginGuard } from './guards/login.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: 'login',
    component: LoginComponent,
    canActivate: [LoginGuard]
  },

  {
    path: 'administration',
    component: AdministrationComponent,
    canActivate: [AuthGuard],
  },

  {
    path: 'profile/:id',
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },

  {
    path: 'profile',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
