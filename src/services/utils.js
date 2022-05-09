const objToWWWForm = (obj) => {
  let form = ''
  for (let key in obj) {
    if(typeof(obj[key]) === 'object')
      form += `${key}=[${objToWWWForm(obj[key])}]&`
    else
      form += `${key}=${obj[key]}&`
  }
  return form.slice(0, -1)
}

const ESP_COUNTRY = 'ESP'

const nifRegex = /^([0-9]{8})([A-Z])$/i
const nieRegex = /^([A-Z])([0-9]{7})([A-Z])$/i
const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const urlRegex = /^((https?|ftp|smtp):\/\/)?(www.)?[a-z0-9]+\.[a-z]+(\/[a-zA-Z0-9#]+\/?)*$/

const mapNifNie = 'trwagmyfpdxbnjzsqvhlcke'

const mapNumberNie = { X: 0, Y: 1, Z: 2 }

const validateNIF = (nif, passport) => {
  const cifRegex = /^([ABCDEFGHJKLMNPQRSUVW])(\d{7})([0-9A-J])$/
  // const psprtRegex = /^[A-Z]{3}[0-9]{6}[A-Z]?$/i

  if(nif !== '') {
    const nifObj = nif.match(nifRegex)
    if(nifObj)
      return mapNifNie[Number(nifObj[1]) % 23] === nifObj[2].toLowerCase()

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
  } else if(passport !== '')
    return passport.length > 2
  return false
}

const validateNIF_NIE = nif_nie => {
  if(nif_nie === '')
    return false
  const nifMatch = nif_nie.match(nifRegex)
  if (nifMatch)
    return mapNifNie[Number(nifMatch[1]) % 23] === nifMatch[2].toLowerCase()
  const nieMatch = nif_nie.match(nieRegex)
  if (nieMatch) {
    const letter = nieMatch[1]
    const number = mapNumberNie[letter.toUpperCase()] + nieMatch[2]
    const letterControl = nieMatch[3]
    return letter === mapNifNie[Number(number) % 23] === letterControl.toLowerCase()
  }
  return false
}

const serializeForm = function (formData) {
	const obj = {};
	for (let key of formData.keys())
		obj[key] = formData.get(key);
	return obj;
}

const objRepeats = arr => {
  const objReduce = arr.reduce((acc, val, index) => {
    if(acc[val]) {
        acc[val].count = acc[val].count + 1
        acc[val].visitors.push(index)
    } else 
        acc[val] = { count: 1, visitors: [index]}
    return acc
  }, {})
  return Object.keys(objReduce).filter(e => objReduce[e].count > 1).map(e => objReduce[e].visitors).flat()
}

const validateVisitorForm = ({ selectedCountry, nif, passport, business, visitors }) => {
  const errors = {}
  const { name: nameBusiness, city: cityBusiness, cp: cpBusiness, province: provinceBusiness,
          email: emailBusiness, phone: phoneBusiness, web, sector } = business
  if(emailBusiness.match(emailRegex) == null)
    errors.emailBusiness = 'visitor.visitorForm.companySection.error.email'
  if (web !== '' && web.match(urlRegex) == null)
    errors.web = 'visitor.visitorForm.companySection.error.urlWeb'
  const nifVisitors = visitors.map(visitor => visitor.nif)
  const nifVisitorsRepeats = objRepeats(nifVisitors)
  if (nifVisitorsRepeats.length > 0) {
    errors.visitors = []
    nifVisitorsRepeats.forEach(e => {
      errors.visitors[e] = 'visitor.visitorForm.visitorsSection.error.repeatedNif'
    })
  } else {
    if (nifVisitors.some(e => e !== '' && !validateNIF_NIE(e))) {
      errors.visitors = []
      nifVisitors.forEach((e, i) => {
        if(!validateNIF_NIE(e))
          errors.visitors[i] = 'visitor.visitorForm.visitorsSection.error.invalidNif'
      })
    }
  }  
    // .reduce((acc, nif) => {
    //   acc[nif] = acc[nif] != undefined ? acc[nif] + 1 : 1
    //   return acc
    // }, {})
    
  visitors.forEach(visitor => {
    const { name: nameVisitor, nif: nifVisitor, passport: passportVisitor, country: countryVisitor,
            email: emailVisitor, phone: phoneVisitor, job: jobVisitor } = visitor   
    
  })

  return errors === {} ? null : errors
}

let countries
const getCountries = async () => {
  if(!countries) {
    const response = await fetch('/gestioninterna/funciones/paises.php')
    countries = await response.json()
  }
  return countries
}

let provinces
const getProvinces = async () => {
  if (!provinces) {
    const response = await fetch('/gestioninterna/funciones/provincias.php');
    provinces = await response.json();
  }
  return provinces
}

const translateCountry = async country => (await getCountries())[country]

const translateProvince = async province => (await getProvinces())[province]

const getFields = async () => {
  const response = await fetch('/gestioninterna/funciones/sectores.php');
  return await response.json();
}


export {
  objToWWWForm, validateNIF, serializeForm, ESP_COUNTRY, validateVisitorForm,
  getCountries, getProvinces, translateCountry, translateProvince, getFields
}