# eftg-send

This tool provides a way to publish new reports in the EFTG Blockchain using Node.js. Use it as an alternative of the manual registration needed for the [website](https://pulsar.blkcc.xyz).

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
Open the file `config.js` and set your username and posting key
```
// Authentication
const username = 'your username'
const password = 'your posting key'
```

Open `send.js` to define the metadata and report to upload
```
// File to upload
const filename = '../POST_RI2017.pdf'

// Metadata
const issuer_name       = 'Post Telecom PSF S.A.'
const home_member_state = 'LU'
const identifier_id     = 4 //ISIN. Check IDs at https://cdn.blkcc.xyz/identifier.json
const identifier_value  = '549300HODTJUIOVE3C26'
const subclass          = 3 //Annual Financial report. Check classes and subclasses at https://cdn.blkcc.xyz/class_subclass_tree.json
const disclosure_date   = '2017-12-31T12:00:00' //format yyyy-mm-ddTHH:mm:ss
const document_language = 'en' // https://cdn.blkcc.xyz/lang.json
const title             = 'Groupe Post Luxembourg Rapport Integre 2017'
const financial_year    = '2017'
const tags              = [
                            'annual-financreport', // https://cdn.blkcc.xyz/class_subclass_tree.json
                            issuer_name,
                            home_member_state,
                            identifier_value
                          ]
```
Save the changes, and run in the terminal
```
node send.js
```
It it works properly it will show a message like this
```
New report published!!
permlink: @jga/5dq03j-groupe-post-luxembourg-rapport-integre-2017
link pdf: https://cdn.blkcc.xyz/DQmd1JYzCSdgPWVeskymUqsgZwbaMKLws8VS59ehfm9HxPR/POST_RI2017.pdf
```
