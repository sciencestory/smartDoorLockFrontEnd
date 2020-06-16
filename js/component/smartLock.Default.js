if (typeof smartLock === "undefined") {
    var smartLock = {};
}

smartLock.Default = eg.Class.extend(eg.Component,{
    checkloginStatus : function() {
        var sUrl = "/ajax/loginCheck";

        $.ajax({
            url : sUrl,
            method : "get",
            error: $.proxy(function(oFailResponse) {
                var oResponse = oFailResponse.responseJSON;
                if(oResponse && oResponse.message) {
                    alert(oResponse.message);
                    this.redirectLoginPage();
                }
            }, this)
        });
    },
    redirectLoginPage : function() {
        window.location.replace('/login?returnUrl=' + window.location.href);
    },
    _processAjaxCallFail: function(oFailResponse) {
        var oResponse = oFailResponse.responseJSON;
        
        if(oResponse) {
            if(oResponse.message) {
                alert(oResponse.message);
            }
    
            if(oResponse.code === 'loginSessionNotExist' || oResponse.code === 'loginSessionExpire' ) {
                this.redirectLoginPage();
            }
        }
    }
});