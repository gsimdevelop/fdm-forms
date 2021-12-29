<script>
  import Modal from '../ui/Modal.svelte'
  import Overlay from '../ui/Overlay.svelte'

  import { objToWWWForm, validateNIF } from '../services/utils'

  const ESP_COUNTRY = 'ESP'
  const getCountries = async () => {
    const response = await fetch('/gestioninterna/funciones/paises.php');
    return await response.json();
  }
  
  const getFields = async () => {
    const response = await fetch('/gestioninterna/funciones/sectores.php');
    return await response.json();
  }

  let formDatas = {selectedCountry: ESP_COUNTRY, nif: '', passport: '', business: {name: '', city: '', cp: '', address: '',
                   email: '', phone: '', web: '', sector: null}}
  
  let step = 0

  let overlay = false, modal = false, correoDetected = ''

  $: formDatas.nif = formDatas.nif.toUpperCase()
  $: formDatas.passport = formDatas.passport.toUpperCase()
  $: validNIF = validateNIF(formDatas.nif, formDatas.passport)

  const changeNacion = () => {
    if(formDatas.selectedCountry === ESP_COUNTRY)
      formDatas.passport = ''
    else
      formDatas.nif = ''
  }

  const caracteresCIF = (evt) => {
    const charCode = (evt.which) ? evt.which : evt.keyCode
    if(charCode != 13 && (charCode < 48 || (charCode > 57 && charCode < 65) || (charCode > 90 && charCode < 97) || (charCode > 122)))
      evt.preventDefault()
  }

  const submitNIF = async () => {
    if(formDatas.nif === '') {
      step = 1
    } else {
      let oldVisitor = await fetch('/gestioninterna/visitantes/visitanteProfesional.php?prove=true', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: objToWWWForm({
          nif: formDatas.nif,
          passport: formDatas.passport
        })
      })
      if(oldVisitor.ok && oldVisitor.status === 200) {
        oldVisitor = await oldVisitor.json()
        if(oldVisitor.status === 1) {
          modal = overlay = true
          step = 1
          correoDetected = oldVisitor.data
        } else
          step = 1
      } else 
        step = 1
    }
  }

  const nextClick = e => {
    if(step > 0) {
      step = 0;
      e.preventDefault()
    } else if (step < 0)
      e.preventDefault()
  }

  const loadData = async () => {
    overlay = true
    try {
      let codeSended = await fetch('/gestioninterna/visitantes/sendCode.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: objToWWWForm({
          nif: formDatas.nif
        })
      })
      if(codeSended.status === 200) {
        codeSended = await codeSended.json()
        if(codeSended.status === 0) {
          modal = true
          step = 2
          alert("Código enviado con éxito")
        } else
          alert("error al enviar el código")
      } else
        alert("error al enviar el código")
    } catch (error) {
      alert('Error al enviar el código')
    } finally {
      overlay = false
    }
  }
  
  const sendCode = async e => {
    const formData = new FormData(e.target)
    const code = formData.get('code')
    overlay = true
    try {
      let codeSended = await fetch('/gestioninterna/visitantes/sendCode.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: objToWWWForm({
          nif: formDatas.nif,
          code
        })
      })
      if(codeSended.status === 200) {
        codeSended = await codeSended.json()
          formDatas.business = {
            name: codeSended.data.empresa,
            city: codeSended.data.poblacion,
            cp: codeSended.data.cp,
            address: codeSended.data.direccion,
            email: codeSended.data.email,
            phone: codeSended.data.telf,
            web: codeSended.data.web,
            sector: codeSended.data.sector
          }
      } else
        alert("error al enviar el código")
    } catch (error) {
      alert('Error al enviar el código')
    } finally {
      overlay = false
      step = 1
    }
  }

  const acceptSendData = () => {
    modal = overlay = false
    loadData()
    step = 2
  }

  const cancelSendData = () => {
    modal = overlay = false
    step = 1
  }
</script>
<Overlay display={overlay}/>
<Modal bind:display={modal} title="Recuperar datos" cancelText="Cancelar" acceptText="Sí, cargar datos"
  on:cancel={cancelSendData} on:accept={acceptSendData}>
  Hemos detectado datos para este CIF/NIF asociados al correo <strong>{correoDetected}</strong>.
  ¿Desea restaurarlos? Se le enviará un código a la dirección de correo para cargarlos.
</Modal>
<form class="headForm" on:submit|preventDefault={submitNIF}>
  <label for="nacionalidad" required>País fiscal empresa</label>
  <select id="nacionalidad" type="text" name="nacionalidad" bind:value={formDatas.selectedCountry} on:change={changeNacion} required disabled={step !== 0}>
    {#await getCountries() then countries}
    {#each Object.keys(countries) as code}
    <option value="{code}" selected={formDatas.selectedCountry===code}>{countries[code]}</option>
    {/each}
    {:catch}
    <option value="ESP" selected={formDatas.selectedCountry==="ESP"}>ESPAÑA</option>
    <option value="FRA" selected={formDatas.selectedCountry==="FRA"}>FRANCIA</option>
    {/await}
  </select>
  {#if formDatas.selectedCountry === ESP_COUNTRY}
  <label for="nif" required>NIF/CIF</label>
  <input id="nif" type="text" name="nif" bind:value={formDatas.nif} on:keypress={caracteresCIF} required disabled={step !== 0}/>
  {:else}
  <label for="pasprt" required>Id. fiscal empresa</label>
  <input id="pasprt" type="text" name="pasprt" bind:value={formDatas.passport} on:keypress={caracteresCIF} required disabled={step !== 0}/>
  {/if}
  <button class="next btn-s" disabled={!validNIF} type={step === 0 ? "submit" : "button"} class:selected={step > 0} on:click={nextClick}>
    <i class="fas" class:fa-arrow-right={step === 0} class:fa-close={step !== 0}></i>
  </button>
</form>
{#if step === 2}
<form class="code" on:submit|preventDefault={sendCode}>
  <input type="text" placeholder="Introduce el código" min="6" max="6" name="code"/>
  <button class="next btn-s" disabled={!validNIF} class:selected={step > 0}>
    <i class="fas fa-arrow-right"></i>
  </button>
</form>
{/if}
{#if step < 2}
<section class="business-section">
  <h2>DATOS EMPRESA</h2>
  <label for="business-name" required>Nombre de empresa</label>
  <input class="span-3" id="business-name" type="text" bind:value={formDatas.business.name} required/>
  
  <label for="business-email" required>Correo electrónico</label>
  <input class="span-3" id="business-email" type="email" bind:value={formDatas.business.email} required/>

  <label for="business-cp" required>Código postal</label>
  <input id="business-cp" type="text" bind:value={formDatas.business.cp} required/>

  <label for="business-city" required>Ciudad</label>
  <input class="span-2" id="business-city" type="text" bind:value={formDatas.business.city} required/>

  <label for="business-phone" required>Teléfono</label>
  <input class="span-2" id="business-phone" type="text" bind:value={formDatas.business.phone} required/>
  
  <label for="business-address" required>Dirección</label>
  <input class="span-3" id="business-address" type="text" bind:value={formDatas.business.address} required/>

  <label for="business-web">Página web</label>
  <input class="span-3" id="business-web" type="text" bind:value={formDatas.business.web}/>

  <label for="business-sector" required>Sector</label>
  <select class="span-3" id="business-sector" bind:value={formDatas.business.sector} required>
    {#await getFields() then fields}
    {#each Object.keys(fields) as idField}
    <option value="{idField}" selected={formDatas.business.sector===idField}>{fields[idField]}</option>
    {/each}
    {:catch}
    <!--<option value="ESP" selected={formDatas.selectedCountry==="ESP"}>ESPAÑA</option>
    <option value="FRA" selected={formDatas.selectedCountry==="FRA"}>FRANCIA</option>-->
    {/await}

  </select>
</section>
{/if}
<style>

  form.code {
    display: flex;
    justify-content: center;
  }

  .next {
    max-width: 50px;
    display: flex;
    justify-content: center;
    margin: 0 0 0.5em 1em;
  }

  form.headForm {
    display: grid;
    grid-template-columns: 0.5fr repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
    grid-column-gap: 5px;
    grid-row-gap: 10px;
    margin: 2rem auto;
    max-width: 80%;
  }

  label {
    display: flex;
    justify-content: right;
    align-items: center;
    margin-bottom: 0.5em;
    text-align: right;
  }

  #nacionalidad { grid-area: 1 / 2 / 2 / 4; } 

  /* #nif, #pasprt { text-transform: uppercase; } */
  
  @media(min-width: 768px) {
    form.headForm {
      max-width: 850px;
    }
  
  } 
  
</style>
