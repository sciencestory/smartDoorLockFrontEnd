if (typeof smartLock === "undefined") {
    var smartLock = {};
}

smartLock.Notice = eg.Class.extend(smartLock.Default,{
    _welBaseElement : {},
    _currentPageNo: 0,
    _nTotalCount: 0,
    construct: function(htParams) {
        this._initParams(htParams);
        this._drawComponentStruct();
        this._initNoticeListArea();
    },
    _initParams : function(htParams) {
        this._welBaseElement = htParams.welBaseElement;
    },
    _drawComponentStruct: function() {
        var $pageHeader = $('<div class="contentHeader">공지사항 관리</div>');
        var $registerButton = $('<button type="button" class="btn btn-success">등록하기</button>').click($.proxy(function(){
            this._drawNoticeWriteArea();
        },this));

        var $noticeSubMenu = $('<div id="noticeSubMenu" class="container" style="margin-bottom:10px"></div>')       
        .append($('<div class="col-xs-8"><span>총 등록 수 : <span id="totalCount"></span>개</span></div>'))
        .append($('<div class="col-xs-3"></div>')
            .append($registerButton)
        );

        var $noticeContentList = $('<div id="noticeContentList"></div>');
        var $noticeContentAdd = $('<button id="addNoticeListButton" type="button" class="btn btn-secondary">더 보기</button>').click($.proxy(function(){
            this._addNoticeList();
        }, this));
        var $container = $('<div id="noticeContainerArea" class="container"></div>')
                            .append($noticeSubMenu)
                            .append($('<div id="noticeContentArea" style="height:380px !important;overflow: auto !important;"></div>')
                                .append($noticeContentList)
                                .append($noticeContentAdd)
                            )
                            .append($('<div id="noticeContentWriteArea"></div>'));
        
        this._welBaseElement
        .append($pageHeader)
        .append($container);
    },
    _initNoticeListArea: function() {
        this._currentPageNo = 0;
        $('#noticeContentList').empty();
        $.ajax({
            url: '/ajax/notice/page/0',
            method: 'get',
            success: $.proxy(function(oResponse){
                if(oResponse) {
                    if (!oResponse.hasNextPage && oResponse.totalCount === 0) {
                        $('#noticeSubMenu').hide();
                    } 

                    if (oResponse.totalCount > 0) {
                        $('#noticeSubMenu').show();
                        $('#totalCount').html(oResponse.totalCount);
                        this._nTotalCount = oResponse.totalCount;
                    }

                    if (oResponse.hasNextPage) {
                        this._currentPageNo++;
                    } else {
                        $('#addNoticeListButton').hide();
                    }

                    this._drawNoticeListArea(oResponse);
                }
            }, this),
            error: $.proxy(function(oFailResponse){
                this._processAjaxCallFail(oFailResponse);
            }, this)    
        });

    },
    _addNoticeList: function() {
        $.ajax({
            url: '/ajax/notice/page/' + this._currentPageNo,
            method: 'get',
            success: $.proxy(function(oResponse){
                if(oResponse) {
                    if (oResponse.totalCount > 0) {
                        $('#noticeSubMenu').show();
                        $('#totalCount').html(oResponse.totalCount);
                        this._nTotalCount = oResponse.totalCount;
                    }

                    if (oResponse.hasNextPage) {
                        this._currentPageNo++;
                    } else {
                        $('#addNoticeListButton').hide();
                    }

                    this._appendAddNoticeList(oResponse);
                }
            }, this),
            error: $.proxy(function(oFailResponse){
                this._processAjaxCallFail(oFailResponse);
            }, this)    
        });
    },
    _appendAddNoticeList(oNoticePaging) {
        var welNoticeContentList = $('#noticeContentList');
        $.each(oNoticePaging.noticeList, $.proxy(function(index, oNotice){
            var $NoticeView = this._createNoticeView(oNotice); 
            welNoticeContentList.append($NoticeView);
        },this));
    },
    _drawNoticeModifyArea: function(nNoticeId) {
        var sUrl = '/ajax/notice/' + nNoticeId;

        $.ajax({
            url: sUrl,
            method: 'get',
            success: $.proxy(function(oResponse) {
                this._drawNoticeWriteArea(nNoticeId);
                $('#noticeSubjectText').val(oResponse.subject);
                $('#noticeContentTextArea').val(oResponse.content);
            }, this),
            error: $.proxy(function(oFailResponse) {
                this._processAjaxCallFail(oFailResponse);
            }, this)
        });
    },
    _drawNoticeWriteArea: function(nNoticeId) {
        
        var welNoticeContentWriteArea =  $("#noticeContentWriteArea");
        var welNoticeContentArea = $('#noticeContentArea');
        var welNoticeSubMenu =  $('#noticeSubMenu');

        var sTitle = '';
        if(nNoticeId) {
            welNoticeContentWriteArea.data("noticeId", nNoticeId);
            sTitle = '수정';
        } else {
            welNoticeContentWriteArea.data("noticeId", null);
            sTitle = '저장';
        }

        welNoticeContentArea.hide();
        welNoticeContentWriteArea.empty();
        welNoticeContentWriteArea.show();
        welNoticeSubMenu.hide();

        var $subject = $('<div class="form-group"> \
                    <label for="noticeSubjectText">제목</label> \
                    <input id ="noticeSubjectText" type="text" class="form-control"> \
      </div>');

        var $content = $('<div class="form-group"> <label for="noticeContentTextArea">내용</label> <textarea id="noticeContentTextArea" class="form-control" id="ta1" rows="5"></textarea> </div>');

        var $save = $('<button type="button" class="btn btn-dark">' + sTitle + '</button>').click($.proxy(function(){
            if(confirm(sTitle + '하시겠습니까?')) {
                var noticeId = welNoticeContentWriteArea.data('noticeId');

                if(noticeId) {
                    this._modifyNoticeToServer(noticeId);
                } else {
                    this._createNoticeToServer();
                }
            }
        },this));
 
        var $cancel = $('<button type="button" class="btn btn-dark">목록으로</button>').click($.proxy(function(){
            welNoticeContentWriteArea.hide();
            welNoticeContentArea.show();

            if(this._nTotalCount > 0) {
                welNoticeSubMenu.show();
            } else {
                welNoticeSubMenu.hide();
            }
        },this));

      $("#noticeContentWriteArea").append($subject)
      .append($content)
      .append($save)
      .append($cancel);
    },
    _createNoticeToServer: function() {

        var welNoticeContentWriteArea =  $("#noticeContentWriteArea");
        var welNoticeContentArea = $('#noticeContentArea');
        var welNoticeSubMenu = $('#noticeSubMenu');

        $.ajax({
            url: '/ajax/notice',
            contentType : "application/json;charset=utf-8",
            method: 'put',
            data: JSON.stringify({
                "subject": $('#noticeSubjectText').val().trim(),
                "content": $('#noticeContentTextArea').val().trim()
            }),
            success: $.proxy(function(oResponse) {
                alert('저장하였습니다.');
                welNoticeContentWriteArea.hide();
                welNoticeContentArea.show();
                this._initNoticeListArea();
            }, this),
            error: $.proxy(function(oFailResponse) {
                this._processAjaxCallFail(oFailResponse);
            }, this)
        })

    },
    _modifyNoticeToServer: function(nNoticeId) {
        var welNoticeContentWriteArea =  $("#noticeContentWriteArea");
        var welNoticeContentArea = $('#noticeContentArea');
        var welNoticeSubMenu = $('#noticeSubMenu');

        $.ajax({
            url: '/ajax/notice',
            contentType : "application/json;charset=utf-8",
            method: 'post',
            data: JSON.stringify({
                "noticeId": nNoticeId,
                "subject": $('#noticeSubjectText').val().trim(),
                "content": $('#noticeContentTextArea').val().trim()
            }),
            success: $.proxy(function(oResponse) {
                alert('수정하였습니다.');
                welNoticeContentWriteArea.hide();
                welNoticeContentArea.show();
                this._initNoticeListArea();
            }, this),
            error: $.proxy(function(oFailResponse) {
                this._processAjaxCallFail(oFailResponse);
            }, this)
        })
    },
    _drawNoticeListArea: function(oNoticePaging) {

        var $emptyListView = $('<div id="emptyNoticeArea" class="card card-default"> \
        <div class="card-body" style="text-align:center"> \
          <h4>공지 사항 등록 내용이 없습니다.</h4> \
          <p><button type="button" class="btn btn-warning">첫 공지 사항 등록하기</button></p> \
        </div> \
      </div>');

        var welNoticeContentList = $('#noticeContentList');

        if (oNoticePaging.totalCount > 0) {
            $.each(oNoticePaging.noticeList, $.proxy(function(index, oNotice){
                var $NoticeView = this._createNoticeView(oNotice); 
                welNoticeContentList.append($NoticeView);
            },this));
        } else {
            $emptyListView.find('button').click($.proxy(function() {
                this._drawNoticeWriteArea();
            }, this));
            welNoticeContentList.append($emptyListView);
        }
    },
    _deleteNoticeByNoticeId: function(nNoticeId) {
        var sUrl = '/ajax/notice/' + nNoticeId;
        $.ajax({
            url: sUrl,
            method: 'delete',
            success: $.proxy(function(oResponse) {
                alert('삭제하였습니다.');
                this._initNoticeListArea();
            }, this),
            error: $.proxy(function(oFailResponse) {
                this._processAjaxCallFail(oFailResponse);
            }, this)
        });
    },
    _exposeNoticeByNoticeId: function(nNoticeId) {
        var sUrl = '/ajax/notice/expose/' + nNoticeId;
        $.ajax({
            url: sUrl,
            method: 'post',
            success: $.proxy(function(oResponse) {
                alert('선택한 공지지사항을 노출하도록 변경하였습니다.');
                this._initNoticeListArea();
            }, this),
            error: $.proxy(function(oFailResponse) {
                this._processAjaxCallFail(oFailResponse);
            }, this)
        });
    },
    _createNoticeView: function(oNotice) {

        var $exposeButton = $('<button type="button" class="btn btn-info">노출</button>').click($.proxy(function(e){
            if(confirm('해당 공지를 도어락에 노출하시겠습니까?\n기존에 노출된 공지사항은 더이상 노출되지 않습니다.')) {
                // 노출 로직 입력
                this._exposeNoticeByNoticeId($(e.toElement).parent().data('notice-id'));    
            }
        },this));
        var $modifyButton = $('<button type="button" class="btn btn-warning">수정</button>').click($.proxy(function(e){
            // alert('수정 id:' + $(e.toElement).parent().data('notice-id'));
            this._drawNoticeModifyArea($(e.toElement).parent().data('notice-id'));
        },this));;
        var $deleteButton = $('<button type="button" class="btn btn-danger">삭제</button>').click($.proxy(function(e){
            if(confirm('삭제하시겠습니까?')) {
                // 삭제 로직 입력
                this._deleteNoticeByNoticeId($(e.toElement).parent().data('notice-id'));
            }
        },this));;

        var sCardTemplate = '<div class="card card-default"> \
                <div class="card-header">{subject}</div> \
                <div class="card-body"> \
                <h4>{noticeDate}</h4> \
                <p>{content}</p> \
                <p class="_noticeButtonArea" data-notice-id={noticeId}></p> \
                </div> \
            </div>';

         $.each(oNotice,$.proxy(function(key, value){
            sCardTemplate = sCardTemplate.replace('{'+key+'}', value);
         },this));   

         var $cardTemplate = $(sCardTemplate);

         var $noticeButtonArea = $cardTemplate.find('._noticeButtonArea');

         if(!oNotice.expose) {
             $noticeButtonArea.append($exposeButton);
         } else {
             $cardTemplate.find('.card-header').addClass('card-expose-header');
         }

         $noticeButtonArea.append($modifyButton).append($deleteButton);

         return $cardTemplate;
    }
});