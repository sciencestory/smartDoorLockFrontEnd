if (typeof smartLock === "undefined") {
    var smartLock = {};
}

smartLock.DoorManage = eg.Class.extend(smartLock.Default,{
    _welBaseElement : {},
    _nCurrentScreenSaverTime: 0,
    construct: function(htParams) {
        this._initParams(htParams);
        this._initManageView();
    },
    _initParams : function(htParams) {
        this._welBaseElement = htParams.welBaseElement;
    },
    _initManageView: function() {
        this._nCurrentScreenSaverTime = 0;
        this._welBaseElement.empty();

        $.ajax({
            url: '/ajax/manage/screenSaverTime',
            method: 'get',
            success: $.proxy(function(oResponse){
                this._nCurrentScreenSaverTime = oResponse.currentScreenSaverTime;
                this._drawManagingForm(oResponse.currentScreenSaverTime);
            },this),
            error: $.ajax(function(oFailResponse){
                this.__processAjaxCallFail(oFailResponse);
            },this)
        });
    },

    _drawManagingForm: function(nChangeScreenSaverTime) {
        
        var $pageHeader = $('<div class="contentHeader">도어락 관리</div>');
        var $container = $('<div id="doorManageContainerArea" class="container"></div>')

        var $masterKeyPassword = $('<input id ="masterKeyPassword" type="password" class="form-control">').change($.proxy(function(){

        }, this));
        var $masterKeyForm = $('<div class="form-group"><label for="masterKeyPassword">마스터키 변경</label></div>')
                    .append($masterKeyPassword);

        var $doorlockKeyPassword = $('<input id ="doorlockKeyPassword" type="password" class="form-control">').change($.proxy(function(){

                    }, this));
        var $doorlockKeyForm = $('<div class="form-group"><label for="doorlockKeyPassword">도어락 비밀번호 변경</label></div>')
                                .append($doorlockKeyPassword);
                    
        var $screenSaverTimeForm = $('<div class="form-group"> \
                <label for="screenSaverTimeForm">스크린 세이버 대기 시간</label>\
                <select id="screenSaverTimeSelect" class="form-control"> \
                    <option value="15">15초 후에 스크린 세이버 노출</option> \
                    <option value="30">30초 후에 스크린 세이버 노출</option> \
                    <option value="45">45초 후에 스크린 세이버 노출</option> \
                    <option value="60">60초 후에 스크린 세이버 노출</option> \
                </select></div>');
         $screenSaverTimeForm.find("#screenSaverTimeSelect").val(nChangeScreenSaverTime);                       

         $container.append($masterKeyForm)
                    .append($doorlockKeyForm)
                    .append($screenSaverTimeForm);

                    
        var $save = $('<button type="button" class="btn btn-dark">변경</button>').click($.proxy(function(){
            // 변경 항목 노출하기

            var welMasterKeyPassword = $('#masterKeyPassword');
            var welDoorlockKeyPassword = $('#doorlockKeyPassword');
            var welScreenSaverTimeSelect = $('#screenSaverTimeSelect');
            
            var sChargingProperty = this._findChagingProperty();
            
            if(!sChargingProperty) {
                alert('변경사항이 없습니다.');
                return;
            }

            if(confirm(sChargingProperty + '변경하시겠습니까?')) {
               $.ajax({
                   url: '/ajax/manage',
                   method: 'post',
                   contentType : "application/json;charset=utf-8",
                   data: JSON.stringify({
                    "masterKey": welMasterKeyPassword.val().trim(),
                    "doorlockKey": welDoorlockKeyPassword.val().trim(),
                    "screenSaverTime": welScreenSaverTimeSelect.val()
                    }),
                   success: $.proxy(function(){
                        alert('변경하였습니다');
                        this._initManageView();
                   },this),
                   error: $.proxy(function(oFailResponse){
                    this._processAjaxCallFail(oFailResponse);
                }, this)    

               })
            }
        },this));

        var $remoteOpenDoor = $('<button type="button" class="btn btn-warning">원격 개방</button>').click($.proxy(function(){
            if(confirm('원격 개방 하시겠습니까?')) {
                $.ajax({
                    url: '/ajax/manage/remoteOpen',
                    method: 'get',
                    success: $.proxy(function(){
                        alert('문이 열렸습니다.');
                   },this),
                   error: $.proxy(function(oFailResponse){
                    this._processAjaxCallFail(oFailResponse);
                }, this) 
                });
            }
        },this));

        $container.append($masterKeyForm)
                    .append($doorlockKeyForm)
                    .append($screenSaverTimeForm)
                    .append($save)
                    .append($remoteOpenDoor);
        
        this._welBaseElement.append($pageHeader).append($container);
    },
    _findChagingProperty: function() {

        var s = '[';
        var welMasterKeyPassword = $('#masterKeyPassword');
        var welDoorlockKeyPassword = $('#doorlockKeyPassword');
        var welScreenSaverTimeSelect = $('#screenSaverTimeSelect');

        if(welDoorlockKeyPassword.val()) {
            s += ' (도어락 패스워드) ';
        }

        if(welMasterKeyPassword.val()) {
            s += ' (마스터키) ';
        }

        if(parseInt(welScreenSaverTimeSelect.val(), 10) !== this._nCurrentScreenSaverTime) {
            s += ' (스크린세이버 대기 시간) ';
        }

        s += ']';

        return s === '[]' ? null : s+']\n';
    }
});