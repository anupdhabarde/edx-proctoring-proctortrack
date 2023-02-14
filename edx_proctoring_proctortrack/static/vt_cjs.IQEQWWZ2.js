importScripts(
  "https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js",
  "https://www.gstatic.com/firebasejs/8.10.1/firebase-database.js"
);
const vtKey =
  "NzQsMTE0LDQyLDM0LDMwLDEzLDUzLDI4LDg4LDY2LDEyMiw0MywxMjIsNDYsMTgsMjMsNzIsMjAsNyw1MiwyMCw0Myw1MCwxNiwxNCw0MywzMSwyNiwxMjQsMTAzLDQsNDIsMTE0LDEwMiwxMyw0LDY2LDExNywyNCw0MCwyLDE0LDUzLDI1LDk5LDEwMiw1OSwyMiw0LDM1LDEwNSwxMjYsODUsMzksMzcsMTcsMTgsNjAsNTUsNyw4Miw2MSwyOSwxMDIsMTEsMTE0LDQ3LDYwLDQsMTA3LDM4LDE3LDg0LDMwLDQ5LDI0LDg2LDU0LDE4LDU1LDg0LDQ5LDU5LDM0LDg5LDM3LDYzLDgsODgsODQsMTIyLDE0LDgyLDMyLDE4LDM4LDgwLDM1LDQ2LDcsMzcsMTAsMTE0LDk1LDg4LDE2LDQ0LDMwLDY3LDM5LDczLDEwNywzMCw1MiwzNywzMyw5MCw0OCwzNiw3MiwzMCwyOSw2MiwxMSw3MCw1Niw3LDEwNSw2NywzNiw0Nyw0OCw4OSwzMiw1NywyMywzMSwyNiw1NywyNSw4Niw2MSwyOCwxMDYsODIsNjMsMzgsMTEyLDkxLDEwMCwzMiwyMywyMSwxOCw2MSw5LDcxLDI5LDIzLDEwMiwxMSwxMTQsNDcsNjAsNCwxMDcsMzgsMTcsODgsODQsMTIyLDI1LDcxLDU5LDEsMzcsODYsNTMsOSwzOSwyMCw0NSw1MywxNyw4OCw2NiwxMjIsMTQsOTMsMzksOTQsNTAsNjksMTI2LDQyLDM0LDcsNTMsMzIsMTAsMTQsODYsNTksNSw5NCwxMTgsOTUsMTAyLDkyLDUzLDU2LDMzLDIyLDMzLDU3LDExLDI5LDQzLDYxLDQsODcsNDksMSwxMyw4NSwxMTQsMTEzLDExMiw3MCwxMTgsMTAxLDg0LDY2LDc1LDEwNyw5MCwwLDk5LDY3LDExMiw3LDExNCwxMDMsMTEyLDIyLDU0LDMyLDQ0LDMwLDkwLDk4LDcyLDIsMTEwLDY2LDExNiw0LDk3LDExNSw5Nyw2OCwxMTgsOTksODIsNzQsNzYsMTEwLDgwLDY4LDQ5LDE3LDEyNiw4LDUxLDEyNSwxMDYsMjAsMzUsNTAsODcsNzIsNzcsMTExLDkwLDgxLDk2LDY3LDExNyw0LDUyLDQxLDQ5LDE5LDExMywxMTQsMjQ=";
function decode(r) {
  typeof r != "string" && (r = r.toString());
  let t,
    e,
    o,
    s = {},
    i = 0,
    c = 0,
    f = "",
    a = String.fromCharCode,
    n = r.length;
  for (t = 0; 64 > t; t++)
    s[
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(
        t
      )
    ] = t;
  for (e = 0; n > e; e++)
    for (t = s[r.charAt(e)], i = (i << 6) + t, c += 6; c >= 8; )
      ((o = 255 & (i >>> (c -= 8))) || n - 2 > e) && (f += a(o));
  return f;
}
function decrypt(r, t) {
  return decode(t)
    .split(",")
    .map(function (e, o) {
      return String.fromCharCode(e ^ r.charCodeAt(Math.floor(o % r.length)));
    })
    .join("");
}
self.proctortrack = { vtKey, vtDecrypt: decrypt };
