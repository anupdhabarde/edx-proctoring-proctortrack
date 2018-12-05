import { handlerWrapper } from '@edx/edx-proctoring';

var pt_msg = 'It appears that the Proctortrack App is currently not running. Please go to the Proctortrack dashboard to start proctoring. If you have already taken the test, there is no further action required and you may continue with other coursework. If Proctortrack application is already running, refresh this page or contact Proctortrack support.';
var initial_port = 54545;
var final_port = 54545;
var is_initial_check = true;  // is this a first check to see if app is running.
var attempt_count = 0; // attempt made to reach app.
var standard_timeout = 30000;
var failure_timeout = 30000;
var max_attempt_count = 5;


class PTProctoringServiceHandler {
  onStartExamAttempt() {
    checkAppStatus(initial_port);
  }
  onEndExamAttempt() {
    closePTApp(initial_port);
  }
  onPing() {
    checkAppStatus(initial_port);
  }
}

var app_not_running_action = function () {
    console.log(pt_msg);
    return Promise.reject();
};

var app_running_action = function() {
    console.log('PT APP is running');
    return Promise.resolve();
};

var closePTApp = function(initial_port){
    // this function is called to close the PT APP, On this Event, PT APP will upload the data and will close itself.
    var xmlhttp = new XMLHttpRequest();
    var url = 'https://app.verificient.com:' + initial_port + '/proxy_server/app/close_proctoring/';
    xmlhttp.open('GET', url, true);
    xmlhttp.send();
    return Promise.resolve();
};

var checkAppStatus = function (initial_port) {
    // this function is called to check the status of PT APP, if PT app is running it will return resolve else reject;
    // the function will also be called using setTimeout to check the status of PT app at defined interval.
    var xmlhttp = new XMLHttpRequest();
    var url = 'https://app.verificient.com:' + initial_port + '/proxy_server/app/proctoring_started/';
    xmlhttp.open('GET', url, true);
    xmlhttp.onreadystatechange = function () {


        if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
            // app is running, notify edx
            var data = JSON.parse(xmlhttp.responseText);
            is_initial_check = false;
            if (data.proctoring){
                // proctoring started, notify edx
                app_running_action();

                attempt_count = 0;  // reset attempt count
                // set 'checkAppStatus' function to be called at 'standard_timeout' i.e 30 seconds,
                // this is done to check if PT app is running while student is attempting the exam.
                setTimeout(function(){
                    checkAppStatus(initial_port);
                }, standard_timeout);
            } else{
                // app is running but proctoring is not started, notify edx
                app_not_running_action();
            }
        }
        else if ((xmlhttp.readyState == 4 || xmlhttp.readyState =="complete")) {
            //app is not running on any port and app server is down, notify edx
            if (is_initial_check){
                app_not_running_action();
                is_initial_check = false;
            } else if ( attempt_count < max_attempt_count) {    // check five more times before returning Promise.reject();.
                // set 'checkAppStatus' function to be called at 'failure_timeout' i.e 30 seconds,
                // this is done to check if PT app is re-started by 'watchdog process'
                setTimeout(function(){
                    checkAppStatus(initial_port);
                }, failure_timeout);
                attempt_count +=1;
            } else{
                app_not_running_action();
            }
        }
    };
    xmlhttp.send();
};

export default handlerWrapper(PTProctoringServiceHandler);

