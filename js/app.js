(function(){
	//Parse initialization
	Parse.initialize("3Q0fl5PFmawluhNowBEogxyOlhLFIp2YTS5s5TBy", "HWWfH7Aa4E0CXz5IS0WAlQxCUMVVlbkdiEBQL7lV");
	
	//Compile template engine function
	var compiled = {};
	var views = ["loginView", "evaluationView", "updateSuccessView"];
	for(var i = 0;i < views.length;i++){
		if(i==views.length-1){
			var view_text = document.getElementById(views[i]).text;
			compiled[views[i]] = doT.template(view_text);
		}
		else{
			var view_text = document.getElementById(views[i]).text;
			compiled[views[i]] = doT.template(view_text);
		}
	}
	
	//Shared function
			
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
			
			logoutButton.click(function(){
				Parse.User.logOut();
				loginButton.css("display", "block");
				evaluationButton.css("display", "none");
				logoutButton.css("display", "none");
			});
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
							window.location = "#peer-evaluation";
						}, 
						error: function(user, error) {
							alert("Error:" + error.code + " " + error.message);
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
						window.location = "#peer-evaluation";
					},
					error: function(user, error){
						alert("Error:" + error.code + " " + error.message);
					}
				});
			});
		},
		evaluationView: function(){
			var evaluation = Parse.Object.extend("Evaluation");
			var query = new Parse.Query(evaluation);
			query.first({
				success: function(data){
					var members = TAHelp.getMemberList(Parse.User.current().get("username"));
					for(var i = 0;i < members.length;i++){
						if(members[i]["StudentID"]===Parse.User.current().get("username")){
							members.splice(i, 1);
						}
					}
					if(data === undefined){
						members[i]["score"] = [0, 0, 0, 0];
					}
					else{
						members[i]["score"] = data["evaluation"].slice(0);
					}
					$("#content").html(compiled["evaluationView"](members));
					for(var j = 0;j < 4;j++){
						$("#stu"+members[i]["StudentID"]+"-q"+j.toString()).val = members[i]["score"][j];
					}
					document.getElementById('evaluationForm').addEventListener('submit', function(){
						for(var i = 0;i < members.length;i++){
							var total = 0;
							for(var j = 0;j < 4; j++){
								var tmp_score = $("#stu"+members[i]["StudentID"]+"-q"+j.toString()).val;
								members[i]["score"][j] = tmp_score; 
							}
						}
						var changed = new evaluation();
						var originData = data["evaluation"].slice(0)
						changed.set("user",Parse.User.current());
						changed.set("evaluation",data["evaluation"]);
						changed.save(null, {
							success: function(changed){
								if(data === undefined){
								}
								else{
									changed.set("evaluation", members);
								}
							},
							error: function(changed, error){
								alert("Error:" + error.code + " " + error.message);
							}
						});
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
		"": "index",
		"peer-evaluation/": "evaluationView",
		"login/*redirect": "loginView",
		},
		index: handler.loginView,
		evaluationView: handler.evaluationView,
		loginView: handler.loginView,
	});
	
	handler.navbar();
	this.Router = new Router();
	Parse.history.start();
	
})();
