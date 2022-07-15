<script>
  import { _ } from './services/i18n'
  import { onMount, tick } from 'svelte';
  import { validateNIF, ESP_COUNTRY, getProvinces, getFields, getCountries } from './services/utils'
  import Overlay from './ui/Overlay.svelte';

  import Modal from './ui/Modal.svelte'
  
  onMount(async () => {
    const res = await fetch('/gestioninterna/comprobar.php')
    const text = await res.text()
    if (text.split('|')[0] === 'no') {
      modalLoginState = true
    }
  })

  let qrCode, qrInput, visitorNameInput
  const focusSubmit = e => {
    if(e.target.tagName === 'BODY')
      qrInput.focus()
  }

  const cleanAction = async () => {
    formDatas = initFormData()
    visitor = initVisitor()
    rfid = ''
    step = 0
    qrCode = ''
    modalOkey = false
    await tick()
    qrInput.focus()
  }
  
  const cleanVisitor = async () => {
    visitor = initVisitor()
    rfid = ''
    step = 0
    qrCode = ''
    modalOkey = false
    await tick()
    visitorNameInput.focus()
  }

  const submitQr = async () => {
    console.log(`Has submiteado el siguiente código QR: '${qrCode}'`)
    const res = await fetch('/gestioninterna/visitantes/visitanteProfesional.php?qrCode=' + qrCode)
    const resJson = await res.json()
    if(resJson.status === -1) 
      modalLoginState = true
    else if(resJson.status > 0)
      modal404State = true
    else {

      datasLoad = resJson.visitor
      if(datasLoad.tarjetaRfid) {
        modalVisitorWithRfid = true
      } else 
        loadVisitor()
    }
  }

  let datasLoad

  const loadVisitor = async () => {
    formDatas = { 
      selectedCountry: datasLoad.pais, 
      nif: datasLoad.pais === ESP_COUNTRY ? datasLoad.CIF : '',
      passport: datasLoad.pais === ESP_COUNTRY ? '' : datasLoad.CIF, 
      business: { 
        name: datasLoad.empresa, 
        city: datasLoad.poblacion, 
        cp: datasLoad.cp, 
        province: datasLoad.provincia, 
        email: datasLoad.email, 
        phone: datasLoad.telf,
        web: datasLoad.web, 
        sector: datasLoad.sectorid
      } 
    }
    visitor = {
      name: datasLoad.visitante, country: datasLoad.nacionalidadVisitante, nif: datasLoad.nacionalidadVisitante === ESP_COUNTRY ? datasLoad.nifVisitante : '',
      passport: datasLoad.nacionalidadVisitante === ESP_COUNTRY ? '' : datasLoad.nifVisitante, email: datasLoad.emailVisitante, phone: datasLoad.telf2,
      job: datasLoad.cargo
    }
    step = 1
    rfidEl.focus()
  }

  const registerCard = async () => {
    const datas = {
      company: formDatas,
      visitor,
      rfid
    }
    datas.id = (step === 1 && (!findedVisitor || yearVisitorSubmit == (new Date()).getFullYear())) ? 
                  qrCode.split('-')[0] : 
                  false
    findedVisitor = false
    yearVisitorSubmit = 0
    console.log({datas})
    const res = await fetch('/gestioninterna/visitantes/registrarRfid.php', {
      method: 'POST',
      body: JSON.stringify(datas)
    })
    const resJson = await res.json()
    if(resJson.status > 0) {
      modalOkey = {
        msg: resJson.msg,
      }
    } else {
      modalError = resJson.error || 'Ha habido un error insertando el visitante'
    }
  }

  const toggleModalLogin = value => modalLoginState = value
  const toggleModal404 = value => modal404State = value
  let modalLoginState = false
  let modal404State = false
  let modalOkey = false
  let modalError = false
  let modalVisitorWithRfid = false


  const charsAvailable = charsAvailable => evt => {
    const charCode = (evt.which) ? evt.which : evt.keyCode
    if(charCode === 13)
      return
    const char = evt.key
    if(!charsAvailable.test(char))
      evt.preventDefault()
  }

  let step = 0

  const initFormData = () => ({ 
      selectedCountry: ESP_COUNTRY, nif: '', passport: '', 
      business: { 
        name: '', city: '', cp: '', province: '', email: '', phone: '', web: '', sector: '' 
      }
    })
  const initVisitor = () => ({ 
      name: '', country: '', nif: '', passport: '', email: '', phone: '', job: ''
    })
  let visitor = initVisitor()
  let formDatas = initFormData()
  let rfid = '', rfidEl

  $: formDatas.business.province = formDatas.selectedCountry === ESP_COUNTRY ? 
                                   formDatas.business.cp.length === 5        ?
                                   String(Number(formDatas.business.cp.substring(0, 2)))     : 
                                   formDatas.business.province               :
                                   formDatas.business.province


  let findedVisitor = false                                   
  let yearVisitorSubmit
  const findVisitorSubmit = async (visitorId, yearVisitor = 0) => {
    qrCode = visitorId
    findedVisitor = true
    yearVisitorSubmit = yearVisitor || 0
    await submitQr()
    findVisitor = false
    visitorsFinded = []
    textSearchVisitor = ''
  }

  let textSearchVisitor = ''
  let timeoutFind
  const findInputVisitor = (time = 1500) => {
    if(textSearchVisitor.length < 3)
      return
    if(timeoutFind)
      clearTimeout(timeoutFind)
    timeoutFind = setTimeout(() => {
      let search = textSearchVisitor
      fetch('/gestioninterna/visitantes/buscador_visitantes.php?search=' + search)
        .then(response => response.json())
        .then(response => {
          visitorsFinded = response.visitors
        })
    }, time);
  }
  let findVisitor = false, findInput, visitorsFinded = []
</script>
<Modal title="Debe registrarse" cancelText={false} acceptText={'Ir al registro'} on:cancel={() => toggleModalLogin(false)}
  on:accept={() => window.location.href = '/gestioninterna/login.php?path=/forms&hash=Register'} display={modalLoginState}
  focusAccept>
  Debe registrarse como usuario para completar esta acción
</Modal>

<Modal title="No encontrado" cancelText={false} acceptText={'Aceptar'} on:accept={() => toggleModal404(false)} display={modal404State}
        focusAccept>
  El código introducido no corresponde con ningún visitante
</Modal>

<Modal title="Ya registrado" cancelText={'Cancelar'} acceptText={'Cargar de nuevo'} 
  on:cancel={() => { datasLoad = undefined; modalVisitorWithRfid = false }} 
  on:accept={() => { loadVisitor(); modalVisitorWithRfid = false }} display={modalVisitorWithRfid}
        focusAccept>
  El visitante ya tiene una tarjeta RFID asociada. ¿Desea cargarlo para asociar una nueva?
</Modal>

<Modal title="Registro finalizado" cancelText={"Limpiar visitante"} acceptText={'Limpiar formulario'} on:accept={cleanAction} on:cancel={cleanVisitor} display={modalOkey}
        focusAccept>
  El visitante se registró correctamente
  <br>
  {modalOkey.msg}
</Modal>

<Modal title="Error en el registro" cancelText={false} acceptText={'Aceptar'} on:accept={() => modalError = false} display={modalError}
        focusAccept>
  {modalError}
</Modal>

<Overlay display={modal404State || modalOkey || modalError || modalLoginState || modalVisitorWithRfid}/>

{#if findVisitor}
  <Overlay display on:click={() => findInput.focus()}/>
  <form id="find-vis" on:submit|preventDefault={() => findInputVisitor(0)}/>
  <form class="modal displayBlock" style="top: 5%; transform: translate(-50%); max-width: 60vw">
    <button class="btn-s close-finded" on:click={() => { textSearchVisitor = ''; visitorsFinded = []; findVisitor = false }}>
      ✖
    </button>
    <label for="text">Buscar por: Nombre de visitante, de empresa, CIF o teléfono</label>
    <input type="text" name="search" id="search-visitor" form="find-vis" bind:this={findInput} bind:value={textSearchVisitor} on:input={() => findInputVisitor()}>
    <ul class="visitors-finded-list">
      {#each visitorsFinded as visitor (visitor.id)}
      <li>
        <span class="name-visitor">Visitante: {visitor.visitante ?? ''}</span>
        <span class="name-company">Empresa: {visitor.empresa ?? ''}</span>
        <span class="id">{visitor.id}</span>
        {#if visitor.CIF}
        <span class="nifs">NIFS: {visitor.CIF ?? ''}</span>
        {/if}
        {#if visitor.telf || visitor.telf2}
        <span class="telfs">TELF: {visitor.telf && visitor.telf2 ? (visitor.telf +'-'+ visitor.telf2) : (visitor.telf || visitor.telf2)}</span>
        {/if}
        <span class="ano">AÑO: {visitor.ano}</span>
        <button class="btn-s button-accept" type="button" on:click={() => findVisitorSubmit(visitor.id, visitor.ano)}>
          CARGAR
        </button>
      </li>
      {/each}
    </ul>
  </form>
{/if}

<div style="display: flex; align-items: center; justify-content: center; position: relative">
  <form on:submit|preventDefault={submitQr} class="form-qr">
    <label for="qr-code">Código  o escáner QR</label>
    <div class="input-btn-next">
      <!-- svelte-ignore a11y-autofocus -->
      <input id="qr-code" placeholder="Código usuario" maxlength="12" bind:value={qrCode} style="text-align: center;" autofocus bind:this={qrInput} 
              on:keypress={charsAvailable(/[0-9-]/)} type="text" pattern="\d+(-\d+)?" disabled={step > 0} required/>
      <button class="next btn-s" disabled={step === 1} type="submit" class:selected={step > 0}>
        <i class="fas" class:fa-arrow-right={step === 0} class:fa-close={step !== 0}></i>
      </button>
    </div>
  </form>

  <button on:click={async () => { findVisitor = true; await tick(); findInput.focus() }} class="btn-s button-find">Buscar visitante</button>
</div>


<form on:submit|preventDefault={registerCard}>
  <section class="business-section">
    <h2>{$_('visitor.visitorPro.companySection.title')}</h2>
    <div class="input-group">
      <label for="business-name" required>{$_('visitor.visitorPro.companySection.name')}</label>
      <input id="business-name" type="text" bind:value={formDatas.business.name} maxlength="300" required/>
    </div>

    <div class="input-group">
      <label for="business-country" required>{$_('visitor.visitorPro.headForm.fiscalCountry')}</label>
      <select id="business-country" type="text" bind:value={formDatas.selectedCountry} required>
        <option value={ESP_COUNTRY} disabled selected>ESPAÑA</option>
        {#await getCountries() then countries}
        {#each Object.keys(countries) as code}
          <option value={code} selected={visitor.country===code}>{countries[code]}</option>
        {/each}
        {/await}
      </select>
    </div>
    
    <div class="input-group">
      <label for="business-email" required>{$_('visitor.visitorPro.companySection.mail')}</label>
      <input id="business-email" type="email" bind:value={formDatas.business.email} maxlength="300" required/>
    </div>

    <div class="input-group">
      <label for="business-cp" required>{$_('visitor.visitorPro.companySection.zipCode')}</label>
      <input id="business-cp" on:keypress={charsAvailable(/[0-9]/)}
            minlength={formDatas.selectedCountry === ESP_COUNTRY ? 5 : 3} 
            maxlength={formDatas.selectedCountry === ESP_COUNTRY ? 5 : 10} 
            type="text" bind:value={formDatas.business.cp} required/>
    </div>
    
    {#if formDatas.selectedCountry === ESP_COUNTRY}
    <div class="input-group">
      <label for="business-province-esp">{$_('visitor.visitorPro.companySection.province')}</label>
      <select id="business-province-esp" type="text" bind:value={formDatas.business.province}>
        <option value="" disabled></option>
        {#await getProvinces() then provincias}
        {#each Object.keys(provincias) as idProvincia}
        <option value="{idProvincia}" selected={formDatas.business.province===idProvincia}>{provincias[idProvincia]}</option>
        {/each}
        {/await}
      </select>
    </div>
    {:else}
    <div class="input-group">
      <label for="business-province">{$_('visitor.visitorPro.companySection.province')}</label>
      <input id="business-province" type="text" bind:value={formDatas.business.province} maxlength="300"/>
    </div>
    {/if}

    <div class="input-group">
      <label for="business-city">{$_('visitor.visitorPro.companySection.city')}</label>
      <input id="business-city" type="text" bind:value={formDatas.business.city} maxlength="300"/>
    </div>

    <div class="input-group">
      <label for="business-phone" required>{$_('visitor.visitorPro.companySection.phone')}</label>
      <input id="business-phone" type="text" bind:value={formDatas.business.phone} maxlength="20" required/>
    </div>

    <div class="input-group">
      <label for="business-web">{$_('visitor.visitorPro.companySection.web')}</label>
      <input id="business-web" type="text" bind:value={formDatas.business.web} maxlength="400"/>
    </div>

    <div class="input-group">
      <label for="business-sector" required>{$_('visitor.visitorPro.companySection.sector')}</label>
      <select id="business-sector" bind:value={formDatas.business.sector} required>
        <option value="" disabled></option>
        {#await getFields() then fields}
        {#each Object.keys(fields) as idField}
        <option value="{idField}" selected={formDatas.business.sector===idField}>{fields[idField]}</option>
        {/each}
        {/await}
    
      </select>
    </div>
  </section>

  <section class="visitors-section">
    <h2>{$_('visitor.visitorPro.visitorSection.title')}</h2>
    <section class="visitor-section" id="visitor">
      <div class="input-group">
        <label for="visitor-name" required>{$_('visitor.visitorPro.visitorSection.name')}</label>
        <input id="visitor-name" name="visitor-name" bind:value={visitor.name} type="text" maxlength="300" required bind:this={visitorNameInput}/>
      </div>

      <div class="input-group">
        <label for="nacionalidad">{$_('visitor.visitorPro.visitorSection.nacionality')}</label>
        <select id="nacionalidad" type="text" name="nacionalidad" bind:value={visitor.country}>
        <option value=''></option>
        {#await getCountries() then countries}
        {#each Object.keys(countries) as code}
          <option value={code} selected={visitor.country===code}>{countries[code]}</option>
        {/each}
        {/await}
      </div>
    
      {#if visitor.country === ESP_COUNTRY}
        <div class="input-group">
          <label for="visitor-nif">{$_('visitor.visitorPro.visitorSection.nif')}</label>
          <input id="visitor-nif" class="text-upper" class:invalid={validateNIF(visitor.name, '')}
                 name="visitor-nif" bind:value={visitor.nif} type="text" maxlength="15"/>
        </div>
        {:else}
        <div class="input-group">
          <label for="visitor-passport">{$_('visitor.visitorPro.visitorSection.passport')}</label>
          <input id="visitor-passport" name="visitor-passport" 
                 bind:value={visitor.passport} type="text" maxlength="15"/>
        </div>
      {/if}

      <div class="input-group">
        <label for="visitor-email">{$_('visitor.visitorPro.visitorSection.mail')}</label>
        <input id="visitor-email" name="visitor-email" 
               bind:value={visitor.email} type="email" maxlength="300"/>
      </div>
      <div class="input-group">
        <label for="visitor-phone" required>{$_('visitor.visitorPro.visitorSection.phone')}</label>
        <input id="visitor-phone" name="visitor-phone" 
               bind:value={visitor.phone} type="text" maxlength="20" required/>
      </div>
      
      <div class="input-group">
        <label for="visitor-job" required>{$_('visitor.visitorPro.visitorSection.job')}</label>
        <input id="visitor-job" name="visitor-job" 
               bind:value={visitor.job} type="text" maxlength="300" required/>
      </div>
    </section>
  </section>

  <section class="rfid-section">
    <label for="rfid" required>Tarjeta RFID</label>
    <input id="rfid" on:keypress={charsAvailable(/[0-9]/)} bind:value={rfid} name="rfid" type="text" style="width: 250px; margin: 0" bind:this={rfidEl} required maxlength="16" />
  </section>
  
  <button type="submit">{$_('visitor.visitorPro.sendButton')}</button>
  <button type="button" on:dblclick={cleanAction}>Limpiar formulario</button>
  <button type="button" on:dblclick={cleanVisitor}>Limpiar datos visitantes</button>

</form>

<svelte:body bind:this={bodyElem} on:click={focusSubmit}></svelte:body>
<style>
  .rfid-section {
    max-width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: baseline;
    gap: 10px;
    margin-bottom: 10px;
  }

  .form-qr {
    display: flex;
    flex-direction: column;
    gap: 5px;
    transform: translateX(-25px);
    max-width: 300px;
  }

  .input-btn-next {
    display: grid;
    grid-template-columns: 50px auto 50px;
  }

  .input-btn-next > * {
    margin: 0;
  }

  .input-btn-next input:focus-visible ~ button {
    outline: var(--red-color) solid 2px;
  }

  #qr-code {
    grid-area: 1 / 2 / 2 / 3;
  }

  .input-btn-next > button {
    grid-area: 1 / 3 / 2 / 4; 
  }

  h2 {
    margin-bottom: 0;
  }

  .close-finded {
    position: absolute;
    top: -10px;
    right: -10px;
    height: 30px;
    width: 30px;
    padding: 0;
    border-radius: 20px;
    margin: 0;
  }

  .visitors-finded-list {
    max-height: 70vh;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    list-style: none;
    padding: 0;
    margin: 5px 0 0 0;
    gap: 5px;
  }

  .visitors-finded-list li:hover {
    background-color: #ca04112e;
  }

  .visitors-finded-list li {
    display: grid;
    grid-template-columns: repeat(6, 1fr) 90px;
    grid-template-rows: 1fr .5fr; 
    grid-column-gap: 0px;
    grid-row-gap: 0px;
    padding-right: 10px;
    justify-items: baseline;
    padding: 5px;
  }
  
  .visitors-finded-list .name-visitor {
    grid-area: 1 / 1 / 2 / 4;
  }
  .visitors-finded-list .name-company {
    grid-area: 1 / 4 / 2 / 7;
  }
  .visitors-finded-list .id {
    grid-area: 2 / 1 / 3 / 2;
    font-size: 10px;
    font-weight: bold;
  }
  .visitors-finded-list .nifs {
    grid-area: 2 / 2 / 3 / 4;
    font-size: 11px;
  }
  .visitors-finded-list .telfs {
    grid-area: 2 / 4 / 3 / 6;
    font-size: 11px;
  }

  .visitors-finded-list .ano {
    grid-area: 2 / 6 / 3 / 7;
    font-size: 11px;
  }

  .visitors-finded-list .button-accept {
    grid-area: 1 / 7 / 3 / 8;
  }

  .button-accept {
    width: 95px;
    height: 30px;
    padding: 0;
    border-radius: 20px;
    margin: 0;
    align-self: center;
  }

  #search-visitor {
    margin: 5px 0;
    max-width: 500px;
  }

  .button-find {
    position: absolute;
    right: 0;
  }


</style>