import { Routes } from '@angular/router';
import { MsalGuard, MsalRedirectComponent } from '@azure/msal-angular';
import { LoginComponent } from './pages/login/login.component';
import { MainComponent } from './pages/main/main.component';
import { DeleteMyDataComponent } from './pages/delete-my-data/delete-my-data.component';
import { PrivacyComponent } from './pages/privacy/privacy.component';
import { CatalogComponent } from './pages/catalog/catalog/catalog.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { NotFoundComponent } from './pages/not-found/not-found/not-found.component';
import { CartComponent } from './pages/cart/cart/cart.component';
import { OrdersComponent } from './pages/order/orders/orders.component';
import { ProductsComponent } from './pages/catalog/products/products.component';
import { SearchResultsComponent } from './pages/search/search-results/search-results.component';
import { ProductDetailsComponent } from './pages/catalog/product-details/product-details.component';
import { OrderDetailsComponent } from './pages/order/order-details/order-details.component';
import { CheckoutComponent } from './pages/order/checkout/checkout.component';
import { UnityComponent } from './pages/unity/unity.component';

export const routes: Routes = [
    {
        path: '',
        component: MainComponent,
    },
    {
        path: 'catalog',
        component: CatalogComponent
    },
    {
        path: 'products/:typeId',
        component: ProductsComponent
    },
    {
        path: 'product-details/:id',
        component: ProductDetailsComponent
    },
    {
        path: 'search/:searchTerm',
        component: SearchResultsComponent
    },
    {
        path: 'cart',
        component: CartComponent
    },
    {
        path: 'checkout/:orderId',
        loadComponent: () => import('./pages/order/checkout/checkout.component')
            .then((mod) => mod.CheckoutComponent),
        canActivate: [
            MsalGuard
        ]
    },
    {
        path: 'orders',
        component: OrdersComponent,
        canActivate: [
            MsalGuard
        ]
    },
    {
        path: 'order-details/:id',
        component: OrderDetailsComponent,
        canActivate: [
            MsalGuard
        ]
    },
    {
        path: '3D',
        loadComponent: () => import('./pages/3D/three-d/three-d.component')
            .then((mod) => mod.ThreeDComponent)
    },
    {
        path: 'unity',
        component: UnityComponent
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
