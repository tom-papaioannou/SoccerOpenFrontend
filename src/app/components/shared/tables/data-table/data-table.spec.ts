/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { DataTable } from './data-table';

interface TestRow {
  name: string;
  value: number;
}

describe('DataTable', () => {
  let component: DataTable<TestRow>;
  let fixture: ComponentFixture<DataTable<TestRow>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataTable, BrowserAnimationsModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataTable<TestRow>);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show all data when pageSize is 0 (pagination disabled)', () => {
    const data: TestRow[] = Array.from({ length: 15 }, (_, i) => ({ name: `item-${i}`, value: i }));
    component.data = data;
    component.columns = [{ key: 'name', header: 'Name' }, { key: 'value', header: 'Value' }];
    component.pageSize = 0;
    component.ngOnChanges({
      data: { currentValue: data, previousValue: [], firstChange: true, isFirstChange: () => true }
    });

    expect(component.renderedData.length).toBe(15);
  });

  it('should paginate data when pageSize is set', () => {
    const data: TestRow[] = Array.from({ length: 25 }, (_, i) => ({ name: `item-${i}`, value: i }));
    component.data = data;
    component.columns = [{ key: 'name', header: 'Name' }, { key: 'value', header: 'Value' }];
    component.pageSize = 10;
    component.ngOnChanges({
      data: { currentValue: data, previousValue: [], firstChange: true, isFirstChange: () => true }
    });

    expect(component.renderedData.length).toBe(10);
    expect(component.renderedData[0].name).toBe('item-0');
    expect(component.renderedData[9].name).toBe('item-9');
  });

  it('should navigate to second page', () => {
    const data: TestRow[] = Array.from({ length: 25 }, (_, i) => ({ name: `item-${i}`, value: i }));
    component.data = data;
    component.columns = [{ key: 'name', header: 'Name' }, { key: 'value', header: 'Value' }];
    component.pageSize = 10;
    component.ngOnChanges({
      data: { currentValue: data, previousValue: [], firstChange: true, isFirstChange: () => true }
    });

    component.onPage({ pageIndex: 1, pageSize: 10, length: 25 });
    expect(component.renderedData.length).toBe(10);
    expect(component.renderedData[0].name).toBe('item-10');
  });

  it('should show remaining items on last page', () => {
    const data: TestRow[] = Array.from({ length: 25 }, (_, i) => ({ name: `item-${i}`, value: i }));
    component.data = data;
    component.columns = [{ key: 'name', header: 'Name' }, { key: 'value', header: 'Value' }];
    component.pageSize = 10;
    component.ngOnChanges({
      data: { currentValue: data, previousValue: [], firstChange: true, isFirstChange: () => true }
    });

    component.onPage({ pageIndex: 2, pageSize: 10, length: 25 });
    expect(component.renderedData.length).toBe(5);
    expect(component.renderedData[0].name).toBe('item-20');
  });

  it('should reset to first page when data changes', () => {
    const data1: TestRow[] = Array.from({ length: 25 }, (_, i) => ({ name: `item-${i}`, value: i }));
    component.data = data1;
    component.columns = [{ key: 'name', header: 'Name' }, { key: 'value', header: 'Value' }];
    component.pageSize = 10;
    component.ngOnChanges({
      data: { currentValue: data1, previousValue: [], firstChange: true, isFirstChange: () => true }
    });

    // Navigate to page 2
    component.onPage({ pageIndex: 1, pageSize: 10, length: 25 });
    expect(component.pageIndex).toBe(1);

    // Change data — should reset to page 0
    const data2: TestRow[] = Array.from({ length: 5 }, (_, i) => ({ name: `new-${i}`, value: i }));
    component.data = data2;
    component.ngOnChanges({
      data: { currentValue: data2, previousValue: data1, firstChange: false, isFirstChange: () => false }
    });

    expect(component.pageIndex).toBe(0);
    expect(component.renderedData.length).toBe(5);
  });
});