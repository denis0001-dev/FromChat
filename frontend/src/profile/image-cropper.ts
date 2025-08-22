import type { Size2D } from "../types";

export class ImageCropper {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private image!: HTMLImageElement;
    private cropSize: number = 200;
    private isDragging: boolean = false;
    private dragStart: Size2D = { x: 0, y: 0 };
    private cropPosition: Size2D = { x: 0, y: 0 };

    constructor(container: HTMLElement) {
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.cropSize;
        this.canvas.height = this.cropSize;
        this.ctx = this.canvas.getContext('2d')!;
        
        container.appendChild(this.canvas);
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.canvas.addEventListener('touchstart', this.onTouchStart.bind(this));
        this.canvas.addEventListener('touchmove', this.onTouchMove.bind(this));
        this.canvas.addEventListener('touchend', this.onTouchEnd.bind(this));
    }

    private onMouseDown(e: MouseEvent): void {
        this.isDragging = true;
        this.dragStart = { x: e.clientX, y: e.clientY };
    }

    private onMouseMove(e: MouseEvent): void {
        if (!this.isDragging) return;
        
        const deltaX = e.clientX - this.dragStart.x;
        const deltaY = e.clientY - this.dragStart.y;
        
        this.cropPosition.x += deltaX;
        this.cropPosition.y += deltaY;
        
        this.dragStart = { x: e.clientX, y: e.clientY };
        this.render();
    }

    private onMouseUp(): void {
        this.isDragging = false;
    }

    private onTouchStart(e: TouchEvent): void {
        e.preventDefault();
        const touch = e.touches[0];
        this.isDragging = true;
        this.dragStart = { x: touch.clientX, y: touch.clientY };
    }

    private onTouchMove(e: TouchEvent): void {
        e.preventDefault();
        if (!this.isDragging) return;
        
        const touch = e.touches[0];
        const deltaX = touch.clientX - this.dragStart.x;
        const deltaY = touch.clientY - this.dragStart.y;
        
        this.cropPosition.x += deltaX;
        this.cropPosition.y += deltaY;
        
        this.dragStart = { x: touch.clientX, y: touch.clientY };
        this.render();
    }

    private onTouchEnd(): void {
        this.isDragging = false;
    }

    loadImage(file: File): Promise<void> {
        return new Promise((resolve) => {
            this.image = new Image();
            this.image.onload = () => {
                this.render();
                resolve();
            };
            this.image.src = URL.createObjectURL(file);
        });
    }

    private render(): void {
        if (!this.image) return;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Calculate crop area
        const scale = Math.max(this.cropSize / this.image.width, this.cropSize / this.image.height);
        const scaledWidth = this.image.width * scale;
        const scaledHeight = this.image.height * scale;

        // Draw image
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.drawImage(
            this.image,
            this.cropPosition.x,
            this.cropPosition.y,
            scaledWidth,
            scaledHeight
        );
        this.ctx.restore();

        // Draw crop overlay
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'destination-in';
        this.ctx.beginPath();
        this.ctx.arc(this.cropSize / 2, this.cropSize / 2, this.cropSize / 2, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.restore();
    }

    getCroppedImage(): string {
        return this.canvas.toDataURL('image/jpeg', 0.8);
    }

    destroy(): void {
        if (this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}
