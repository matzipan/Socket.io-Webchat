jQuery(function($) {

	var LayoutClass = function() {};
	LayoutClass.prototype.preloadDialog = {}; 
	LayoutClass.prototype.preloadDialog.hide = function () {
		$("#preloadDialog").hide("blind", 500);
	};

	LayoutClass.prototype.nicknameDialog = {};
	LayoutClass.prototype.nicknameDialog.show = function() {
		var nicknameDialog = $("#nicknameDialog");
		if(typeof this.nicknameDialogInitialized == "undefined") {
			nicknameDialog.css({
		        'left' : $("#content").width()/2 - (nicknameDialog.width() / 2), 
		        'top' : $("#content").height()/2 - (nicknameDialog.height() / 2),
		        'z-index' : 15,             
		    });
			$("#submitNickname").button();

			this.nicknameDialogInitialized = true;
		}

		nicknameDialog.show("fade", 500);
	};
	LayoutClass.prototype.nicknameDialog.hide = function() {
		$("#nicknameDialog").hide("fade", 500, function() {
				$("#nicknameDialogLoader").hide();
		});
	};
	LayoutClass.prototype.nicknameDialog.showLoader = function() {
		$("#nicknameDialogLoader").show("fade", 500);
	};
	LayoutClass.prototype.nicknameDialog.hideLoader = function() {
		$("#nicknameDialogLoader").hide("fade", 500);
	};

	LayoutClass.prototype.notifications = {};
	LayoutClass.prototype.notifications.showError = function(error) {
		var message;
		if(error=="nickname taken")
			message="Numele a fost luat deja. Incercati din nou";
		if(error="disconnected")
			message = "Ai fost deconectat de la server. Reincarca pagina pentru a te reconecta";

		$("#notificationsDialog").html($("<span>").addClass("error").html(message));
		$("#notificationsDialog").show("blind", 500); 
	};
	LayoutClass.prototype.notifications.hideError = function(force) {
		if(force == true)
			$("#notificationsDialog").hide();
		else
			$("#notificationsDialog").hide("blind", 500); 
		$("#notificationsDialog").html();
	};

	LayoutClass.prototype.contentOverlay = {};
	LayoutClass.prototype.contentOverlay.hide = function() {
		$("#contentOverlay").hide("fade", 500);
	}
	LayoutClass.prototype.contentOverlay.show = function() {
		$("#contentOverlay").show("fade", 500);
	}

	LayoutClass.prototype.userList = {}; 
	LayoutClass.prototype.userList.parseData = function (users, nickname) {
		$("#userList").html("");
  		$.each(users, function(index,user){
  			var div=$("<div>").html(user); 

  			if(user == nickname)
  				div.addClass("self");

  			$("#userList").append(div);
  		});
	};

	LayoutClass.prototype.messages = {};
	LayoutClass.prototype.messages.addServerMessage = function(data) {
		var message;
		if(data.type == "connect")
			message = data.data.nickname + " has connected";
		if(data.type == "connect self")
			message = "You have now connected. Welcome!";
		if(data.type == "disconnect")
			message = data.data.nickname + " has disconnected";

		$("#chatLog").append($("<div>").addClass("server").html(message));
	};
	LayoutClass.prototype.messages.addMessage = function (data) {
		var div = $("<div>").html(data.nickname + ": " + data.message);

		if(data.type="self")
			div.addClass("self");

		$("#chatLog").append(div); 
	}

	var LogicClass = function() {};

	LogicClass.prototype.handleConnect = function() {
		function sendNickname (nickname,callback) {
			socket.emit("set-nickname", {nickname: nickname}, callback);
		};

		function handleSubmit(data) {
			if(data.error == false) {
				Layout.nicknameDialog.hide();
				Layout.contentOverlay.hide();
				nickname=$("#nicknameContainer").val();
			} else {
				Layout.notifications.showError(data.error);
				Layout.nicknameDialog.hideLoader();
			}

		}

		function submitNicknameHandler() {
			Layout.notifications.hideError(true);
			Layout.nicknameDialog.showLoader();
			sendNickname($("#nicknameContainer").val(), handleSubmit);
		};

		if(disconnected != true ) {
			$("#submitNickname").click(submitNicknameHandler);
			_.delay(Layout.nicknameDialog.show,1000);
	  		_.delay(Layout.preloadDialog.hide,1000);
  		}	
	};
	LogicClass.prototype.messageSend= function (e) {
		if($("#messageBox").val() != "")
	  		if(e.keyCode == 13) {
	  			socket.emit("message", {message: $("#messageBox").val() });
	  			$("#messageBox").val("");
	  		}
	}
	LogicClass.prototype.disconnect = function() {
		disconnected = true;
		Layout.contentOverlay.show();
		Layout.notifications.showError("disconnected");
	}

	var Layout = new LayoutClass();
	var Logic = new LogicClass();
  	var socket = io.connect();
  	var nickname;
  	var disconnected = false;

  	socket.on('connect', Logic.handleConnect);

  	socket.on("userlist", function(data) {
  		Layout.userList.parseData(data.list, nickname); 
  	})

	socket.on("server", Layout.messages.addServerMessage);

  	socket.on('message', Layout.messages.addMessage);

  	socket.on("disconnect", Logic.disconnect)

  	$("#messageBox").keypress(Logic.messageSend);

});
