// Adapted Platform class for React - accepts image as parameter
export class Platform {
    constructor(x, y, w, img) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.img = img;
    }

    drawPlatform(ctx) {
        const spriteX = 152;
        const spriteY = 154;
        const spriteWidth = 9;
        const spriteHeight = 8;
        
        if (this.img) {
            for (let i = 0; i < this.w; i++) {
                const x = this.x + i * 15;
                ctx.drawImage(this.img, spriteX, spriteY, spriteWidth, spriteHeight, x, this.y, 20, 24);
            }
        }
    }
}

