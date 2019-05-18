import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MembrePage } from './membre.page';

describe('MembrePage', () => {
  let component: MembrePage;
  let fixture: ComponentFixture<MembrePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MembrePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MembrePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
