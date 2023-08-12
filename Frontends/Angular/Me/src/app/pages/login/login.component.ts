import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InputComponent } from "../../shared/components/input/input.component";

@Component({
    selector: 'app-login',
    standalone: true,
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        InputComponent
    ]
})
export class LoginComponent implements OnInit {
  //Variables
  form!: FormGroup;
  error = '';
  isLogin: boolean = true;

  constructor(
    private fb: FormBuilder,
    private router: Router) { }
  
  
  ngOnInit(): void { 
    this.form = this.fb.nonNullable.group({
      username: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }


  onSubmit() { }

  /**
   * Switch from login mode to register mode.
   */
  toggleIsLogin() {
    this.isLogin = !this.isLogin;
  }
}
