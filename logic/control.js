sanitizer = require("sanitizer");

logic = function (socket) {
	this.socket = socket;

	this.socket.on("set-nickname", (function(ego) { return function(data, fn) { ego.setNickname(data,fn); }; })(this)); 
};

logic.prototype.nicknameList = [];
logic.prototype.setNickname = function(data, fn) {
	nickname = sanitizer.escape(data.nickname);
	if(logic.prototype.nicknameList.indexOf(nickname) != -1)
		fn({error: "nickname taken"});
	else {
		logic.prototype.nicknameList.push(nickname);
		logic.prototype.nicknameList.sort();

		this.socket.set('nickname', nickname, function () { fn({error:false}); });
		this.socket.emit("userlist", {list: logic.prototype.nicknameList});
		this.socket.broadcast.emit("userlist", { list: logic.prototype.nicknameList });
		this.handleConnect();		
	}
};
logic.prototype.unsetNickname = function() {
	this.socket.get("nickname", (function(ego) { return function(error, nickname) {
		logic.prototype.nicknameList.splice(logic.prototype.nicknameList.indexOf(nickname),1);
		ego.socket.broadcast.emit("userlist", { list: logic.prototype.nicknameList });
	}; })(this));
};

logic.prototype.handleConnect = function () {
  	this.socket.on('disconnect', (function(ego) { return function() { ego.handleDisconnect(); } })(this) ); 
  	this.socket.on('message', (function(ego) { return function(data) { ego.handleMessage(data.message); }}) (this));

	this.socket.get('nickname', (function(ego) { return function(error, nickname) {
		ego.socket.emit("server", {type: "connect self", data: {nickname: nickname}});
		ego.socket.broadcast.emit("server", {type: "connect", data: { nickname: nickname }});
	} })(this));
};
logic.prototype.handleDisconnect = function () {
	this.unsetNickname();
	this.socket.broadcast.emit("userlist", { list: logic.prototype.nicknameList });
	this.socket.broadcast.emit("server", {type: "disconnect", data: { nickname: nickname }});
};
logic.prototype.handleMessage = function(message) {
	message = sanitizer.escape(message);

	this.socket.get("nickname", (function(ego) { return function(error, nickname) {
		ego.socket.emit("message", {type: "self", message: message, nickname: nickname});
		ego.socket.broadcast.emit("message", { message: message, nickname: nickname});
	}; })(this));

};