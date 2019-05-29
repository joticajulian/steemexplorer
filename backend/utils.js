function validateUser(user) {
  if(!user.name) throw new Error('No name defined')
  if(!user.email) throw new Error('No email defined')
  if(!user.password) throw new Error('No password defined')
  if(!user.role) throw new Error('No role defined')
  
  switch(user.role) {
    case 'student':
    case 'admin':
      break
    default:
      throw new Error('Role '+user.role+' does not exists')
  }
  return user
}

function validateSubject(subject) {
  if(!subject.name) throw new Error('No name defined')
  return subject
}

module.exports = {
  validateUser,
  validateSubject
}