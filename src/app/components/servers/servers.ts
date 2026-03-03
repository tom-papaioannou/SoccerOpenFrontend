/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule, MatCardContent } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormTextfield } from '../shared/textfields/form-textfield/form-textfield';
import { ServerService } from '../../services/server.service';
import { IServer } from '../../models/server.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-servers',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatCardContent,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    FormTextfield
  ],
  templateUrl: './servers.html',
  styleUrl: './servers.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Servers implements OnInit {
  private destroyRef = inject(DestroyRef);

  servers = signal<IServer[]>([]);
  busy = signal(false);
  errorMsg = signal<string | null>(null);

  serverForm: FormGroup;

  constructor(
    private serverService: ServerService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.serverForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]]
    });
  }

  ngOnInit(): void {
    this.loadServers();
  }

  loadServers(): void {
    this.busy.set(true);
    this.errorMsg.set(null);

    this.serverService.getAllServers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.servers.set(data);
          this.busy.set(false);
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.errorMsg.set(err.message || 'Failed to load servers');
          this.busy.set(false);
          this.cdr.markForCheck();
        }
      });
  }

  addServer(): void {
    if (!this.serverForm.valid) return;

    this.busy.set(true);

    this.serverService.createNewServer(this.serverForm.value.name)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.serverForm.reset();
          this.loadServers();
        },
        error: (err) => {
          this.errorMsg.set(err.message || 'Failed to create server');
          this.busy.set(false);
          this.cdr.markForCheck();
        }
      });
  }
}
