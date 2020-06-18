if (typeof smartLock === "undefined") {
    var smartLock = {};
}

smartLock.Main = eg.Class.extend(smartLock.Default,{
    _welBaseMainMenuElement: {},
    _welBaseMainContentElement: {},

    _oSelectedContentComponent: {},
    
    construct: function(htParams) {
        this.checkloginStatus();
        this._initParams(htParams);
        this._drawSelectedContent();
    },

    _initParams: function(htParams) {
        this._welBaseMainMenuElement = htParams.welBaseMainMenuElement;
        this._welBaseMainContentElement = htParams.welBaseMainContentElement;
    },
    _drawSelectedContent: function() {
        this._welBaseMainContentElement.empty();
        var sSelectedMenuName = this._findSelectedMenuName();
        switch(sSelectedMenuName) {
            case 'home':
                this._oSelectedContentComponent = new smartLock.Home({
                    "welBaseElement" : this._welBaseMainContentElement
                });
                break;
            case 'notice':
                this._oSelectedContentComponent = new smartLock.Notice({
                    "welBaseElement" : this._welBaseMainContentElement
                });
                break;
            case 'trackingVisitor':
                this._oSelectedContentComponent = new smartLock.TrackingVisitor({
                    "welBaseElement" : this._welBaseMainContentElement
                });
                break;
            case 'doorManage':
                this._oSelectedContentComponent = new smartLock.DoorManage({
                    "welBaseElement" : this._welBaseMainContentElement
                });
                break;
            default:
                this._oSelectedContentComponent = new smartLock.Home({
                    "welBaseElement" : this._welBaseMainContentElement
                }); 
                sSelectedMenuName = null;
        }

        if(sSelectedMenuName) {
            this._welBaseMainMenuElement.find('#home').removeClass('active');
            this._welBaseMainMenuElement.find('#' + sSelectedMenuName).addClass('active');
        }
    },
    _findSelectedMenuName: function() {
        var sUrl = String(window.location.href).replace('#','');
        return sUrl.substr(sUrl.lastIndexOf('/') + 1);
    },
    logout : function() {
        if(confirm("로그 아웃 하시겠습니까?")) {
            $.ajax({
                url : "/logout",
                method : "get",
                error: $.proxy(function() {
                    $.cookie('SES_ID', null);      
                },this),
                complete: $.proxy(function() {
                    this.redirectLoginPage();
                },this)   
            });
        }
    },
});