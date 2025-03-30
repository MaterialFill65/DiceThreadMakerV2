
export class Coord {
    private _x: number = 0;
    private _y: number = 0;
    private observer?: (x: number, y: number) => void;

    constructor(x: number, y: number, observer?: (x: number, y: number) => void) {
        this.observer = observer;
        this.set(x, y);
    }
    get x() {
        return this._x;
    }
    get y() {
        return this._y;
    }

    set(x: number, y: number) {
        if (this.observer) {
            this.observer(x, y);
        }
        this._x = x;
        this._y = y;
    }
}
