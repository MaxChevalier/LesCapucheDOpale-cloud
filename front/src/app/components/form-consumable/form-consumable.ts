import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ConsumableFormData, ConsumableType } from '../../models/models';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConsumableService } from '../../services/consumable/consumable.service';
import { forkJoin } from 'rxjs';
import { FormMoney } from '../form-money/form-money';
import {MatFormField} from "@angular/material/input";
import {MatOption, MatSelect} from "@angular/material/select";

@Component({
  selector: 'app-form-consumable',
  imports: [ReactiveFormsModule, FormMoney, MatFormField, MatSelect, MatOption],
  templateUrl: './form-consumable.html',
  styleUrl: './form-consumable.scss',
})
export class FormConsumable implements OnInit, OnChanges {
  @Output() submitForm = new EventEmitter<ConsumableFormData>();
  @Input() initialData: ConsumableFormData | null = null;

  protected consumableForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    consumableTypeId: new FormControl('', [Validators.required]),
    cost: new FormControl(0, [Validators.required, Validators.min(0)]),
    quantity: new FormControl(0, [Validators.required, Validators.min(1)]),
    newTypeName: new FormControl(''),
  });
  protected consumableTypes: ConsumableType[] = [];
  protected showTypePopup = false;
  protected newTypeError = '';

  constructor(
    private readonly consumableService: ConsumableService,
  ) { }

  ngOnInit(): void {
    forkJoin({
      consumable: this.consumableService.getConsumableTypes(),
    }).subscribe(({ consumable }) => {
      this.consumableTypes = consumable;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialData'] && this.initialData) {
      this.consumableForm.patchValue({
        name: this.initialData.name,
        consumableTypeId: this.initialData.consumableTypeId?.toString() ?? '',
        cost: this.initialData.cost,
      });
      this.consumableForm.get('quantity')?.disable();
    }
  }

  protected get name() {
    return this.consumableForm.get('name')!;
  }

  protected get consumableTypeId() {
    return this.consumableForm.get('consumableTypeId')!;
  }

  protected get cost() {
    return this.consumableForm.get('cost')!;
  }

  protected get quantity() {
    return this.consumableForm.get('quantity')!;
  }

  protected getMoney(): number {
    return this.consumableForm.get('cost')?.value ?? 0;
  }

  protected setMoney(value: number): void {
    this.consumableForm.get('cost')?.setValue(value);
  }

  protected onSubmit(): void {
    if (this.consumableForm.invalid) {
      console.warn('Form is invalid, cannot submit.');
      return;
    }
    this.submitForm.emit({
      name: this.consumableForm.value.name!,
      consumableTypeId: +this.consumableForm.value.consumableTypeId!,
      cost: this.getMoney(),
      quantity: this.consumableForm.value.quantity!,
    });
  }

  addNewConsumableType(): void {
    this.newTypeError = '';

    if (!this.consumableForm.get('newTypeName')?.value?.trim()) {
      this.newTypeError = 'Le nom du type est requis.';
      return;
    }
    this.consumableService.addConsumableType(this.consumableForm.get('newTypeName')?.value ?? '').subscribe({
      next: (createdType) => {
        this.consumableTypes.push(createdType);
        this.consumableForm.get('consumableTypeId')?.setValue(createdType.id.toString());
        this.showTypePopup = false;
        this.consumableForm.get('newTypeName')?.setValue('');
      },
      error: (err) => {
        this.newTypeError = 'Erreur lors de l\'ajout du type : ' + err.message;
      }
    });
  }

  cancelPopup(): void {
    this.showTypePopup = false;
    this.consumableForm.get('newTypeName')?.setValue('');
    this.newTypeError = '';
  }
}
