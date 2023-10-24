interface HttpPostCallback {
	(x:any): any;
}

const random_id = (len:number) => {
    let p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return [...Array(len)].reduce(a => a + p[Math.floor(Math.random() * p.length)], '');
}

const g_origin = new URL(window.location.href).origin;
const g_id = random_id(12);

class Sprite {
	x: number;
	y: number;
	speed: number;
	speed_x: number = 8;
	speed_y: number = 8;
	image: HTMLImageElement;
	dest_x: number;
	dest_y: number;
	id: any;

	constructor(id:any, x: number, y: number, image_url: string, update_method: { (): void; (): void; (): void; }, onclick_method: { (x: number, y: number): void; (x: number, y: number): void; (x: number, y: number): void; }) {
		this.id = id;
		this.x = x;
		this.y = y;
		this.dest_x = x;
		this.dest_y = y;
        this.speed = 8;
		this.image = new Image();
		this.image.src = image_url;
		this.update = update_method;
		this.onclick = onclick_method;
	}

	update(){
		this.go_toward_destination();
	}

	onclick(x: number, y: number){
		this.set_destination(x, y);
	}

	set_destination(x: number, y: number) {
		this.dest_x = x;
		this.dest_y = y;

		//Set x and y speeds using slope as ratio
		let dx: number = this.x-this.dest_x;
		let dy: number = this.y-this.dest_y;
		if (dx < 0){
			dx = dx*(-1);
		}
		if (dy < 0){
			dy = dy*(-1);
		}

		if (dx == 0){
			this.speed_x = 0;
			this.speed_y = 8;
		}
		else if(dx < dy){
			let slope: number = dy/dx;
			this.speed_x = 8 / slope;
			this.speed_y = 8;
		}
		else if(dx > dy){
			let slope: number = dy/dx;
			this.speed_x = 8;
			this.speed_y = 8 * slope;
		}
		else{
			this.speed_x = 8;
			this.speed_y = 8;
		}
	}

	ignore_click(x: number, y: number) {
	}

	move(dx: number, dy: number) {
		this.dest_x = this.x + dx;
		this.dest_y = this.y + dy;
	}

	go_toward_destination() {
		if(this.dest_x === undefined)
			return;

		if(this.x < this.dest_x)
			this.x += Math.min(this.dest_x - this.x, this.speed_x);
		else if(this.x > this.dest_x)
			this.x -= Math.min(this.x - this.dest_x, this.speed_x);
		if(this.y < this.dest_y)
			this.y += Math.min(this.dest_y - this.y, this.speed_y);
		else if(this.y > this.dest_y)
			this.y -= Math.min(this.y - this.dest_y, this.speed_y);
	}

	sit_still() {
	}
}

class Model {
	robot: Sprite;
	sprites: Sprite[];

	constructor() {
		this.sprites = [];
		this.robot = new Sprite(g_id, 50, 50, "blue_robot.png", Sprite.prototype.go_toward_destination, Sprite.prototype.set_destination);
		id_to_sprite[g_id] = this.robot;
		this.sprites.push(this.robot);
	}

	update() {
		for (const sprite of this.sprites) {
			sprite.update();
		}
	}

	onclick(x: number, y: number) {
		for (const sprite of this.sprites) {
			sprite.onclick(x, y);
		}
	}

	move(dx: number, dy: number) {
		this.robot.move(dx, dy);
	}
}


class View
{
	model: Model;
	canvas: HTMLCanvasElement;
	robot: HTMLImageElement;
	
	constructor(model: Model) {
		this.model = model;
		this.canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
		this.robot = new Image();
		this.robot.src = "blue_robot.png";
	}

	update() {
		let ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
		ctx.clearRect(0, 0, 1000, 500);
		for (const sprite of this.model.sprites) {
			ctx.drawImage(sprite.image, sprite.x - sprite.image.width / 2, sprite.y - sprite.image.height / 2);
		}
	}
}

const id_to_sprite: Record<string, Sprite> = {};

class Controller
{
	model: Model;
	view: View;
	key_right: boolean;
	key_left: boolean;
	key_up: boolean;
	key_down: boolean;
	last_updates_request_time: number;
	
	constructor(model: Model, view: View) {
		this.model = model;
		this.view = view;
		this.key_right = false;
		this.key_left = false;
		this.key_up = false;
		this.key_down = false;
		let self = this;
		this.last_updates_request_time = Date.now();
		view.canvas.addEventListener("click", function(event) { self.onClick(event); });
		document.addEventListener('keydown', function(event) { self.keyDown(event); }, false);
		document.addEventListener('keyup', function(event) { self.keyUp(event); }, false);
	}

	onClick(event: MouseEvent) {
		const x = event.pageX - this.view.canvas.offsetLeft;
		const y = event.pageY - this.view.canvas.offsetTop;
		this.model.onclick(x, y);

		httpPost('ajax.html', {
			id: g_id,
			action: 'click',
			x: x,
			y: y,
		}, (ob) => { return this.onAcknowledgeClick(ob)} );
	}

	keyDown(event: KeyboardEvent) {
		if(event.keyCode == 39) this.key_right = true;
		else if(event.keyCode == 37) this.key_left = true;
		else if(event.keyCode == 38) this.key_up = true;
		else if(event.keyCode == 40) this.key_down = true;
	}

	keyUp(event: KeyboardEvent) {
		if(event.keyCode == 39) this.key_right = false;
		else if(event.keyCode == 37) this.key_left = false;
		else if(event.keyCode == 38) this.key_up = false;
		else if(event.keyCode == 40) this.key_down = false;
	}

	onAcknowledgeClick(ob: any) {
		console.log(`Response to click: ${JSON.stringify(ob)}`);
	}

	onReceiveUpdates(ob: any) {
		// { "updates": [ ["id", 3112, 2131], ["id", 123, 321], ["id", 234, 654] ] }
		console.log(`ob = ${JSON.stringify(ob)}`);
		if ("updates" in ob){
			let updates = ob["updates"];
			let count = Object.keys(updates).length;
			console.log(count);
			for (let i = 0; i < count; i++){
				console.log("TESTING");
				let update = ob["updates"][i];
				let id = update[0];
				let x = update[1];
				let y = update[2];

				// find the sprite with id == id
				for (let j = 0; j < this.model.sprites.length; j++){
					if (id in id_to_sprite){
						const sprite1 = id_to_sprite[id];
						sprite1.set_destination(x, y);
						return;
					}
					else{
						let newPlayer:Sprite = new Sprite(id, x, y, "green_robot.png", Sprite.prototype.go_toward_destination, Sprite.prototype.ignore_click);
						this.model.sprites.push(newPlayer);
						id_to_sprite[id] = newPlayer;
						return;
					}
				}
			}
		}
	}

	update() {
		let dx = 0;
		let dy = 0;
        let speed = this.model.robot.speed;
		if(this.key_right) dx += speed;
		if(this.key_left) dx -= speed;
		if(this.key_up) dy -= speed;
		if(this.key_down) dy += speed;
		if(dx != 0 || dy != 0)
			this.model.move(dx, dy);

		const time = Date.now();
		if (time - this.last_updates_request_time >= 1000) {
			this.last_updates_request_time = time;
			httpPost('ajax.html', {
				id: g_id,
				action: 'getUpdates',
				x: this.model.robot.x,
				y: this.model.robot.y
			}, (ob) => { return this.onReceiveUpdates(ob); });
			// console.log(this.model.sprites)
		}
	}
}


class Game {
	model: Model;
	view: View;
	controller: Controller;
	
	constructor() {
		this.model = new Model();
		this.view = new View(this.model);
		this.controller = new Controller(this.model, this.view);
	}

	onTimer() {
		this.controller.update();
		this.model.update();
		this.view.update();
	}
}


let game = new Game();
let timer = setInterval(() => { game.onTimer(); }, 40);


// Payload is a marshaled (but not JSON-stringified) object
// A JSON-parsed response object will be passed to the callback
const httpPost = (page_name: string, payload: any, callback: HttpPostCallback) => {
	let request = new XMLHttpRequest();
	request.onreadystatechange = () => {
		if(request.readyState === 4)
		{
			if(request.status === 200) {
				let response_obj;
				try {
					response_obj = JSON.parse(request.responseText);
				} catch(err) {}
				if (response_obj) {
					callback(response_obj);
				} else {
					callback({
						status: 'error',
						message: 'response is not valid JSON',
						response: request.responseText,
					});
				}
			} else {
				if(request.status === 0 && request.statusText.length === 0) {
					callback({
						status: 'error',
						message: 'connection failed',
					});
				} else {
					callback({
						status: 'error',
						message: `server returned status ${request.status}: ${request.statusText}`,
					});
				}
			}
		}
	};
	request.open('post', `${g_origin}/${page_name}`, true);
	request.setRequestHeader('Content-Type', 'application/json');
	console.log(payload);
	request.send(JSON.stringify(payload));
}