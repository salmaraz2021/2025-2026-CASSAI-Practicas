/* jshint esversion: 6 */
/* exported Crono */

class Crono {
    constructor(display) {
        this.display = display;
        this.cent = 0;
        this.seg = 0;
        this.min = 0;
        this.timer = null;
    }

    tic() {
        this.cent++;
        if (this.cent === 100) {
            this.cent = 0;
            this.seg++;
        }
        if (this.seg === 60) {
            this.seg = 0;
            this.min++;
        }

        const c = this.cent.toString().padStart(2, '0');
        const s = this.seg.toString().padStart(2, '0');
        const m = this.min.toString().padStart(2, '0');

        this.display.textContent = `${m}:${s}:${c}`;
    }

    start() {
        if (!this.timer) {
            this.timer = setInterval(() => this.tic(), 10);
        }
    }

    stop() {
        clearInterval(this.timer);
        this.timer = null;
    }

    reset() {
        this.stop();
        this.cent = 0;
        this.seg = 0;
        this.min = 0;
        this.display.textContent = "00:00:00";
    }
    getTime() {
    const c = this.cent.toString().padStart(2, '0');
    const s = this.seg.toString().padStart(2, '0');
    const m = this.min.toString().padStart(2, '0');
    return `${m}:${s}:${c}`;
}
}