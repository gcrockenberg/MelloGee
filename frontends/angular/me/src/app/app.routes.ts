import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/login/login.component')
            .then((mod) => mod.LoginComponent)
    },
    {
        path: 'me',
        loadComponent: () => import('./pages/main/main.component')
            .then((mod) => mod.MainComponent)
    },
    {
        path: 'test',
        loadComponent: () => import('./pages/layout-test/layout-test.component')
            .then((mod) => mod.LayoutTestComponent)
    }
    
];
