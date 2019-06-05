import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModulesPage } from './modules.page';

describe('ModulesPage', () => {
  let component: ModulesPage;
  let fixture: ComponentFixture<ModulesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModulesPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModulesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
