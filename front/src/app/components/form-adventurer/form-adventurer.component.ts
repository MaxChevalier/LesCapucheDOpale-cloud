import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { AdventurerFormData, ConsumableType, EquipmentType, Speciality } from '../../models/models';

import { forkJoin } from 'rxjs';
import { SpecialityService } from '../../services/speciality/speciality.service';
import { EquipmentService } from '../../services/equipment/equipment.service';
import { ConsumableService } from '../../services/consumable/consumable.service';
import { FormMoney } from '../form-money/form-money';

@Component({
    selector: 'app-form-adventurer',
    imports: [ReactiveFormsModule, FormMoney],
    templateUrl: './form-adventurer.component.html',
    styleUrl: './form-adventurer.component.scss'
})
export class FormAdventurerComponent implements OnInit {
  @Output() formSubmitted = new EventEmitter<AdventurerFormData>();
  @Input() initialData: AdventurerFormData | null = null;

  protected adventurerForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    speciality: new FormControl(0, [Validators.required]),
    equipmentType: new FormControl([] as number[], []),
    consumableType: new FormControl([] as number[], []),
    dailyRate: new FormControl(0, [Validators.required, Validators.min(0)]),
  });

  protected specialities: Speciality[] = [];
  protected equipmentTypes: EquipmentType[] = [];
  protected consumableTypes: ConsumableType[] = [];
  protected hasSubmitted = false;

  constructor(
    private readonly specialityService: SpecialityService,
    private readonly equipmentService: EquipmentService,
    private readonly consumableService: ConsumableService
  ) { }

  ngOnInit(): void {
    forkJoin({
      specialities: this.specialityService.getSpecialities(),
      equipment: this.equipmentService.getEquipment(),
      consumables: this.consumableService.getConsumables()
    }).subscribe(({ specialities, equipment, consumables }) => {
      this.specialities = specialities;
      this.equipmentTypes = equipment;
      this.consumableTypes = consumables;
    });

    if (this.initialData) {
      this.adventurerForm.patchValue({
        name: this.initialData.name,
        speciality: this.initialData.speciality,
        equipmentType: this.initialData.equipmentType,
        consumableType: this.initialData.consumableType,
        dailyRate: this.initialData.dailyRate,
      });
    }
  }

  protected onSubmit(): void {
    this.hasSubmitted = true;
    if (this.adventurerForm.invalid) {
      return;
    }
    this.formSubmitted.emit(
      this.adventurerForm.value as AdventurerFormData
    );
  }

  protected getMoney(): number {
    return this.adventurerForm.get('dailyRate')?.value ?? 0;
  }

  protected setMoney(value: number): void {
    this.adventurerForm.get('dailyRate')?.setValue(value);
  }
}
