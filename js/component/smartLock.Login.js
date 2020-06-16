if (typeof smartLock === "undefined") {
    var smartLock = {};
}

/**
 * @params [wrapping element] welBaseElement : 베이스가 되는 element 객체 (jQuery)  
 *
 */
smartLock.Login = eg.Class({
    _welBaseElement : {},
    _welIdInput : {},
    _welPasswordInput : {},
    _welLoginButton : {},
    construct : function(htParams) {
        this._initParams(htParams);
        this._initAttributes();
        this._initEvent();
    },
    _initParams : function(htParams) {
        this._welBaseElement = htParams.welBaseElement;
    },
    _initAttributes : function() {
        this._welIdInput = this._welBaseElement.find('#login');
        this._welPasswordInput = this._welBaseElement.find('#password');
        this._welLoginButton = this._welBaseElement.find('#loginButton');
    },
    _initEvent : function() {

        // login 버튼 click event 
        this._welLoginButton.click($.proxy(function() {
            this.login();
        }, this));

        // submit 동작 방지
        $(this._welBaseElement.find('form')).bind('submit', $.proxy(function(e){
            e.preventDefault();
            e.stopPropagation();
        }, this));
    },
    login : function() {
        // alert('로그인 클릭 또는 엔터');
        // var deferred = $.Deferred();
        var sUrl = "/ajax/login";

        $.ajax({
            url : sUrl,
            type : "post",
            contentType : "application/json;charset=utf-8",
            data: JSON.stringify({
                "id": this._welIdInput.val().trim(),
                "password": this._welPasswordInput.val().trim()
            }),
            success: $.proxy(function(oResponse) {
                alert('로그인 하였습니다.');
                var oQueryString = this._findUrlQueryString();

                if(oQueryString && oQueryString.returnUrl) {
                    window.location.replace(oQueryString.returnUrl);
                }
                
            }, this),
            error: $.proxy(function(oFailResponse) {
                oResponse = oFailResponse.responseJSON;
                if(oResponse && oResponse.message) {
                    alert(oResponse.message);
                }
            }, this)
        });
    },
    _findUrlQueryString: function() {
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for(var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
    } 
});