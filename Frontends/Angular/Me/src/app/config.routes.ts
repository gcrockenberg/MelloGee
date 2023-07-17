import { Routes } from '@angular/router';
import { MsalGuard, MsalRedirectComponent } from '@azure/msal-angular';
import { LoginComponent } from './pages/login/login.component';
import { MainComponent } from './pages/main/main.component';
import { DeleteMyDataComponent } from './pages/delete-my-data/delete-my-data.component';
import { PrivacyComponent } from './pages/privacy/privacy.component';
import { SecureComponent } from './pages/secure/secure.component';
import { CatalogComponent } from './pages/catalog/catalog.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ThreeDComponent } from './pages/3D/three-d/three-d.component';
import { NotFoundComponent } from './pages/not-found/not-found/not-found.component';

export const routes: Routes = [
    {
        path: '',
        component: MainComponent
    },
    {
        path: 'catalog',
        component: CatalogComponent
    },
    {
        path: '3D',
        component: ThreeDComponent
    },
    {
        path: 'secure',
        component: SecureComponent,
        canActivate: [
            MsalGuard
        ]
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'profile',
        component: ProfileComponent
    },
    {
        // Needed for handling redirect after login
        path: 'auth',
        component: MsalRedirectComponent
    },
    {
        path: 'me',
        component: MainComponent
    },
    {
        path: 'delete-my-data',
        component: DeleteMyDataComponent
    },
    { 
        path: 'privacy',
        component: PrivacyComponent        
    },
    {   // loadComponent format
        path: 'tos',
        loadComponent: () => import('./pages/tos/tos.component')
            .then((mod) => mod.TosComponent)
    },
    // Without wild card not found the home page will be loaded on bad routes
    // {
    //     path: '**',
    //     component: NotFoundComponent
    // }

];