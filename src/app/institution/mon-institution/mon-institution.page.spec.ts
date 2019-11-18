import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MonInstitutionPage } from './mon-institution.page';

describe('MonInstitutionPage', () => {
  let component: MonInstitutionPage;
  let fixture: ComponentFixture<MonInstitutionPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MonInstitutionPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonInstitutionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
