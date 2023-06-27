import { APP_BASE_HREF } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// EmptyRouteComponent was created for us by create-single-spa 
import { EmptyRouteComponent } from './empty-route/empty-route.component';

// const routes: Routes = [
//   { path: '**', component: EmptyRouteComponent }
// ];

@NgModule({
  declarations: [EmptyRouteComponent],
  imports: [
    RouterModule.forRoot([{ path: '**', component: EmptyRouteComponent }]),
  ],
  providers: [{ provide: APP_BASE_HREF, useValue: '/' }],
  exports: [RouterModule]
})
export class AppRoutingModule { } 
