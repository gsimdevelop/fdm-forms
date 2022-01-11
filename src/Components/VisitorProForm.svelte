<script>
  import Modal from '../ui/Modal.svelte'
  import Overlay from '../ui/Overlay.svelte'

  import { objToWWWForm, validateNIF, serializeForm } from '../services/utils'

  import { _ } from '../services/i18n'

  const ESP_COUNTRY = 'ESP'
  const getCountries = async () => {
    const response = await fetch('/gestioninterna/funciones/paises.php');
    return await response.json();
  }
  
  const getFields = async () => {
    const response = await fetch('/gestioninterna/funciones/sectores.php');
    return await response.json();
  }
  
  const getProvinces = async () => {
    const response = await fetch('/gestioninterna/funciones/provincias.php');
    return await response.json();
  }

  let formDatas = { selectedCountry: ESP_COUNTRY, nif: '', passport: '', 
                      business: { name: '', city: '', cp: '', address: '', province: '',
                      email: '', phone: '', web: '', sector: '' }}
  
  let step = 0

  let overlay = false, modal = false, correoDetected = ''

  let nVisitors = '1'

  $: formDatas.nif = formDatas.nif.toUpperCase()
  $: formDatas.passport = formDatas.passport.toUpperCase()
  $: validNIF = validateNIF(formDatas.nif, formDatas.passport)
  $: formDatas.business.province =  formDatas.selectedCountry === ESP_COUNTRY ? 
                                    formDatas.business.cp.length === 5        ?
                                    formDatas.business.cp.substring(0, 2)     : 
                                    formDatas.business.province               :
                                    formDatas.business.province
  $: visitorsArray = [...Array(Number(nVisitors))].map((_e,i) => i+1)

  const changeNacion = () => {
    if(formDatas.selectedCountry === ESP_COUNTRY)
      formDatas.passport = ''
    else
      formDatas.nif = ''
  }

  const charsCIF = (evt) => {
    const charCode = (evt.which) ? evt.which : evt.keyCode
    if(charCode != 13 && (charCode < 48 || (charCode > 57 && charCode < 65) || (charCode > 90 && charCode < 97) || (charCode > 122)))
      evt.preventDefault()
  }

  const charsNumbers = (evt) => {
    const charCode = (evt.which) ? evt.which : evt.keyCode
    if(charCode != 13 && (charCode < 48 || charCode > 57))
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

  const sendForm = async form => {
    form.preventDefault()
    let formObject = serializeForm(new FormData(form.target))
    formDatas.visitors = visitorsArray.map(v => {
      return {
        name: formObject[`visitor-name-${v}`],
        nif: formObject[`visitor-nif-${v}`],
        email: formObject[`visitor-email-${v}`],
        phone: formObject[`visitor-phone-${v}`],
        born: formObject[`visitor-born-${v}`],
        job: formObject[`visitor-job-${v}`]
      }
    })
    let result = await fetch('/gestioninterna/visitantes/newVisitor.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({...formDatas})
    })
    if(result.ok && result.status === 200) {
      result = await result.json()
      if(result.status === 0) {
        alert('Visita registrada con éxito\nIdentificadores de los visitantes registrados:\n'+result.data.map(d => d.id+'\n'))
        window.location.href = '/gestioninterna/visitantes/visitantes.php'
      } else
        alert('Error al registrar la visita')
    } else
      alert('Error al enviar los datos')
  }
</script>
<Overlay display={overlay}/>
<Modal bind:display={modal} title={$_('visitorPro.modalCode.title')} cancelText={$_('visitorPro.modalCode.cancel')} acceptText={$_('visitorPro.modalCode.accept')}
  on:cancel={cancelSendData} on:accept={acceptSendData}>
  {$_('visitorPro.modalCode.body1')} <strong>{correoDetected}</strong>.
  {$_('visitorPro.modalCode.body2')}
</Modal>
<form class="headForm" on:submit|preventDefault={submitNIF}>
  <div class="input-group">
    <label for="nacionalidad" required>{$_('visitorPro.headForm.fiscalCountry')}</label>
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
  </div>
  <div class="input-group">
    {#if formDatas.selectedCountry === ESP_COUNTRY}
    <label for="nif" required>{$_('visitorPro.headForm.nif')}</label>
    <div class="input-btn-next">
      <input id="nif" type="text" name="nif" bind:value={formDatas.nif} on:keypress={charsCIF} required disabled={step !== 0} maxlength="15"/>
      <button class="next btn-s" disabled={!validNIF} type={step === 0 ? "submit" : "button"} class:selected={step > 0} on:click={nextClick}>
        <i class="fas" class:fa-arrow-right={step === 0} class:fa-close={step !== 0}></i>
      </button>
    </div>
    {:else}
    <label for="pasprt" required>Id. fiscal empresa</label>
    <div class="input-btn-next">
      <input id="pasprt" type="text" name="pasprt" bind:value={formDatas.passport} on:keypress={charsCIF} required disabled={step !== 0} maxlength="15"/>
      <button class="next btn-s" disabled={!validNIF} type={step === 0 ? "submit" : "button"} class:selected={step > 0} on:click={nextClick}>
        <i class="fas" class:fa-arrow-right={step === 0} class:fa-close={step !== 0}></i>
      </button>
    </div>
    {/if}
  </div>
</form>
{#if step === 2}
<form class="code" on:submit|preventDefault={sendCode}>
  <input id="codeRecover" type="text" placeholder={$_('visitorPro.codeForm.placeholderGetCode')} minlength="3" maxlength="10" name="code"/>
  <button class="next btn-s" disabled={!validNIF} class:selected={step > 0}>
    <i class="fas fa-arrow-right"></i>
  </button>
</form>
{/if}
{#if step === 1}
<form  on:submit|preventDefault={sendForm}>
  <section class="business-section">
    <h2>{$_('visitorPro.companySection.title')}</h2>
    <div class="input-group">
      <label for="business-name" required>{$_('visitorPro.companySection.name')}</label>
      <input id="business-name" type="text" bind:value={formDatas.business.name} maxlength="300" required/>
    </div>
    
    <div class="input-group">
      <label for="business-email" required>{$_('visitorPro.companySection.mail')}</label>
      <input id="business-email" type="email" bind:value={formDatas.business.email} maxlength="300" required/>
    </div>

    <div class="input-group">
      <label for="business-cp" required>{$_('visitorPro.companySection.zipCode')}</label>
      <input id="business-cp" on:keypress={charsNumbers} pattern="[0-9]+" 
            minlength={formDatas.selectedCountry === ESP_COUNTRY ? 5 : 3} 
            maxlength={formDatas.selectedCountry === ESP_COUNTRY ? 5 : 10} 
            type="text" bind:value={formDatas.business.cp} required/>
    </div>
    
    {#if formDatas.selectedCountry === ESP_COUNTRY}
    <div class="input-group">
      <label for="business-province-esp" required>{$_('visitorPro.companySection.province')}</label>
      <select id="business-province-esp" type="text" bind:value={formDatas.business.province} required>
        <option value="" disabled></option>
        {#await getProvinces() then provincias}
        {#each Object.keys(provincias) as idProvincia}
        <option value="{idProvincia}" selected={formDatas.business.sector===idProvincia}>{provincias[idProvincia]}</option>
        {/each}
        {/await}
      </select>
    </div>
    {:else}
    <div class="input-group">
      <label for="business-province" required>{$_('visitorPro.companySection.province')}</label>
      <input id="business-province" type="text" bind:value={formDatas.business.province} maxlength="300" required/>
    </div>
    {/if}

    <div class="input-group">
      <label for="business-city" required>{$_('visitorPro.companySection.city')}</label>
      <input id="business-city" type="text" bind:value={formDatas.business.city} maxlength="300" required/>
    </div>

    <div class="input-group">
      <label for="business-phone" required>{$_('visitorPro.companySection.phone')}</label>
      <input id="business-phone" type="text" bind:value={formDatas.business.phone} maxlength="20" required/>
    </div>
    
    <div class="input-group">
      <label for="business-address" required>{$_('visitorPro.companySection.address')}</label>
      <input id="business-address" type="text" bind:value={formDatas.business.address} maxlength="300" required/>
    </div>

    <div class="input-group">
      <label for="business-web">{$_('visitorPro.companySection.web')}</label>
      <input id="business-web" type="text" bind:value={formDatas.business.web} maxlength="400"/>
    </div>

    <div class="input-group">
      <label for="business-sector" required>{$_('visitorPro.companySection.sector')}</label>
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
    <h2>{$_('visitorPro.visitorSection.title')}</h2>
    <div class="input-group number-visitors">
      <label for="visitors-name" required>{$_('visitorPro.visitorSection.visitorNumberSelector')}</label>
      <select name="nVisitors" id="nVisitors" bind:value={nVisitors}>
        <option value="1" selected>1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
        <option value="6">6</option>
        <option value="7">7</option>
        <option value="8">8</option>
        <option value="9">9</option>
        <option value="10">10</option>    
      </select>
    </div>
    {#each visitorsArray as indexVisitor}
    <section class="visitor-section" id="visitor-{indexVisitor}">
      <h3>{$_('visitorPro.visitorSection.visitor')} {indexVisitor}</h3>
      <div class="input-group">
        <label for="visitor-name-{indexVisitor}" required>{$_('visitorPro.visitorSection.name')}</label>
        <input id="visitor-name-{indexVisitor}" name="visitor-name-{indexVisitor}" type="text" maxlength="300" required/>
      </div>
    
      <div class="input-group">
        <label for="visitor-nif-{indexVisitor}" required>{$_('visitorPro.visitorSection.nifPassport')}</label>
        <input id="visitor-nif-{indexVisitor}" name="visitor-nif-{indexVisitor}" type="text" maxlength="15" required/>
      </div>

      <div class="input-group">
        <label for="visitor-email-{indexVisitor}" required>{$_('visitorPro.visitorSection.mail')}</label>
        <input id="visitor-email-{indexVisitor}" name="visitor-email-{indexVisitor}" type="email" maxlength="300" required/>
      </div>
      <div class="input-group">
        <label for="visitor-phone-{indexVisitor}" required>{$_('visitorPro.visitorSection.phone')}</label>
        <input id="visitor-phone-{indexVisitor}" name="visitor-phone-{indexVisitor}" type="text" maxlength="20" required/>
      </div>

      <div class="input-group">
        <label for="visitor-born-{indexVisitor}" required>{$_('visitorPro.visitorSection.bornDate')}</label>
        <input id="visitor-born-{indexVisitor}" name="visitor-born-{indexVisitor}" type="date" required/>
      </div>
      
      <div class="input-group">
        <label for="visitor-job-{indexVisitor}" required>{$_('visitorPro.visitorSection.job')}</label>
        <input id="visitor-job-{indexVisitor}" name="visitor-job-{indexVisitor}" type="text" maxlength="300" required/>
      </div>

    </section>
    {/each}
  </section>
  <button type="submit">{$_('visitorPro.sendButton')}</button>
</form>
{/if}
<style>

  form.code {
    display: flex;
    justify-content: center;
    max-width: 300px;
    margin: auto;
  }

  .next {
    max-width: 50px;
    display: flex;
    justify-content: center;
    margin: 0 0 0.5em 0;
  }

  form.headForm {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: repeat(2, 1fr);
    grid-column-gap: 5px;
    grid-row-gap: 10px;
    margin: 2rem auto;
    width: 90%;
  }

  label {
    display: flex;
    justify-content: right;
    align-items: center;
    margin-bottom: 0.5em;
    text-align: right;
  }

  .input-btn-next {
    display: flex;
    width: 100%;
    max-width: 400px;
  }

  #nacionalidad { grid-area: 1 / 2 / 2 / 4; }
  
  #nif:focus-visible, #pasprt:focus-visible, #codeRecover:focus-visible {
    outline: none;
  }

  #nif, #pasprt {
    border-right: none;
  }

  @media(min-width: 768px) {
    form.headForm {
      max-width: 850px;
    }
  
  } 
  
</style>
