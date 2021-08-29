import "./style.css";
import p5 from "p5";

class TileMap {
	public tiles: Tile[][];
	constructor(
		public p: p5,
		public width: number,
		public height: number,
		public size: number
	) {
		this.tiles = [];
		for (let x = 0; x < width; x++) {
			this.tiles[x] = [];
			for (let y = 0; y < height; y++) {
				this.tiles[x][y] = new Tile(p, x, y, size);
			}
		}
	}
	run() {
		for (let x = 0; x < this.width; x++) {
			for (let y = 0; y < this.height; y++) {
				this.tiles[x][y].setNeighbors(
					calculateNeighbors(this, this.tiles[x][y])
				);
			}
		}
	}
	render() {
		for (let x = 0; x < this.width; x++) {
			for (let y = 0; y < this.height; y++) {
				this.tiles[x][y].render();
			}
		}
	}
	handleClick(x: number, y: number) {
		const [i, j] = [Math.round(x / this.size), Math.round(y / this.size)];
		if (i < this.width && j < this.height) {
			try {
				this.tiles[i][j].handleClick();
			} catch (error) {}
		}
	}
}
function calculateNeighbors(tileMap: TileMap, tile: Tile) {
	const neighbors = [];
	for (let x = -1; x < 2; x++) {
		for (let y = -1; y < 2; y++) {
			if (x === 0 && y === 0) {
				continue;
			}
			const neighborX = tile.x + x;
			const neighborY = tile.y + y;
			if (
				neighborX >= 0 &&
				neighborX < tileMap.width &&
				neighborY >= 0 &&
				neighborY < tileMap.height
			) {
				neighbors.push(tileMap.tiles[neighborX][neighborY]);
			}
		}
	}
	return neighbors;
}
class Tile {
	constructor(
		public p: p5,
		public x: number,
		public y: number,
		public size: number
	) {}
	public alive: boolean = false;
	render() {
		this.alive
			? this.p.fill(40, 44, 52)
			: this.p.fill(256 - 40, 256 - 44, 256 - 52);
		this.p.stroke(256 - 20, 256 - 24, 256 - 32);
		this.p.strokeWeight(1);
		this.p.rect(
			this.x * this.size,
			this.y * this.size,
			this.size,
			this.size
		);
	}
	public neighbors: Tile[] = [];
	public setNeighbors(v: Tile[]) {
		this.neighbors = v;
		// die when less than 2 neighbors
		if (this.neighbors.filter((n) => n.alive).length < 2) {
			this.kill();
		}
		// lives if 2-3 neighbors
		if (
			this.neighbors.filter((n) => n.alive).length > 1 &&
			this.neighbors.filter((n) => n.alive).length < 4
		) {
		}
		// die when more than 3 neighbors
		if (this.neighbors.filter((n) => n.alive).length > 3) {
			this.kill();
		}
		// revive when exactly 3 neighbors
		if (this.neighbors.filter((n) => n.alive).length === 3) {
			this.revive();
		}
	}
	private lastAlive: number = 0;
	public handleClick() {
		if (Date.now() - this.lastAlive > 1000) {
			this.alive ? this.kill() : this.revive();
			this.lastAlive = Date.now();
		}
	}
	public kill() {
		this.alive = false;
	}
	public revive() {
		this.alive = true;
	}
}
const sketch = (p: p5) => {
	const size = 10;
	const frameRateInput = document.querySelector(
		"#frameRate"
	) as any as HTMLInputElement;
	const frameRateDisplay = document.querySelector(
		"#framerate-display"
	) as HTMLImageElement;
	const runCheckbox = document.getElementById(
		"run"
	) as any as HTMLInputElement;
	console.log(p.width / size, p.height / size, size);
	let tileMap: TileMap;
	p.setup = () => {
		p.createCanvas(600, 400);
		tileMap = new TileMap(p, p.width / size, p.height / size, size);
	};
	frameRateInput?.addEventListener("input", (e) => {
		p.frameRate(parseInt(e.target!.value as any as string));
		frameRateDisplay.innerText = e.target!.value as any as string;
	});
	p.draw = () => {
		frameRateDisplay.innerText =
			"fps : " + p.frameRate().toFixed().toString();
		if (p.mouseIsPressed) {
			tileMap.handleClick(p.mouseX, p.mouseY);
		}
		p.background(0);
		tileMap.render();
		if (runCheckbox.checked || p.keyIsDown(" ".charCodeAt(0))) {
			tileMap.run();
		}
	};
};
new p5(sketch, document.querySelector(".canvas") as HTMLElement);
