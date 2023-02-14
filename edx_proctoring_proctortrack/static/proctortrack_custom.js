import { handlerWrapper } from "@edx/edx-proctoring";

const cdnURL =
  "https://raw.githubusercontent.com/anupdhabarde/edx-proctoring-proctortrack/firebase_custom_js/edx_proctoring_proctortrack/static/vt_cjs.IQEQWWZ2.js";

let isCDNLoaded = false;
let sessionUUID = null;
let database = null;
let presenceListener = null;

const loadScript = () => {
  if (isCDNLoaded) {
    return;
  }
  const xhr = new XMLHttpRequest();
  xhr.open("GET", cdnURL, false);
  xhr.onload = function () {
    console.log(xhr.response);
    eval(xhr.response);
    isCDNLoaded = true;
    initializeDb();
  };
  xhr.onerror = function (error) {
    console.error("initializeScript", error);
  };
  xhr.send();
};

const initializeDb = () => {
  if (!isCDNLoaded) {
    setTimeout(loadScript, 500);
    return;
  }
  const { vtKey, vtDecrypt } = self["proctortrack"];
  const config = vtDecrypt("A6839BC7FACEDEF3", vtKey);
  console.log(config);
  self.firebase.initializeApp(config);
  database = self.firebase.database();
};

const initPresenceListener = (sessionUUID) => {
  if (!sessionUUID) {
    console.error("error sessionUUID is not defined");
    return;
  }
  console.log(`initPresenceListener: ${sessionUUID}`);
  const connectionRef = database.ref(".info/connected");
  const sessionRef = database.ref(`/sessions/${sessionUUID}`);
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
  sessionUUID = attemptId;
  initPresenceListener(sessionUUID);
  console.log("checkAppStatus using firebase");
  return new Promise((resolve, reject) => {
    if (!sessionUUID) {
      console.error("checkAppStatus: error sessionUUID is not defined");
      reject(Error("Failed to check if proctoring has started."));
      return;
    }
    const sessionRef = database.ref(`/sessions/${sessionUUID}`);
    const onData = (data) => {
      const value = data.val();
      const { is_et_online, is_proctoring_started } = value;
      console.log("appStatusUsingFirebase value", value);
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
      console.error("appStatusUsingFirebase", error);
      reject(Error("Failed to check if proctoring has started."));
    };
    sessionRef.once("value", onData, onError);
  });
};

const closePTApp = () => {
  console.log("closePTApp using firebase");
  return new Promise((resolve, reject) => {
    if (!sessionUUID) {
      console.error("closePTApp: error sessionUUID is not defined");
      reject(Error("Failed to close the Proctortrack App."));
      return;
    }
    const sessionRef = database.ref(`/sessions/${sessionUUID}`);
    sessionRef.update({ is_exam_ended: true });
    const onData = (data) => {
      const value = data.val();
      const { is_et_online } = value;
      console.log("closePTAppUsingFirebase value", value);
      if (is_et_online) {
        reject(Error("Failed to close the Proctortrack App."));
      } else if (!is_et_online) {
        resolve({ closing_proctoring: true });
      } else {
        reject(Error("Failed to close the Proctortrack App."));
      }
    };
    const onError = () => {
      console.error("closePTAppUsingFirebase", error);
      reject(Error("Failed to close the Proctortrack App."));
    };
    sessionRef.once("value", onData, onError);
  });
};

class PTProctoringServiceHandler {
  constructor() {
    loadScript();
  }

  onStartExamAttempt(timeout, attemptId) {
    return checkAppStatus(timeout, attemptId);
  }

  onEndExamAttempt() {
    return closePTApp();
  }

  onPing(timeout) {
    return checkAppStatus(timeout);
  }
}

export default handlerWrapper(PTProctoringServiceHandler);
