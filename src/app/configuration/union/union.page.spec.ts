import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnionPage } from './union.page';

describe('UnionPage', () => {
  let component: UnionPage;
  let fixture: ComponentFixture<UnionPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnionPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
