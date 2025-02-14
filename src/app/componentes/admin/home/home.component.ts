import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import Chart from 'chart.js/auto';
import { CarService } from '../../../servicios/cars/car.service';
import { AccesoriosService } from '../../../servicios/accesorios/accesorios.service';
import { SaleService } from '../../../servicios/sale/sale.service';
import { SaleaccService } from '../../../servicios/saleacc/saleacc.service';
import { UserService } from '../../../servicios/user/user.service';
import { Sale_acc } from '../../../entidades/saleacc';
import { Sale } from '../../../entidades/sale';
import { usuario } from '../../../entidades/usuario';
import { forkJoin, map } from 'rxjs';

interface TopSeller {
  brand: string;
  model: string;
  count: number;
  revenue: number;
}

interface TopUser {
  user?: string;
  purchases: number;
  totalSpent: number;
}

interface TopAccessory {
  name: string;
  quantity: number;
  revenue: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class adminHomeComponent implements OnInit, AfterViewInit {
  // Charts references
  @ViewChild('salesChart') salesChartRef!: ElementRef;
  @ViewChild('accSalesChart') accSalesChartRef!: ElementRef;

  // Charts instances
  private salesChart: Chart | null = null;
  private accSalesChart: Chart | null = null;

  // Form and filters
  filterForm: FormGroup;
  years: number[] = [];
  months: string[] = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  userCurrent: usuario | null = null;
  // Statistics
  totalCarSales: number = 0;
  totalAccSales: number = 0;
  totalRevenue: number = 0;
  totalUsers: number = 0;

  // Growth metrics
  monthlyGrowth: number = 0;
  accMonthlyGrowth: number = 0;
  revenueGrowth: number = 0;
  userGrowth: number = 0;

  // Top listings
  topSellingCars: TopSeller[] = [];
  topBuyers: TopUser[] = [];
  topAccessories: TopAccessory[] = [];

  // Recent sales
  latestCarSales: Sale[] = [];
  latestAccSales: Sale_acc[] = [];

  // Monthly data
  carSalesByMonth: number[] = new Array(12).fill(0);
  accSalesByMonth: number[] = new Array(12).fill(0);
  revenueByMonth: number[] = new Array(12).fill(0);

  constructor(
    private fb: FormBuilder,
    private carService: CarService,
    private accService: AccesoriosService,
    private saleService: SaleService,
    private saleaccService: SaleaccService,
    private userService: UserService
  ) {
    // Initialize years (last 5 years)
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 5; i++) {
      this.years.push(currentYear - i);
    }

    // Initialize filter form
    this.filterForm = this.fb.group({
      year: [currentYear],
      month: ['']
    });
  }
  infoUser(id: string) {
    this.userService.getUserById(id).subscribe(
      (response) => {
        this.userCurrent = response;
        console.log(response);
      }
    )
  }

  ngOnInit(): void {
    this.userCurrent = null;
    // Subscribe to filter changes
    this.filterForm.valueChanges.subscribe(() => {
      this.fetchDashboardData();
    });

    // Initial data fetch
    this.fetchDashboardData();
  }

  ngAfterViewInit(): void {
    // Initial charts setup will happen after data fetch
  }

  fetchDashboardData(): void {
    const filters = this.filterForm.value;

    // Fetch car sales
    this.saleService.getSales().subscribe((sales: Sale[]) => {
      const filteredSales = this.filterSales(sales, filters);
      this.processSalesData(filteredSales);
      this.calculateTopSellers(filteredSales);
      this.calculateTopBuyers(filteredSales);
      this.updateSalesChart();
    });

    // Fetch accessory sales
    this.saleaccService.getAllSales().subscribe((salesAcc: Sale_acc[]) => {
      const filteredAccSales = this.filterAccSales(salesAcc, filters);
      this.processAccSalesData(filteredAccSales);
      this.calculateTopAccessories(filteredAccSales);
      this.updateAccSalesChart();
    });

    // Fetch users
    this.userService.getAllUsers().subscribe(users => {
      this.totalUsers = users.length;
      // Calculate user growth (if needed)
      this.calculateUserGrowth(users);
    });
  }

  private filterSales(sales: Sale[], filters: any): Sale[] {
    return sales.filter(sale => {
      const saleDate = new Date(sale.date);
      const matchesYear = saleDate.getFullYear() === filters.year;
      const matchesMonth = !filters.month || saleDate.getMonth() === this.months.indexOf(filters.month);
      return matchesYear && matchesMonth;
    });
  }

  private filterAccSales(sales: Sale_acc[], filters: any): Sale_acc[] {
    return sales.filter(sale => {
      const saleDate = new Date(sale.orderDate);
      const matchesYear = saleDate.getFullYear() === filters.year;
      const matchesMonth = !filters.month || saleDate.getMonth() === this.months.indexOf(filters.month);
      return matchesYear && matchesMonth;
    });
  }

  private processSalesData(sales: Sale[]): void {
    this.totalCarSales = sales.length;
    this.latestCarSales = sales.slice(-5).reverse();

    // Calculate total revenue from cars
    const carRevenue = sales.reduce((sum, sale) => sum + sale.vehiculo.precioBase, 0);
    this.totalRevenue = carRevenue;

    // Calculate monthly growth
    this.calculateMonthlyGrowth(sales);

    // Group sales by month
    this.carSalesByMonth = this.groupByMonth(sales, 'date');
  }

  private processAccSalesData(sales: Sale_acc[]): void {
    this.totalAccSales = sales.length;
    this.latestAccSales = sales.slice(-5).reverse();

    // Calculate total revenue from accessories
    const accRevenue = sales.reduce((sum, sale) => sum + sale.totalAccesorios, 0);
    this.totalRevenue += accRevenue;

    // Calculate monthly growth for accessories
    this.calculateAccMonthlyGrowth(sales);

    // Group accessory sales by month
    this.accSalesByMonth = this.groupByMonth(sales, 'orderDate');
  }

  private calculateTopSellers(sales: Sale[]): void {
    const carSales = new Map<string, TopSeller>();

    sales.forEach(sale => {
      const key = `${sale.vehiculo.brand}-${sale.vehiculo.modelo}`;
      if (!carSales.has(key)) {
        carSales.set(key, {
          brand: sale.vehiculo.brand,
          model: sale.vehiculo.modelo,
          count: 0,
          revenue: 0
        });
      }

      const seller = carSales.get(key)!;
      seller.count++;
      seller.revenue += sale.vehiculo.precioBase;
    });

    this.topSellingCars = Array.from(carSales.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private calculateTopBuyers(sales: Sale[]): void {
    // Primero, agrupa las ventas por usuario
    const buyers = new Map<string, TopUser>();
    
    // Recolecta todos los IDs únicos de usuarios
    const uniqueUserIds = Array.from(new Set(sales.map(sale => sale.usuarioID)));
    
    // Crea un array de observables para cada usuario
    const userObservables = uniqueUserIds.map(userId => {
      return this.userService.getUserById(userId).pipe(
        map(user => {
          // Calcula las estadísticas de compra para este usuario
          const userSales = sales.filter(sale => sale.usuarioID === userId);
          const totalSpent = userSales.reduce((sum, sale) => sum + sale.vehiculo.precioBase, 0);
          
          return {
            user: user?.last_name! + ' '+user?.first_name!, // O puedes usar user.first_name + ' ' + user.last_name
            purchases: userSales.length,
            totalSpent: totalSpent
          } as TopUser;
        })
      );
    });
  
    // Combina todos los observables y actualiza topBuyers
    forkJoin(userObservables).subscribe(results => {
      this.topBuyers = results
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 5);
    });
  }

  private calculateTopAccessories(sales: Sale_acc[]): void {
    const accessories = new Map<string, TopAccessory>();

    sales.forEach(sale => {
      sale.items.forEach(item => {
        if (!accessories.has(item.name)) {
          accessories.set(item.name, {
            name: item.name,
            quantity: 0,
            revenue: 0
          });
        }

        const accessory = accessories.get(item.name)!;
        accessory.quantity += item.quantity;
        accessory.revenue += item.total_item;
      });
    });

    this.topAccessories = Array.from(accessories.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }

  private groupByMonth(data: any[], dateField: string): number[] {
    const months = new Array(12).fill(0);
    data.forEach(item => {
      const month = new Date(item[dateField]).getMonth();
      months[month]++;
    });
    return months;
  }

  private calculateMonthlyGrowth(sales: Sale[]): void {
    const currentMonth = new Date().getMonth();
    const currentMonthSales = sales.filter(sale =>
      new Date(sale.date).getMonth() === currentMonth
    ).length;

    const lastMonthSales = sales.filter(sale =>
      new Date(sale.date).getMonth() === (currentMonth - 1 + 12) % 12
    ).length;

    this.monthlyGrowth = lastMonthSales === 0 ? 100 :
      Math.round(((currentMonthSales - lastMonthSales) / lastMonthSales) * 100);
  }

  private calculateAccMonthlyGrowth(sales: Sale_acc[]): void {
    const currentMonth = new Date().getMonth();
    const currentMonthSales = sales.filter(sale =>
      new Date(sale.orderDate).getMonth() === currentMonth
    ).length;

    const lastMonthSales = sales.filter(sale =>
      new Date(sale.orderDate).getMonth() === (currentMonth - 1 + 12) % 12
    ).length;

    this.accMonthlyGrowth = lastMonthSales === 0 ? 100 :
      Math.round(((currentMonthSales - lastMonthSales) / lastMonthSales) * 100);
  }

  private updateSalesChart(): void {
    if (this.salesChart) {
      this.salesChart.destroy();
    }

    if (this.salesChartRef && this.salesChartRef.nativeElement) {
      this.salesChart = new Chart(this.salesChartRef.nativeElement, {
        type: 'line',
        data: {
          labels: this.months,
          datasets: [{
            label: 'Ventas de Carros',
            data: this.carSalesByMonth,
            borderColor: 'rgba(59,130,246,1)',
            backgroundColor: 'rgba(59,130,246,0.2)',
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  }

  private updateAccSalesChart(): void {
    if (this.accSalesChart) {
      this.accSalesChart.destroy();
    }

    if (this.accSalesChartRef && this.accSalesChartRef.nativeElement) {
      this.accSalesChart = new Chart(this.accSalesChartRef.nativeElement, {
        type: 'bar',
        data: {
          labels: this.months,
          datasets: [{
            label: 'Ventas de Accesorios',
            data: this.accSalesByMonth,
            backgroundColor: 'rgba(16,185,129,0.6)',
            borderColor: 'rgba(16,185,129,1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  }

  private calculateUserGrowth(users: any[]): void {
    // Implement user growth calculation logic here
    // This would depend on how you track user registration dates
    this.userGrowth = 0; // Placeholder
  }
}