import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormMoney } from './form-money';

describe('FormMoney', () => {
  let component: FormMoney;
  let fixture: ComponentFixture<FormMoney>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormMoney],
    }).compileComponents();

    fixture = TestBed.createComponent(FormMoney);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with zeros', () => {
    expect(component.form.get('po')?.value).toBe(0);
    expect(component.form.get('pa')?.value).toBe(0);
    expect(component.form.get('pc')?.value).toBe(0);
  });

  it('should calculate money correctly and emit event', () => {
    const emitSpy = spyOn(component.moneyChange, 'emit');

    component.form.get('po')?.setValue(3);
    component.form.get('pa')?.setValue(4);
    component.form.get('pc')?.setValue(5);

    component['onChange']();

    // money = 3*100 + 4*10 + 5 = 345
    expect(component.money).toBe(345);
    expect(emitSpy).toHaveBeenCalledWith(345);
  });

  it('should update form controls based on computed money', () => {
    component.form.get('po')?.setValue(7);
    component.form.get('pa')?.setValue(2);
    component.form.get('pc')?.setValue(8);

    component['onChange']();

    // Vérifie que les champs sont recalculés sans émettre d'événement
    expect(component.form.get('po')?.value).toBe(7);
    expect(component.form.get('pa')?.value).toBe(2);
    expect(component.form.get('pc')?.value).toBe(8);
  });

  it('should handle null or undefined values gracefully', () => {
    const emitSpy = spyOn(component.moneyChange, 'emit');

    component.form.get('po')?.setValue(null);
    component.form.get('pa')?.setValue(null);
    component.form.get('pc')?.setValue(null);

    component['onChange']();

    expect(component.money).toBe(0);
    expect(emitSpy).toHaveBeenCalledWith(0);
  });
});
