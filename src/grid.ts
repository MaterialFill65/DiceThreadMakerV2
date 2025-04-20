import Card, { CardMeta } from './card';
import { Coord } from './utils';
import './grid.css';

class Grid {
    cards: Card[] = [];
    readonly oneblock = {
        width: 300 as const,
        height: 150 as const
    };
    private readonly gridElement: HTMLDivElement = document.createElement("div");
    private readonly parentElement: HTMLDivElement;
    readonly translates: Coord;
    scale: number = 1;
    pointerCache: {
        [key: string]: {
            ev: PointerEvent;
            shift: Coord;
        };
    } = {};
    cardPointers: {
        [key: string]: {
            ev: PointerEvent;
            shift: Coord;
            target_pos: Coord;
            card: Card;
            shadow: HTMLDivElement;
        };
    } = {};
    prevDiff: number = 0;
    private _background: string = "#fff"; // Default to white
    private _backgroundImage: string = "";
    private _backgroundOpacity: number = 1;
    lastCenterX?: number = undefined;
    lastCenterY?: number = undefined;
    private _width: number = 5; // Default width
    private _height: number = 5; // Default height
    private areNumbersVisible: boolean = true;
    private readonly increaseWidthButton = document.createElement("span");
    private readonly decreaseWidthButton = document.createElement("span");
    private readonly increaseHeightButton = document.createElement("span");
    private readonly decreaseHeightButton = document.createElement("span");
    private readonly widthInput: HTMLInputElement = document.createElement("input");
    private readonly heightInput: HTMLInputElement = document.createElement("input");
    private readonly ctrlContainer: HTMLDivElement = document.createElement("div");
    private areNamesVisible: boolean = true;

    constructor(screen: HTMLDivElement) {
        this.gridElement.classList.add("grid");
        this.gridElement.style.background = this._background;

        // Create a container for the control elements
        this.ctrlContainer.classList.add("ctrl-container");
        screen.appendChild(this.ctrlContainer);

        this.increaseWidthButton.textContent = "add";
        this.increaseWidthButton.classList.add("CtrlButton");
        this.increaseWidthButton.classList.add("material-symbols-outlined");
        this.increaseWidthButton.style.top = "-70px";
        this.increaseWidthButton.addEventListener("click", () => {
            this.width++;
            this.widthInput.value = this.width.toString();
        });
        this.ctrlContainer.appendChild(this.increaseWidthButton);

        this.decreaseWidthButton.textContent = "remove";
        this.decreaseWidthButton.style.top = "-70px";
        this.decreaseWidthButton.style.left = "70px";
        this.decreaseWidthButton.classList.add("CtrlButton");
        this.decreaseWidthButton.classList.add("material-symbols-outlined");
        this.decreaseWidthButton.addEventListener("click", () => {
            this.width--;
            this.widthInput.value = this.width.toString();
        });
        this.ctrlContainer.appendChild(this.decreaseWidthButton);

        this.widthInput.style.top = "-170px";
        this.widthInput.classList.add("CtrlInput");
        this.widthInput.type = "number"
        this.widthInput.pattern = "\d*"
        this.widthInput.value = this._width.toString();
        this.widthInput.addEventListener("change", () => {
            const newWidth = parseInt(this.widthInput.value, 10);
            if (!isNaN(newWidth) && newWidth > 0) {
                this.width = newWidth;
            } else {
                this.widthInput.value = this.width.toString();
            }
        });
        this.ctrlContainer.appendChild(this.widthInput);

        this.increaseHeightButton.textContent = "add";
        this.increaseHeightButton.style.left = "-70px";
        this.increaseHeightButton.classList.add("CtrlButton");
        this.increaseHeightButton.classList.add("material-symbols-outlined");
        this.increaseHeightButton.addEventListener("click", () => {
            this.height++;
            this.heightInput.value = this.height.toString();
        });
        this.ctrlContainer.appendChild(this.increaseHeightButton);

        this.decreaseHeightButton.textContent = "remove";
        this.decreaseHeightButton.style.top = "70px";
        this.decreaseHeightButton.style.left = "-70px";
        this.decreaseHeightButton.classList.add("CtrlButton");
        this.decreaseHeightButton.classList.add("material-symbols-outlined");
        this.decreaseHeightButton.addEventListener("click", () => {
            this.height--;
            this.heightInput.value = this.height.toString();
        });
        this.ctrlContainer.appendChild(this.decreaseHeightButton);

        this.heightInput.classList.add("CtrlInput");
        this.heightInput.style.left = "-210px";
        this.heightInput.type = "number"
        this.heightInput.pattern = "\d*"
        this.heightInput.value = this._height.toString();
        this.heightInput.addEventListener("change", () => {
            const newHeight = parseInt(this.heightInput.value, 10);
            if (!isNaN(newHeight) && newHeight > 0) {
                this.height = newHeight;
            } else {
                this.heightInput.value = this.height.toString();
            }
        });
        this.ctrlContainer.appendChild(this.heightInput);

        screen.appendChild(this.ctrlContainer);

        this.translates = new Coord(10, 200, (x, y) => {
            this.gridElement.style.top = `${y}px`;
            this.gridElement.style.left = `${x}px`;
            this.ctrlContainer.style.top = `${y}px`;
            this.ctrlContainer.style.left = `${x}px`;
        });

        screen.addEventListener("pointerdown", this.pointerdown.bind(this), { passive: false });
        screen.addEventListener("pointermove", this.pointermove.bind(this), { passive: false });
        screen.addEventListener("pointerup", this.pointerend.bind(this), { passive: false });
        screen.addEventListener("pointerleave", this.pointerend.bind(this), { passive: false });
        screen.addEventListener("wheel", this.wheel.bind(this), { passive: false });
        this.gridElement.addEventListener("dragover", this.handleDragOver.bind(this));
        this.gridElement.addEventListener("drop", this.handleDrop.bind(this));
        this.parentElement = screen;
        this.gridElement.style.width = `${this.oneblock.width * this._width}px`;
        this.gridElement.style.height = `${this.oneblock.height * this._height}px`;
        screen.appendChild(this.gridElement);
    }

    private pointerdown(ev: PointerEvent) {
        const target = ev.target as HTMLElement;
        if (!this.parentElement.contains(target) || this.isCtrlElement(target)) {
            return;
        };

        const isCardClicked = this.cards.some(card => card.element.contains(target));
        if (isCardClicked && !ev.ctrlKey) {
            return; //　カードクリックされてるならそっちでハンドルする
        }

        ev.preventDefault();
        if (ev.currentTarget) {
            const target_rect = (ev.currentTarget as HTMLElement).getBoundingClientRect();
            const offsetX = ev.pageX - target_rect.left;
            const offsetY = ev.pageY - target_rect.top;
            this.pointerCache[ev.pointerId] = {
                ev,
                shift: new Coord(offsetX - this.translates.x, offsetY - this.translates.y)
            };
        }
    }

    private isCtrlElement(element: HTMLElement): boolean {
        if (element.classList.contains("CtrlInput") || element.classList.contains("CtrlButton")) {
            return true;
        } else if (element.parentElement) {
            return this.isCtrlElement(element.parentElement);
        }
        return false
    }

    public pointermove(ev: PointerEvent) {
        ev.preventDefault();
        const cache = Object.values(this.pointerCache);
        const cardPointerCount = Object.values(this.cardPointers).length;

        if (cache.length === 2) {
            // 二本指 検出！
            this.pointerCache[ev.pointerId].ev = ev;
            if (ev.currentTarget) {
                if (ev.currentTarget !== this.parentElement) {
                    return;
                }
                const target_rect = (ev.currentTarget as HTMLElement).getBoundingClientRect();
                const offsetX = ev.pageX - target_rect.left;
                const offsetY = ev.pageY - target_rect.top;
                this.pointerCache[ev.pointerId].shift =
                    new Coord(offsetX - this.translates.x, offsetY - this.translates.y)
            }
            const x1 = cache[0].ev.clientX;
            const y1 = cache[0].ev.clientY;
            const x2 = cache[1].ev.clientX;
            const y2 = cache[1].ev.clientY;

            const curDiff = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

            const centerX = (x1 + x2) / 2;
            const centerY = (y1 + y2) / 2;

            if (this.prevDiff === 0) {
                this.lastCenterX = centerX;
                this.lastCenterY = centerY;
                this.prevDiff = curDiff;
                return;
            }

            const moveX = centerX - this.lastCenterX!;
            const moveY = centerY - this.lastCenterY!;

            let scaleDiff = (curDiff - this.prevDiff) / this.prevDiff;
            if (scaleDiff === Infinity || isNaN(scaleDiff)) {
                scaleDiff = 0;
            }
            const scaleAmount = scaleDiff * this.scale;
            const adjustedMoveX = moveX;
            const adjustedMoveY = moveY;

            this.move(centerX, centerY, scaleAmount);

            this.move(
                this.translates.x + adjustedMoveX,
                this.translates.y + adjustedMoveY
            );

            this.prevDiff = curDiff;
            this.lastCenterX = centerX;
            this.lastCenterY = centerY;
        } else if (cache.length === 1) {
            this.pointerCache[ev.pointerId].ev = ev;
            

            if (this.prevDiff !== 0) {
                this.prevDiff = 0;
                this.lastCenterX = undefined;
                this.lastCenterY = undefined;
            }

            if (cardPointerCount === 0) {
                this.move(
                    ev.pageX - this.pointerCache[ev.pointerId].shift.x,
                    ev.pageY - this.pointerCache[ev.pointerId].shift.y
                );
            } else if (this.cardPointers[ev.pointerId]) {
                const { card, shadow, shift, target_pos } = this.cardPointers[ev.pointerId]!;
                card.element.style.transform = `translate(${(ev.pageX - this.translates.x) / this.scale - shift.x}px, ${(ev.pageY - this.translates.y) / this.scale - shift.y}px)`;
                const pos = card.element.getBoundingClientRect();
                const { x, y } = this.find(
                    (pos.left + this.oneblock.width / 2 * this.scale - this.translates.x) / this.oneblock.width / this.scale,
                    (pos.top + this.oneblock.height / 2 * this.scale - this.translates.y) / this.oneblock.height / this.scale,
                    card
                );
                if (target_pos.x !== x || target_pos.y !== y) {
                    shadow.style.transform = `translate(${x * this.oneblock.width}px, ${y * this.oneblock.height}px)`;
                }
                target_pos.set(x, y);
            }
        }
        else if (cache.length === 0 && cardPointerCount > 0) {
            for (const key in this.cardPointers) {
                this.pointerend({ pointerId: parseInt(key) } as PointerEvent);
            }
        }
    }


    private find(x: number, y: number, card: Card) {
        const normal_x = Math.min(Math.max(0, x), this._width - card.size.x); // 正規化
        const normal_y = Math.min(Math.max(0, y), this._height - card.size.y);
        return { x: Math.floor(normal_x), y: Math.floor(normal_y) };
    }

    private pointerend(ev: PointerEvent) {
        delete this.pointerCache[ev.pointerId];
        const cache = Object.values(this.pointerCache);
        if (cache.length === 0) {
            this.lastCenterX = undefined;
            this.lastCenterY = undefined;
            this.prevDiff = 0;
        }

        if (!this.cardPointers[ev.pointerId] || Object.values(this.pointerCache).length >= 2) {
            return;
        }
        const { card, shadow } = this.cardPointers[ev.pointerId]!;

        const { x, y } = this.cardPointers[ev.pointerId]!.target_pos;
        shadow.style.transform = `translate(${x * this.oneblock.width}px, ${y * this.oneblock.height}px)`;
        const existingCard = this.cards.find(c => c.position.x === x && c.position.y === y);
        if (existingCard) {
            const tempX = card.position.x;
            const tempY = card.position.y;
            card.position.set(x, y);
            existingCard.position.set(tempX, tempY);
        } else {
            card.position.set(x, y);
        }

        this.assign_number();
        setTimeout(() => {
            shadow.remove();
        }, 300);
        delete this.cardPointers[ev.pointerId];
        delete this.pointerCache[ev.pointerId];
    }

    private wheel(ev: WheelEvent) {
        if (ev.ctrlKey) {
            ev.preventDefault();
        }
        const scaleAmount = -ev.deltaY * 0.001;
        const x = ev.pageX;
        const y = ev.pageY;
        this.move(x, y, scaleAmount * this.scale);
    }

    private isPositionOccupied(x: number, y: number): boolean {
        return this.cards.some(card => card.position.x === x && card.position.y === y);
    }

    public addCard(meta: CardMeta) {
        let x = 0;
        let y = 0;

        while (this.isPositionOccupied(x, y)) {
            x++;
            if (x >= this._width) {
                x = 0;
                y++;
            }
            if (y >= this._height) {
                alert("カードがいっぱいです！どれか削除してください！");
                return;
            }
        }

        const card = new Card(meta, x, y, this);
        this.gridElement.appendChild(card.element);
        this.cards.push(card);
        this.assign_number();
    }

    public assign_number() {
        // 左上から番号振ってく
        let counter = 1;
        const sortedCards = this.cards.sort((a, b) => {
            if (a.position.y !== b.position.y) {
                return a.position.y - b.position.y;
            }
            return a.position.x - b.position.x;
        });
        for (const card of sortedCards) {
            if (card.isNumberVisible)
                card.num = counter++;
        }
    }

    public toggleNumberVisibility() {
        this.areNumbersVisible = !this.areNumbersVisible;
        this.cards.forEach(card => {
            card.isNumberVisible = this.areNumbersVisible;
        });
    }

    public toggleNameVisibility() {
        this.areNamesVisible = !this.areNamesVisible;
        this.cards.forEach(card => {
            card.isNameVisible = this.areNamesVisible;
        });
    }

    public move(x: number, y: number, scaleAmount?: number) {
        if (scaleAmount) {
            const prevScale = this.scale;
            this.scale += scaleAmount;
            this.scale = Math.min(Math.max(0.1, this.scale), 10);

            const out_x = (this.translates.x - x) * (this.scale / prevScale) + x;
            const out_y = (this.translates.y - y) * (this.scale / prevScale) + y;

            this.gridElement.style.scale = this.scale.toString();
            this.ctrlContainer.style.scale = this.scale.toString();
            this.translates.set(out_x, out_y);
        } else {
            this.translates.set(x, y);
        }
    }

    set height(y: number) {
        if (y <= 0) return;
        this._height = y;
        this.gridElement.style.height = `${this.oneblock.height * y}px`;
        this.cards = this.cards.filter(card => {
            if (card.position.y + card.size.y >= y + 1) {
                card.destroy();
                return false;
            }
            return true;
        });
        this.assign_number();
        this.heightInput.value = y.toString();

    }
    get height() {
        return this._height;
    }

    set width(x: number) {
        if (x <= 0) return;
        this._width = x;
        this.gridElement.style.width = `${this.oneblock.width * x}px`;
        this.cards = this.cards.filter(card => {
            if (card.position.x + card.size.x >= x + 1) {
                card.destroy();
                return false;
            }
            return true;
        });
        this.assign_number();
        this.widthInput.value = x.toString();

    }
    get width() {
        return this._width;
    }

    set background(color: string) {
        this._background = color;
        this.gridElement.style.background = color;
    }
    set backgroundImage(url: string) {
        this._backgroundImage = url;
        this.updateBackgroundStyle();
    }

    get backgroundImage() {
        return this._backgroundImage;
    }
    set backgroundOpacity(opacity: number) {
        this._backgroundOpacity = opacity;
        this.updateBackgroundStyle();
    }

    get backgroundOpacity() {
        return this._backgroundOpacity;
    }

    private updateBackgroundStyle() {
        this.gridElement.style.background = this._backgroundImage ? `url(${this._backgroundImage})` : this._background;
        this.gridElement.style.backgroundSize = "cover";
        this.gridElement.style.opacity = this._backgroundOpacity.toString();
    }
    get background() {
        return this._background;
    }

    get element() {
        return this.gridElement;
    }
    public removeAllCards() {
        this.cards.forEach(card => card.destroy());
        this.cards = [];
    }

    private handleDragOver(event: DragEvent) {
        event.preventDefault();
        event.dataTransfer!.dropEffect = 'copy';
    }

    private handleDrop(event: DragEvent) {
        event.preventDefault();
        if (event.target !== this.gridElement) {
            return;
        }
        const files = event.dataTransfer!.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                const objectURL = URL.createObjectURL(file)
                this.createNewCardWithImage(objectURL);
            }
        }
    }

    private createNewCardWithImage(imageUrl: string) {
        const newCardMeta: CardMeta = {
            name: "新カード",
            background: "#ffffff",
            charactor_img: imageUrl,
            img_pos: { x: 0, y: 0 },
            img_scale: 100,
            font_size: 50,
            size: { x: 1, y: 1 }
        };
        this.addCard(newCardMeta);
    }
}

export default Grid;
