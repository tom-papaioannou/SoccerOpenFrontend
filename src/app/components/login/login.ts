/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */


import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ActionButton } from '../shared/buttons/action-button/action-button';
import { LinkButton } from '../shared/buttons/link-button/link-button';
import { Card } from '../shared/cards/card/card';
import { FormTextfield } from '../shared/textfields/form-textfield/form-textfield';

@Component({
  selector: 'app-login',
  imports: [
    Card,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    ActionButton,
    LinkButton,
    FormTextfield
],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './login.css'
})
export class Login{
  loginForm: FormGroup;
  role = "";

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      username: [''],
      password: ['']
    });
  }

  login(){
    this.authService.login(this.loginForm.value.username, this.loginForm.value.password).subscribe({
      next: (result) => {
        this.authService.afterSuccessfulLogin(result);
        this.role = this.authService.getRole();
        this.authService.getDefaultAuthenticatedRoute$().subscribe((route) => {
          this.router.navigate([route]);
        });
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  openRegister(): void {
    this.router.navigate(['/register']);
  }
}
