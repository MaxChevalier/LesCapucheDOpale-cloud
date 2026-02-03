import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { EquipmentFormData, EquipmentType } from '../../models/models';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EquipmentService } from '../../services/equipment/equipment.service';
import { forkJoin } from 'rxjs';
import { FormMoney } from '../form-money/form-money';
import { MatFormField } from "@angular/material/input";
import { MatOption, MatSelect } from "@angular/material/select";

@Component({
  selector: 'app-form-equipment',
  imports: [ReactiveFormsModule, FormMoney, MatFormField, MatSelect, MatOption],
  templateUrl: './form-equipment.html',
  styleUrl: './form-equipment.scss',
})
export class FormEquipment implements OnInit, OnChanges {
  @Output() submitForm = new EventEmitter<EquipmentFormData>();
  @Input() initialData: EquipmentFormData | null = null;

  protected equipmentForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    equipmentTypeId: new FormControl('', [Validators.required]),
    cost: new FormControl(0, [Validators.required, Validators.min(0)]),
    maxDurability: new FormControl(0, [Validators.required, Validators.min(1)]),
    newTypeName: new FormControl(''),
  });
  protected equipmentTypes: EquipmentType[] = [];
  protected showTypePopup = false;
  protected newTypeError = '';

  constructor(
    private readonly equipmentService: EquipmentService,
  ) { }

  ngOnInit(): void {
    forkJoin({
      equipment: this.equipmentService.getEquipmentType(),
    }).subscribe(({ equipment }) => {
      this.equipmentTypes = equipment;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialData'] && this.initialData) {
      this.equipmentForm.patchValue({
        name: this.initialData.name,
        equipmentTypeId: this.initialData.equipmentTypeId?.toString() ?? '',
        cost: this.initialData.cost,
        maxDurability: this.initialData.maxDurability,
      });
    }
  }

  protected get name() {
    return this.equipmentForm.get('name')!;
  }

  protected get equipmentTypeId() {
    return this.equipmentForm.get('equipmentTypeId')!;
  }

  protected get cost() {
    return this.equipmentForm.get('cost')!;
  }

  protected get maxDurability() {
    return this.equipmentForm.get('maxDurability')!;
  }

  protected getMoney(): number {
    return this.equipmentForm.get('cost')?.value ?? 0;
  }

  protected setMoney(value: number): void {
    this.equipmentForm.get('cost')?.setValue(value);
  }

  protected onSubmit(): void {
    if (this.equipmentForm.invalid) {
      console.warn('Form is invalid, cannot submit.');
      return;
    }
    this.submitForm.emit({
      name: this.equipmentForm.value.name!,
      equipmentTypeId: +this.equipmentForm.value.equipmentTypeId!,
      cost: this.getMoney(),
      maxDurability: this.equipmentForm.value.maxDurability!,
    });
  }

  addNewEquipmentType(): void {
    this.newTypeError = '';

    if (!this.equipmentForm.get('newTypeName')?.value?.trim()) {
      this.newTypeError = 'Le nom du type est requis.';
      return;
    }
    this.equipmentService.addEquipmentType(this.equipmentForm.get('newTypeName')?.value ?? '').subscribe({
      next: (createdType) => {
        this.equipmentTypes.push(createdType);
        this.equipmentForm.get('equipmentTypeId')?.setValue(createdType.id.toString());
        this.showTypePopup = false;
        this.equipmentForm.get('newTypeName')?.setValue('');
      },
      error: (err) => {
        this.newTypeError = 'Erreur lors de l\'ajout du type : ' + err.message;
      }
    });
  }

  cancelPopup(): void {
    this.showTypePopup = false;
    this.equipmentForm.get('newTypeName')?.setValue('');
    this.newTypeError = '';
  }
}
