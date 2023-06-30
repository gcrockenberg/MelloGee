import { ChangeDetectionStrategy, Component, Input, forwardRef, OnInit, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule, NgControl } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: forwardRef(() => InputComponent)
  }]
})
export class InputComponent implements ControlValueAccessor, OnInit {
  // ControlValueAccessor variables
  onChange?: (v: string) => void;
  onTouched?: any;
  value: string | undefined;
  // End ControlValueAccessor variables

  @Input() id: string | undefined;
  @Input() label: string | undefined;
  @Input() type: string | undefined;

  // For validation and error message handling in this component
  ngControl?: NgControl | null;
  

  constructor(private readonly injector: Injector) { }

  changeValue(value: string): void { 
    this.value = value;
    this.onTouched?.();
    this.onChange?.(value);
  }

  ngOnInit() { 
    this.ngControl = this.injector.get(NgControl);    
  }

  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    //console.log(`InputComponent.setDisabled(): ${isDisabled}`);
  }

  writeValue(value: string | undefined): void {
    this.value = value;
  }

}
