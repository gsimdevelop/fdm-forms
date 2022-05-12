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

  let qrCode, qrInput
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
  
  const cleanVisitor = () => {
    visitor = initVisitor()
    rfid = ''
    step = 0
    qrCode = ''
  }

  const submitQr = async () => {
    if(step === 1) {
      step = 0
      qrCode = ''
      return
    }
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
    datas.id = step === 1 ? qrCode.split('-')[0] : false
    
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

<Modal title="Registro finalizado" cancelText={false} acceptText={'Limpiar formulario'} on:accept={cleanAction} display={modalOkey}
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




<form on:submit|preventDefault={registerCard}>
  <section class="business-section">
    <h2>{$_('visitor.visitorPro.companySection.title')}</h2>
    <div class="input-group">
      <label for="business-name" required>{$_('visitor.visitorPro.companySection.name')}</label>
      <input disabled={step === 1} id="business-name" type="text" bind:value={formDatas.business.name} maxlength="300" required/>
    </div>

    <div class="input-group">
      <label for="business-country" required>{$_('visitor.visitorPro.headForm.fiscalCountry')}</label>
      <select disabled={step === 1} id="business-country" type="text" bind:value={formDatas.selectedCountry} required>
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
      <input disabled={step === 1} id="business-email" type="email" bind:value={formDatas.business.email} maxlength="300" required/>
    </div>

    <div class="input-group">
      <label for="business-cp" required>{$_('visitor.visitorPro.companySection.zipCode')}</label>
      <input disabled={step === 1} id="business-cp" on:keypress={charsAvailable(/[0-9]/)}
            minlength={formDatas.selectedCountry === ESP_COUNTRY ? 5 : 3} 
            maxlength={formDatas.selectedCountry === ESP_COUNTRY ? 5 : 10} 
            type="text" bind:value={formDatas.business.cp} required/>
    </div>
    
    {#if formDatas.selectedCountry === ESP_COUNTRY}
    <div class="input-group">
      <label for="business-province-esp">{$_('visitor.visitorPro.companySection.province')}</label>
      <select disabled={step === 1} id="business-province-esp" type="text" bind:value={formDatas.business.province}>
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
      <input disabled={step === 1} id="business-province" type="text" bind:value={formDatas.business.province} maxlength="300"/>
    </div>
    {/if}

    <div class="input-group">
      <label for="business-city">{$_('visitor.visitorPro.companySection.city')}</label>
      <input disabled={step === 1} id="business-city" type="text" bind:value={formDatas.business.city} maxlength="300"/>
    </div>

    <div class="input-group">
      <label for="business-phone" required>{$_('visitor.visitorPro.companySection.phone')}</label>
      <input disabled={step === 1} id="business-phone" type="text" bind:value={formDatas.business.phone} maxlength="20" required/>
    </div>

    <div class="input-group">
      <label for="business-web">{$_('visitor.visitorPro.companySection.web')}</label>
      <input disabled={step === 1} id="business-web" type="text" bind:value={formDatas.business.web} maxlength="400"/>
    </div>

    <div class="input-group">
      <label for="business-sector" required>{$_('visitor.visitorPro.companySection.sector')}</label>
      <select disabled={step === 1} id="business-sector" bind:value={formDatas.business.sector} required>
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
        <input disabled={step === 1} id="visitor-name" name="visitor-name" bind:value={visitor.name} type="text" maxlength="300" required/>
      </div>

      <div class="input-group">
        <label for="nacionalidad">{$_('visitor.visitorPro.visitorSection.nacionality')}</label>
        <select disabled={step === 1} id="nacionalidad" type="text" name="nacionalidad" bind:value={visitor.country}>
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
          <input disabled={step === 1} id="visitor-nif" class="text-upper" class:invalid={validateNIF(visitor.name, '')}
                 name="visitor-nif" bind:value={visitor.nif} type="text" maxlength="15"/>
        </div>
        {:else}
        <div class="input-group">
          <label for="visitor-passport">{$_('visitor.visitorPro.visitorSection.passport')}</label>
          <input disabled={step === 1} id="visitor-passport" name="visitor-passport" 
                 bind:value={visitor.passport} type="text" maxlength="15"/>
        </div>
      {/if}

      <div class="input-group">
        <label for="visitor-email">{$_('visitor.visitorPro.visitorSection.mail')}</label>
        <input disabled={step === 1} id="visitor-email" name="visitor-email" 
               bind:value={visitor.email} type="email" maxlength="300"/>
      </div>
      <div class="input-group">
        <label for="visitor-phone" required>{$_('visitor.visitorPro.visitorSection.phone')}</label>
        <input disabled={step === 1} id="visitor-phone" name="visitor-phone" 
               bind:value={visitor.phone} type="text" maxlength="20" required/>
      </div>
      
      <div class="input-group">
        <label for="visitor-job" required>{$_('visitor.visitorPro.visitorSection.job')}</label>
        <input disabled={step === 1} id="visitor-job" name="visitor-job" 
               bind:value={visitor.job} type="text" maxlength="300" required/>
      </div>
    </section>
  </section>

  <section class="rfid-section">
    <label for="rfid" required>Tarjeta RFID</label>
    <input id="rfid" bind:value={rfid} name="rfid" type="text" style="width: 250px; margin: 0" bind:this={rfidEl} required maxlength="16" />
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
    margin: 10px auto 20px;
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
  
</style>