# eftg-send

This tool provides a way to publish new reports in the EFTG Blockchain using Node.js. Use it as an alternative of the manual registration needed for the [website](https://eftg.eu).

Installation
----------

Install [npm](https://www.npmjs.com/get-npm) and [Node.js](https://nodejs.org/en/)

To check if you have Node.js installed, run this command in your terminal
```
node -v
```
To check if you have npm installed, run this command
```
npm -v
```

Download this repository (eftg-send) and run
```
npm install
```
How to use
----------

The data to upload must me formatted in a JSON format, using the schema defined in this file: data.json.

Save the file in eftg-send/data.json

For example:

```
  {
    "filename":          "../../test_files/POST_RI2017.pdf",
    "issuer_name":       "Post Telecom PSF S.A.",
    "home_member_state": "LU", // Full list of countries at https://cdn.blkcc.xyz/home_member_states.json
    "identifier_type":   "LEI",// Full list of types at https://cdn.blkcc.xyz/identifier.json
    "identifier_value":  "549300HODTJUIOVE3C26",
    "subclass":          101, // Full list of subclasses at https://cdn.blkcc.xyz/class_subclass_tree.json
    "disclosure_date":   "2013-12-31T12:00:00",
    "submission_date":   "2013-12-31T12:00:00",
    "type_submission":   "first", //Can be only "first" or "revised"
    "document_language": "en", // Full list of languages at https://cdn.blkcc.xyz/lang.json
    "title":             "Annual Financial Report Post 2013",
    "financial_year":    2013
  }
```

Open the file `config.js` and set your username and password.

!!! Use only the provided account type: contry_code-busX  (example: rou-bus1) !!! 
```
// Authentication
const username = 'country_code-busX'
const password = 'your password'
```

Save the changes, and run in the terminal
```
node send.js
```
If it works properly, it will send the documents and show a message like this
```
New document published!! [1/2]
permlink: @oamname/7l8x3o-annual-financial-report-post-2017
New document published!! [2/2]
permlink: @oamname/psxwx-annual-financial-report-post-2018
```
