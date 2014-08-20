var multiBudgetApp = angular.module('multiBudget', []);

var bankAccounts = [];
var activeContainer = "";
var selectedAccountId = "";
var selectedEnvelopeId = "";
var transactionType = "";
var regexPattern = /,"\$\$\w+":"\w+"/g;

multiBudgetApp.controller('budget', ['$scope',
    function ($scope) {
        $scope.showAccounts = 5;
        $scope.showEnvelopes = 3;
        
        $scope.activeContainer = function(){
            //console.log("activeContainer: " + activeContainer);
            return activeContainer;
        };
        
        $scope.back = function() {
            if(activeContainer === "account"){
                activeContainer = "";
                $scope.selectedAccountText = ""
                return activeContainer;
            }
            if(activeContainer === "envelope"){
                console.log($scope.selectedAccountText)
                if($scope.selectedAccountText == "" | $scope.selectedAccountText == undefined){
                    activeContainer = "";
                }else{
                    activeContainer = "account";
                }
                return activeContainer;
            }
        };
        
        $scope.selectBankAccount = function(accountId){
            //console.log("<----  selectBankAccount  ---->");
            //console.log("accountId: " + accountId);
            //console.log(bankAccounts[accountId]);
            activeContainer = "account";
            selectedAccountId = accountId;
            $scope.selectedAccountText = bankAccounts[accountId].title;
            $scope.selectedAccount = bankAccounts[accountId];
        };
        
        $scope.selectEnvelope = function(accountId, envelopeId){
            //console.log("<----  selectEnvelope  ---->");
            //console.log("accountId: " + accountId);
            //console.log("envelopeId: " + envelopeId);
            //console.log(bankAccounts[accountId].envelopes[envelopeId]);
            activeContainer = "envelope";
            selectedAccountId = accountId;
            selectedEnvelopeId = envelopeId;
            $scope.selectedEnvelopeText = bankAccounts[accountId].envelopes[envelopeId].title;
            $scope.selectedEnvelope = bankAccounts[accountId].envelopes[envelopeId];
        };
        
        $scope.add = function(name, color) {
            //console.log("click: add button |" + name);
            if(activeContainer === ""){
                bankAccounts[bankAccounts.length] = {
                    "id": bankAccounts.length,
                    "title": name,
                    "color": color,
                    "envelopes": [],
                    "display": "show",
                    "date": this.date
                    };
            }
            if(activeContainer == "account"){
                bankAccounts[selectedAccountId].envelopes[bankAccounts[selectedAccountId].envelopes.length] = {
                    "id": bankAccounts[selectedAccountId].envelopes.length,
                    "title": name,
                    "color": color,
                    "transactions": [],
                    "diaplay" : "show",
                    "date": this.date
                    };
            }
            var dataToStore = this.getString(bankAccounts);
            this.setLocalStorage('bankAccounts', dataToStore);
            //console.log("bankAccounts:");
            //console.log(bankAccounts);
            $scope.add.text = "";
        };
        
        $scope.add.color = "default";
        
        $scope.remove = function(accountId, envelopeId) {
            
            var confirmText = "Are you sure you want to remove " + bankAccounts[accountId].title + " and all the inside Envelopes";
            if (envelopeId != undefined){
                confirmText = "Are you sure you want to remove " + bankAccounts[accountId].envelopes[envelopeId].title;
            }
            
            var check = confirm(confirmText);
            if(check == true){
                if (envelopeId != undefined){
                    console.log("true - envelope")
                    bankAccounts[accountId].envelopes[envelopeId].display = "hide";
                } else {
                    console.log("true - account")
                    bankAccounts[accountId].display = "hide";
                }
                //console.log("bankAccounts:");
                //console.log(bankAccounts);
                var dataToStore = this.getString(bankAccounts);
                this.setLocalStorage('bankAccounts', dataToStore);
            }
            
        };
        
        $scope.transaction = function(disc, amount, type, date) {
            //console.log("click: transaction button | " + disc + " " + amount + " " + date);
            if(activeContainer == "envelope"){
                bankAccounts[selectedAccountId].envelopes[selectedEnvelopeId].transactions[bankAccounts[selectedAccountId].envelopes[selectedEnvelopeId].transactions.length] = {
                    "id": bankAccounts[selectedAccountId].envelopes[selectedEnvelopeId].transactions.length,
                    "disc": disc,
                    "amount": amount,
                    "type": type,
                    "date": this.date,
                    "display": "show"
                    };
                //console.log("bankAccounts:");
                //console.log(bankAccounts);
                var dataToStore = this.getString(bankAccounts);
                this.setLocalStorage('bankAccounts', dataToStore);
                $scope.transaction.text = "";
                $scope.transaction.amount = "";
            }
        };
        
        $scope.transaction.spend = "Spend";
        $scope.transaction.earn = "Earn";
        $scope.transaction.transactionType = transactionType;
        
        $scope.payRoll = function(disc, total){
            //console.log(disc);
            //console.log(total);
            if(bankAccounts.length = 0){
                alert("You do not have any Accounts.");
                $('#payroll').modal('toggle');
                return;
            }
            
            var anyEnvelope = bankAccounts.length;
            for(var x = 0; x < bankAccounts.length; x++){
                if(bankAccounts[x].envelopes.length = 0){
                    anyEnvelope = anyEnvelope - 1;
                }
            }
            if(anyEnvelope = 0){
                alert("You do not have any Envelopes.");
                $('#payroll').modal('toggle');
                return;
            }
            
            if(total != undefined){
                if(this.payRollTotal.perc > 100){
                    alert("You have allocated more money then you have.");
                    return;
                }
                if(this.payRollTotal.perc != 100){
                    alert("You have not allocated all your money.")
                    return;
                }
                if(disc == undefined){
                    disc = "Paycheck";
                }
                
                for(var x = 0; x < bankAccounts.length; x++){
                    for(var y = 0; y < bankAccounts[x].envelopes.length; y++){
                        if(bankAccounts[x].envelopes[y].pendAmount != undefined){
                            bankAccounts[x].envelopes[y].transactions[bankAccounts[x].envelopes[y].transactions.length] = {
                                "id": bankAccounts[x].envelopes[y].transactions.length,
                                "disc": disc,
                                "amount": bankAccounts[x].envelopes[y].pendAmount,
                                "type": "Earn",
                                "date": this.date,
                                "display": "show"
                                };
                            bankAccounts[x].envelopes[y].pendAmount = undefined;
                        }
                    }
                }
                var dataToStore = this.getString(bankAccounts);
                this.setLocalStorage('bankAccounts', dataToStore);
                $('#payroll').modal('toggle');
            }
        }
        
        $scope.payRollTotal = function(total) {
            if(total == undefined){
                return;
            }
            var pendTotal = 0;
            for(var x = 0; x < bankAccounts.length; x++){
                for(var y = 0; y < bankAccounts[x].envelopes.length; y++){
                    if(bankAccounts[x].envelopes[y].pendAmount != undefined){
                        pendTotal = pendTotal + bankAccounts[x].envelopes[y].pendAmount;
                    }
                }
            }
            var newTotal = (pendTotal/total) * 100;
            $scope.payRollTotal.perc = newTotal;
            if (newTotal > 80){
                $scope.payRollTotal.color = "warning"
            }
            if (newTotal > 100){
                $scope.payRollTotal.color = "danger"
            }
            
        }
        
        $scope.payRollTotal.perc = 0;
        $scope.payRollTotal.color = "default"
        
        $scope.panelColor = function(acId, envId){
            var calcAmount = 0;
            if(envId == undefined){
                for(var x = 0; x < bankAccounts[acId].envelopes.length; x++){
                    for(var y = 0; y < bankAccounts[acId].envelopes[x].transactions.length; y++){
                        if(bankAccounts[acId].envelopes[x].transactions[y].type == "Spend"){
                            calcAmount = calcAmount - bankAccounts[acId].envelopes[x].transactions[y].amount;
                        }else{
                            calcAmount = calcAmount + bankAccounts[acId].envelopes[x].transactions[y].amount;
                        }
                    }
                }
            }else{
                for(var x = 0; x < bankAccounts[acId].envelopes[envId].transactions.length; x++){
                    if(bankAccounts[acId].envelopes[envId].transactions[x].type == "Spend"){
                        calcAmount = calcAmount - bankAccounts[acId].envelopes[envId].transactions[x].amount;
                    }else{
                        calcAmount = calcAmount + bankAccounts[acId].envelopes[envId].transactions[x].amount;
                    }
                }
            }
            
            if(calcAmount >= 0){
                return "primary";
            }else{
                return "danger"
            }
        };
        
        $scope.listColor = function(acId, envId, transId){
            if(transId != undefined){
                if(bankAccounts[acId].envelopes[envId].transactions[transId].type == "Spend"){
                    return "danger";
                }else{
                    return "success";
                }
            }
            
            var calcAmount = 0;
            
            for(var x = 0; x < bankAccounts[acId].envelopes[envId].transactions.length; x++){
                if(bankAccounts[acId].envelopes[envId].transactions[x].type == "Spend"){
                    calcAmount = calcAmount - bankAccounts[acId].envelopes[envId].transactions[x].amount;
                }else{
                    calcAmount = calcAmount + bankAccounts[acId].envelopes[envId].transactions[x].amount;
                }
            }
            
            if(calcAmount > 0){
                return "success";
            } else if(calcAmount == 0){
                return "warning"
            } else{
                return "danger"
            }
        };
        
        $scope.transactionType = function(type){
            //console.log(type);
            transactionType = type;
            $scope.transaction.transactionType = transactionType;
        };
        
        $scope.calcTotal = function(acId, envId){
            var calcAmount = 0;
            if(envId == undefined){
                for(var x = 0; x < bankAccounts[acId].envelopes.length; x++){
                    for(var y = 0; y < bankAccounts[acId].envelopes[x].transactions.length; y++){
                        if(bankAccounts[acId].envelopes[x].transactions[y].type == "Spend"){
                            calcAmount = calcAmount - bankAccounts[acId].envelopes[x].transactions[y].amount;
                        }else{
                            calcAmount = calcAmount + bankAccounts[acId].envelopes[x].transactions[y].amount;
                        }
                    }
                }
            }else{
                for(var x = 0; x < bankAccounts[acId].envelopes[envId].transactions.length; x++){
                    if(bankAccounts[acId].envelopes[envId].transactions[x].type == "Spend"){
                        calcAmount = calcAmount - bankAccounts[acId].envelopes[envId].transactions[x].amount;
                    }else{
                        calcAmount = calcAmount + bankAccounts[acId].envelopes[envId].transactions[x].amount;
                    }
                }
            }
            
            return ("$" + calcAmount);
        };

        $scope.toggleHide = function(id){
            //console.log("toggleHide: " + id);
            if($('#' + id).hasClass('hide')){
                $('#' + id).removeClass('hide');
            }else{
                $('#' + id).addClass('hide');
            }
            //console.log("toggleHide: " + id);
        };

        $scope.getLocalStorage = function(key){
            //console.log("localStorage - key: " + key);
            return window.localStorage.getItem(key);
        };

        $scope.setLocalStorage = function(key, value){
            //console.log("localStorage - key: " + key);
            //console.log("localStorage - value: " + value);
            return window.localStorage.setItem(key, value);
        };
        
        $scope.getJson = function(storedData){
            //console.log(storedData);
            //this.testRegex(storedData);
            storedData = storedData.replace(regexPattern, "");
            //console.log(storedData);
            return JSON.parse(storedData);
        };
        
        $scope.getString = function(storedData){
            //console.log(storedData);
            storedData = JSON.stringify(storedData);
            //this.testRegex(storedData);
            storedData = storedData.replace(regexPattern, "");
            //console.log(storedData);
            return storedData;

        };

        $scope.clearLocalStorage = function() {
            var localStorage1 = JSON.parse(this.getLocalStorage('bankAccounts'));
            if(localStorage1 !== null){
                window.localStorage.removeItem('bankAccounts');
                location.reload();
            }
        };

        $scope.testRegex = function(storedData){
            var testArray = storedData.match(regexPattern);
            console.log(testArray);
        };

        $scope.date = new Date().toDateString();
        
        $scope.testJson = [{
            "id": 0,
            "title": "Savings",
            "color": "primary",
            "envelopes": [{
                "id": 0,
                "title": "Car Payment",
                "color": "primary",
                "transactions": [{
                    "id":0,
                    "disc":"Payroll",
                    "amount":135,
                    "type":"Earn",
                    "date":"Thu July 30  2014",
                    "display":"show"
                },{
                    "id":1,
                    "disc":"Payroll",
                    "amount":135,
                    "type":"Earn",
                    "date":"Thu Aug 15 2014",
                    "display":"show"
                },{
                    "id":2,
                    "disc":"Payment",
                    "amount":250,
                    "type":"Spend",
                    "date":"Thu Aug 18 2014",
                    "display":"show"
                }],
                "display":"show"
            },{
                "id": 1,
                "title": "Gas",
                "color": "info",
                "transactions": [{
                    "id":0,
                    "disc":"Payroll",
                    "amount":160,
                    "type":"Earn",
                    "date":"Thu July 30 2014",
                    "display":"show"
                },{
                    "id":1,
                    "disc":"Gas to Work",
                    "amount":20,
                    "type":"Spend",
                    "date":"Thu Aug 14 2014",
                    "display":"show"
                },{
                    "id":2,
                    "disc":"Payroll",
                    "amount":160,
                    "type":"Earn",
                    "date":"Thu Aug 30 2014",
                    "display":"show"
                }],
                "display":"show"
            },{
                "id": 2,
                "title": "Lunch",
                "color": "primary",
                "transactions": [{
                    "id":0,
                    "disc":"Payroll",
                    "amount":50,
                    "type":"Earn",
                    "date":"Thu July 30 2014",
                    "display":"show"
                },{
                    "id":1,
                    "disc":"Wendey's",
                    "amount":2.50,
                    "type":"Spend",
                    "date":"Thu Aug 14 2014",
                    "display":"show"
                },{
                    "id":2,
                    "disc":"Payroll",
                    "amount":2.50,
                    "type":"Earn",
                    "date":"Thu Aug 30 2014",
                    "display":"show"
                }],
                "display":"show"
            },{
                "id": 3,
                "title": "Misc.",
                "color": "info",
                "transactions": [{
                    "id":0,
                    "disc":"Payroll",
                    "amount":50,
                    "type":"Earn",
                    "date":"Thu July 30 2014",
                    "display":"show"
                },{
                    "id":1,
                    "disc":"Payroll",
                    "amount":50,
                    "type":"Earn",
                    "date":"Thu Aug 30 2014",
                    "display":"show"
                },{
                    "id":2,
                    "disc":"Transfer",
                    "amount":101,
                    "type":"Spend",
                    "date":"Thu Aug 14 2014",
                    "display":"show"
                }],
                "display":"show"
            }],
            "display": "show",
            "date": "xx/xx/xxxx"
        },{
            "id": 1,
            "title": "Checking",
            "color": "info",
            "envelopes": [
                {"id": 0, "title": "School", "color": "primary", "transactions":[], "display":"show" },
                {"id": 1, "title": "New Computer", "color": "primary", "transactions":[], "display":"show" },
                {"id": 2, "title": "Misc.", "color": "primary", "transactions":[], "display":"show" },
                {"id": 3, "title": "Mud Truck", "color": "primary", "transactions":[], "display":"show" },
                {"id": 4, "title": "Secret", "color": "primary", "transactions":[], "display":"show" }
            ],
            "display": "show",
            "date": "xx/xx/xxxx"
        }];
        
        if(typeof(Storage) !== "undefined") {
            window.localStorage.setItem('bankAccounts', $scope.getString($scope.testJson));
            // Code for localStorage/sessionStorage.
            console.log("localStorage: " + window.localStorage.getItem('bankAccounts'));
            var localBanks = window.localStorage.getItem('bankAccounts');
            console.log("localBanks: " + JSON.parse(localBanks));
            if(localBanks !== null){
                localBanks = localBanks.replace(regexPattern, "");
                bankAccounts = JSON.parse(localBanks);
            }else{
                bankAccounts = [];
            }
            //console.log("bankAccounts:");
            //console.log(bankAccounts);
            $scope.bankAccounts = bankAccounts;
        } else {
            // Sorry! No Web Storage support..
            $('#storageAlert').removeClass('hide');
        }        
        
}]);
