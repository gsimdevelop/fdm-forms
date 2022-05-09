import { objToWWWForm } from "./utils"

const getExpositors = async query => {
  const urlBase = '/gestioninterna/expositores/expositoresBusqueda.php';
  const url = query ? `${urlBase}?${objToWWWForm(query)}` : urlBase

  const response = await fetch(url)
  return await response.json()
}

export { getExpositors }