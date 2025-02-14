import { Component } from '@angular/core';
import { Sale } from '../../../entidades/sale';
import { SaleService } from '../../../servicios/sale/sale.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-adminsale',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './adminsale.component.html',
  styleUrl: './adminsale.component.css'
})
export class AdminsaleComponent {
  sales: Sale[] = [];
  searchTerm: string = '';
  showReportModal: boolean = false;
  selectedSale?: Sale;

  constructor(private saleService: SaleService) {}

  ngOnInit(): void {
    this.loadSales();
  }

  loadSales(): void {
    this.saleService.getSales().subscribe({
      next: (data: Sale[]) => this.sales = data,
      error: (error) => console.error('Error al cargar las ventas:', error)
    });
  }

  filterSales(): Sale[] {
    return this.sales.filter(sale =>
      sale.vehiculo.brand.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      sale.vehiculo.modelo.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      sale.status.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  openSaleReport(sale: Sale): void {
    this.selectedSale = sale;
    this.showReportModal = true;
  }

  closeReportModal(): void {
    this.showReportModal = false;
    this.selectedSale = undefined;
  }
}
