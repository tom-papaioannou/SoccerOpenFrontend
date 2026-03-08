/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ActionButton } from '../shared/buttons/action-button/action-button';
import { FormTextfield } from '../shared/textfields/form-textfield/form-textfield';
import { LinkButton } from '../shared/buttons/link-button/link-button';
import { FormDropdown } from '../shared/dropdowns/form-dropdown/form-dropdown';
import { AuthService } from '../../services/auth.service';
import { ServerService } from '../../services/server.service';

@Component({
  selector: 'app-register',
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    CommonModule,
    ActionButton,
    LinkButton,
    FormTextfield,
    FormDropdown
  ],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register implements OnInit {
  registerForm: FormGroup;
  roleOptions = [
    { value: 'Admin', label: 'Admin' },
    { value: 'Host', label: 'Host' },
    { value: 'User', label: 'User' }
  ];
  serverOptions: { value: string; label: string }[] = [];
  
  private readonly SNACKBAR_DURATION_MS = 3000;
  private readonly REDIRECT_DELAY_MS = 2000;

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly serverService: ServerService,
    private readonly snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      role: ['', Validators.required],
      serverID: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.serverService.getAllServers().subscribe({
      next: (servers) => {
        this.serverOptions = servers.map(s => ({ value: s.serverID, label: s.name }));
      },
      error: (err) => {
        console.error('Failed to load servers', err);
        this.snackBar.open('Failed to load servers. Please try again later.', 'Close', {
          duration: this.SNACKBAR_DURATION_MS,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  passwordMatchValidator = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (!password || !confirmPassword) {
      return null;
    }
    
    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  };

  get passwordMismatch(): boolean {
    const confirmPassword = this.registerForm.get('confirmPassword');
    return this.registerForm.hasError('passwordMismatch') && 
           (confirmPassword?.touched || false) &&
           (confirmPassword?.value?.length > 0);
  }

  register(){
    // Mark all fields as touched to show validation errors
    Object.keys(this.registerForm.controls).forEach(key => {
      this.registerForm.get(key)?.markAsTouched();
    });

    // Validate form before sending request
    if (!this.registerForm.valid) {
      return;
    }

    // Do not send confirmPassword to backend
    let data = {
      username: this.registerForm.value.username,
      password: this.registerForm.value.password,
      role: this.registerForm.value.role,
      serverID: this.registerForm.value.serverID
    };
    this.authService.register(data).subscribe({
      next: (result) => {
        this.snackBar.open('Registration successful!', 'Close', {
          duration: this.SNACKBAR_DURATION_MS,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
        // Navigate to login after successful registration
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, this.REDIRECT_DELAY_MS);
      },
      error: (error) => {
        console.error(error);
        const errorMessage = error?.error?.message || error?.message || 'Registration failed. Please try again.';
        this.snackBar.open(errorMessage, 'Close', {
          duration: this.SNACKBAR_DURATION_MS,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}
