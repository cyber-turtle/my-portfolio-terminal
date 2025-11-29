// Adapted Ladder class for React - accepts image as parameter
export class Ladder {
    constructor(x, y, h, img) {
        this.x = x;
        this.y = y;
        this.h = h;
        this.img = img;
    }

    drawLadder(ctx) {
        const spriteX = 130;
        const spriteY = 151.5;
        const spriteWidth = 10.5;
        const spriteHeight = 9;
        
        if (this.img) {
            for (let i = 0; i < this.h; i++) {
                const y = this.y - i * 15;
                ctx.drawImage(this.img, spriteX, spriteY, spriteWidth, spriteHeight, this.x, y, 38, 38);
            }
        }
    }
}

