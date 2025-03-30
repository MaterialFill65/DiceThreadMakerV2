import './card.css';
import { Coord } from './utils';
import Grid from './grid';
import GroundPicker from './groundpicker';

const LONG_PRESS_DURATION = 10;

function createCloneElement(card: Card) {
    const shadow = document.createElement("div");
    const clone_inner = document.createElement("div");
    shadow.classList.add("card");
    shadow.classList.add("card-clone");
    clone_inner.classList.add("card-inner");
    shadow.style.zIndex = "2";
    shadow.style.pointerEvents = "none";
    shadow.appendChild(clone_inner);
    shadow.style.width = `${card.size.x * card.parent.oneblock.width - 20}px`;
    shadow.style.height = `${card.size.y * card.parent.oneblock.height - 20}px`;
    shadow.style.borderRadius = "20px";
    return shadow;
}


export type CardMeta = {
    display_name?: string;
    name: string;
    background: string;
    charactor_img?: string;
    img_pos: { x: number, y: number };
    img_scale: number;
    font_size: number;
    size: { x: number, y: number }
    isNumberVisible?: boolean;
};

export type CardMetaWithGroup = CardMeta & { group: string };

export default class Card {
    readonly position: Coord;
    readonly size: Coord;
    readonly parent: Grid;
    private readonly cardElement: HTMLDivElement = document.createElement("div");
    private readonly numElement: HTMLHeadingElement = document.createElement("h2");
    private readonly nameElement: HTMLHeadingElement = document.createElement("h1");
    private readonly mainImgElement: HTMLImageElement = document.createElement("img");
    private isLongPressing: boolean = false;
    private initialTouchPosition: { x: number; y: number; } = { x: 0, y: 0 };
    private longPressTimeout?: number;
    private times: number[] = [];

    constructor(meta: CardMeta, x: number, y: number, parent: Grid) {
        this.numElement.id = "num";
        this.cardElement.appendChild(this.numElement);
        this.nameElement.id = "name";
        this.cardElement.appendChild(this.nameElement);
        this.cardElement.appendChild(this.mainImgElement);
        this.parent = parent;

        this.name = meta.name;
        this.background = meta.background;
        this.main_img = meta.charactor_img;
        this.main_img_pos = meta.img_pos;
        this.main_img_scale = meta.img_scale;
        if (typeof meta.isNumberVisible === "boolean") {
            this.isNumberVisible = meta.isNumberVisible
        }else{
            this.isNumberVisible = true;
        }

        this.font = meta.font_size;
        this.position = new Coord(x, y, this.observe_pos.bind(this));
        this.size = new Coord(meta.size.x, meta.size.y, (x, y) => {
            this.cardElement.style.height = `${parent.oneblock.height * y}px`;
            this.cardElement.style.width = `${parent.oneblock.width * x}px`;
        });

        this.cardElement.addEventListener("contextmenu", this.contextmenu.bind(this));
        this.cardElement.addEventListener("pointerdown", this.pointerdown.bind(this));
        this.cardElement.addEventListener("pointermove", this.pointermove.bind(this));
        this.cardElement.addEventListener("pointerup", this.pointerup.bind(this));
        this.cardElement.addEventListener("pointercancel", this.cancelLongPress.bind(this));
        this.cardElement.addEventListener("dragover", this.handleDragOver.bind(this));
        this.cardElement.addEventListener("drop", this.handleDrop.bind(this));
        this.cardElement.classList.add("card");
        this.cardElement.style.width = `${parent.oneblock.width * meta.size.x}px`;
        this.cardElement.style.height = `${parent.oneblock.height * meta.size.y}px`;
    }

    private observe_pos(x: number, y: number) {
        this.times.forEach(clearTimeout);
        this.times = [];
        this.cardElement.style.transition = "";
        this.cardElement.style.transitionDuration = "0.3s";
        this.cardElement.style.transform = `translate(${x * this.parent.oneblock.width}px, ${y * this.parent.oneblock.height}px)`;
        this.cardElement.style.borderRadius = "";
        this.cardElement.style.zIndex = "10";
        const func = () => {
            this.cardElement.style.zIndex = "1";
            this.cardElement.style.transitionDuration = "";
        };
        const id = setTimeout(func, 300);
        this.times.push(id);
    }

    private contextmenu(ev: MouseEvent) {
        ev.preventDefault();
        if (Object.keys(this.parent.cardPointers).length > 0) return;
        this.createContextMenu(ev.pageX, ev.pageY);
    }

    private createContextMenu(x: number, y: number) {
        const menu = document.createElement("div");
        menu.className = "context-menu";

        const editItem = document.createElement("div");
        editItem.className = "context-menu-item";
        editItem.textContent = "編集";
        editItem.onclick = () => {
            this.openEditModal();
            menu.remove();
        };
        menu.appendChild(editItem);

        const deleteItem = document.createElement("div");
        deleteItem.className = "context-menu-item";
        deleteItem.textContent = "削除";
        deleteItem.style.color = "red";
        deleteItem.onclick = () => {
            this.destroy();
            const idx = this.parent.cards.findIndex(target_card => target_card === this);
            if (idx !== -1) this.parent.cards.splice(idx, 1);
            menu.remove();
        };
        menu.appendChild(deleteItem);

        document.body.appendChild(menu);
        menu.style.display = "flex";
        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;

        const closeMenu = (e: PointerEvent) => {
            if (!menu.contains(e.target as Node)) {
                menu.remove();
                document.body.removeEventListener("pointerdown", closeMenu);
            }
        };
        document.body.addEventListener("pointerdown", closeMenu);
    }

    private openEditModal() {
        const modalOverlay = document.createElement("div");
        modalOverlay.classList.add("modal-overlay");
        document.body.appendChild(modalOverlay);

        modalOverlay.addEventListener("click", (e) => {
            if (e.target === modalOverlay) {
                modal.remove();
                modalOverlay.remove();
            }
        });

        const previewContainer = document.createElement("div");
        previewContainer.classList.add("preview-container");
        previewContainer.style.background = this.background;
        const previewNum = document.createElement("h2");
        previewNum.id = "num";
        previewNum.textContent = this.num.toString();
        previewContainer.appendChild(previewNum);
        const previewName = document.createElement("h1");
        previewName.id = "name";
        previewName.innerHTML = `<div>${this.name}</div>`;
        previewContainer.appendChild(previewName);

        const previewImg = document.createElement("img");
        if (this.main_img === "about:blank"){
            previewImg.style.display = "none";
        }
        previewImg.src = this.main_img!;
        previewImg.style.top = `${this.main_img_pos.y}%`;
        previewImg.style.right = `${this.main_img_pos.x}%`;
        previewImg.style.width = `${this.main_img_scale}%`;
        previewContainer.appendChild(previewImg);

        const modal = document.createElement("div");
        modal.classList.add("edit-modal");
        modal.classList.add("panel");

        const previewPlaceholder = document.createElement("div");
        previewPlaceholder.classList.add("preview-img-placeholder");
        modal.appendChild(previewPlaceholder);
        modal.appendChild(previewContainer);

        const nameLabel = document.createElement("label");
        nameLabel.textContent = "名前:";
        const nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.value = this.name;
        modal.appendChild(nameLabel);
        modal.appendChild(nameInput);

        const backgroundInput = document.createElement("button");
        backgroundInput.textContent = "背景を指定"
        const picker = new GroundPicker(backgroundInput, previewContainer)
        modal.appendChild(backgroundInput);

        const imgContainer = document.createElement("div");
        imgContainer.classList.add("img-input-container");

        const imgLabel = document.createElement("label");
        imgLabel.textContent = "画像URL:";
        const imgInput = document.createElement("input");
        imgInput.type = "text";
        if (this.main_img == "about:blank"){
            imgInput.value = "";
        }else{
            imgInput.value = this.main_img!;
        }
        imgContainer.appendChild(imgLabel);
        imgContainer.appendChild(imgInput);

        // 画像アップロードボタン
        const imgUploadButton = document.createElement("label");
        imgUploadButton.classList.add("img-upload-button");
        imgUploadButton.classList.add("panel-button");
        imgUploadButton.innerHTML = `<span class="material-symbols-outlined">file_upload</span>`;
        const imgUploadInput = document.createElement("input");
        imgUploadInput.classList.add("file-button");
        imgUploadInput.type = "file";
        imgUploadInput.accept = "image/*";
        imgUploadButton.appendChild(imgUploadInput);
        imgContainer.appendChild(imgUploadButton);

        // 画像削除ボタン
        const imgRemoveButton = document.createElement("button");
        imgRemoveButton.classList.add("img-remove-button");
        imgRemoveButton.innerHTML = `<span class="material-symbols-outlined delete-icon">delete</span>`;
        imgRemoveButton.addEventListener("click", () => {
            imgInput.value = "";
            previewImg.src = "";
            previewImg.style.display = "none";
        });
        imgContainer.appendChild(imgRemoveButton);

        imgUploadInput.addEventListener("change", (event) => {
            const file = (event.target as HTMLInputElement).files?.[0];
            if (file) {
                const objectURL = URL.createObjectURL(file)
                imgInput.value = objectURL;
                previewImg.src = objectURL;
                previewImg.style.display = "block";
            }
        });
        modal.appendChild(imgContainer);

        const imgPosLabel = document.createElement("label");
        imgPosLabel.textContent = "画像位置:";
        const imgPosXInput = document.createElement("input");
        imgPosXInput.type = "number";
        imgPosXInput.value = this.main_img_pos.x.toString();
        const imgPosYInput = document.createElement("input");
        imgPosYInput.type = "number";
        imgPosYInput.value = this.main_img_pos.y.toString();
        const imgPosContainer = document.createElement("div");
        imgPosContainer.classList.add("input-container");
        imgPosContainer.appendChild(imgPosXInput);
        imgPosContainer.appendChild(imgPosYInput);
        modal.appendChild(imgPosLabel);
        modal.appendChild(imgPosContainer);

        const imgScaleLabel = document.createElement("label");
        imgScaleLabel.textContent = "画像サイズ:";
        const imgScaleInput = document.createElement("input");
        imgScaleInput.type = "number";
        imgScaleInput.value = this.main_img_scale.toString();
        modal.appendChild(imgScaleLabel);
        modal.appendChild(imgScaleInput);

        const fontSizeLabel = document.createElement("label");
        fontSizeLabel.textContent = "フォントサイズ:";
        const fontSizeInput = document.createElement("input");
        fontSizeInput.type = "number";
        fontSizeInput.value = this.font.toString();
        modal.appendChild(fontSizeLabel);
        modal.appendChild(fontSizeInput);

        const sizeLabel = document.createElement("label");
        sizeLabel.textContent = "サイズ:";
        const sizeXInput = document.createElement("input");
        sizeXInput.type = "number";
        sizeXInput.value = this.size.x.toString();
        const sizeYInput = document.createElement("input");
        sizeYInput.type = "number";
        sizeYInput.value = this.size.y.toString();
        const sizeContainer = document.createElement("div");
        sizeContainer.classList.add("input-container");
        sizeContainer.appendChild(sizeXInput);
        sizeContainer.appendChild(sizeYInput);
        modal.appendChild(sizeLabel);
        modal.appendChild(sizeContainer);

        const numberVisibilityContainer = document.createElement("div");
        numberVisibilityContainer.classList.add("number-visible-container");
        const numberVisibilityLabel = document.createElement("label");
        numberVisibilityLabel.textContent = "数字表示:";
        const numberVisibilityCheckbox = document.createElement("input");
        numberVisibilityCheckbox.type = "checkbox";
        numberVisibilityCheckbox.checked = this.isNumberVisible;
        numberVisibilityContainer.appendChild(numberVisibilityLabel);
        numberVisibilityContainer.appendChild(numberVisibilityCheckbox);
        modal.appendChild(numberVisibilityContainer);

        const updatePreview = () => {
            previewName.innerHTML = `<div>${nameInput.value}</div>`;
            previewImg.src = imgInput.value;
            previewImg.style.right = `${imgPosXInput.value}%`;
            previewImg.style.top = `${imgPosYInput.value}%`;
            previewImg.style.width = `${imgScaleInput.value}%`;
            previewName.style.fontSize = `${fontSizeInput.value}px`;
            previewContainer.style.width = `${Number(sizeXInput.value) * this.parent.oneblock.width}px`;
            previewContainer.style.height = `${Number(sizeYInput.value) * this.parent.oneblock.height}px`;
            previewContainer.style.scale = `${1 / Math.max(Number(sizeXInput.value), Number(sizeYInput.value))}`;
            const rect = previewContainer.getBoundingClientRect()
            previewPlaceholder.style.height = `${rect.height}px`;
            previewPlaceholder.style.width = `${rect.width}px`;
            previewPlaceholder.style.minHeight = `${rect.height}px`;
            previewPlaceholder.style.minWidth = `${rect.width}px`;
            picker.apply_result(previewContainer);
            previewNum.style.display = numberVisibilityCheckbox.checked ? "block" : "none";
            if (imgInput.value === "") {
                previewImg.style.display = "none";
            } else {
                previewImg.style.display = "block";
            }
        };

        nameInput.addEventListener("input", updatePreview);
        imgInput.addEventListener("input", updatePreview);
        imgPosXInput.addEventListener("input", updatePreview);
        imgPosYInput.addEventListener("input", updatePreview);
        imgScaleInput.addEventListener("input", updatePreview);
        fontSizeInput.addEventListener("input", updatePreview);
        sizeXInput.addEventListener("input", updatePreview);
        sizeYInput.addEventListener("input", updatePreview);
        numberVisibilityCheckbox.addEventListener("change", updatePreview);
        backgroundInput.addEventListener("click", updatePreview);
        imgUploadInput.addEventListener("change", updatePreview);
        imgRemoveButton.addEventListener("click", updatePreview);

        numberVisibilityCheckbox.addEventListener("change", () => {
            previewNum.style.display = numberVisibilityCheckbox.checked ? "display" : "none";
        });

        const saveButton = document.createElement("button");
        saveButton.textContent = "保存";
        saveButton.onclick = () => {
            this.name = nameInput.value;
            picker.apply_result(this.cardElement)
            this.main_img = imgInput.value;
            this.main_img_pos = { x: Number(imgPosXInput.value), y: Number(imgPosYInput.value) };
            this.main_img_scale = Number(imgScaleInput.value);
            this.font = Number(fontSizeInput.value);
            this.size.set(Number(sizeXInput.value), Number(sizeYInput.value));
            this.isNumberVisible = numberVisibilityCheckbox.checked;
            modal.remove();
            modalOverlay.remove();
        };
        modal.appendChild(saveButton);

        const cancelButton = document.createElement("button");
        cancelButton.textContent = "キャンセル";
        cancelButton.onclick = () => {
            modal.remove();
            modalOverlay.remove();
        };
        modal.appendChild(cancelButton);

        document.body.appendChild(modal);
        updatePreview();
    }

    private pointerdown(ev: PointerEvent) {
        if (ev.button === 2 || ev.ctrlKey) return;

        if (ev.pointerType === 'touch') {
            this.isLongPressing = false;
            this.initialTouchPosition = { x: ev.clientX, y: ev.clientY };
            this.longPressTimeout = setTimeout(() => {
                this.isLongPressing = true;
            }, LONG_PRESS_DURATION);
        }
        const target_rect = (ev.currentTarget as HTMLElement).getBoundingClientRect();
        const offsetX = ev.pageX - target_rect.left;
        const offsetY = ev.pageY - target_rect.top;
        this.parent.pointerCache[ev.pointerId] = {
            ev,
            shift: new Coord(offsetX - this.parent.translates.x, offsetY - this.parent.translates.y)
        };

        if (Object.values(this.parent.pointerCache).length >= 2) {
            this.cancelLongPress();

            this.cardElement.style.transition = "transform 0.3s";
            this.cardElement.style.transform = `translate(${this.position.x * this.parent.oneblock.width}px, ${this.position.y * this.parent.oneblock.height}px)`;

            setTimeout(() => {
                this.cardElement.style.transition = "";
                this.cardElement.style.borderRadius = "";
                this.cardElement.style.zIndex = "1";
            }, 300);
            return;
        }

        this.startDragging(ev);
    }
    private pointermove(ev: PointerEvent) {
        if (this.longPressTimeout && ev.pointerType === 'touch') {
            const moveThreshold = 10;
            const deltaX = Math.abs(ev.clientX - this.initialTouchPosition.x);
            const deltaY = Math.abs(ev.clientY - this.initialTouchPosition.y);

            if (deltaX > moveThreshold || deltaY > moveThreshold) {
                this.cancelLongPress();
            }
        }
    }
    private pointerup(ev: PointerEvent) {
        if (ev.pointerType === 'touch') {
            if (this.isLongPressing) {
                this.createContextMenu(ev.pageX,ev.pageY);
            }else{
                this.cancelLongPress();
            }
        }
    }
    private cancelLongPress() {
        if (this.longPressTimeout) {
            clearTimeout(this.longPressTimeout);
            this.longPressTimeout = undefined;
        }
        this.isLongPressing = false;
    }

    private startDragging(ev: PointerEvent) {
        this.times.forEach(clearTimeout);
        const pos = this.cardElement.getBoundingClientRect();
        const shiftX = (ev.pageX - pos.left) / this.parent.scale;
        const shiftY = (ev.pageY - pos.top) / this.parent.scale;

        const shadow = createCloneElement(this);
        this.parent.element.appendChild(shadow);
        this.cardElement.style.zIndex = "2000";
        this.cardElement.style.transitionDuration = "";
        this.cardElement.style.transition = "border-radius 0.3s";
        this.cardElement.style.borderRadius = "20px";

        for (const pointerId in this.parent.cardPointers) {
            this.parent.cardPointers[pointerId].shadow.remove();
            delete this.parent.cardPointers[pointerId];
        }

        this.parent.cardPointers[ev.pointerId] = {
            shadow,
            shift: new Coord(shiftX, shiftY),
            card: this,
            target_pos: new Coord(this.position.x, this.position.y),
            ev
        };

        shadow.style.transform = `translate(${this.position.x * this.parent.oneblock.width}px, ${this.position.y * this.parent.oneblock.height}px)`;

        this.parent.pointermove(ev);
    }
    get num() {
        return Number(this.numElement.textContent ?? -1);
    }
    set num(x: number) {
        if (x === -1) {
            this.numElement.textContent = "";
        } else {
            this.numElement.textContent = x.toString();
        }
    }
    get name() {
        return this.nameElement.children[0].innerHTML;
    }
    set name(name: string) {
        this.nameElement.innerHTML = `<div>${name}</div>`;
    }
    get background() {
        return this.cardElement.style.background;
    }
    set background(code: string) {
        this.cardElement.style.background = code;
    }
    get main_img() {
        return this.mainImgElement.src;
    }
    set main_img(url: string | undefined) {
        if (url) {
            this.mainImgElement.src = url;
            this.mainImgElement.style.display = "block";
        } else {
            this.mainImgElement.src = "about:blank";
            this.mainImgElement.style.display = "none";
        }
    }
    get main_img_pos() {
        return {
            x: Number(this.mainImgElement.style.right.replace("%", "")),
            y: Number(this.mainImgElement.style.top.replace("%", "")),
        };
    }
    set main_img_pos(coord: { x: number; y: number; }) {
        this.mainImgElement.style.top = `${coord.y}%`;
        this.mainImgElement.style.right = `${coord.x}%`;
    }
    get main_img_scale() {
        return Number(this.mainImgElement.style.width.replace("%", ""));
    }
    set main_img_scale(scale: number) {
        this.mainImgElement.style.width = `${scale}%`;
    }
    get font() {
        return Number(this.nameElement.style.fontSize.replace("px", ""));
    }
    set font(fontSize: number) {
        this.nameElement.style.fontSize = `${fontSize}px`;
    }

    get isNumberVisible() {
        return this.numElement.style.display !== "none";
    }
    set isNumberVisible(value: boolean) {
        this.numElement.style.display = value ? "block" : "none";
    }
    

    destroy() {
        this.cardElement.remove();
    }
    get element() {
        return this.cardElement;
    }

    private handleDragOver(event: DragEvent) {
        event.preventDefault();
        event.dataTransfer!.dropEffect = 'copy';
    }

    private handleDrop(event: DragEvent) {
        event.preventDefault();
        const files = event.dataTransfer!.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                const objectURL = URL.createObjectURL(file)
                this.main_img= objectURL;
            }
        }
    }
};
