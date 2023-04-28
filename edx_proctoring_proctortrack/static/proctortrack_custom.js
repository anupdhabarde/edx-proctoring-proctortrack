import { handlerWrapper } from "@edx/edx-proctoring";

const CDN_URL = process.env.JS_ENV_EXTRA_CONFIG.PROCTORTRACK_CDN_URL;
const KEY = process.env.JS_ENV_EXTRA_CONFIG.PROCTORTRACK_CONFIG_KEY;
const BASE_URL = "https://app.verificient.com:54545";
let useRemoteServer = false;
let isCDNLoaded = false;
let database = null;
let presenceListener = null;

const initializeJs = () => {
  useRemoteServer =
    CDN_URL && CDN_URL.includes("fb_cjs") && KEY && KEY.length > 2;
  if (useRemoteServer) {
    if (isCDNLoaded) {
      return;
    }
    const xhr = new XMLHttpRequest();
    xhr.open("GET", CDN_URL, false);
    xhr.onload = function () {
      eval(xhr.response);
      isCDNLoaded = true;
      setupDB();
    };
    xhr.onerror = function (error) {
      console.error("Failed to initialize proctortrack script", error);
    };
    xhr.send();
  }
};

const setupDB = () => {
  if (!isCDNLoaded) {
    setTimeout(initializeJs, 500);
    return;
  }
  const { vtKey, vtDecrypt } = self["proctortrack"];
  const config = vtDecrypt(KEY, vtKey);
  self.firebase.initializeApp(JSON.parse(config));
  database = self.firebase.database();
};

const initPresenceAPI = (sessionKey) => {
  if (!sessionKey) {
    return;
  }
  const connectionRef = database.ref(".info/connected");
  const sessionRef = database.ref(`/sessions/${sessionKey}`);
  if (!presenceListener) {
    presenceListener = connectionRef.on("value", (snap) => {
      if (snap.val() === true) {
        sessionRef.update({ is_custom_js_online: true });
        sessionRef.onDisconnect().update({ is_custom_js_online: false });
      }
    });
  }
};

const checkAppStatus = (timeout, attemptId) => {
  if (useRemoteServer) {
    return checkAppStatusUsingRemoteServer(timeout, attemptId);
  } else {
    return checkAppStatusUsingLocalServer(timeout);
  }
};

const checkAppStatusUsingLocalServer = (timeout = 150000) => {
  /**
   * This function is used to check if the Proctortrack app is running or not.
   */
  return new Promise((resolve, reject) => {
    let maxFailedAttemptCount = 5;
    let failedAttemptCount = 0;
    let retryInterval = Math.floor(timeout / maxFailedAttemptCount);

    let attemptConnection = () => {
      let xhr = new XMLHttpRequest();
      xhr.open("GET", BASE_URL + "/proxy_server/app/proctoring_started/", true);
      xhr.onload = function () {
        if (this.status >= 200 && this.status < 300) {
          let response = JSON.parse(xhr.response);
          if (response.proctoring) {
            resolve({ proctoring_started: true });
          } else {
            reject(
              Error(
                "Proctortrack app is running but proctoring hasn't started."
              )
            );
          }
        } else {
          failedAttemptCount += 1;
          if (failedAttemptCount < maxFailedAttemptCount) {
            setTimeout(attemptConnection, retryInterval);
          } else {
            reject(Error("Failed to check if proctoring has started."));
          }
        }
      };
      xhr.onerror = function () {
        failedAttemptCount += 1;
        if (failedAttemptCount < maxFailedAttemptCount) {
          setTimeout(attemptConnection, retryInterval);
        } else {
          reject(Error("Proctortrack app is not running."));
        }
      };
      xhr.send();
    };

    attemptConnection();
  });
};

const checkAppStatusUsingRemoteServer = (timeout, sessionKey) => {
  initPresenceAPI(sessionKey);
  return new Promise((resolve, reject) => {
    if (!sessionKey) {
      reject(Error("Failed to check if proctoring has started."));
      return;
    }
    const sessionRef = database.ref(`/sessions/${sessionKey}`);
    const onData = (data) => {
      const value = data.val();
      const { is_et_online, is_proctoring_started } = value;
      if (is_et_online && is_proctoring_started) {
        resolve({ proctoring_started: true });
      } else if (is_et_online && !is_proctoring_started) {
        reject(
          Error("Proctortrack app is running but proctoring hasn't started.")
        );
      } else if (!is_et_online) {
        reject(Error("Proctortrack app is not running."));
      } else {
        reject(Error("Failed to check if proctoring has started."));
      }
    };
    const onError = (error) => {
      reject(Error("Failed to check if proctoring has started."));
    };
    sessionRef.once("value", onData, onError);
  });
};

const closePTApp = (attemptId) => {
  if (useRemoteServer) {
    return closePTAppUsingRemoteServer(attemptId);
  } else {
    return closePTAppUsingLocalServer();
  }
};

const closePTAppUsingLocalServer = () => {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", BASE_URL + "/proxy_server/app/close_proctoring", true);
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
    xhr.send();
  });
};

const closePTAppUsingRemoteServer = (sessionKey) => {
  return new Promise((resolve, reject) => {
    if (!sessionKey) {
      reject(Error("Failed to close the Proctortrack App."));
      return;
    }
    const sessionRef = database.ref(`/sessions/${sessionKey}`);
    sessionRef.update({ is_exam_ended: true });
    const onData = (data) => {
      const value = data.val();
      const { is_et_online } = value;
      if (is_et_online) {
        reject(Error("Failed to close the Proctortrack App."));
      } else if (!is_et_online) {
        resolve({ closing_proctoring: true });
      } else {
        reject(Error("Failed to close the Proctortrack App."));
      }
    };
    const onError = (error) => {
      reject(Error("Failed to close the Proctortrack App."));
    };
    sessionRef.once("value", onData, onError);
  });
};

class PTProctoringServiceHandler {
  constructor() {
    initializeJs();
  }

  onStartExamAttempt(timeout, attemptId) {
    return checkAppStatus(timeout, attemptId);
  }

  onEndExamAttempt(attemptId) {
    return closePTApp(attemptId);
  }

  onPing(timeout, attemptId) {
    return checkAppStatus(timeout, attemptId);
  }
}

export default handlerWrapper(PTProctoringServiceHandler);