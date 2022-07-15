<script>
import { onMount } from "svelte"
import { getExpositors } from "./services/expositors";

import Overlay from './ui/Overlay.svelte';
import Modal from './ui/Modal.svelte'

let expositores = [], modalLoginState = false
onMount(async () => {
  const res = await fetch('/gestioninterna/comprobar.php')
  const text = await res.text()
  if (text.split('|')[0] === 'no') {
    modalLoginState = true
  }
  expositores  = await getExpositorsThisYear()
})

let allExpositores

const getExpositorsThisYear = async () => {
  const response = await getExpositors({ano: new Date().getFullYear()})
  allExpositores = response.expositores
  return allExpositores
          .reduce((acc, val) =>
            acc.some(i => i.id === val.id) ?
              acc :
              [...acc, val], [])
          .sort((i1, i2) => i1.empresa.localeCompare(i2.empresa) || i1.rfids_associated - i2.rfids_associated)
}

const getExpositorRfidsThisYear = async (expositorId) => {
  const response = await getExpositors({rfid: expositorId,ano: new Date().getFullYear()})
  return response.rfids
}

const postRfid = async () => {

  let urlEncoded = new URLSearchParams()
  urlEncoded.append('rfid', rfidId)
  urlEncoded.append('expositor', openExpo)
  urlEncoded.append('ano', new Date().getFullYear())
  const response = await fetch('/gestioninterna/fichajes/asociar_rfid_expositor.php', {
    method: 'POST',
    body: urlEncoded
  })

  if(response.status !== 200) {
    const resJson = await response.json()
    alert('Error al asociar el RFID: ' + resJson.error)
  } else {
    rfids.push({id: rfidId, expositor: openExpo, ano: new Date().getFullYear()})
    rfids = rfids
    expositores.find(i => i.id === openExpo).rfids_associated++
    expositores = expositores
    rfidId = undefined
  }
}

const openExpositor = expoId => async () => {
  if(openExpo === expoId) return

  rfidId = undefined
  openExpo = expoId
  rfids = await getExpositorRfidsThisYear(expoId)
}

let openExpo = false, rfidId = undefined

let rfids = []

</script>

<Modal title="Debe registrarse" cancelText={false} acceptText={'Ir al registro'} on:cancel={() => modalLoginState = false}
  on:accept={() => window.location.href = '/gestioninterna/login.php?path=/forms&hash=RegisterExpo'} display={modalLoginState}
  focusAccept>
  Debe registrarse como usuario para completar esta acción
</Modal>
<Overlay display={modalLoginState}/>

<section class="expositores">
  {#each expositores as expositor (expositor.id)}
  <article class="expo-rfid" on:click={openExpositor(expositor.id)} class:open-expo={openExpo === expositor.id}>
    <p class="name">{expositor.empresa}</p>
    <p class="rfids" class:red-text={expositor.nTarjetas < expositor.rfids_associated} class:yellow-text={expositor.nTarjetas > expositor.rfids_associated} 
       class:green-text={expositor.nTarjetas === expositor.rfids_associated}>
      RFIDs asociados: {expositor.rfids_associated}/{expositor.nTarjetas}
    </p>
    {#if openExpo === expositor.id}
      <div class="expo-rfid-content">
        <form class="form-rfid" on:submit|preventDefault={postRfid}>
          <input type="text" bind:value={rfidId} placeholder="INGRESA UN CODIGO RFID" required  maxlength="16" style="max-width: 250px;margin: 0">
          <button type="submit" class="btn-s">OK</button>
        </form>
        {#if rfids.length > 0}
        <div class="rfids-saved">
          {#each rfids as rfid (rfid.id)}
            <p>{rfid.id}</p>
          {/each}
        </div>
        {/if}
      </div>
    {/if}
  </article>
  {/each}
</section>

<style>
section.expositores {
  display: flex;
  flex-direction: column;
  gap: 20px;

}

.expo-rfid {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  border: var(--red-color) 1px solid;
  border-radius: 7px;
  padding: 0 15px;
  justify-content: space-between;
}

.expo-rfid:not(.open-expo):hover {
  background-color: #ca041133;
  cursor: pointer;
}

.expo-rfid-content {
 grid-column: span 2;
}

.rfids-saved {
  border-top: solid 1px var(--red-color);
}

.expo-rfid-content > form > input {
 text-align: center;
}

.expo-rfid-content > form {
  position: relative;
  margin: 10px 0;
}

.expo-rfid-content > form > button {
  margin: 0;
}

.form-rfid {
  display: flex;
  justify-content: center;
}

.yellow-text {
  color: #ffd700;
}

.red-text {
  color: #ca0411;
}

.green-text {
  color: #12ca45;
}

</style>