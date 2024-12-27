class Texture {
    constructor(src) {
        this.src = src;
    }

    init() {
        return new Promise((resolve) => {
            this.image = new Image();
            this.image.src = this.src;

            this.image.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = this.image.width;
                canvas.height = this.image.height;

                const ctx = canvas.getContext("2d");
                ctx.drawImage(this.image, 0, 0);
                this.data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
                resolve();
            };
        });
    }

    /**
     * Gets a pixel from the texture
     * @param {integer} x normalized x coord
     * @param {integer} y normalized y coord
     * @returns {color} color of the pixel
     */
    get_pixel(x, y) {
        // todo: texture anti-aliasing (maybe something toggleable)
        x = Math.round(x * this.image.width);
        y = Math.round(y * this.image.height);

        // x = this.image.width - x;
        y = this.image.height - y;

        return [
            this.data[((this.image.width * y) + x) * 4],
            this.data[((this.image.width * y) + x) * 4 + 1],
            this.data[((this.image.width * y) + x) * 4 + 2],
            this.data[((this.image.width * y) + x) * 4 + 3]
        ];
    }
}