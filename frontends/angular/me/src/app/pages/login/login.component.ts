import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { InputComponent } from "../../components/input/input.component";

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
    private auth: AuthService,
    private router: Router) { }
  
  
  ngOnInit(): void { 
    this.form = this.fb.nonNullable.group({
      username: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }


  onSubmit() { 
    console.log('SIGN IN: ', this.form?.value);
    const { email, password } = this.form?.getRawValue();

    // Test saimon@devdactic.com, 123456
    this.auth.login(email, password).subscribe({
      next: (res) => { 
        console.log('LOGIN RESULT: ', res);
        this.router.navigateByUrl('/me');
      },
      error: (err: any) => { 
        console.log('LOGIN ERROR: ', err);
        this.error = 'Login failed';
      }
    });
  }

  
  createAccount() {
    console.log('CREATE ACCOUNT: ', this.form?.value);
    const { email, password } = this.form?.getRawValue();

    // Test saimon@devdactic.com, 123456
    this.auth.register(email, password).subscribe({
      next: (res) => {
        console.log('REGISTER RESULT: ', res);
        this.router.navigateByUrl('/me');
      },
      error: (err: any) => {
        console.log('REGISTER ERROR: ', err);
        this.error = 'Registration failed';
      }
    });
  }


  /**
   * Switch from login mode to register mode.
   */
  toggleIsLogin() {
    this.isLogin = !this.isLogin;
  }
}
