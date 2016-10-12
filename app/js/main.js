$ = jQuery.noConflict();
window.Modernizr = {};
var currRefId;
var pStatus;

var   cdnBasePath= "https://kalmedia.laureate.net/emb/";
var assestsPath="http://cdnfiles.laureate.net/2dett4d/managed/"


function jsCallbackReady(objectId) {
    console.log(objectId + " is ready!!");
    window.kdp = document.getElementById(objectId);

    kdp.kBind("mediaReady.init", function() {
        $('.totalTime').text(timeConversion(kdp.evaluate("{mediaProxy.entry.duration}")));
        console.log("duration ready: " + kdp.evaluate("{mediaProxy.entry.duration}"));
        kdp.kUnbind('.init');
        kdp.kBind('playerUpdatePlayhead', 'videoTimeUpdateHandler');
        kdp.kBind('playerStateChange', 'playerStateHandler');
        //$('.hidePlayer').hide();
    });


}



$(document).ready(function() {
  $('.videoContainer').hide();
    $('.audioPlayer').hide();
    $.getJSON('js/data.json', function(data) {
        var template = document.getElementById('templateBtns').innerHTML;
        $.each(data.items, function(i, item) {
            var html = Mustache.to_html(template, item);
              var fPath=cdnBasePath+item.referenceID +".json"
            $('.grid').append(html);
        });


    });



$("body").tooltip({
  selector: '[data-toggle="tooltip"]'
});


    $('body').on('click', '.clickFigure', function(e) {
      $('figure').removeClass('active')
      $(e.target).parents('figure').addClass('active');
        e.preventDefault();
        var tgt=$(this).data('target')
        console.log(tgt)
          var refId=tgt.substr(tgt.lastIndexOf("/") + 1,tgt.length);
          console.log('refId:  '+refId)
        if (refId == currRefId) {
            console.log(e.target)
            playPauseHandler();
        } else {
            $('.clicked').removeClass('clicked')
            kdp.sendNotification("changeMedia", {
                "referenceId": refId
            });
            currRefId = refId;
              $('.videoContainer').show('300');

        }
        $(e.target).toggleClass('clicked')

    });

});



function playerReadyHandler(e) {
    console.log(e + '<<Im readyy')
}


// buttons`
$("#playBtn").click(function(e) {
    e.preventDefault();
    playPauseHandler();
});

function playPauseHandler() {
    if (pStatus == 'playing') {
        kdp.sendNotification("doPause");
    } else if (pStatus == 'paused') {
        kdp.sendNotification("doPlay");
    }
}


$("#pauseBtn").click(function(e) {
    e.preventDefault();
    kdp.sendNotification("doPause");
});
//videoPlayer events
function videoTimeUpdateHandler(data, id) {
    var currentTime = data;
    var duration = kdp.evaluate("{mediaProxy.entry.duration}")
    $('.currentTime').text(timeConversion(data));
    var remainingTime = duration - data;
    $('.totalTime').text('-' + timeConversion(remainingTime));
    var percent = currentTime / kdp.evaluate("{mediaProxy.entry.duration}");
    updateProgressWidth(percent);
}



function playerStateHandler(e) {
    if (e == 'paused' || e == 'playing') {
        pStatus = e;
    }

}


function timeConversion(seconds) {
    d = Number(seconds);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);
    return ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s);
}


//scrub bar events




function updateProgressWidth(percent) {
    $('.timebar').width((percent * 100) + "%");

}


var timeDrag = false; /* Drag status */
$('.progressbar').mousedown(function(e) {
    timeDrag = true;
    updatebar(e.pageX);
});
$(document).mouseup(function(e) {
    if (timeDrag) {
        timeDrag = false;
        updatebar(e.pageX);
    }
});
$(document).mousemove(function(e) {
    if (timeDrag) {
        updatebar(e.pageX);
    }
});

//update Progress Bar control
var updatebar = function(x) {
    var progress = $('.progressBar');
    var maxduration = kdp.evaluate("{mediaProxy.entry.duration}") //Video duraiton
    var position = x - progress.offset().left; //Click pos
    var percentage = 100 * position / progress.width();

    //Check within range
    if (percentage > 100) {
        percentage = 100;
    }
    if (percentage < 0) {
        percentage = 0;
    }

    //Update progress bar and video currenttime
    var seekTime = maxduration * percentage / 100;

    $('.timeBar').css('width', percentage + '%');
    kdp.sendNotification("doSeek", seekTime);
};
