export default [
  {
    name: '__handle',
    titleClass: 'center aligned',
    dataClass: 'center aligned'
  },
  {
    name: '__checkbox',
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
    title: 'Language',
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
    sortField: 'title',
  },
  {
    name: 'revised',
    title: 'Revised',
    callback: 'formatBoolean'
    
  },
  {
    name: '__slot:actions',
    title: 'Actions',
    titleClass: 'center aligned',
    dataClass: 'center aligned',
  }
]
