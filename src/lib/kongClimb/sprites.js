// Adapted sprites class for React - accepts images as parameters instead of loading them
export class sprites {
    constructor(ctx, images) {
        this.ctx = ctx;
        this.images = images;
    }

    drawSprite(spriteX, spriteY, spriteWidth, spriteHeight, canvasX, canvasY, canvasWidth, canvasHeight) {
        if (this.images.sprites) {
            this.ctx.drawImage(this.images.sprites, spriteX, spriteY, spriteWidth, spriteHeight, canvasX, canvasY, canvasWidth, canvasHeight);
        }
    }

    drawSpriteBarrel(spriteX, spriteY, spriteWidth, spriteHeight, canvasX, canvasY, canvasWidth, canvasHeight) {
        if (this.images.barrel) {
            this.ctx.drawImage(this.images.barrel, spriteX, spriteY, spriteWidth, spriteHeight, canvasX, canvasY, canvasWidth, canvasHeight);
        }
    }

    drawSpriteDK(spriteX, spriteY, spriteWidth, spriteHeight, canvasX, canvasY, canvasWidth, canvasHeight) {
        if (this.images.dk) {
            this.ctx.drawImage(this.images.dk, spriteX, spriteY, spriteWidth, spriteHeight, canvasX, canvasY, canvasWidth, canvasHeight);
        }
    }
}

