var initial_port = 54545;
var pt_msg = 'It appears that the Proctortrack App is currently not running. Please go to the EDX exam page to start proctoring. If you have already taken the test, there is no further action required and you may continue with other coursework. If Proctortrack application is already running, refresh this page or contact Proctortrack support.'

class ProctoringServiceHandler {
  onStartExamAttempt() {
    return checkAppStatus(initial_port);
  }
  onEndExamAttempt() {
    return closePTApp(initial_port);
  }
  onPing() {
    return checkAppStatus(initial_port);
  }
}

var app_not_running_action = function () {
    console.log(pt_msg);
    Promise.reject();
};

var app_running_action = function() {
    Promise.resolve();
};

var closePTApp = function(initial_port){
    var xmlhttp = new XMLHttpRequest();
    var url = 'https://app.verificient.com:' + initial_port + '/proxy_server/app/close_proctoring/';
    xmlhttp.open('GET', url, true);
    xmlhttp.send();
    Promise.resolve();
};

var checkAppStatus = function (initial_port) {
    var xmlhttp = new XMLHttpRequest();
    var url = 'https://app.verificient.com:' + initial_port + '/proxy_server/app/proctoring_started/';
    xmlhttp.open('GET', url, true);
    xmlhttp.onreadystatechange = function () {

        if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
            // app is running,
            var data = JSON.parse(xmlhttp.responseText);
            if (data.proctoring){
                // proctoring started, notify edx
                alert('PT APP is running but proctoring is yet not started');

            } else{
                // app is running but proctoring is not started, notify edx
                app_not_running_action();
            }
        }
        else if ((xmlhttp.readyState == 4 || xmlhttp.readyState =="complete")) {
        //app is not running on any port and app server is down, notify edx
            app_not_running_action();
        }

    };
    xmlhttp.send();
};