import { CommonModule } from '@angular/common';
import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-form-textfield',
  imports: [
    MatFormFieldModule,
    MatLabel,
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './form-textfield.html',
  styleUrl: './form-textfield.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormTextfield),
      multi: true,
    },
  ],
})
export class FormTextfield implements ControlValueAccessor {
  // Input properties for customization
  @Input() labelText = '';
  @Input() placeHolderText = '';
  @Input() type: 'text' | 'password' | 'email' = 'text';
  @Input() showToggle = false;
  @Input() appearance: 'fill' | 'outline' = 'outline';
  @Input() hintText?: string;

  // Internal value
  value: string | null = null;
  disabled = false;

  hidePassword = true;

  get inputType(): string {
    if (this.type !== 'password') return this.type;
    return this.hidePassword ? 'password' : 'text';
  }


  // ControlValueAccessor callbacks
  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  // CVA methods
  writeValue(value: string | null): void {
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

  // Input event handlers
  onInput(value: string): void {
    this.value = value;
    this.onChange(value);
  }

  onBlur(): void {
    this.onTouched();
  }
}
