// http://github.com/nje/jquery-datalink
// http://www.devcomments.com/Proposal-for-adding-Data-Linking-to-jQuery-to196729.htm
// Changing the value of one object (the 'source') 
// automatically updates the value in the other object (the 'target')

// ;(function($) {

	// just for logging changes
	function attrChange(ev) {
		console.log("Change attr '" + ev.attrName + "' from '" + ev.oldValue + "' to '" + ev.newValue + "'.");
	};

	// just for logging changes 
	function arrayChange(ev) {
		console.log("Array operation " + ev.change + " executed with args " + ev.arguments);
	};	
	
	// nothing special
	function randomString(length) {
		var text = "";
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		for( var i=0; i < length; i++ ) {
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		};
		return text;
	}
	
	// adding a few custom converters
	$.extend($.convertFn, {
		full_name: function(value, settings) {
			return settings.source.first_name + " " + settings.source.last_name;
		},
	});
	
	var json_object = { 
		"account_info": {
			"first_name": "Russ",
			"last_name": "Jones",
			"url": "www.codeofficer.com"
		},
		"player_table": [
			{ "user": {
				id: 1, 
				first_name: "Dave", 
				last_name: "Reed",
				score: 300
			}},
			{ "user": {
				id: 2, 
				first_name: "John", 
				last_name: "Doe",
				score: 150
			}}
		]
	};
	
	$(function() {
	
		// add a new person on each click
		$('#add').click(function(e) {
			var new_user = { "user": {
				id: 0, 
				first_name: "", 
				last_name: "", 
				score: 0
			}};
			$.push(json_object.player_table, new_user);
			$(json_object).trigger("attrChange");
			e.stopPropagation();
		});
	
		// change some account info on click
		$('#change').click(function(e) {
			$(json_object.account_info).attr("first_name", randomString(10));
			$(json_object.account_info).attr("last_name", randomString(10));
			$(json_object).trigger("attrChange");
			e.stopPropagation();
		});
		
		// execute our refresh routine on blur
		$('input').live('blur', function(e) {
			$(json_object).trigger("attrChange");
			e.stopPropagation();
		});
		
		function refresh() {			
			var data,
					$player_table_body = $('#player_table_body'),
					$account_info = $('#account_info');
			
			// handle the users info
			data = new EJS({url: 'player_table.ejs'}).render(json_object);
			$player_table_body.empty().html(data);
			
			// establish data linking for each user
			$(".user").each(function(i) {
				var user = json_object.player_table[i].user;
				$(".id", this).linkBoth("val", user, "id");
				$(".first_name", this).linkBoth("val", user, "first_name");
				$(".last_name", this).linkBoth("val", user, "last_name");
				$(".full_name", this).linkFrom("text", user, null, "full_name");
				$(".score", this).linkBoth("val", user, "score");
				
				$(".user-remove", this).click(function() {
					$.splice(json_object.player_table, i, 1);
					$(json_object).trigger("attrChange");
				});
			});

			// handle the account info
			data = new EJS({url: 'account_info.ejs'}).render(json_object);
			$account_info.empty().html(data);
			$(".first_name", $account_info).linkFrom("text", json_object.account_info, "first_name");
			$(".last_name", $account_info).linkFrom("text", json_object.account_info, "last_name");
			$(".full_name", $account_info).linkFrom("text", json_object.account_info, null, "full_name");
		
			// show json_object in the dom
			$("#results").html(JSON.stringify(json_object, null, 4));
		};

		/*
			listen for changes and log them ...
			objects and arrays are bound too differently, because they have different accessors.
		*/
		$(json_object.account_info).attrChange(attrChange);
		$([json_object.player_table]).arrayChange(arrayChange);

		/*
			bind and execute our refresh routine ...
			anywhere we make a change, we just have to $(json_object).trigger("attrChange");
		*/
		$(json_object).attrChange(refresh);
		refresh();
		
	});
// })(jQuery);
