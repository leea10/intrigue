/**
 * @fileoverview Controller for the logic on the login page.
 */
app.controller('LandingController', function($scope){
    $scope.switchForm = (switchTo) => {
        let eReg = document.getElementById("register-form");
        let eLog = document.getElementById("login-form");
        if (switchTo == 'toSignUp'){
            eReg.style.display = 'inline-block';
            eLog.style.display = 'none';
        }
        else{
            eReg.style.display = 'none';
            eLog.style.display = 'inline-block';
        }
    };
});