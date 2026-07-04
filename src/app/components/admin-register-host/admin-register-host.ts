/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { ServerService } from '../../services/server.service';
import { IServer } from '../../models/server.model';
import { ActionButton } from '../shared/buttons/action-button/action-button';
import { FormDropdown } from '../shared/dropdowns/form-dropdown/form-dropdown';
import { FormTextfield } from '../shared/textfields/form-textfield/form-textfield';

@Component({
  selector: 'app-admin-register-host',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ActionButton,
    FormDropdown,
    FormTextfield
  ],
  templateUrl: './admin-register-host.html',
  styleUrl: './admin-register-host.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminRegisterHost implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  hostForm: FormGroup;
  serverOptions: { value: string; label: string }[] = [];
  loadingServers = false;
  submitting = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly serverService: ServerService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.hostForm = this.fb.group({
      username: ['', [Validators.required, Validators.maxLength(50)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      serverID: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadServers();
  }

  get canSubmit(): boolean {
    return this.hostForm.valid && !this.loadingServers && !this.submitting;
  }

  createHost(): void {
    this.hostForm.markAllAsTouched();
    this.errorMessage = null;
    this.successMessage = null;

    if (!this.canSubmit) {
      return;
    }

    const username = this.hostForm.get('username')!.value.trim();

    this.submitting = true;
    this.authService
      .registerHostByAdmin({
        username,
        password: this.hostForm.get('password')!.value,
        serverID: this.hostForm.get('serverID')!.value
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => {
          this.submitting = false;
          this.successMessage = `Host account "${username}" was created with role ${result.role}.`;
          this.hostForm.reset();
          this.cdr.markForCheck();
        },
        error: error => {
          this.submitting = false;
          this.errorMessage = this.getErrorMessage(error);
          this.cdr.markForCheck();
        }
      });
  }

  private loadServers(): void {
    this.loadingServers = true;
    this.errorMessage = null;

    this.serverService
      .getAllServers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: servers => {
          this.serverOptions = servers.map((server: IServer) => ({
            value: server.serverID,
            label: server.name
          }));

          if (this.serverOptions.length === 0) {
            this.errorMessage = 'Create a server before registering a host account.';
          }

          this.loadingServers = false;
          this.cdr.markForCheck();
        },
        error: error => {
          this.loadingServers = false;
          this.errorMessage = this.getErrorMessage(error, 'Failed to load servers.');
          this.cdr.markForCheck();
        }
      });
  }

  private getErrorMessage(error: unknown, fallback = 'Could not create host account.'): string {
    if (error instanceof HttpErrorResponse) {
      if (typeof error.error === 'string' && error.error.trim()) {
        return error.error;
      }

      if (error.error?.message) {
        return error.error.message;
      }
    }

    return fallback;
  }
}
