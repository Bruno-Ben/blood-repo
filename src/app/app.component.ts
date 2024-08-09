import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import $ from "jquery";

import { HttpClientModule } from '@angular/common/http';
import { Observable } from 'rxjs';

interface ApiResponse {
  peopleByState: { [state: string]: number };
  averageBMIByAgeGroup: { [key: string]: number };
  percentageOfSexWithHighBMI: { [key: string]: number };
  averageAgePerBloodType: { [bloodType: string]: number };
  donorCount: { [bloodType: string]: number };

}
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HttpClientModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {
  title = 'new-angular-app2';

  selectedFile: File | null = null;
  peopleByState: { [state: string]: number } = {};
  averageBMIByAgeGroup: { [state: string]: string } = {};
  percentageOfSexWithHighBMI: { [key: string]: number } = {};
  averageAgePerBloodType: { [bloodType: string]: string } = {};
  donorCount: { [bloodType: string]: number } = {};
  peopleByStatePartOne: {key: string, value: number}[] = [];
  peopleByStatePartTwo: {key: string, value: number}[] = [];
  indices: number[] = [];

  constructor(private http: HttpClient, private router: Router) { }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }
  

  onSubmit(): void {
    if (this.selectedFile) {
      const reader = new FileReader();
      const formData = new FormData();
      formData.append('file', this.selectedFile);

      this.http.post('http://localhost:8080/api/data', formData, {
      }).pipe().subscribe(response => {
        console.log('File uploaded successfully', response);
      }, error => {
        console.error('Error uploading file', error);
      });

      reader.readAsText(this.selectedFile);
      
    } else {
      console.warn('No file selected');
    }
  }
  

  fetchData(): void {
    this.http.get<ApiResponse>('http://localhost:8080/api/data')
      .subscribe(data => {
        this.peopleByState = data['peopleByState'];
        const allEntries = Object.entries(this.peopleByState);
        const half = Math.ceil(allEntries.length / 2);

        this.peopleByStatePartOne = allEntries.slice(0, half).map(([key, value]) => ({key, value}));
        this.peopleByStatePartTwo = allEntries.slice(half).map(([key, value]) => ({key, value}));

        this.indices = Array.from(Array(this.peopleByStatePartOne.length).keys());
        this.averageBMIByAgeGroup =  this.formatBMIData(data['averageBMIByAgeGroup']);
        this.percentageOfSexWithHighBMI = data['percentageOfSexWithHighBMI'];
        this.averageAgePerBloodType = this.formatBMIData(data['averageAgePerBloodType']);
        this.donorCount = data['donorCount'];

        $('.main-container').css('display', 'flex');
        $('.result-container').css('display', 'flex');
        $('.data-container').css('display', 'block');

      }, error => {
        console.error('Error fetching data', error);
      });
    }
  
  formatBMIData(data: { [key: string]: number }): { [key: string]: string } {
    const formattedData: { [key: string]: string } = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        formattedData[key] = data[key].toFixed(2);
      }
    }
    return formattedData;
  }
  
  getAgeGroups(): string[] {
    return Object.keys(this.averageBMIByAgeGroup).sort((a, b) => {
      const [aStart] = a.split('-').map(Number);
      const [bStart] = b.split('-').map(Number);
      return aStart - bStart;
    });
  }
  


  getSexTypes(): string[] {
    return Object.keys(this.percentageOfSexWithHighBMI);
  }

  getFirstHalfOfPeopleByState(): { key: string, value: number }[] {
    const entries = Object.entries(this.peopleByState);
    const half = Math.ceil(entries.length / 2);
    return entries.slice(0, half).map(([key, value]) => ({ key, value }));
  }

  // Method to get the second half of the peopleByState entries
  getSecondHalfOfPeopleByState(): { key: string, value: number }[] {
    const entries = Object.entries(this.peopleByState);
    const half = Math.ceil(entries.length / 2);
    return entries.slice(half).map(([key, value]) => ({ key, value }));
  }

  getBloodTypes() {
    return this.averageAgePerBloodType ? Object.keys(this.averageAgePerBloodType) : [];
  }

  getSexDonorBloodTypes() {
    return this.donorCount ? Object.keys(this.donorCount) : [];
  }
}