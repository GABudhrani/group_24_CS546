$('#loginBtn').on('click', (e)=>{
    e.preventDefault();
    username = document.getElementById("login-username").value;
    password = document.getElementById("login-password").value;

    console.log(username,password);
    
    if(username == "" || username.trim()== "") {
        alert("Please Enter Valid User Name");
        return false;
    }
    if(password == "" || password.trim()== "") {
        alert("Please Enter Valid Password");
        return false;
    }

    try{
        $.ajax({
            type: "post",
            url: "/login",
            data: $('#login-form').serialize(),
            async: false,
            contentType: "application/x-www-form-urlencoded",
            success: function(res, txtStatus, jqXHR){ 
                console.log("ajax res",res);
                location.reload();
              }
        });
    }catch(e){
        alert(e);
    }
});