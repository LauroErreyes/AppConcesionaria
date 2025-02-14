import { Component } from '@angular/core';
import { Sale_acc } from '../../../entidades/saleacc';
import { SaleaccService } from '../../../servicios/saleacc/saleacc.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-adminsaleacc',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './adminsaleacc.component.html',
  styleUrl: './adminsaleacc.component.css'
})
export class AdminsaleaccComponent {
  sales: Sale_acc[] = [];
  searchTerm: string = '';
  showReportModal: boolean = false;
  selectedSale?: Sale_acc;

  constructor(private saleaccService: SaleaccService) {}

  ngOnInit(): void {
    this.loadSales();
  }

  loadSales(): void {
    this.saleaccService.getAllSales().subscribe({
      next: (data: Sale_acc[]) => this.sales = data,
      error: (error) => console.error('Error al cargar ventas de accesorios:', error)
    });
  }

  filterSales(): Sale_acc[] {
    return this.sales.filter(sale =>
      sale.user.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      sale.formaPago.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  openSaleReport(sale: Sale_acc): void {
    this.selectedSale = sale;
    this.showReportModal = true;
  }

  closeReportModal(): void {
    this.showReportModal = false;
    this.selectedSale = undefined;
  }
}
