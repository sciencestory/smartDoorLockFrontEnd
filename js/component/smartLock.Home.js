if (typeof smartLock === "undefined") {
    var smartLock = {};
}

smartLock.Home = eg.Class.extend(smartLock.Default,{
    _welBaseElement : {},
    construct: function(htParams) {
        this._initParams(htParams);
        this._drawHomeArea();
    },
    _initParams : function(htParams) {
        this._welBaseElement = htParams.welBaseElement;
    },
    _drawHomeArea: function() {
        this._welBaseElement.append($('<div class="jumbotron"> \
        <h2>스마트 도어락 관리 페이지 입니다.</h2> \
        <p>모바일 화면에서는 삼선 메뉴를 클릭하여 관리를 시작해보세요. </p> \
        <ul class="list-group"> \
            <li class="list-group-item"> <a href="/menu/notice">공지사항 관리</a></li> \
            <li class="list-group-item"> <a href="/menu/trackingVisitor">방문자 트래킹 확인</a></li> \
            <li class="list-group-item"> <a href="/menu/doorManage">도어락 관리</a></li> \
        </ul> \
      </div>'));
    },
});