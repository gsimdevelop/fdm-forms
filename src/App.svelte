<script context='module'>
  import { setupI18n } from './services/i18n'
  setupI18n()
</script>

<script>
	import Navigator from './Components/Navigator.svelte'
	import Footer from './Components/Footer.svelte'
	import VisitorForm from './VisitorForm.svelte'
	import ExpositorForm from './ExpositorForm.svelte'
	import RegisterForm from './RegisterForm.svelte'
	import RegisterExpositorForm from './RegisterExpositorForm.svelte'
	import { _ } from './services/i18n'

	const formVisitorStr = '#Visitor'
	const formExpositorStr = '#Expositor'
	const formRegisterStr = '#Register'
	const formRegisterExpoStr = '#RegisterExpo'
	$: formSelected = document.location.hash
</script>

<Navigator bind:formSelected/>
<main>
	{#if formSelected===formExpositorStr}
	<ExpositorForm/>
	{:else if formSelected===formVisitorStr}
	<VisitorForm/>
	{:else if formSelected===formRegisterStr}
	<RegisterForm/>
	{:else if formSelected===formRegisterExpoStr}
	<RegisterExpositorForm/>
	{:else}
	<h2>{$_('landingPage.title')}</h2>
	<a href={formExpositorStr}><button on:click={() => formSelected = formExpositorStr}>{$_('landingPage.formExpo')}</button></a>
	<a href={formVisitorStr}><button on:click={() => formSelected = formVisitorStr}>{$_('landingPage.formVisitor')}</button></a>
	{/if}
</main>
<Footer/>
<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: none;
		margin: 0 auto;
	}
 
	@media (max-width: 640px) {
		main {
			width: 100%;
			padding: 0;
		}
	} 
</style>