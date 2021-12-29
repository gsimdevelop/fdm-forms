const objToWWWForm = (obj) => {
  let form = ''
  for(let key in obj) {
    form += `${key}=${obj[key]}&`
  }
  return form.slice(0, -1)
}


const validateNIF = (nif, passport) => {
  const nifRegex = /^([0-9]{8})([A-Z])$/i
  const cifRegex = /^([A-Z])([0-9]{7})([A-HK-NPQS0-9])$/i
  const psprtRegex = /^[A-Z]{3}[0-9]{6}[A-Z]?$/i
  const mapNif = 'trwagmyfpdxbnjzsqvhlcke'

  if(nif !== '') {
    const nifObj = nif.match(nifRegex)
    if(nifObj)
      return mapNif[Number(nifObj[1]) % 23] === nifObj[2].toLowerCase()

    const cifObj = nif.match(cifRegex)
    if(cifObj) {
      if('kpqs'.includes(cifObj[1].toLowerCase()))
        return isNaN(cifObj[3])
      if('abeh'.includes(cifObj[1].toLowerCase()))
        return !isNaN(cifObj[3])
      return true
    }
    else
      return false
  } else {
    return passport.match(psprtRegex) !== null
  }
}

export { objToWWWForm, validateNIF }