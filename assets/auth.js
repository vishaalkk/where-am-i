document.addEventListener("DOMContentLoaded", function () {
    const username = "admin";
    const password = "secret";
  
    const entered = prompt("Enter username:");
    const enteredPass = prompt("Enter password:");
  
    if (entered !== username || enteredPass !== password) {
      document.body.innerHTML = "<h1>Unauthorized</h1>";
    }
  });
  