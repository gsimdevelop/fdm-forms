<script context='module'>
  import { setupI18n } from './services/i18n'
  setupI18n()
</script>

<script>
	import Navigator from './Components/Navigator.svelte'
	import VisitorForm from './VisitorForm.svelte'
	import ExpositorForm from './ExpositorForm.svelte'
	import { _ } from './services/i18n'

	const formVisitorStr = '#Visitor'
	const formExpositorStr = '#Expositor'
	$: formSelected = document.location.hash
</script>

<Navigator/>
<main>
	{#if formSelected===formExpositorStr}
	<ExpositorForm/>
	{:else if formSelected===formVisitorStr}
	<VisitorForm/>
	{:else}
	<h2>{$_('landingPage.title')}</h2>
	<a href={formExpositorStr}><button on:click={() => formSelected = formExpositorStr}>{$_('landingPage.formExpo')}</button></a>
	<a href={formVisitorStr}><button on:click={() => formSelected = formVisitorStr}>{$_('landingPage.formVisitor')}</button></a>
	{/if}
</main>
<footer>
		
</footer>
<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: none;
		margin: 0 auto;
	}
/* 
	@media (min-width: 640px) {
		main {
		}
	} */
</style>