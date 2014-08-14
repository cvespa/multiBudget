var multiBudgetApp = angular.module('multiBudget', []);

var bankAccounts = [];
var payRollEnvelopes = [];
var envelopes = [];
var transactions = [];
var activeContainer = "";
var payRollContainer = "";
var selectedBankAccountId = "";
var selectedEnvelopeId = "";
var regexPattern = /,"\$\$\w+":"\w+"/g;

multiBudgetApp.controller('budget', ['$scope',
    function ($scope) {

        if(typeof(Storage) !== "undefined") {
            // Code for localStorage/sessionStorage.
            console.log("localStorage: " + window.localStorage.getItem('bankAccounts'));
            var localBanks = window.localStorage.getItem('bankAccounts');
            console.log("localBanks: " + localBanks);
            if(localBanks !== null){
                localBanks = localBanks.replace(regexPattern, "");
                bankAccounts = JSON.parse(localBanks);
            }else{
                bankAccounts = [];
            }
            console.log("bankAccounts:");
            console.log(bankAccounts);
            $scope.bankAccounts = bankAccounts;
        } else {
            // Sorry! No Web Storage support..
            $('#storageAlert').removeClass('hide');
        }

        $scope.back = function() {
            if(activeContainer === "envelopes"){
                activeContainer = "";
                $scope.selectedText = "";
                $scope.selectedTotal = "";
                $('#back').addClass('hide');
                return activeContainer;
            }
            if(activeContainer === "transactions"){
                activeContainer = "envelopes";
                $scope.selectedText = bankAccounts[selectedBankAccountId].name;
                $scope.selectedTotal = $scope.selectedTotal = "$" + this.totalBank(selectedBankAccountId);
                $('#back').addClass('hide');
                return activeContainer;
            }
        };

        $scope.spend = function(disc, amount, date) {
            //console.log("click: spend button | " + disc + " " + amount + " " + date);
            if(activeContainer == "transactions"){
                transactions[transactions.length] = {'disc': disc, 'id': transactions.length, 'amount': amount, 'type': 'spend', 'date': date, 'display': 'show'};
                var dataToStore = this.toStorage(transactions);
                this.setLocalStorage('bankAccounts.'+ selectedBankAccountId + "." + selectedEnvelopeId, dataToStore);
                //console.log("transactions:");
                //console.log(transactions);
                $scope.spend.text = "";
                $scope.spend.amount = "";
            }
        };

        $scope.earn = function(disc, amount, date) {
            //console.log("click: earn button | " + disc + " " + amount + " " + date);
            if(activeContainer == "transactions"){
                transactions[transactions.length] = {'disc': disc, 'id': transactions.length, 'amount': amount, 'type': 'earn', 'date': date, 'display': 'show'};
                var dataToStore = this.toStorage(transactions);
                this.setLocalStorage('bankAccounts.'+ selectedBankAccountId + "." + selectedEnvelopeId, dataToStore);
                //console.log("transactions:");
                //console.log(transactions);
                $scope.earn.text = "";
                $scope.earn.amount = "";
            }
        };

        $scope.add = function(name) {
            //console.log("click: add button |" + name);
            var dataToStore = "";
            if(activeContainer === ""){
                bankAccounts[bankAccounts.length] = {'name': name , 'id': bankAccounts.length, 'display': 'show'};
                dataToStore = this.toStorage(bankAccounts);
                this.setLocalStorage('bankAccounts', dataToStore);
                //console.log("bankAccounts:");
                //console.log(bankAccounts);
                $scope.add.text = "";
            }
            if(activeContainer == "envelopes"){
                envelopes[envelopes.length] = {'name': name , 'id': envelopes.length, 'display': 'show'};
                dataToStore = this.toStorage(envelopes);
                this.setLocalStorage('bankAccounts.'+ selectedBankAccountId , dataToStore);
                //console.log("envelopes:");
                //console.log(envelopes);
                $scope.add.text = "";
            }
        };

        $scope.remove = function(id) {
            if(activeContainer === ""){
                bankAccounts[id].display = 'hide';
                var dataToStore = this.toStorage(bankAccounts);
                this.setLocalStorage('bankAccounts', dataToStore);
                //console.log("bankAccounts:");
                //console.log(bankAccounts);
            }
            if(activeContainer == "envelopes"){
                envelopes[id].display = 'hide';
                dataToStore = this.toStorage(envelopes);
                this.setLocalStorage('bankAccounts.'+ selectedBankAccountId , dataToStore);
                //console.log("envelopes:");
                //console.log(envelopes);
            }
        };

        $scope.selectBankAccount = function(id) {
            activeContainer = "envelopes";
            selectedBankAccountId = id;
            $scope.selectedText = bankAccounts[id].name;
            $scope.selectedTotal = "$" + this.totalBank(id);
            var localEnvelopes = this.getLocalStorage('bankAccounts.' + id);
            if(localEnvelopes !== null){
                envelopes = this.fromStorage(localEnvelopes);
            }else{
                envelopes = [];
            }
            $scope.envelopes = envelopes;
        };

        $scope.selectEnvelope = function(id) {
            //console.log(id);
            //console.log(envelopes[id].name);
            activeContainer = "transactions";
            selectedEnvelopeId = id;
            $scope.selectedText = envelopes[id].name;
            $scope.selectedTotal = "$" + this.totalEnvelope(id);
            var localTransactions = this.getLocalStorage('bankAccounts.' + selectedBankAccountId + '.' + id);
            //console.log("localTransactions: " + localTransactions);
            if(localTransactions !== null){
                transactions = this.fromStorage(localTransactions);
            }else{
                transactions = [];
            }
            //console.log("localTransactions:");
            //console.log(transactions);
            $scope.transactions = transactions;
            //console.log(envelopes[id].name);
        };


        $scope.totalBank = function(id){
            var bankTotalNumber = 0;
            //console.log('totalBank: ' + id);
            var bank = this.getLocalStorage('bankAccounts.' + id);
            if (bank !== null) {
                var bankTotal = this.fromStorage(bank);
                //console.log(bankTotal);
                for (var total = 0; total < bankTotal.length; total++){
                    //console.log('for: ' + bankTotal[total].id);
                    var coreBank = this.getLocalStorage('bankAccounts.' + id + '.' + total);
                    if (coreBank !== null) {
                        var coreBankTotal = this.fromStorage(coreBank);
                        //console.log(coreBankTotal);
                        for(var coreTotal = 0; coreTotal < coreBankTotal.length; coreTotal++) {
                            //console.log(coreBankTotal[coreTotal]);
                            if(coreBankTotal[coreTotal].type === 'spend'){
                                bankTotalNumber = bankTotalNumber - coreBankTotal[coreTotal].amount;
                                //console.log(bankTotalNumber);
                                continue;
                            }else if(coreBankTotal[coreTotal].type === 'earn'){
                                bankTotalNumber = bankTotalNumber + coreBankTotal[coreTotal].amount;
                                //console.log(bankTotalNumber);
                                continue;
                            }
                        }
                    }
                }
            }
            $scope.total = bankTotalNumber;
            return bankTotalNumber;
        };

        $scope.totalEnvelope = function(id){
            var envelopeTotalNumber = 0;
            //console.log('totalEnvelope: ' + id);
            var envelope = this.getLocalStorage('bankAccounts.' + selectedBankAccountId + '.' + id);
            if(envelope !== null) {
                var envelopeTotal = this.fromStorage(envelope);
                //console.log(envelopeTotal);
                for(var total = 0; total < envelopeTotal.length; total++) {
                    //console.log(envelopeTotal[total]);
                    if(envelopeTotal[total].type === 'spend'){
                        envelopeTotalNumber = envelopeTotalNumber - envelopeTotal[total].amount;
                        //console.log(envelopeTotalNumber);
                        continue;
                    }else if(envelopeTotal[total].type === 'earn'){
                        envelopeTotalNumber = envelopeTotalNumber + envelopeTotal[total].amount;
                        //console.log(envelopeTotalNumber);
                        continue;
                    }
                }
            }
            return envelopeTotalNumber;

        };

        $scope.payRollContainer = function(){
            console.log("payRollContainer");
            return payRollContainer;
        };

        $scope.payRollSelected = function(id){
            console.log("payRollSelected:" + id);
            var payRoll = this.getLocalStorage('bankAccounts.' + id);
            if(payRoll !== null){
                var payStorage = this.fromStorage(payRoll);
                if(payRollEnvelopes === payStorage){
                    console.log(payRollEnvelopes);
                    console.log(payStorage);
                    return true;
                }
                if(payStorage.length > 0){
                    $scope.payRollEnvelopes = payStorage;
                    return true;
                }
                return false;
            } else if(payRoll === undefined){
                return;
            }
            return false;
        };

        $scope.activeContainer = function(){
            console.log("activeContainer");
            //if(activeContainer === ""){
                //return activeContainer;
            //}
            //if(activeContainer === "envelopes"){
                //return activeContainer;
            //}
            //if(activeContainer === "transactions"){
                //return activeContainer;
            //}
            return activeContainer;
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

        $scope.clearLocalStorage = function() {
            var localStorage1 = JSON.parse(this.getLocalStorage('bankAccounts'));
            if(localStorage1 !== null){
                for(var clear1 = 0; clear1 < localStorage1.length; clear1++){
                    var localStorage2 = JSON.parse(this.getLocalStorage('bankAccounts.'+ clear1));
                    if(localStorage2 !== null){
                        for(var clear2 = 0; clear2 < localStorage2.length; clear2++){
                            //console.log('bankAccounts.'+ clear1 + '.' + clear2);
                            window.localStorage.removeItem('bankAccounts.'+ clear1 + '.' + clear2);
                        }
                    }
                    //console.log('bankAccounts.'+ clear1);
                    window.localStorage.removeItem('bankAccounts.'+ clear1);
                }
                //console.log('bankAccounts');
                window.localStorage.removeItem('bankAccounts');
                location.reload();
            }
        };

        $scope.fromStorage = function(storedData){
            //console.log(storedData);
            //this.testRegex(storedData);
            storedData = storedData.replace(regexPattern, "");
            //console.log(storedData);
            return JSON.parse(storedData);
        };

        $scope.toStorage = function(storedData){
            //console.log(storedData);
            storedData = JSON.stringify(storedData);
            //this.testRegex(storedData);
            storedData = storedData.replace(regexPattern, "");
            //console.log(storedData);
            return storedData;

        };

        $scope.testRegex = function(storedData){
            var testArray = storedData.match(regexPattern);
            console.log(testArray);
        };

        $scope.date = new Date().toDateString();
}]);
