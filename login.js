import register from "./register.js";

function login() {
    const state=register();
    if (state==="student"){
    window.location.href = "students.html";
    }else if(state==="lecturer"){
     window.location.href = "lecturers.html";
    }else{
      window.location.href = "admin.html";
    }
        
  }