/**
 * VALIDATE
 */

function crossValidationDisclosureDateFinancialYear(who, disclosure_date, financial_year){
  try{
    var discDate = new Date(disclosure_date + 'Z')
    var yearDisc = discDate.getFullYear()
  }catch(error){
    if(who === 'disclosure_date') return { valid: false, message: 'Invalid date format, use dd/mm/yyyy' }
    if(who === 'financial_year') return { valid: true, message: 'No error' }
  }

  if(financial_year != yearDisc - 1 && financial_year != yearDisc) {
    return {
      valid: false,
      message: 'Please check financial year('+financial_year+') and disclosure date('+yearDisc+')'
    }        
  }

  return { valid: true, message: 'No error'}      
}
    
function crossValidationDisclosureDateSubmissionDate(who, disclosure_date, submission_date){
  try{
    var discDate = new Date(disclosure_date + 'Z')
  }catch(error){
    if(who === 'disclosure_date') return { valid: false, message: 'Invalid date format, use dd/mm/yyyy' }
    if(who === 'submission_date') return { valid: true, message: 'No error' }
  }

  try{
    var submDate = new Date(submission_date + 'Z')
  }catch(error){
    if(who === 'disclosure_date') return { valid: true, message: 'No error' }
    if(who === 'submission_date') return { valid: false, message: 'Invalid date format, use dd/mm/yyyy' }
  }

  if(discDate > submDate) {
    return {
      valid: false,
      message: 'Submission date should be after disclosure date'
    }          
  }

  return {valid: true, message: 'No error'}
}

/**
 * Validate issuer name
 */
function validateIssuerName(issuer_name) {
  if (typeof issuer_name !== 'string') throw new Error('The issuer name is not a string')
  if (issuer_name.length == 0 ) throw new Error('The issuer name is empty')
  if (issuer_name.length > 200) throw new Error('The issuer name is too long')
  return true
}

/**
 * Validate home member state
 */
function validateHomeMemberState(home_member_state, dic) {
  if (typeof home_member_state !== 'string') throw new Error('The home member state is not a string')
  if (home_member_state.length == 0 ) throw new Error('The home member state is empty')
  if ( !dic.find( (hms)=>{return hms.code === home_member_state} ) )
    throw new Error('The home member state '+home_member_state+' can not be recognized')
  return true
}

/**
 * Validate identifier id
 */
function validateIdentifierId(identifier_id, dic) {
  if (typeof identifier_id !== 'number') throw new Error('The identifier id is not a number')
  if ( !dic.find( (identifier)=>{return identifier.id == identifier_id} ) )  
    throw new Error('The identifier id '+identifier_id+' can not be recognized')
  return true
}

/**
 * Validate identifier
 */
function validateIdentifierType(type, dic) {
  if (typeof type !== 'string') throw new Error('The identifier is not a string')
  if (type.length == 0 ) throw new Error('The identifier type is empty')
  if ( !dic.find( (identifier)=>{return identifier.type === type} ) )  
    throw new Error('The identifier '+type+' can not be recognized')
  return true
}

/**
 * Validate identifier value
 */
function validateIdentifierValue(identifier_value, identifier_type, dic_id, dic_hms) {
  if (typeof identifier_value !== 'string') throw new Error('The identifier value is not a string')
  if (identifier_value.length == 0 ) throw new Error('The identifier value is empty')
  if (identifier_value.length <  3 ) throw new Error('The identifier value is too short')

  validateIdentifierType( identifier_type, dic_id )
  var type = dic_id.find( (identifier)=>{return identifier.type === identifier_type} )
    
  switch (type) {
    case 'LEI':
      if (identifier_value.length !== 20)
        throw new Error('Legal Entity Identifier must have 20 characters')
      break
    case 'VAT':
      break
    case 'RegistrationNumber':
      break
    case 'ISIN':
      if (identifier_value.length !== 12)
        throw new Error('ISIN number must have 12 characters')
      if (!dic_hms.find( (hms)=>{return hms.code === identifier_value.substring(0,2)} ) )
        throw new Error('ISIN number must starts with the country code')
      break
    default:
      break
  }
  return true
}

/**
 * Validate subclass
 */
function validateSubclass(subclass, dic) {
  if (typeof subclass !== 'number') throw new Error('The subclass is not a number')
  if ( !dic.find( (c)=>{return c.id == subclass || c.subclass.find( (subc)=>{return subc.id == subclass})} ) )
    throw new Error('The subclass '+subclass+' can not be recognized') 
  return true
}


function validateISOformatDate(d) {
  if (typeof d !== 'string') throw new Error('The date is not a string')
  var date = new Date(d + 'Z')
  if(d !== date.toISOString().slice(0, -5))
    throw new Error('Incorrect ISO datetime format')
  return true
}

/**
 * Validate disclosure date
 */
function validateDisclosureDate(disclosure_date, submission_date, financial_year = null ) {
  if (typeof disclosure_date !== 'string') throw new Error('The disclosure date is not a string')
  validateISOformatDate(disclosure_date)
  
  if(new Date(disclosure_date + 'Z') > new Date()) //prevent future dates
    throw new Error('Disclosure date should be today or earlier')

  if(financial_year != null) {
    var validation = crossValidationDisclosureDateFinancialYear('disclosure_date', disclosure_date, financial_year)
    if(!validation.valid)
      throw new Error(validation.message)
  }

  var validation = crossValidationDisclosureDateSubmissionDate('disclosure_date', disclosure_date, submission_date)
  if(!validation.valid)
    throw new Error(validation.message)
  return true
}

/**
 * Validate submission date
 */
function validateSubmissionDate(submission_date, disclosure_date) {
  if (typeof submission_date !== 'string') throw new Error('The submission date is not a string')
  validateISOformatDate(submission_date)

  if(new Date(submission_date + 'Z') > new Date()) //prevent future dates
    throw new Error('Submission date should be today or earlier')
  var validation = crossValidationDisclosureDateSubmissionDate('submission_date', disclosure_date, submission_date)
  if(!validation.valid)
    throw new Error(validation.message)
  return true
}

/**
 * Validate storage date
 */
function validateStorageDate(storage_date) {
  if (typeof storage_date !== 'string') throw new Error('The storage date is not a string')
  validateISOformatDate(storage_date)

  return true
}

/**
 * Validate document language
 */
function validateDocumentLanguage(document_language, dic) {
  if (typeof document_language !== 'string') throw new Error('The document language is not a string')
  if (document_language.length == 0 ) throw new Error('The document language is empty')
  if ( !dic[document_language] )  
    throw new Error('The document language '+document_language+' can not be recognized')
  return true  
}

/**
 * Validate title
 */
function validateTitle(title) {
  if (typeof title !== 'string') throw new Error('The title is not a string')
  if (title.length == 0 ) throw new Error('The title is empty')
  return true
}

/**
 * Validate financial year
 */
function validateFinancialYear(financial_year, disclosure_date) {
  if (typeof financial_year !== 'number') throw new Error('The financial year is not a number')
  if(financial_year > (new Date()).getFullYear()) //prevent future dates
    throw new Error('Financial year should be current year or earlier')                                 

  var validation = crossValidationDisclosureDateFinancialYear('financial_year', disclosure_date, financial_year)
  if(!validation.valid)
    throw new Error(validation.message)
  return true
}

/**
 * Validate file
 */
function validateFile(file, serverConfig) {
  if(file.size > this.serverConfig.maximum_file_size)
    throw new Error('Maximum upload file size: '+serverConfig.maximum_file_size+' Bytes')
  return true
}

/**
 * Validate type submission
 */
function validateTypeSubmission(type) {
  if(type !== 'first' && type !== 'revised')
    throw new Error('Incorrect type of submission')
  return true
}

//module.exports = {
export default {
  validateIssuerName,
  validateHomeMemberState,
  validateIdentifierType,
  validateIdentifierId,
  validateIdentifierValue,
  validateSubclass,
  validateDisclosureDate,
  validateSubmissionDate,
  validateStorageDate,
  validateDocumentLanguage,
  validateTitle,
  validateFinancialYear,
  validateFile,
  validateTypeSubmission
}
