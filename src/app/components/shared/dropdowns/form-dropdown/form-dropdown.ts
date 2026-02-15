/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import { CommonModule } from '@angular/common';
import { Component, forwardRef, Injector, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-form-dropdown',
  imports: [
    MatFormFieldModule,
    MatLabel,
    CommonModule,
    ReactiveFormsModule,
    MatSelectModule
  ],
  templateUrl: './form-dropdown.html',
  styleUrl: './form-dropdown.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormDropdown),
      multi: true,
    },
  ],
})
export class FormDropdown implements ControlValueAccessor, OnInit {
  // Input properties for customization
  @Input() labelText = '';
  @Input() placeHolderText = '';
  @Input() appearance: 'fill' | 'outline' = 'outline';
  @Input() hintText?: string;
  @Input() options: any[] = [];
  @Input() valueKey = 'value';
  @Input() displayKey = 'label';

  // Internal value
  value: any = null;
  disabled = false;
  
  ngControl: NgControl | null = null;

  constructor(private injector: Injector) {}

  ngOnInit() {
    try {
      this.ngControl = this.injector.get(NgControl);
    } catch {
      this.ngControl = null;
    }
  }

  get hasError(): boolean {
    return !!(this.ngControl?.invalid && this.ngControl?.touched);
  }

  get errorMessage(): string {
    if (this.ngControl?.errors?.['required']) {
      return 'This field is required';
    }
    return '';
  }

  // ControlValueAccessor callbacks
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  // CVA methods
  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // Select event handlers
  onSelectionChange(value: any): void {
    this.value = value;
    this.onChange(value);
  }

  onBlur(): void {
    this.onTouched();
  }
}
