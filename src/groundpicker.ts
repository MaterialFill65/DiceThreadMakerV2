import './groundpicker.css';
import './panel.css';

class GroundPicker {
    private hsv: { h: number; s: number; v: number } = {
        h: 0,
        s: 0,
        v: 0
    };
    private previous: { x: number; y: number; } = {
        x: 0,
        y: 0
    };
    private hueSlider: HTMLInputElement | null = null;
    private colorGraph: HTMLCanvasElement | null = null;
    private colorSelector: HTMLDivElement | null = null;
    private imageUpload: HTMLInputElement | null = null;
    private imageRemove: HTMLButtonElement | null = null;
    private rgbaInput: HTMLInputElement | null = null;
    private popover: HTMLDivElement | null = null;
    private isPopoverOpen: boolean = false;
    private isDragging: boolean = false;

    constructor(
        public pickerButton: HTMLElement,
        public target: HTMLElement | null = null
    ) {
        this.pickerButton.addEventListener('click', this.togglePopover.bind(this));
    }

    create_popup() {
        // ポップアップパネル
        const popover = document.createElement('div');
        popover.id = 'popover';
        popover.classList.add('popover');
        popover.classList.add('panel');

        const rgbaInputContainer = document.createElement('div');
        rgbaInputContainer.classList.add('popover-input-container');

        const rgbaInputLabel = document.createElement('label');
        rgbaInputLabel.htmlFor = 'rgba-input';
        rgbaInputLabel.classList.add('popover-label');
        rgbaInputLabel.textContent = 'カラーコード';
        rgbaInputContainer.appendChild(rgbaInputLabel);

        const rgbaInput = document.createElement('input');
        rgbaInput.type = 'text';
        rgbaInput.id = 'rgba-input';
        rgbaInput.placeholder = '#ffffff';
        rgbaInput.pattern = "^#([0-9a-fA-F]{3}){1,2}$"
        rgbaInput.classList.add('popover-input');
        rgbaInputContainer.appendChild(rgbaInput);
        popover.appendChild(rgbaInputContainer);

        const colorGraphContainer = document.createElement('div');
        colorGraphContainer.classList.add('popover-graph-container');

        const colorGraphLabel = document.createElement('div');
        colorGraphLabel.classList.add('popover-label');
        colorGraphLabel.textContent = '色のグラフ';
        colorGraphContainer.appendChild(colorGraphLabel);

        const colorGraph = document.createElement('canvas');
        colorGraph.id = 'color-graph';
        colorGraph.classList.add('color-graph');

        const colorSelector = document.createElement('div');
        colorSelector.id = 'color-selector';
        colorSelector.classList.add('selector');
        colorGraphContainer.appendChild(colorSelector);
        colorGraphContainer.appendChild(colorGraph);
        popover.appendChild(colorGraphContainer);

        const hueSliderContainer = document.createElement('div');
        hueSliderContainer.classList.add('popover-slider-container');

        const hueSlider = document.createElement('input');
        hueSlider.type = 'range';
        hueSlider.id = 'hue-slider';
        hueSlider.min = '0';
        hueSlider.max = '360';
        hueSlider.value = '0';
        hueSlider.classList.add('hue-slider');
        hueSliderContainer.appendChild(hueSlider);
        popover.appendChild(hueSliderContainer);

        const imageUploadRemoveContainer = document.createElement('div');
        imageUploadRemoveContainer.classList.add('popover-image-container');

        const imageUploadWrapperContainer = document.createElement('div');
        imageUploadWrapperContainer.classList.add('popover-image-upload-wrapper');

        const imageUploadLabel = document.createElement('label');
        imageUploadLabel.htmlFor = 'image-upload';
        imageUploadLabel.textContent = '背景画像';
        imageUploadWrapperContainer.appendChild(imageUploadLabel);

        const fileUploadWrapper = document.createElement('div');
        fileUploadWrapper.classList.add('file-upload-wrapper');

        const fileUploadButton = document.createElement('div');
        fileUploadWrapper.classList.add('panel-button');

        const fileUploadButtonText = document.createElement('span');
        fileUploadButtonText.classList.add('file-upload-button-text');
        fileUploadButtonText.textContent = '画像を選択';
        fileUploadButton.appendChild(fileUploadButtonText);

        const imageUpload = document.createElement('input');
        imageUpload.type = 'file';
        imageUpload.id = 'image-upload';
        imageUpload.accept = 'image/*';
        fileUploadWrapper.appendChild(fileUploadButton);
        fileUploadWrapper.appendChild(imageUpload);


        const imageUploadButtonContainer = document.createElement('div');
        imageUploadButtonContainer.classList.add('popover-image-button-container');
        imageUploadButtonContainer.appendChild(fileUploadWrapper);

        const imageRemove = document.createElement('button');
        imageRemove.id = 'image-remove';
        imageRemove.classList.add('panel-button');
        imageRemove.textContent = '背景を削除';
        imageRemove.disabled = false;
        imageUploadButtonContainer.appendChild(imageRemove);
        imageUploadRemoveContainer.appendChild(imageUploadButtonContainer);

        popover.appendChild(imageUploadRemoveContainer);

        const closeButtonContainer = document.createElement('div');
        closeButtonContainer.classList.add('popover-close-container');

        const closeButton = document.createElement('button');
        closeButton.id = 'close-button';
        closeButton.classList.add('popover-close-button');
        closeButton.textContent = '閉じる';
        closeButtonContainer.appendChild(closeButton);
        popover.appendChild(closeButtonContainer);

        closeButton.addEventListener('click', this.closePopover.bind(this));
        rgbaInput.addEventListener('input', this.handleInputChange.bind(this));
        imageUploadWrapperContainer.addEventListener('click', () => {
            imageUpload.click();
        });
        imageUpload.addEventListener('change', this.handleImageUpload.bind(this));
        imageRemove.addEventListener('click', this.handleImageRemove.bind(this));
        document.addEventListener('click', this.handleDocumentClick.bind(this));
        popover.addEventListener('pointermove', this.handlePopoverMouseMove.bind(this));
        colorGraph.addEventListener('pointerdown', this.handleColorGraphMouseDown.bind(this));
        popover.addEventListener('pointerup', this.handlePopoverMouseUp.bind(this));
        hueSlider.addEventListener('input', this.handleHueSliderInput.bind(this));
        popover.addEventListener('dragover', this.handleDragOver.bind(this));
        popover.addEventListener('drop', this.handleDrop.bind(this));

        this.hueSlider = hueSlider;
        this.imageUpload = imageUpload;
        this.imageRemove = imageRemove;
        this.colorGraph = colorGraph;
        this.colorSelector = colorSelector;
        this.rgbaInput = rgbaInput;

        return popover;
    }

    private handleImageUpload(event: Event): void {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        if (file) {
            const objectURL = URL.createObjectURL(file)
            this.applyBackground(undefined, objectURL);
        }
    }

    private handleDragOver(event: DragEvent): void {
        event.preventDefault();
        event.dataTransfer!.dropEffect = 'copy';
    }

    private handleDrop(event: DragEvent): void {
        event.preventDefault();
        const file = event.dataTransfer!.files[0];
        if (file && file.type.startsWith('image/')) {
            const objectURL = URL.createObjectURL(file)
            this.applyBackground(undefined, objectURL);
        }
    }

    private handleImageRemove(): void {
        this.applyBackground("transparent");
        if (this.imageRemove && this.imageUpload) {
            this.imageUpload.value = '';
            this.imageRemove.disabled = true;
        }
    }

    private handleDocumentClick(event: MouseEvent): void {
        if (this.isPopoverOpen && this.popover && !this.popover.contains(event.target as Node) && event.target !== this.pickerButton) {
            this.closePopover();
        }
    }

    private handlePopoverMouseMove(event: PointerEvent): void {
        if (this.isDragging && this.colorGraph) {
            const graphRect = this.colorGraph.getBoundingClientRect();
            const x = event.clientX - graphRect.left;
            const y = event.clientY - graphRect.top;
            const clampedX = Math.max(0, Math.min(x, graphRect.width));
            const clampedY = Math.max(0, Math.min(y, graphRect.height));
            this.hsv.s = clampedX / graphRect.width;
            this.hsv.v = 1 - clampedY / graphRect.height;
            const color = this.hsvToRgb(this.hsv.h, this.hsv.s * 100, this.hsv.v * 100);
            const hexColor = this.rgbToHex(color.r, color.g, color.b);
            if (this.rgbaInput)
                this.rgbaInput.value = hexColor;
            this.applyBackground(hexColor);

            if (this.colorSelector) {
                this.colorSelector.style.left = `${clampedX}px`;
                this.colorSelector.style.top = `${clampedY}px`;
            }
            this.previous = { x: clampedX, y: clampedY };
            event.preventDefault();
        }
    }

    private handleColorGraphMouseDown(event: PointerEvent): void {
        this.isDragging = true;
        this.handlePopoverMouseMove(event);
    }

    private handlePopoverMouseUp(event: PointerEvent): void {
        if (this.isDragging && this.popover && this.rgbaInput && this.colorSelector) {
            const popoverRect = this.popover.getBoundingClientRect();
            if (
                event.clientX < popoverRect.left ||
                event.clientX > popoverRect.right ||
                event.clientY < popoverRect.top ||
                event.clientY > popoverRect.bottom
            ) {
                this.isDragging = false;
                this.rgbaInput.value = '';
                document.body.style.backgroundColor = '';
                this.colorSelector.style.left = '-100px';
                this.colorSelector.style.top = '-100px';
            }
        }
        this.isDragging = false;
    }

    private parseRgb(rgbString: string): { r: number; g: number; b: number } | null {
        const match = rgbString.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        if (match) {
            return {
                r: parseInt(match[1], 10),
                g: parseInt(match[2], 10),
                b: parseInt(match[3], 10)
            };
        }
        return null;
    }


    private handleHueSliderInput(event: Event): void {
        const target = event.target as HTMLInputElement;
        this.hsv.h = parseInt(target.value);
        if (this.colorGraph)
            this.updateGraphBackground(this.colorGraph, this.hsv);
        const rgb = this.hsvToRgb(this.hsv.h, this.hsv.s * 100, this.hsv.v * 100);
        const hexColor = this.rgbToHex(rgb.r, rgb.g, rgb.b);
        if (this.rgbaInput)
            this.rgbaInput.value = hexColor;
        this.applyBackground(hexColor);
        if (this.colorSelector) {
            this.colorSelector.style.left = `${this.previous.x}px`;
            this.colorSelector.style.top = `${this.previous.y}px`;
        }
    }

    private hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
        h = h / 360;
        s = s / 100;
        v = v / 100;
        let r: number, g: number, b: number;
        const i = Math.floor(h * 6);
        const f = h * 6 - i;
        const p = v * (1 - s);
        const q = v * (1 - f * s);
        const t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
            default:
                return { r: 0, g: 0, b: 0 };
        }
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    private rgbToHex(r: number, g: number, b: number): string {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    private rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const d = max - min;
        let h = 0;
        const s = max === 0 ? 0 : d / max;
        const v = max;
        if (max !== min) {
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return {
            h: Math.round(h * 360),
            s: s,
            v: v
        };
    }

    private applyBackground(color?: string, imageUrl?: string): void {
        if (!this.target) return;

        if (color) {
            this.target.style.background = color;
        }

        if (imageUrl) {
            this.target.style.background = `url(${imageUrl}) 0 / cover`;
        }
    }

    private updateGraphBackground(canvas: HTMLCanvasElement, hsv: { h: number; s: number; v: number }): void {
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        canvas.width = 256;
        canvas.height = 256;
        const horizontalGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        horizontalGradient.addColorStop(0, 'rgba(255,255,255,1)');
        const rgb = this.hsvToRgb(hsv.h, 100, 100);
        const colorString = `rgba(${rgb.r},${rgb.g},${rgb.b},1)`;
        horizontalGradient.addColorStop(1, colorString);
        ctx.fillStyle = horizontalGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const verticalGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        verticalGradient.addColorStop(0, 'rgba(255,255,255,0)');
        verticalGradient.addColorStop(1, 'rgba(0,0,0,1)');
        ctx.fillStyle = verticalGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    private handleInputChange(event: Event): void {
        const target = event.target as HTMLInputElement;
        const hex = target.value;
        this.setWithHex(hex);
    }

    private setWithHex(hex: string) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        this.hsv = this.rgbToHsv(r, g, b);
        if (this.hueSlider)
            this.hueSlider.value = this.hsv.h.toString();

        if (this.colorGraph) {
            this.updateGraphBackground(this.colorGraph, this.hsv);
            const graphRect = this.colorGraph.getBoundingClientRect();
            const x = this.hsv.s * graphRect.width;
            const y = (1 - this.hsv.v) * graphRect.height;
            if (this.colorSelector) {
                this.colorSelector.style.left = `${x}px`;
                this.colorSelector.style.top = `${y}px`;
            }
            this.previous = { x: x, y: y };
        }

        this.applyBackground(hex);
    }

    private closePopover(): void {
        this.isPopoverOpen = false;
        this.popover!.remove();
        this.isDragging = false;
    }

    private togglePopover(): void {
        this.isPopoverOpen = !this.isPopoverOpen;
        if (this.isPopoverOpen) {
            this.popover = this.create_popup();
            document.body.appendChild(this.popover);
            const buttonRect = this.pickerButton.parentElement?.parentElement?.getBoundingClientRect() ?? this.pickerButton.getBoundingClientRect();
            const popoverRect = this.popover.getBoundingClientRect();
            const top = buttonRect.top;
            const left = buttonRect.left + (buttonRect.width / 2) - (popoverRect.width / 2);
            this.popover.style.top = top + 'px';
            this.popover.style.left = left + 'px';

            if (!this.target) {
                return;
            }

            const rgb = this.target.style.background
            if (!rgb.startsWith("rgb")) {
                this.setWithHex("#FFFFFF");
                return;
            }
            const parsed_rgb = this.parseRgb(rgb)
            if (!rgb)
                return;
            const hex = this.rgbToHex(parsed_rgb!.r, parsed_rgb!.g, parsed_rgb!.b);

            this.setWithHex(hex);
        } else {
            this.closePopover();
        }
    }

    public apply_result(element: HTMLElement) {
        if (!this.target) return;

        element.style.background = this.target.style.background;
    }
}

export default GroundPicker;
