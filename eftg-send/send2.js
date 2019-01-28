const dsteem = require('eftg-dsteem')
const eftgSend = require('./eftg-send.js')
const config = require('./config.js')

const username = config.username
const privKey = dsteem.PrivateKey.fromString(config.password)

const title = 'Test'

data = [
  {
    filename:          '../../test_files/POST_RI2017.pdf',
    issuer_name:       'Post Telecom PSF S.A.',
    home_member_state: 'LU',
    identifier_id:     4, //ISIN. Check IDs at https://cdn.blkcc.xyz/identifier.json
    identifier_value:  '549300HODTJUIOVE3C26',
    subclass:          3, //Annual Financial report. Check classes and subclasses at https://cdn.blkcc.xyz/class_subclass_tree.json
    subclassTag:       'annual-financreport',
    disclosure_date:   '2017-12-31T12:00:00', //format yyyy-mm-ddTHH:mm:ss
    document_language: 'en', // https://cdn.blkcc.xyz/lang.json
    title:             title+'1',
    financial_year:    '2017'
  },{
    filename:          '../../test_files/POST_RI2017.pdf',
    issuer_name:       'Post Telecom PSF S.A.',
    home_member_state: 'LU',
    identifier_id:     4, //ISIN. Check IDs at https://cdn.blkcc.xyz/identifier.json
    identifier_value:  '549300HODTJUIOVE3C26',
    subclass:          3, //Annual Financial report. Check classes and subclasses at https://cdn.blkcc.xyz/class_subclass_tree.json
    subclassTag:       'annual-financreport',
    disclosure_date:   '2017-12-31T12:00:00', //format yyyy-mm-ddTHH:mm:ss
    document_language: 'en', // https://cdn.blkcc.xyz/lang.json
    title:             title+'2',
    financial_year:    '2017'
  },{
    filename:          '../../test_files/POST_RI2017.pdf',
    issuer_name:       'Post Telecom PSF S.A.',
    home_member_state: 'LU',
    identifier_id:     4, //ISIN. Check IDs at https://cdn.blkcc.xyz/identifier.json
    identifier_value:  '549300HODTJUIOVE3C26',
    subclass:          3, //Annual Financial report. Check classes and subclasses at https://cdn.blkcc.xyz/class_subclass_tree.json
    subclassTag:       'annual-financreport',
    disclosure_date:   '2017-12-31T12:00:00', //format yyyy-mm-ddTHH:mm:ss
    document_language: 'en', // https://cdn.blkcc.xyz/lang.json
    title:             title+'3',
    financial_year:    '2017'
  },{
    filename:          '../../test_files/POST_RI2017.pdf',
    issuer_name:       'Post Telecom PSF S.A.',
    home_member_state: 'LU',
    identifier_id:     4, //ISIN. Check IDs at https://cdn.blkcc.xyz/identifier.json
    identifier_value:  '549300HODTJUIOVE3C26',
    subclass:          3, //Annual Financial report. Check classes and subclasses at https://cdn.blkcc.xyz/class_subclass_tree.json
    subclassTag:       'annual-financreport',
    disclosure_date:   '2017-12-31T12:00:00', //format yyyy-mm-ddTHH:mm:ss
    document_language: 'en', // https://cdn.blkcc.xyz/lang.json
    title:             title+'4',
    financial_year:    '2017'
  },
  
]

eftgSend.publishOneTrx(data, username, privKey)