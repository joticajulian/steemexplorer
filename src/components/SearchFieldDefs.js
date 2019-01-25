export default [
  {
    name: '__handle',
    titleClass: 'center aligned',
    dataClass: 'center aligned'
  },
  {
    name: '__checkbox',
    title: 'Select<br/>Document<br/>',
    titleClass: 'center aligned',
    dataClass: 'center aligned'
  },
  {
    name: 'author',
    title: 'OAM Name',
    sortField: 'author',
  }, 
  {
    name: 'issuer_name_identifier',
    title: 'Issuer Name',
    sortField: 'issuer_name',
  }, 
  {
    name: 'home_member_state',
    title: 'HMS',
    sortField: 'home_member_state'
  }, 
  {
    name: 'document_language',
    title: 'Document<br/>language',
    sortField: 'document_language'
  },
  {
    name: 'disclosure_date',
    title: 'Disclosure<br/>date',
    sortField: 'disclosure_date',
    callback: 'formatDate|DD/MM/YYYY'
  },
  {
    name: 'submission_date',
    title: 'Submission<br/>date',
    sortField: 'submission_date',
    callback: 'formatDate|DD/MM/YYYY'
  },
  {
    name: 'financial_year',
    title: 'Financial<br/>year',
    sortField: 'financial_year',
  },
  {
    name: 'comment',
    title: 'Document Title',
  },
  {
    name: 'subclass_label',
    title: 'Document<br>Subclass',
  },
  {
    name: 'revised',
    title: 'Revised<br/>Document?',
    callback: 'formatBoolean'
    
  },
  {
    name: '__slot:actions',
    title: 'Actions:<br/>View/Download',
    titleClass: 'center aligned',
    dataClass: 'center aligned',
  }
]
