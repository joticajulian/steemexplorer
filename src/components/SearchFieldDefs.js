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
    name: 'oam_name',
    title: 'OAM Name',
    sortField: 'oam_name',
  }, 
  {
    name: 'issuer_name_identifier',
    title: 'Issuer Name',
    sortField: 'issuer_name',
  }, 
  {
    name: 'home_member_state_name',
    title: 'Company Country',
    sortField: 'home_member_state'
  }, 
  {
    name: 'document_language_name',
    title: 'Language',
    sortField: 'document_language'
  },
  {
    name: 'disclosure_date',
    title: 'Disclosure date',
    sortField: 'disclosure_date',
    callback: 'formatDate|DD/MM/YYYY'
  },
  {
    name: 'financial_year',
    title: 'Financial year',
    sortField: 'financial_year',
  },
  {
    name: 'comment',
    title: 'Document Title',
    sortField: 'title',
  },
  {
    name: '__slot:actions',
    title: 'Actions',
    titleClass: 'center aligned',
    dataClass: 'center aligned',
  }
]