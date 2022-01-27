<script>
  import Modal from './ui/Modal.svelte'
  import Overlay from './ui/Overlay.svelte'
  import { _ } from './services/i18n.js'
  import { validateNIF, objToWWWForm, ESP_COUNTRY, getCountries, getProvinces, translateCountry, translateProvince } from './services/utils.js'
  import { printExpositorPDF } from './services/jsPDFGenerator.js'
  

  let step = 0
  let overlay = false, modal = false, modal2 = false, correoDetected = ''
  let formDatas = { 
    nameCompany: '', 
    selectedCountry: ESP_COUNTRY, 
    nif: '', 
    passport: '',
    email: '', 
    province: '',
    city: '',
    cp: '',
    phone: '', 
    address: '',
    web: '',
    contactPerson: '', 
    contactPersonPhone: '',
    contactPersonEmail: '',
    options: {
      stand48: false,
      stand64: false,
      freeFloor: false,
      painting: false,
      cleaning: false,
      carpet: false,
    }
  }

  $: formDatas.nif = formDatas.nif.toUpperCase()
  $: formDatas.passport = formDatas.passport.toUpperCase()
  $: validNIF = validateNIF(formDatas.nif, formDatas.passport)
  $: formDatas.province = formDatas.selectedCountry === ESP_COUNTRY ? 
                                   formDatas.cp.length === 5        ?
                                   formDatas.cp.substring(0, 2)     : 
                                   formDatas.province               :
                                   formDatas.province

  const submitNIF = async () => {
    if(formDatas.nif === '') {
      step = 1
    } else {
      let oldVisitor = await fetch('/gestioninterna/expositores/expositorExist.php?prove=true', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: objToWWWForm({
          nif: formDatas.nif
        })
      })
      if(oldVisitor.ok && oldVisitor.status === 200) {
        oldVisitor = await oldVisitor.json()
        if(oldVisitor.status === 1) {
          modal = overlay = true
          correoDetected = oldVisitor.data
        } else
          step = 1
      } else 
        step = 1
    }
  }

  const charsCIF = (evt) => {
    const charCode = (evt.which) ? evt.which : evt.keyCode
    if(charCode != 13 && (charCode < 48 || (charCode > 57 && charCode < 65) || (charCode > 90 && charCode < 97) || (charCode > 122)))
      evt.preventDefault()
  }

  const nextClick = e => {
    if(step > 0) {
      step = 0;
      e.preventDefault()
    } else if (step < 0)
      e.preventDefault()
  }
  
  const changeNacion = () => {
    if(formDatas.selectedCountry === ESP_COUNTRY)
      formDatas.passport = ''
    else
      formDatas.nif = ''
  }

  const acceptSendData = () => {
    modal = overlay = false
    loadData()
    step = 2
  }

  const loadData = async () => {
    overlay = true
    try {
      let codeSended = await fetch('/gestioninterna/expositores/sendCode.php', {
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

  const cancelSendData = () => {
    modal = overlay = false
    step = 1
  }

  const sendCode = async e => {
    const formData = new FormData(e.target)
    const code = formData.get('code')
    overlay = true
    try {
      let codeSended = await fetch('/gestioninterna/expositores/sendCode.php', {
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
        if(codeSended.status !== 0) {
          step = 1
          return
        }
        formDatas.nameCompany = codeSended.data.empresa
        formDatas.city = codeSended.data.poblacion
        formDatas.cp = codeSended.data.cp
        formDatas.address = codeSended.data.direccion
        formDatas.email = codeSended.data.email
        formDatas.phone = codeSended.data.telf
        formDatas.web = codeSended.data.web
        formDatas.sector = codeSended.data.sector
        formDatas.province = codeSended.data.provincia
        formDatas.contactPerson = codeSended.data.representante
        formDatas.contactPersonPhone = codeSended.data.telf2
        formDatas.contactPersonEmail = codeSended.data.emailRepresentante
      } else
        alert("error al enviar el código")
    } catch (error) {
      alert('Error al enviar el código')
    } finally {
      overlay = false
      step = 1
    }
  }

  const charsNumbers = (evt) => {
    const charCode = (evt.which) ? evt.which : evt.keyCode
    if(charCode != 13 && (charCode < 48 || charCode > 57))
      evt.preventDefault()
  }

  const sendForm = async () => {
    console.log({formDatas});
    let newExpositor = await fetch('/gestioninterna/expositores/nuevoExpositor.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formDatas)
      })

    let nuevoExpositorId
    if(newExpositor.ok && newExpositor.status === 200) {
      const result = await newExpositor.json()
      if(result.status === 0) {
        overlay = true
        modal2 = true
        nuevoExpositorId = result.newId
      } else {
        alert('Error al crear el expositor')
        return
      }
    } else {
      alert('Error al crear el expositor')
      return
    }

    const printData = {...formDatas}

    if(formDatas.selectedCountry === ESP_COUNTRY) {
      printData.passport = ''
      printData.province = await translateProvince(formDatas.province)
    }
    else
      printData.nif = ''
    printData.selectedCountry = await translateCountry(formDatas.selectedCountry)

    let pdf = btoa(printExpositorPDF(printData))

    await fetch('/gestioninterna/expositores/pdfExpositor.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({pdf, name: `expositor_${nuevoExpositorId}.pdf`, email: formDatas.email})
    })
  }
</script>

<Overlay display={overlay}/>
<Modal bind:display={modal} title={$_('visitor.visitorPro.modalCode.title')} cancelText={$_('visitor.visitorPro.modalCode.cancel')} acceptText={$_('visitor.visitorPro.modalCode.accept')}
  on:cancel={cancelSendData} on:accept={acceptSendData}>
  {$_('visitor.visitorPro.modalCode.body1')} <strong>{correoDetected}</strong>.
  {$_('visitor.visitorPro.modalCode.body2')}
</Modal>

<Modal bind:display={modal2} title={$_('expositor.finalModal.title')} cancelText={$_('expositor.finalModal.reload')} 
       acceptText={$_('expositor.finalModal.return')}
  on:cancel={() => window.location.reload()} on:accept={() => window.location.href="https://feriayecla.com"}>
  {$_('expositor.finalModal.body')} {formDatas.email}
</Modal>

<form class="headForm" on:submit|preventDefault={submitNIF}>
  <div class="input-group">
    <label for="nacionalidad" required>{$_('visitor.visitorPro.headForm.fiscalCountry')}</label>
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
    <label for="nif" required>{$_('visitor.visitorPro.headForm.nif')}</label>
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
  <input id="code" type="text" placeholder={$_('visitor.visitorPro.codeForm.placeholderGetCode')} minlength="3" maxlength="10" name="code"/>
  <button class="next btn-s" disabled={!validNIF} class:selected={step > 0}>
    <i class="fas fa-arrow-right"></i>
  </button>
</form>
{:else if step === 1}
<form  on:submit|preventDefault={sendForm}>
  <section class="business-section">
    <h2>{$_('visitor.visitorPro.companySection.title')}</h2>
    <div class="input-group span-2">
      <label for="business-name" required>{$_('visitor.visitorPro.companySection.name')}</label>
      <input id="business-name" type="text" bind:value={formDatas.nameCompany} maxlength="300" required/>
    </div>
    
    <div class="input-group">
      <label for="business-email" required>{$_('visitor.visitorPro.companySection.mail')}</label>
      <input id="business-email" type="email" bind:value={formDatas.email} maxlength="300" required/>
    </div>

    <div class="input-group">
      <label for="business-cp" required>{$_('visitor.visitorPro.companySection.zipCode')}</label>
      <input id="business-cp" on:keypress={charsNumbers} pattern="[0-9]+" 
            minlength={formDatas.selectedCountry === ESP_COUNTRY ? 5 : 3} 
            maxlength={formDatas.selectedCountry === ESP_COUNTRY ? 5 : 10} 
            type="text" bind:value={formDatas.cp} required/>
    </div>
    
    {#if formDatas.selectedCountry === ESP_COUNTRY}
    <div class="input-group">
      <label for="business-province-esp" required>{$_('visitor.visitorPro.companySection.province')}</label>
      <select id="business-province-esp" type="text" bind:value={formDatas.province} required>
        <option value="" disabled></option>
        {#await getProvinces() then provincias}
        {#each Object.keys(provincias) as idProvincia}
        <option value="{idProvincia}" selected={formDatas.province===idProvincia}>{provincias[idProvincia]}</option>
        {/each}
        {/await}
      </select>
    </div>
    {:else}
    <div class="input-group">
      <label for="business-province" required>{$_('visitor.visitorPro.companySection.province')}</label>
      <input id="business-province" type="text" bind:value={formDatas.province} maxlength="300" required/>
    </div>
    {/if}

    <div class="input-group">
      <label for="business-city" required>{$_('visitor.visitorPro.companySection.city')}</label>
      <input id="business-city" type="text" bind:value={formDatas.city} maxlength="300" required/>
    </div>

    <div class="input-group">
      <label for="business-phone" required>{$_('visitor.visitorPro.companySection.phone')}</label>
      <input id="business-phone" type="text" bind:value={formDatas.phone} maxlength="20" required/>
    </div>
    
    <div class="input-group">
      <label for="business-address" required>{$_('visitor.visitorPro.companySection.address')}</label>
      <input id="business-address" type="text" bind:value={formDatas.address} maxlength="300" required/>
    </div>

    <div class="input-group">
      <label for="business-web">{$_('visitor.visitorPro.companySection.web')}</label>
      <input id="business-web" type="text" bind:value={formDatas.web} maxlength="400"/>
    </div>
    
    <div class="input-group">
      <label for="contact-name" required>{$_('visitor.visitorPro.companySection.contactName')}</label>
      <input id="contact-name" type="text" bind:value={formDatas.contactPerson} maxlength="20" required/>
    </div>
    
    <div class="input-group">
      <label for="contact-phone" required>{$_('visitor.visitorPro.companySection.contactPhone')}</label>
      <input id="contact-phone" type="tel" bind:value={formDatas.contactPersonPhone} maxlength="15" required/>
    </div>

    <div class="input-group">
      <label for="contact-email" required>{$_('visitor.visitorPro.companySection.contactEmail')}</label>
      <input id="contact-email" type="email" bind:value={formDatas.contactPersonEmail} maxlength="200"/>
    </div>

    </section>
    <section class="options">
      <table>
        <tr>
          <th></th>
          <th></th>
          <th><p>Pago completo</p><p>anterior a 01/03</p></th>
          <th></th>
        </tr>
        <tr>
          <td>
            <label for="seguro" required>
              Seguro <strong style="padding: 0 0.2em">obligatorio</strong> de daños materiales
            </label>
          </td>
          <td>30 €</td>
          <td></td>
          <td><input id="seguro" type="checkbox" checked disabled/></td>
        </tr>
        <tr>
          <td><label for="stand-48">Estand premontado 48m²</label></td>
          <td><label for="stand-48" class="center-flex">45 €/m² (2.160 €)</label></td>
          <td><label for="stand-48" class="center-flex">40 €/m² (1.920 €)</label></td>
          <td><input id="stand-48" type="checkbox" bind:checked={formDatas.options.stand48}/></td>
        </tr>
        <tr>
          <td><label for="stand-64">Estand premontado 64m²</label></td>
          <td><label for="stand-64" class="center-flex">45 €/m² (2.880 €)</label></td>
          <td><label for="stand-64" class="center-flex">40 €/m² (2.560 €)</label></td>
          <td><input id="stand-64" type="checkbox" bind:checked={formDatas.options.stand64}/></td>
        </tr>
        <tr>
          <td><label for="suelo-libre">Suelo libre (obligatorio instalación de tarima con zócalo de ebtre 8 y 10 cm de altura)</label></td>
          <td><label for="suelo-libre" class="center-flex">25 €/m²</label></td>
          <td><label for="suelo-libre" class="center-flex">20 €/m²</label></td>
          <td><input id="suelo-libre" type="checkbox" bind:checked={formDatas.options.freeFloor}/></td>
        </tr>
        <tr>
          <td><label for="pintura">Pintura de estand</label></td>
          <td><label for="pintura" class="center-flex">7,50 €/m²</label></td>
          <td></td>
          <td><input id="pintura" type="checkbox" bind:checked={formDatas.options.painting}/></td>
        </tr>
        <tr>
          <td><label for="limpieza">Limpieza diaria de estand</label></td>
          <td><label for="limpieza" class="center-flex">35 €/día</label></td>
          <td></td>
          <td><input id="limpieza" type="checkbox" bind:checked={formDatas.options.cleaning}/></td>
        </tr>
        <tr>
          <td><label for="moqueta">Moqueta (petición antes del 19-04-22)</label></td>
          <td><label for="moqueta" class="center-flex">6 €/m²</label></td>
          <td></td>
          <td><input id="moqueta" type="checkbox" bind:checked={formDatas.options.carpet}/></td>
        </tr>  
      </table>
      <!--
        <div class="input-group">
          <label for="seguro">Seguro <strong style="padding: 0 0.2em">obligatorio</strong> de daños materiales</label>
          <input id="seguro" type="checkbox" checked disabled/>
        </div>
        <div class="input-group">
          <label for="stand-48">Estand premontado 48m²</label>
          <input id="stand-48" type="checkbox" bind:checked={formDatas.options.stand48}/>
        </div>
        <div class="input-group">
          <label for="stand-64">Estand premontado 64m²</label>
          <input id="stand-64" type="checkbox" bind:checked={formDatas.options.stand64}/>
        </div>
        <div class="input-group">
          <label for="suelo-libre">Suelo libre (obligatorio instalación de tarima con zócalo de ebtre 8 y 10 cm de altura)</label>
          <input id="suelo-libre" type="checkbox" bind:checked={formDatas.options.freeFloor}/>
        </div>
        <div class="input-group">
          <label for="pintura">Pintura de estand</label>
          <input id="pintura" type="checkbox" bind:checked={formDatas.options.painting}/>
        </div>
        <div class="input-group">
          <label for="limpieza">Limpieza diaria de estand</label>
          <input id="limpieza" type="checkbox" bind:checked={formDatas.options.cleaning}/>
        </div>
        <div class="input-group">
          <label for="moqueta">Moqueta (petición antes del 19-04-22)</label>
          <input id="moqueta" type="checkbox" bind:checked={formDatas.options.carpet}/>
        </div> 
      --> 
    </section>
    <div>
      <span>
        <input type="checkbox" id="terms" style="width: inherit;" required/>
        <label for="terms" style="display: inherit;">
          {$_('visitor.visitorPro.companySection.politicPrivacyText')}
        </label>
        <a href="https://feriayecla.com/politica-de-privacidad/" target="_blank">
          {$_('visitor.visitorPro.companySection.politicPrivacy')}
        </a>
      </span>
    </div>
    <footer>
      <button type="submit">{$_('expositor.submitButton')}</button>
    </footer>
</form>
{/if}
<style>
  .center-flex {
    justify-content: center;
  }

  label[for="terms"]::before {
    content: "* ";
    color: var(--red-color);
    margin-left: 0.2em;
  }
  .options {
    max-width: 1500px;
    display: grid;
    justify-content: center;
    margin: auto;
  }

  td > label {
    cursor: pointer;
  }
  th > p {
    margin: 0;
  }
  tr > td:not(:first-child):not(:last-child) {
    font-weight: bold;
  }
  table {
    border-spacing: 2em 10px;
  }

  /* .options > .input-group > input[type=checkbox] {
    width: min-content;
    margin-left: auto;
    margin-bottom: 0px;
  }

  .options > .input-group > label {
    margin-bottom: 0px;
    margin-right: 10px;
    width: 100%;
    text-align: left;
    justify-content: left;
  }

  .options > .input-group {
    flex-direction: row;
    justify-content: center;
    padding: 0.5em;
  }
  
  .options > .input-group:nth-child(2n) {
    background-color: #0001;
  } */

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
  
  #nif:focus-visible, #pasprt:focus-visible, #code:focus-visible {
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