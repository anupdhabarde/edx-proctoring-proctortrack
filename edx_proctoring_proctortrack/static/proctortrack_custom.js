import { handlerWrapper } from '@edx/edx-proctoring';

var baseUrl = 'https://app.verificient.com:54545';

var closePTApp = function () {
    /**
     * This function can be used to make a request to Proctortrack app to close itself. Proctortrack app will upload
     * the data before closing itself.
     */
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', baseUrl + '/proxy_server/app/close_proctoring', true);
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(JSON.parse(xhr.response));
            } else {
                reject(Error("Failed to close the Proctortrack App."));
            }
        };
        xhr.onerror = function () {
            reject(Error("Failed to close the Proctortrack App."));
        };
        xhr.send()
    });
};

var checkAppStatus = function () {
    /**
     * This function is used to check if the Proctortrack app is running or not.
     */
    return new Promise(function (resolve, reject) {
        var maxFailedAttemptCount = 2;
        var failedAttemptCount = 0;

        var attemptConnection = function () {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', baseUrl + '/proxy_server/app/proctoring_started/', true);
            xhr.onload = function () {
                if (this.status >= 200 && this.status < 300) {
                    var response = JSON.parse(xhr.response);
                    if (response.proctoring) {
                        resolve({proctoring_started: true});
                    } else {
                        reject(Error("Proctortrack app is running but proctoring hasn't started."));
                    }
                } else {
                    failedAttemptCount += 1;
                    if (failedAttemptCount < maxFailedAttemptCount) {
                        setTimeout(attemptConnection, 30 * 1000);
                    } else {
                        reject(Error("Failed to check if proctoring has started."));
                    }
                }
            };
            xhr.onerror = function () {
                failedAttemptCount += 1;
                if (failedAttemptCount < maxFailedAttemptCount) {
                    setTimeout(attemptConnection, 30 * 1000);
                } else {
                    reject(Error("Proctortrack app is not running."));
                }
            };
            xhr.send();
        };

        attemptConnection();
    });
};

class PTProctoringServiceHandler {
    onStartExamAttempt() {
        return checkAppStatus();
    }

    onEndExamAttempt() {
        return closePTApp();
    }

    onPing() {
        return checkAppStatus();
    }
}

export default handlerWrapper(PTProctoringServiceHandler);
