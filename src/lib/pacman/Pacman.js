
import { DIRECTION_RIGHT, DIRECTION_UP, DIRECTION_LEFT, DIRECTION_BOTTOM } from './constants.js';

export class Pacman {
    constructor(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.direction = DIRECTION_RIGHT;
        this.nextDirection = DIRECTION_RIGHT;
        this.frameCount = 7;
        this.currentFrame = 1;
        this.rotation = 0;
        
        // Animation interval
        setInterval(() => {
            this.changeAnimation();
        }, 100);
    }

    moveProcess(map, oneBlockSize) {
        this.changeDirectionIfPossible(map, oneBlockSize);
        this.moveForwards();
        if (this.checkCollisions(map, oneBlockSize)) {
            this.moveBackwards();
            return;
        }
    }

    eat(map, oneBlockSize) {
        let scoreIncrement = 0;
        let powerPelletEaten = false;
        let cherryEaten = false;

        for (let i = 0; i < map.length; i++) {
            for (let j = 0; j < map[0].length; j++) {
                if (
                    this.getMapX(oneBlockSize) === j &&
                    this.getMapY(oneBlockSize) === i
                ) {
                    if (map[i][j] === 2) { // Normal Food
                        map[i][j] = 3; // Eaten
                        scoreIncrement += 1;
                    } else if (map[i][j] === 4) { // Power Pellet
                        map[i][j] = 3; // Eaten
                        scoreIncrement += 50;
                        powerPelletEaten = true;
                    } else if (map[i][j] === 5) { // Cherry
                        map[i][j] = 3; // Eaten
                        scoreIncrement += 100;
                        cherryEaten = true;
                    }
                }
            }
        }
        return { score: scoreIncrement, powerPellet: powerPelletEaten, cherry: cherryEaten };
    }

    moveBackwards() {
        switch (this.direction) {
            case DIRECTION_RIGHT: this.x -= this.speed; break;
            case DIRECTION_UP: this.y += this.speed; break;
            case DIRECTION_LEFT: this.x += this.speed; break;
            case DIRECTION_BOTTOM: this.y -= this.speed; break;
        }
    }

    moveForwards() {
        switch (this.direction) {
            case DIRECTION_RIGHT: this.x += this.speed; break;
            case DIRECTION_UP: this.y -= this.speed; break;
            case DIRECTION_LEFT: this.x -= this.speed; break;
            case DIRECTION_BOTTOM: this.y += this.speed; break;
        }
    }

    checkCollisions(map, oneBlockSize) {
        let isCollided = false;
        if (
            map[parseInt(this.y / oneBlockSize)][parseInt(this.x / oneBlockSize)] === 1 ||
            map[parseInt(this.y / oneBlockSize + 0.9999)][parseInt(this.x / oneBlockSize)] === 1 ||
            map[parseInt(this.y / oneBlockSize)][parseInt(this.x / oneBlockSize + 0.9999)] === 1 ||
            map[parseInt(this.y / oneBlockSize + 0.9999)][parseInt(this.x / oneBlockSize + 0.9999)] === 1
        ) {
            isCollided = true;
        }
        return isCollided;
    }

    checkGhostCollision(ghosts, oneBlockSize) {
        for (let i = 0; i < ghosts.length; i++) {
            let ghost = ghosts[i];
            if (
                ghost.getMapX(oneBlockSize) === this.getMapX(oneBlockSize) &&
                ghost.getMapY(oneBlockSize) === this.getMapY(oneBlockSize)
            ) {
                return ghost; // Return the ghost object instead of boolean
            }
        }
        return null;
    }

    changeDirectionIfPossible(map, oneBlockSize) {
        if (this.direction === this.nextDirection) return;
        let tempDirection = this.direction;
        this.direction = this.nextDirection;
        this.moveForwards();
        if (this.checkCollisions(map, oneBlockSize)) {
            this.moveBackwards();
            this.direction = tempDirection;
        } else {
            this.moveBackwards();
        }
    }

    getMapX(oneBlockSize) {
        return parseInt(this.x / oneBlockSize);
    }

    getMapY(oneBlockSize) {
        return parseInt(this.y / oneBlockSize);
    }

    getMapXRightSide(oneBlockSize) {
        return parseInt((this.x * 0.99 + oneBlockSize) / oneBlockSize);
    }

    getMapYRightSide(oneBlockSize) {
        return parseInt((this.y * 0.99 + oneBlockSize) / oneBlockSize);
    }

    changeAnimation() {
        this.currentFrame = this.currentFrame === this.frameCount ? 1 : this.currentFrame + 1;
    }

    draw(ctx, pacmanFrames, oneBlockSize) {
        ctx.save();
        ctx.translate(
            this.x + oneBlockSize / 2,
            this.y + oneBlockSize / 2
        );
        ctx.rotate((this.direction * 90 * Math.PI) / 180);
        ctx.translate(
            -this.x - oneBlockSize / 2,
            -this.y - oneBlockSize / 2
        );
        ctx.drawImage(
            pacmanFrames,
            (this.currentFrame - 1) * oneBlockSize,
            0,
            oneBlockSize,
            oneBlockSize,
            this.x,
            this.y,
            this.width,
            this.height
        );
        ctx.restore();
    }
}
