
import { DIRECTION_RIGHT, DIRECTION_UP, DIRECTION_LEFT, DIRECTION_BOTTOM } from './constants.js';

export class Ghost {
    constructor(
        x,
        y,
        width,
        height,
        speed,
        imageX,
        imageY,
        imageWidth,
        imageHeight,
        range,
        randomTargets
    ) {
        this.x = x;
        this.y = y;
        this.startX = x;
        this.startY = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.normalSpeed = speed;
        this.direction = DIRECTION_RIGHT;
        this.imageX = imageX;
        this.imageY = imageY;
        this.imageHeight = imageHeight;
        this.imageWidth = imageWidth;
        this.range = range;
        this.randomTargets = randomTargets;
        this.randomTargetIndex = parseInt(Math.random() * 4);
        this.target = randomTargets[this.randomTargetIndex];
        
        this.isScared = false;
        this.scaredTimer = 0;

        setInterval(() => {
            this.changeRandomDirection();
        }, 10000);
    }

    isInRange(pacman, oneBlockSize) {
        let xDistance = Math.abs(pacman.getMapX(oneBlockSize) - this.getMapX(oneBlockSize));
        let yDistance = Math.abs(pacman.getMapY(oneBlockSize) - this.getMapY(oneBlockSize));
        if (
            Math.sqrt(xDistance * xDistance + yDistance * yDistance) <=
            this.range
        ) {
            return true;
        }
        return false;
    }

    changeRandomDirection() {
        let addition = 1;
        this.randomTargetIndex += addition;
        this.randomTargetIndex = this.randomTargetIndex % 4;
    }

    moveProcess(pacman, map, oneBlockSize) {
        if (this.isScared) {
            this.target = this.randomTargets[this.randomTargetIndex];
            this.speed = this.normalSpeed * 0.5; // Slow down
        } else {
            this.speed = this.normalSpeed;
            if (this.isInRange(pacman, oneBlockSize)) {
                this.target = pacman;
            } else {
                this.target = this.randomTargets[this.randomTargetIndex];
            }
        }
        
        this.changeDirectionIfPossible(map, oneBlockSize);
        this.moveForwards();
        if (this.checkCollisions(map, oneBlockSize)) {
            this.moveBackwards();
            return;
        }
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

    changeDirectionIfPossible(map, oneBlockSize) {
        let tempDirection = this.direction;
        this.direction = this.calculateNewDirection(
            map,
            parseInt(this.target.x / oneBlockSize),
            parseInt(this.target.y / oneBlockSize),
            oneBlockSize
        );
        if (typeof this.direction === "undefined") {
            this.direction = tempDirection;
            return;
        }
        if (
            this.getMapY(oneBlockSize) != this.getMapYRightSide(oneBlockSize) &&
            (this.direction === DIRECTION_LEFT ||
                this.direction === DIRECTION_RIGHT)
        ) {
            this.direction = DIRECTION_UP;
        }
        if (
            this.getMapX(oneBlockSize) != this.getMapXRightSide(oneBlockSize) &&
            this.direction === DIRECTION_UP
        ) {
            this.direction = DIRECTION_LEFT;
        }
        this.moveForwards();
        if (this.checkCollisions(map, oneBlockSize)) {
            this.moveBackwards();
            this.direction = tempDirection;
        } else {
            this.moveBackwards();
        }
    }

    calculateNewDirection(map, destX, destY, oneBlockSize) {
        let mp = [];
        for (let i = 0; i < map.length; i++) {
            mp[i] = map[i].slice();
        }

        let queue = [
            {
                x: this.getMapX(oneBlockSize),
                y: this.getMapY(oneBlockSize),
                rightX: this.getMapXRightSide(oneBlockSize),
                rightY: this.getMapYRightSide(oneBlockSize),
                moves: [],
            },
        ];
        while (queue.length > 0) {
            let poped = queue.shift();
            if (poped.x === destX && poped.y === destY) {
                return poped.moves[0];
            } else {
                mp[poped.y][poped.x] = 1;
                let neighborList = this.addNeighbors(poped, mp);
                for (let i = 0; i < neighborList.length; i++) {
                    queue.push(neighborList[i]);
                }
            }
        }

        return 1;
    }

    addNeighbors(poped, mp) {
        let queue = [];
        let numOfRows = mp.length;
        let numOfColumns = mp[0].length;

        if (
            poped.x - 1 >= 0 &&
            poped.x - 1 < numOfRows &&
            mp[poped.y][poped.x - 1] != 1
        ) {
            let tempMoves = poped.moves.slice();
            tempMoves.push(DIRECTION_LEFT);
            queue.push({ x: poped.x - 1, y: poped.y, moves: tempMoves });
        }
        if (
            poped.x + 1 >= 0 &&
            poped.x + 1 < numOfRows &&
            mp[poped.y][poped.x + 1] != 1
        ) {
            let tempMoves = poped.moves.slice();
            tempMoves.push(DIRECTION_RIGHT);
            queue.push({ x: poped.x + 1, y: poped.y, moves: tempMoves });
        }
        if (
            poped.y - 1 >= 0 &&
            poped.y - 1 < numOfColumns &&
            mp[poped.y - 1][poped.x] != 1
        ) {
            let tempMoves = poped.moves.slice();
            tempMoves.push(DIRECTION_UP);
            queue.push({ x: poped.x, y: poped.y - 1, moves: tempMoves });
        }
        if (
            poped.y + 1 >= 0 &&
            poped.y + 1 < numOfColumns &&
            mp[poped.y + 1][poped.x] != 1
        ) {
            let tempMoves = poped.moves.slice();
            tempMoves.push(DIRECTION_BOTTOM);
            queue.push({ x: poped.x, y: poped.y + 1, moves: tempMoves });
        }
        return queue;
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

    reset() {
        this.x = this.startX;
        this.y = this.startY;
        this.isScared = false;
        this.speed = this.normalSpeed;
    }

    draw(ctx, ghostFrames, oneBlockSize) {
        ctx.save();
        
        if (this.isScared) {
            // Blue filter for scared ghosts
            ctx.filter = 'hue-rotate(200deg) brightness(1.5)';
        }

        ctx.drawImage(
            ghostFrames,
            this.imageX,
            this.imageY,
            this.imageWidth,
            this.imageHeight,
            this.x,
            this.y,
            this.width,
            this.height
        );
        
        ctx.restore();
    }
}
