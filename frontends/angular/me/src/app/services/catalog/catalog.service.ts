import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

const baseUrl = '';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {

  constructor(private http: HttpClient) { }
}
