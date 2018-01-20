const ST = require("../../st")
const result = ST.transform({
  "rows": {
    "{{#each items}}": {
      "row_number": "{{$index}}",
      "columns": {
        "{{#each this}}": {
          "content": "{{this}}",
          "column_number": "{{$index}}"
        }
      }
    }
  }
}, {
  "items": [['a,','b','c','d','e'], [1,2,3,4,5]]
});
console.log(JSON.stringify(result, null, 2));
