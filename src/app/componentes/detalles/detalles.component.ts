import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Car, Color } from '../../entidades/car';
import { AccesoriosService } from '../../servicios/accesorios/accesorios.service';
import { CarService } from '../../servicios/cars/car.service';
@Component({
  selector: 'app-detalles',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './detalles.component.html',
  styleUrl: './detalles.component.css',
})
export class DetallesComponent {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private model: THREE.Object3D | null = null;
  private animationFrameId: number = 0;
  car: Car | null = null;
  accessories: any[] = [];
  selectedColor: Color | null = null;
  selectedAccessories: any[] = [];
  errorMessage: string = '';
  modeloCargado: boolean = false;
  showModel3D: boolean = false;
  modeloError: boolean = false;
  @ViewChild('canvasContainer', { static: false }) canvasContainer!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private carService: CarService,
    private accessoryService: AccesoriosService,
    private router: Router
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        window.scrollTo(0, 0);
      }
    });
  }

  ngOnInit(): void {
    localStorage.removeItem('orderData');
    this.route.paramMap.subscribe((params) => {
      const carId = params.get('id');
      if (carId) {
        this.loadCarDetails(carId);
        this.loadCompatibleAccessories(carId);
      }
    });
  }

  toggleModel3D(): void {
    if (!this.showModel3D) {
      // Solo cargar si estamos mostrando el modelo
      if (this.car?._id) {
        this.loadModel3D(this.car._id);
      }
    } else {
      // Limpiar recursos si estamos ocultando el modelo
      this.cleanupViewer();
      this.showModel3D = false;
      this.modeloCargado = false;
      this.modeloError = false;
    }
  }

  private cleanupViewer(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
    if (this.model) {
      this.scene.remove(this.model);
      this.model = null;
    }
  }

  private initScene(): void {
    const container = this.canvasContainer.nativeElement;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf8f8f8);

    this.camera = new THREE.PerspectiveCamera(
      40,
      container.clientWidth / container.clientHeight,
      1,
      2500
    );
    this.camera.position.set(700, 300, 700);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    // Habilitar sombras
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 15;
    this.controls.maxDistance = 15;
    this.controls.maxPolarAngle = Math.PI / 2;
    this.controls.minPolarAngle = Math.PI / 2;
    this.controls.rotateSpeed = 0.8;
    this.controls.target.set(0, 150, 0);

    this.setupLights();
    this.animate();

    window.addEventListener('resize', () => this.onWindowResize());
  }

  private setupLights(): void {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Luz direccional mejorada para sombras
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 10);
    directionalLight.castShadow = true;

    // Configuración de sombras en la luz direccional
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;

    this.scene.add(directionalLight);
  }

  private loadModel3D(id: string): void {
    this.showModel3D = true;
    this.modeloCargado = false;
    this.modeloError = false;

    this.carService.getModel3dById(id).subscribe({
      next: (blobData) => {
        if (!blobData || blobData.size === 0) {
          this.modeloError = true;
          return;
        }
        const url = URL.createObjectURL(
          new Blob([blobData], { type: 'model/gltf-binary' })
        );
        setTimeout(() => {
          this.initScene();
          this.loadModel(url);
        }, 0);
      },
      error: (error) => {
        console.error('Error al cargar el modelo 3D:', error);
        this.modeloError = true;
        this.modeloCargado = false;
      },
    });
  }

  private loadModel(url: string): void {
    const loader = new GLTFLoader();
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      loadingElement.style.display = 'flex';
    }

    loader.load(
      url,
      (gltf) => {
        if (this.model) {
          this.scene.remove(this.model);
        }

        this.model = gltf.scene;

        const modelScale = 1;
        this.model.scale.set(modelScale, modelScale, modelScale);

        const box = new THREE.Box3().setFromObject(this.model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        this.model.position.set(-center.x, -center.y + size.y / 2, -center.z);

        // Habilitar sombras en el modelo
        this.model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            (child as THREE.Mesh).castShadow = true;
            (child as THREE.Mesh).receiveShadow = true;
          }
        });

        this.scene.add(this.model);

        // Plano para recibir sombras
        const shadowPlane = new THREE.Mesh(
          new THREE.PlaneGeometry(size.x * 1, size.z * 1),
          new THREE.ShadowMaterial({ opacity: 0.7 })
        );
        shadowPlane.rotation.x = -Math.PI / 2;
        shadowPlane.position.set(0.01, -0.01, 0);
        shadowPlane.receiveShadow = true;

        this.scene.add(shadowPlane);
        this.modeloCargado = true;

        if (loadingElement) {
          loadingElement.style.display = 'none';
        }

        const maxDim = Math.max(size.x, size.y, size.z);
        this.camera.position.set(maxDim * 2, maxDim, maxDim * 2);
        this.controls.target.set(0, size.y / 2, 0);
        this.controls.update();
      },
      (xhr) => {
        const percentComplete = (xhr.loaded / xhr.total) * 100;
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
          loadingElement.textContent = `Cargando: ${percentComplete.toFixed(
            0
          )}%`;
        }
      },
      (error) => {
        console.error('Error al cargar el modelo:', error);
        this.modeloCargado = false;
        this.modeloError = true;
      }
    );
  }

  private animate(): void {
    this.animationFrameId = requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    const container = this.canvasContainer.nativeElement;
    this.camera.aspect = container.clientWidth / container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(container.clientWidth, container.clientHeight);
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
    window.removeEventListener('resize', () => this.onWindowResize());
  }

  private loadCarDetails(id: string): void {
    this.carService.getCarById(id).subscribe({
      next: (car) => {
        this.car = car;
        if (car.colors && car.colors.length > 0) {
          this.selectedColor = car.colors[0];
        }
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar los detalles del vehículo';
      },
    });
  }

  private loadCompatibleAccessories(carId: string): void {
    this.accessoryService.getAccessoriesByCar(carId).subscribe({
      next: (accessories) => {
        this.accessories = accessories;
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar los accesorios compatibles';
      },
    });
  }

  selectColor(color: Color): void {
    this.selectedColor = color;
  }

  toggleAccessory(accessory: any): void {
    // Recuperar la lista actual desde localStorage
    const orderData = localStorage.getItem('orderData');
    let parsedData = orderData ? JSON.parse(orderData) : { accessories: [] };

    // Asegurar que `selectedAccessories` tenga el estado actualizado
    this.selectedAccessories = parsedData.accessories || [];

    // Buscar si el accesorio ya está en la lista
    const index = this.selectedAccessories.findIndex(
      (a) => a._id === accessory._id
    );

    if (index === -1) {
      // Si no está, agrégalo
      this.selectedAccessories.push(accessory);
    } else {
      // Si ya está, quítalo
      this.selectedAccessories.splice(index, 1);
    }

    // Guardar la nueva lista en localStorage
    this.saveOrderData();
    console.log(this.selectedAccessories);
  }

  private saveOrderData(): void {
    if (this.selectedColor && this.car) {
      const orderData = localStorage.getItem('orderData');
      let parsedData = orderData ? JSON.parse(orderData) : {};

      // Actualizar solo la parte de accesorios
      parsedData.accessories = this.selectedAccessories;
      parsedData.car = this.car;
      parsedData.selectedColor = this.selectedColor;

      localStorage.setItem('orderData', JSON.stringify(parsedData));
    }
  }

  proceedToCheckout(): void {
    if (this.selectedColor && this.car) {
      const orderData = {
        car: this.car,
        selectedColor: this.selectedColor,
        accessories: this.selectedAccessories,
      };
      localStorage.setItem('orderData', JSON.stringify(orderData));
      //console.log(localStorage.getItem('orderData'));
      this.router.navigate(['/cotizar', this.car._id]);
    }
  }
}
