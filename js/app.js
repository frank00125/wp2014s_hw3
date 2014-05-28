(function(){
	//Parse initialization
	Parse.initialize("3Q0fl5PFmawluhNowBEogxyOlhLFIp2YTS5s5TBy", "HWWfH7Aa4E0CXz5IS0WAlQxCUMVVlbkdiEBQL7lV");
	
	//Compile template engine function
	var compiled = {};
	var views = ["loginView", "evaluationView", "updateSuccessView"];
	for(var i = 0;i < views.length;i++){
			var view_text = document.getElementById(views[i]).text;
			compiled[views[i]] = doT.template(view_text);
	}

	//Shared function
	
	$("#logoutButton").click(function(){
		Parse.User.logOut();
		$("#loginButton").css("display", "block");
		$("#evaluationButton").css("display", "none");
		$("#logoutButton").css("display", "none");
		window.location = "?#login/";
	});	
	
	var handler = {
		navbar: function(){
			var users = Parse.User.current();
			var loginButton = $("#loginButton");
			var evaluationButton = $("#evaluationButton");
			var logoutButton = $("#logoutButton");
			if(users==null){
				loginButton.css("display", "block");
				evaluationButton.css("display", "none");
				logoutButton.css("display", "none");
			}
			else{
				loginButton.css("display", "none");
				evaluationButton.css("display", "block");
				logoutButton.css("display", "block");
			}
		},
		loginView: function(){
			//Show the login content on browser
			var content = document.getElementById("content");
			content.innerHTML = compiled["loginView"]();
			
			//check if student ID has been entered in login form
			document.getElementById("form-signin-student-id").addEventListener("keyup", function(){
				var loginStudentID = this.value;
				if(TAHelp.getMemberlistOf(loginStudentID)==false){
					document.getElementById("form-signin-message").style.display = "block";
					document.getElementById("form-signin-message").innerHTML = "<p>The student is not one of the class students.</p>"
				}
				else{
					document.getElementById("form-signin-message").style.display = "none";
				}
			});
			
			//check if student ID has been entered in sign up form
			document.getElementById("form-signup-student-id").addEventListener("keyup", function(){
				var signupStudentID = this.value;
				if(TAHelp.getMemberlistOf(signupStudentID)==false){
					document.getElementById("form-signup-message").style.display = "block";
					document.getElementById("form-signup-message").innerHTML = "<p>The student is not one of the class students.</p>"
				}
				else{
					document.getElementById("form-signup-message").style.display = "none";
				}
			});
			
			//check password correctness in sign up form
			document.getElementById("form-signup-password1").addEventListener("keyup", function(){
				var signupPwd = document.getElementById("form-signup-password").value;
				var signupPwdRepeat = this.value;
				if(signupPwd != signupPwdRepeat){
					document.getElementById("form-signup-message").style.display = "block";
					document.getElementById("form-signup-message").innerHTML = "<p>Passwords don't match.</p>"
				}
				else{
					document.getElementById("form-signup-message").style.display = "none";
				}	
			});
			
			//check if student ID and password is correct in log in form
			document.getElementById('form-signin').addEventListener('submit', function(){
				Parse.User.logIn(
					document.getElementById('form-signin-student-id').value,
					document.getElementById('form-signin-password').value, 
					{
						success: function(user) {
							handler.navbar();
							window.location.hash = "peer-evaluation/";
						}, 
						error: function(user, error) {
							console.log("Error:" + error.code + " " + error.message);
							alert("Error:" + error.code + " " + error.message);
							window.location.hash = "login/";
						}
					}
				);
			});
			
			//check if student ID and password is correct in sign up form
			document.getElementById('form-signup').addEventListener('submit', function(){
				var user = new Parse.User();
				user.set("username", document.getElementById("form-signup-student-id").value);
				user.set("password", document.getElementById("form-signup-password").value);
				user.set("email", document.getElementById("form-signup-email").value);
				
				user.signUp(null, {
					success: function(user){
						handler.navbar();
						window.location = "peer-evaluation/";
					},
					error: function(user, error){
						alert("Error:" + error.code + " " + error.message);
						window.location = "login/";
					}
				});
			});
		},
		evaluationView: function(){
			var evaluation = Parse.Object.extend("Evaluation");
			var query = new Parse.Query(evaluation);
			query.first({
				success: function(data){
					var current_user = Parse.User.current();
					var username = current_user.getUsername();
					var member = TAHelp.getMemberlistOf(username);
						
					for(var i = 0;i < member.length;i++){
						if(data === undefined){
							member[i]["scores"] = new Array("0", "0", "0", "0");
						}
						else if(data.get("user")!=current_user){
							member[i]["scores"] = new Array("0", "0", "0", "0");
						}
						else{
							member = data.get("evaluation").slice(0);
							break;
						}
					}
					
					for(var i = 0;i < member.length;i++){
						if(member[i].StudentId === current_user.getUsername()){
							member.splice(i,1);
							break;
						}
					}
					document.getElementById("content").innerHTML = (compiled.evaluationView(member));
					for(var i = 0;i < 4;i++){
						for(var j = 0;j < 3;j++){
							$("stu"+member.StudentId+"-q"+j.toString()).val(member[i].scores[j]);
						}
					}
					document.getElementById('evaluationForm').addEventListener('submit', function(){
						for(var i = 0;i < member.length;i++){
							var total = 0;
							for(var j = 0;j < 4; j++){
								var tmp_score = $("#stu"+member[i]["StudentId"]+"-q"+j.toString()).val();
								member[i]["scores"][j] = tmp_score; 
							}
						}
						if(data===undefined){
							var ev = Parse.Object.extend("Evaluation")
							var changed = new ev();
							changed.set("user",current_user);
							changed.set("evaluation",member);
							changed.save(null,{
								success: function(changed){
									console.log("New data with id = "+changed.get("objectId")+" created.")
								},
								error: function(changed, error){
									console.log("Failed to create new object, with error code: " + error.description);
								}
							});
						}
						else if(data.get("user")!=current_user){
							var ev = Parse.Object.extend("Evaluation")
							var changed = new ev();
							changed.set("user",current_user);
							changed.set("evaluation",member);
							changed.save(null,{
								success: function(changed){
									console.log("New data with id = "+changed.get("objectId")+" created.")
								},
								error: function(changed, error){
									console.log("Failed to create new object, with error code: " + error.description);
								}
							});
						}
						else{
							var ev = Parse.Object.extend("Evaluation")
							var changed = new ev();
							changed.set("user",current_user);
							changed.set("evaluation",data.get("evaluation").slice(0));
							changed.set("objectId",data.id);
							changed.save(null, {
								success: function(changed){
									changed.set("evaluation", member);
									changed.save();
									console.log("Data updated in Parse.");
								}
							});
						}
						
						document.getElementById("content").innerHTML = (compiled.updateSuccessView());
					});
				},
				error: function(data, error){
					alert("Error:" + error.code + " " + error.message);
				}
			});
		}
	};
	
	var Router = Parse.Router.extend({
		routes: {
		"": "loginView",
		"peer-evaluation/": "evaluationView",
		"login/*redirect": "loginView",
		},
		indexView: handler.loginView,
		evaluationView: handler.evaluationView,
		loginView: handler.loginView,
	});
	
	handler.navbar();
	this.Router = new Router();
	Parse.history.start();
	
})();
