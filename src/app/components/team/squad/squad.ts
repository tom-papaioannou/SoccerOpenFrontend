import { Component } from '@angular/core';
import { DataTable } from "../../shared/tables/data-table/data-table";

@Component({
  selector: 'app-squad',
  imports: [
    DataTable
  ],
  templateUrl: './squad.html',
  styleUrl: './squad.css'
})
export class Squad {
  displayedColumns = [
    { key: 'name', header: 'Name', width: '30%', sortable: true },
    { key: 'position', header: 'Position' },
    { key: 'age', header: 'Age', align: 'end', headerClass:'text-end', cellClass:'text-end' }
  ];
  people = [
    { name: 'Alice Johnson', age: 25, position: "CF" },
    { name: 'Bob Brown', age: 32, position: "CD" },
    { name: 'Charlie Core', age: 28, position: "GK" },
    { name: 'Dennis Dalton', age: 25, position: "CF" },
    { name: 'Roy Rience', age: 32, position: "CD" },
    { name: 'Charlie Charles', age: 28, position: "GK" },
    { name: 'Tom Petersen', age: 25, position: "ML" },
    { name: 'Andy Andrew', age: 32, position: "CD" },
    { name: 'John Jonnes', age: 28, position: "DL" },
    { name: 'Owen John', age: 25, position: "DR" },
    { name: 'Jack Jacky', age: 32, position: "DM" },
    { name: 'Nick Brown', age: 21, position: "MC" }
  ];
}
