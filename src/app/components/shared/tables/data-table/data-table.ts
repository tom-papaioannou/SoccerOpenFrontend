/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, TemplateRef, Output, EventEmitter } from '@angular/core';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-data-table',
  imports: [
    MatTableModule,
    CommonModule,
    MatSortModule,
    MatPaginatorModule,
    DragDropModule
  ],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss'
})
export class DataTable<T> implements OnChanges{
  ngOnChanges(changes: SimpleChanges): void {
    this.sortedData = [...this.data];
    // Apply initial sort if provided and not yet set
    if (changes['initialSort'] && this.initialSort && !this.active) {
      this.active = this.initialSort.active;
      this.direction = this.initialSort.direction;
    }
    // Reset to first page when data changes
    if (changes['data']) {
      this.pageIndex = 0;
    }
    this.applySort();
  }
  @Input() data: T[] = [];
  @Input() columns: ColumnDef<T>[] = [];
  @Input() tableClass = 'app-table';
  @Input() initialSort?: { active: string; direction: 'asc' | 'desc' };
  @Input() pageSize = 0;
  @Input() pageSizeOptions: number[] = [5, 10, 25];
  @Input() enableDragDrop = false;
  @Output() rowClick = new EventEmitter<T>();
  @Output() rowDrop = new EventEmitter<{ draggedRow: T; droppedOnRow: T }>();
  private active = '';
  private direction: 'asc' | 'desc' | '' = '';
  private sortedData: T[] = [];
  renderedData: T[] = [];
  pageIndex = 0;
  get displayed() { return this.columns.map(c => c.key); }

  onRowClick(row: T): void {
    this.rowClick.emit(row);
  }

  onDrop(event: CdkDragDrop<T[]>): void {
    if (event.previousIndex === event.currentIndex) return;
    const draggedRow = this.renderedData[event.previousIndex];
    const droppedOnRow = this.renderedData[event.currentIndex];
    this.rowDrop.emit({ draggedRow, droppedOnRow });
  }

  onSort(e: Sort) {
    this.active = e.active;
    this.direction = e.direction;
    this.applySort();
  }

  onPage(e: PageEvent) {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
    this.applyPage();
  }

  private applySort() {
    if (!this.active || !this.direction) {
      this.sortedData = [...this.data];
    } else {
      const col = this.columns.find(c => c.key === this.active);
      if (!col) return;

      const accessor = col.sortAccessor
        ? (row: T) => col.sortAccessor!(row)
        : (row: T) => (row as any)[this.active];

      const cmp = col.comparator ?? defaultComparator;

      this.sortedData = [...this.data].sort((ra, rb) => {
        const a = accessor(ra);
        const b = accessor(rb);
        const result = cmp(a, b);
        return this.direction === 'asc' ? result : -result;
      });
    }
    this.applyPage();
  }

  private applyPage() {
    if (this.pageSize > 0) {
      const start = this.pageIndex * this.pageSize;
      this.renderedData = this.sortedData.slice(start, start + this.pageSize);
    } else {
      this.renderedData = this.sortedData;
    }
  }
}

function defaultComparator(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;

  if (typeof a === 'number' && typeof b === 'number') return a - b;

  const ad = asDate(a), bd = asDate(b);
  if (ad && bd) return ad.getTime() - bd.getTime();

  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
}

function asDate(v: unknown): Date | null {
  if (v instanceof Date) return v;
  if (typeof v === 'string' || typeof v === 'number') {
    const d = new Date(v as any);
    return isNaN(+d) ? null : d;
  }
  return null;
}


export interface ColumnDef<T = any> {
  key: string;
  header: string;
  width?: string;
  align?: 'left'|'center'|'right';
  sticky?: boolean;
  headerClass?: string;
  cellClass?: string;
  cellTemplate?: TemplateRef<{ $implicit: T; value: any }>;
  sortable?: boolean;
  sortAccessor?: (row: T) => unknown;
  comparator?: (a: unknown, b: unknown) => number;
}