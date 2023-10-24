"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var random_id = function (len) {
    var p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return __spreadArray([], Array(len), true).reduce(function (a) { return a + p[Math.floor(Math.random() * p.length)]; }, '');
};
var g_origin = new URL(window.location.href).origin;
var g_id = random_id(12);
var Sprite = /** @class */ (function () {
    function Sprite(id, x, y, image_url, update_method, onclick_method) {
        this.speed_x = 8;
        this.speed_y = 8;
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
    Sprite.prototype.update = function () {
        this.go_toward_destination();
    };
    Sprite.prototype.onclick = function (x, y) {
        this.set_destination(x, y);
    };
    Sprite.prototype.set_destination = function (x, y) {
        this.dest_x = x;
        this.dest_y = y;
        //Set x and y speeds using slope as ratio
        var dx = this.x - this.dest_x;
        var dy = this.y - this.dest_y;
        if (dx < 0) {
            dx = dx * (-1);
        }
        if (dy < 0) {
            dy = dy * (-1);
        }
        if (dx == 0) {
            this.speed_x = 0;
            this.speed_y = 8;
        }
        else if (dx < dy) {
            var slope = dy / dx;
            this.speed_x = 8 / slope;
            this.speed_y = 8;
        }
        else if (dx > dy) {
            var slope = dy / dx;
            this.speed_x = 8;
            this.speed_y = 8 * slope;
        }
        else {
            this.speed_x = 8;
            this.speed_y = 8;
        }
    };
    Sprite.prototype.ignore_click = function (x, y) {
    };
    Sprite.prototype.move = function (dx, dy) {
        this.dest_x = this.x + dx;
        this.dest_y = this.y + dy;
    };
    Sprite.prototype.go_toward_destination = function () {
        if (this.dest_x === undefined)
            return;
        if (this.x < this.dest_x)
            this.x += Math.min(this.dest_x - this.x, this.speed_x);
        else if (this.x > this.dest_x)
            this.x -= Math.min(this.x - this.dest_x, this.speed_x);
        if (this.y < this.dest_y)
            this.y += Math.min(this.dest_y - this.y, this.speed_y);
        else if (this.y > this.dest_y)
            this.y -= Math.min(this.y - this.dest_y, this.speed_y);
    };
    Sprite.prototype.sit_still = function () {
    };
    return Sprite;
}());
var Model = /** @class */ (function () {
    function Model() {
        this.sprites = [];
        this.robot = new Sprite(g_id, 50, 50, "blue_robot.png", Sprite.prototype.go_toward_destination, Sprite.prototype.set_destination);
        id_to_sprite[g_id] = this.robot;
        this.sprites.push(this.robot);
    }
    Model.prototype.update = function () {
        for (var _i = 0, _a = this.sprites; _i < _a.length; _i++) {
            var sprite = _a[_i];
            sprite.update();
        }
    };
    Model.prototype.onclick = function (x, y) {
        for (var _i = 0, _a = this.sprites; _i < _a.length; _i++) {
            var sprite = _a[_i];
            sprite.onclick(x, y);
        }
    };
    Model.prototype.move = function (dx, dy) {
        this.robot.move(dx, dy);
    };
    return Model;
}());
var View = /** @class */ (function () {
    function View(model) {
        this.model = model;
        this.canvas = document.getElementById("myCanvas");
        this.robot = new Image();
        this.robot.src = "blue_robot.png";
    }
    View.prototype.update = function () {
        var ctx = this.canvas.getContext("2d");
        ctx.clearRect(0, 0, 1000, 500);
        for (var _i = 0, _a = this.model.sprites; _i < _a.length; _i++) {
            var sprite = _a[_i];
            ctx.drawImage(sprite.image, sprite.x - sprite.image.width / 2, sprite.y - sprite.image.height / 2);
        }
    };
    return View;
}());
var id_to_sprite = {};
var Controller = /** @class */ (function () {
    function Controller(model, view) {
        this.model = model;
        this.view = view;
        this.key_right = false;
        this.key_left = false;
        this.key_up = false;
        this.key_down = false;
        var self = this;
        this.last_updates_request_time = Date.now();
        view.canvas.addEventListener("click", function (event) { self.onClick(event); });
        document.addEventListener('keydown', function (event) { self.keyDown(event); }, false);
        document.addEventListener('keyup', function (event) { self.keyUp(event); }, false);
    }
    Controller.prototype.onClick = function (event) {
        var _this = this;
        var x = event.pageX - this.view.canvas.offsetLeft;
        var y = event.pageY - this.view.canvas.offsetTop;
        this.model.onclick(x, y);
        httpPost('ajax.html', {
            id: g_id,
            action: 'click',
            x: x,
            y: y,
        }, function (ob) { return _this.onAcknowledgeClick(ob); });
    };
    Controller.prototype.keyDown = function (event) {
        if (event.keyCode == 39)
            this.key_right = true;
        else if (event.keyCode == 37)
            this.key_left = true;
        else if (event.keyCode == 38)
            this.key_up = true;
        else if (event.keyCode == 40)
            this.key_down = true;
    };
    Controller.prototype.keyUp = function (event) {
        if (event.keyCode == 39)
            this.key_right = false;
        else if (event.keyCode == 37)
            this.key_left = false;
        else if (event.keyCode == 38)
            this.key_up = false;
        else if (event.keyCode == 40)
            this.key_down = false;
    };
    Controller.prototype.onAcknowledgeClick = function (ob) {
        console.log("Response to click: ".concat(JSON.stringify(ob)));
    };
    Controller.prototype.onReceiveUpdates = function (ob) {
        // { "updates": [ ["id", 3112, 2131], ["id", 123, 321], ["id", 234, 654] ] }
        console.log("ob = ".concat(JSON.stringify(ob)));
        if ("updates" in ob) {
            var updates = ob["updates"];
            var count = Object.keys(updates).length;
            console.log(count);
            for (var i = 0; i < count; i++) {
                console.log("TESTING");
                var update = ob["updates"][i];
                var id = update[0];
                var x = update[1];
                var y = update[2];
                // find the sprite with id == id
                for (var j = 0; j < this.model.sprites.length; j++) {
                    if (id in id_to_sprite) {
                        var sprite1 = id_to_sprite[id];
                        sprite1.set_destination(x, y);
                        return;
                    }
                    else {
                        var newPlayer = new Sprite(id, x, y, "green_robot.png", Sprite.prototype.go_toward_destination, Sprite.prototype.ignore_click);
                        this.model.sprites.push(newPlayer);
                        id_to_sprite[id] = newPlayer;
                        return;
                    }
                }
            }
        }
    };
    Controller.prototype.update = function () {
        var _this = this;
        var dx = 0;
        var dy = 0;
        var speed = this.model.robot.speed;
        if (this.key_right)
            dx += speed;
        if (this.key_left)
            dx -= speed;
        if (this.key_up)
            dy -= speed;
        if (this.key_down)
            dy += speed;
        if (dx != 0 || dy != 0)
            this.model.move(dx, dy);
        var time = Date.now();
        if (time - this.last_updates_request_time >= 1000) {
            this.last_updates_request_time = time;
            httpPost('ajax.html', {
                id: g_id,
                action: 'getUpdates',
                x: this.model.robot.x,
                y: this.model.robot.y
            }, function (ob) { return _this.onReceiveUpdates(ob); });
            // console.log(this.model.sprites)
        }
    };
    return Controller;
}());
var Game = /** @class */ (function () {
    function Game() {
        this.model = new Model();
        this.view = new View(this.model);
        this.controller = new Controller(this.model, this.view);
    }
    Game.prototype.onTimer = function () {
        this.controller.update();
        this.model.update();
        this.view.update();
    };
    return Game;
}());
var game = new Game();
var timer = setInterval(function () { game.onTimer(); }, 40);
// Payload is a marshaled (but not JSON-stringified) object
// A JSON-parsed response object will be passed to the callback
var httpPost = function (page_name, payload, callback) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState === 4) {
            if (request.status === 200) {
                var response_obj = void 0;
                try {
                    response_obj = JSON.parse(request.responseText);
                }
                catch (err) { }
                if (response_obj) {
                    callback(response_obj);
                }
                else {
                    callback({
                        status: 'error',
                        message: 'response is not valid JSON',
                        response: request.responseText,
                    });
                }
            }
            else {
                if (request.status === 0 && request.statusText.length === 0) {
                    callback({
                        status: 'error',
                        message: 'connection failed',
                    });
                }
                else {
                    callback({
                        status: 'error',
                        message: "server returned status ".concat(request.status, ": ").concat(request.statusText),
                    });
                }
            }
        }
    };
    request.open('post', "".concat(g_origin, "/").concat(page_name), true);
    request.setRequestHeader('Content-Type', 'application/json');
    console.log(payload);
    request.send(JSON.stringify(payload));
};
