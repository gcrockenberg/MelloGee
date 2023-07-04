import { Routes } from '@angular/router';
import { MsalGuard, MsalRedirectComponent } from '@azure/msal-angular';
import { LoginComponent } from './pages/login/login.component';
import { MainComponent } from './pages/main/main.component';
import { LayoutTestComponent } from './pages/layout-test/layout-test.component';
import { DeleteMyDataComponent } from './pages/delete-my-data/delete-my-data.component';
import { PrivacyComponent } from './pages/privacy/privacy.component';

export const routes: Routes = [
    {
        path: '',
        component: MainComponent
    },
    {
        path: 'login',
        component: LoginComponent
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
        path: 'test',
        component: LayoutTestComponent
    },
    {
        path: 'delete-my-data',
        component: DeleteMyDataComponent
    },
    {   // Using MsalGuard
        path: 'privacy',
        component: PrivacyComponent,
        canActivate: [
            MsalGuard
        ]
    },
    {   // loadComponent format
        path: 'tos',
        loadComponent: () => import('./pages/tos/tos.component')
            .then((mod) => mod.TosComponent)
    }

];
