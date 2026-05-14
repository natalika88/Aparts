const fs = require("fs");
const path = require("path");

const p = path.join(__dirname, "brif-plain-utf8.txt");
let t = fs.readFileSync(p, "utf8");
if (t.charCodeAt(0) === 0xfeff) t = t.slice(1);

// Split by address sections
const addrMarker = "Объекты по адресу ";
const parts = t.split(addrMarker);
console.log("parts after addrMarker split:", parts.length);
parts.slice(0, 5).forEach((x, i) => {
  console.log("\n--- part", i, "first 200 chars ---");
  console.log(x.slice(0, 200));
});

// Find object boundaries: title seems to be right after "Объект " with digit
// Pattern from sample: "Объект 13-к. квартира" - so "Объект " + number at start of title
const reObj = /Объект (\d+)([^О]*?)(?=Объект \d+|Объекты по адресу |$)/g;
let m;
let n = 0;
while ((m = reObj.exec(t))) {
  n++;
  const id = m[1];
  const body = m[2].slice(0, 120).replace(/\s+/g, " ");
  console.log("OBJ", id, body);
}
console.log("total regex objects:", n);

// Also list avito item URLs
const avito = [...t.matchAll(/https:\/\/www\.avito\.ru\/sankt-peterburg\/kvartiry\/[^\s]+/g)];
console.log("avito listing urls:", avito.length);
avito.slice(0, 25).forEach((x) => console.log(x[0].slice(0, 100)));
