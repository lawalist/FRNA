import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DerniereModificationComponent } from './derniere-modification.component';

describe('DerniereModificationComponent', () => {
  let component: DerniereModificationComponent;
  let fixture: ComponentFixture<DerniereModificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DerniereModificationComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DerniereModificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
