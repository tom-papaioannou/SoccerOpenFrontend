import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { MatCard } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { ActionButton } from '../shared/buttons/action-button/action-button';
import { FormTextfield } from '../shared/textfields/form-textfield/form-textfield';
import { LinkButton } from '../shared/buttons/link-button/link-button';
import { FormDropdown } from '../shared/dropdowns/form-dropdown/form-dropdown';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [
    MatCard,
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
export class Register {
  registerForm: FormGroup;
  roleOptions = [
    { value: 'Admin', label: 'Admin' },
    { value: 'Host', label: 'Host' },
    { value: 'User', label: 'User' }
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      username: [''],
      password: [''],
      confirmPassword: [''],
      role: ['']
    }, { validators: this.passwordMatchValidator });
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
    // Validate form before sending request
    if (!this.registerForm.valid) {
      return;
    }

    // Do not send confirmPassword to backend
    let data = {
      username: this.registerForm.value.username,
      password: this.registerForm.value.password,
      role: this.registerForm.value.role
    };
    this.authService.register(data).subscribe({
      next: (result) => {
        debugger
        // this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error(error);
      }
    });
  }
}
