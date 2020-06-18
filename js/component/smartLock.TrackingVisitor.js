if (typeof smartLock === "undefined") {
    var smartLock = {};
}

smartLock.TrackingVisitor = eg.Class.extend(smartLock.Default,{
    _welBaseElement : {},
    _currentPageNo: 0,
    _nTotalCount: 0,
    _bEntireSearch: true,
    _sSearchDateString: null,

    _sSearchDate: '',
    construct: function(htParams) {
        this._initParams(htParams);
        this._drawComponentStruct();
        this._initEvent();
        this._initTrackingVisitorListArea();
    },
    _initParams : function(htParams) {
        this._welBaseElement = htParams.welBaseElement;
    },
    _initEvent : function() {
        //datePicker 입력
        $("#dateSearchPicker").datepicker({
            showButtonPanel: true, 
            currentText: '오늘 날짜', 
            closeText: '닫기', 
            dateFormat: "yy-mm-dd",
            onSelect: $.proxy(function(text) {
                this._sSearchDateString = text.trim();;
            }, this)
     });
       
    },
    _drawComponentStruct: function() {
        var $pageHeader = $('<div class="contentHeader">방문자 트래킹</div>');
        var $entireSearchCheckBox = $('<input type="checkbox" checked />').click($.proxy(function(e){
            this._bEntireSearch = $(e.toElement).prop('checked');
            var welDatePickerArea = $('._datePickerArea'); 
            $('#dateSearchPicker').val('');
            if(this._bEntireSearch) {
                welDatePickerArea.hide();
            } else {
                welDatePickerArea.show();
            }
        },this));
        var $queryButton = $('<button type="button" class="btn btn-sm btn-success">조회</button>').click($.proxy(function(){
            this._initTrackingVisitorListArea();
        },this));

        var $TrackingVisitorSubMenu = $('<div id="trackingVisitorSubMenu" class="container" style="margin-bottom:10px"></div>')       
        .append($('<div class="col-xs-3"><span>총 <span id="totalCount"></span>개</span></div>'))
        .append($('<div class="col-xs-6"></div>')
            .append($entireSearchCheckBox)
            .append($("<span> 전체 &nbsp;</span>"))
            .append($('<span class="_datePickerArea" style="display:none"><input id="dateSearchPicker" style="width:80px" type="text" placeholder="날짜선택"/></span>'))
        )
        .append($('<div class="col-xs-3"></div>').append($queryButton));
        var $TrackingVisitorList = $('<div id="trackingVisitorList"></div>');
        var $TrackingVisitorListAdd = $('<button id="trackingVisitorListAddButton" type="button" class="btn btn-secondary">더 보기</button>').click($.proxy(function(){
            this._appendTrackingVisitorList();
        }, this));
        var $container = $('<div id="trackingVisitorContainerArea" class="container"></div>')
                            .append($TrackingVisitorSubMenu)
                            .append($('<div id="trackingVisitorContentArea" style="height:380px !important;overflow: auto !important;"></div>')
                                .append($TrackingVisitorList)
                                .append($TrackingVisitorListAdd)
                            );
        
        this._welBaseElement
        .append($pageHeader)
        .append($container);
    },
    _initTrackingVisitorListArea: function() {
        this._currentPageNo = 0;
        $('#trackingVisitorList').empty();
        var oRequestData = {
            "currentNo" : this._currentPageNo,
            "searchDateString" : this._bEntireSearch ? null : this._sSearchDateString
        }

        $.ajax({
            url: '/ajax/trackingVisitor/page',
            method: 'get',
            data: oRequestData,
            success: $.proxy(function(oResponse){
                if(oResponse) {
                
                    if (oResponse.totalCount > 0) {
                        $('#trackingVisitorSubMenu').show();
                        $('#totalCount').html(oResponse.totalCount);
                        this._nTotalCount = oResponse.totalCount;
                    }

                    if (oResponse.hasNextPage) {
                        this._currentPageNo++;
                        $('#trackingVisitorListAddButton').show();
                    } else {
                        $('#trackingVisitorListAddButton').hide();
                    }

                    this._drawTrackingVisitorListArea(oResponse);
                }
            }, this),
            error: $.proxy(function(oFailResponse){
                this._processAjaxCallFail(oFailResponse);
            }, this)    
        });

    },
    _appendTrackingVisitorList: function() {
        var oRequestData = {
            "currentNo" : this._currentPageNo,
            "searchDateString" : this._bEntireSearch ? null : this._sSearchDateString
        }

        $.ajax({
            url: '/ajax/trackingVisitor/page',
            method: 'get',
            data: oRequestData,
            success: $.proxy(function(oResponse){
                if(oResponse) {
                    if (oResponse.totalCount > 0) {
                        $('#totalCount').html(oResponse.totalCount);
                        this._nTotalCount = oResponse.totalCount;
                    }

                    if (oResponse.hasNextPage) {
                        this._currentPageNo++;
                    } else {
                        $('#trackingVisitorListAddButton').hide();
                    }

                    this._addTrackingVisitorList(oResponse);
                }
            }, this),
            error: $.proxy(function(oFailResponse){
                this._processAjaxCallFail(oFailResponse);
            }, this)    
        });
    },
    _addTrackingVisitorList: function(oTrackingVisitorPaging) {
        var welTrackingVisitorContentList = $('#trackingVisitorList');
        $.each(oTrackingVisitorPaging.trackingVisitorList, $.proxy(function(index, oTrackingVisitor){
            var $TrackingVisitorView = this._createTrackingVisitorView(oTrackingVisitor); 
            welTrackingVisitorContentList.append($TrackingVisitorView);
        },this));
    },
    _drawTrackingVisitorListArea: function(oTrackingVisitorPaging) {

        var $emptyListView = $('<div id="emptyTrackingVisitorArea" class="card card-default"> \
        <div class="card-body" style="text-align:center"> \
          <h4>방문자 트래킹 내용이 없습니다.</h4> \
        </div> \
      </div>');

        var welTrackingVisitorContentList = $('#trackingVisitorList');

        if (oTrackingVisitorPaging.totalCount > 0) {
            $.each(oTrackingVisitorPaging.trackingVisitorList, $.proxy(function(index, oTrackingVisitor){
                var $TrackingVisitorView = this._createTrackingVisitorView(oTrackingVisitor); 
                welTrackingVisitorContentList.append($TrackingVisitorView);
            },this));
        } else {
            welTrackingVisitorContentList.append($emptyListView);
        }
    },
    _deleteTrackingVisitorByTrackingVisitorId: function(nTrackingVisitorId) {
        var sUrl = '/ajax/trackingVisitor/' + nTrackingVisitorId;
        $.ajax({
            url: sUrl,
            method: 'delete',
            success: $.proxy(function(oResponse) {
                alert('삭제하였습니다.');
                this._initTrackingVisitorListArea();
            }, this),
            error: $.proxy(function(oFailResponse) {
                this._processAjaxCallFail(oFailResponse);
            }, this)
        });
    },
    _createTrackingVisitorView: function(oTrackingVisitor) {

        var $deleteButton = $('<button type="button" class="btn btn-danger">삭제</button>').click($.proxy(function(e){
            if(confirm('삭제하시겠습니까?')) {
                this._deleteTrackingVisitorByTrackingVisitorId($(e.toElement).parent().data('tracking-id'));
            }
        },this));;

        var sCardTemplate = '<div class="card card-default"> \
                <div class="card-header">{trackingDate}</div> \
                <div class="card-img"> \
                    <img src=" data:image/jpeg;base64,{base64PictureData}" class="img-responsive"> \
                </div> \
                <div class="card-body"> \
                    <p class="_trackingVisitorButtonArea" data-tracking-id={trackingId}></p> \
                </div> \
            </div>';

         $.each(oTrackingVisitor,$.proxy(function(key, value){
            sCardTemplate = sCardTemplate.replace('{'+key+'}', value);
         },this));   

         var $cardTemplate = $(sCardTemplate);
         var $TrackingVisitorArea = $cardTemplate.find('._trackingVisitorButtonArea');

         $TrackingVisitorArea.append($deleteButton);

         return $cardTemplate;
    }
});