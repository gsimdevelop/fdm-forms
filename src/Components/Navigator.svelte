<script>
  import { setLang, _ } from '../services/i18n';

  const selectLang = lang => () => {
    setLang(lang);
  };

  let rrss = [
    {url: "https://www.facebook.com/pages/Feria-del-Mueble-Yecla/171169179563479?v=wall", icon: "fab fa-facebook-f"},
    {url: "https://twitter.com/FMYecla", icon: "fab fa-twitter"},
    {url: "https://www.youtube.com/user/FeriaYecla", icon: "fab fa-youtube"},
    {url: "https://www.instagram.com/feriadelmuebleyecla", icon: "fab fa-instagram"},
    {url: "https://www.linkedin.com/company/feriamuebleyecla", icon: "fab fab fa-linkedin-in"},
  ]

  const formVisitorStr = '#Visitor'
	const formExpositorStr = '#Expositor'
	const formRegisterStr = '#Register'
  const formRegisterExpoStr = '#RegisterExpo'
  export let formSelected = ''
</script>
{#if !(new RegExp([formRegisterStr, formRegisterExpoStr].join('|')).test(formSelected))}
<nav class="nav-lang">
  <strong style="padding-left: 15px;"> 
    FMY 60′ Edición · 
    {#if formSelected === formExpositorStr}
      <a href="https://feriayecla.com/informacion-para-el-expositor/" target="_blank" class="info underlined">{$_('navigation.expositorsInfo')}</a>
    {:else if formSelected === formVisitorStr}
      <a href="https://feriayecla.com/informacion-general/" target="_blank" class="info underlined">{$_('navigation.visitorsInfo')}</a>
    {/if}
  </strong>
  <ul class="rrss">
    {#each rrss as rs}
    <li>
      <a href={rs.url} target="_blank">
        <span class="rs-span" style="height: 20px;">
          <i class={"rs "+rs.icon}></i>
        </span>
      </a>
    </li>
    {/each}
    <li class="center lang-selector" data-lang="es" style="margin-left: 10px;" on:click={selectLang('es')}>
        <img class="flag" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAALCAIAAAD5gJpuAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAFnSURBVHjaYvzPgAD/UNlYEUAAmuTYAAAQhAEYqF/zFbe50RZ1cMmS9TLi0pJLRjZohAMTGFUN9HdnHgEE1sDw//+Tp0ClINW/f0NIKPoFJH/9//ULyGaUlQXaABBALAx/Gf4zAt31F4i+ffj3/cN/XrFfzOx//v///f//LzACM/79ZmD8/e8TA0AAMYHdDVT958vXP38nMDB0s3x94/Tj5y+YahhiAKLfQKUAAcQEdtJfoDHMF2L+vPzDmFXLelf551tGFOOhev4A/QgQQExgHwAd8IdFT/Wz6j+GhlpmXSOW/2z///8Eq/sJ18Dw/zdQA0AAMQExxJjjdy9x2/76EfLz4MXdP/i+wsyGkkA3Aw3984cBIIAYfzIwMKel/bt3jwEaLNAwgZIQxp/fDH/+MqqovL14ESCAWICeZvr9h0FSEhSgwBgAygFDEMT+wwAhgQgc4kAEVAwQQIxfUSMSTxxDAECAAQAJWke8v4u1tAAAAABJRU5ErkJggg==" title="Español" alt="Español" data-pagespeed-url-hash="2753703692" width="16" height="11"/>
    </li>
    <li class="center lang-selector" data-lang="en" on:click={selectLang('en')}>
        <img class="flag" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAALCAIAAAD5gJpuAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAflJREFUeNpinDRzn5qN3uFDt16+YWBg+Pv339+KGN0rbVP+//2rW5tf0Hfy/2+mr99+yKpyOl3Ydt8njEWIn8f9zj639NC7j78eP//8739GVUUhNUNuhl8//ysKeZrJ/v7z10Zb2PTQTIY1XZO2Xmfad+f7XgkXxuUrVB6cjPVXef78JyMjA8PFuwyX7gAZj97+T2e9o3d4BWNp84K1NzubTjAB3fH0+fv6N3qP/ir9bW6ozNQCijB8/8zw/TuQ7r4/ndvN5mZgkpPXiis3Pv34+ZPh5t23//79Rwehof/9/NDEgMrOXHvJcrllgpoRN8PFOwy/fzP8+gUlgZI/f/5xcPj/69e/37//AUX+/mXRkN555gsOG2xt/5hZQMwF4r9///75++f3nz8nr75gSms82jfvQnT6zqvXPjC8e/srJQHo9P9fvwNtAHmG4f8zZ6dDc3bIyM2LTNlsbtfM9OPHH3FhtqUz3eXX9H+cOy9ZMB2o6t/Pn0DHMPz/b+2wXGTvPlPGFxdcD+mZyjP8+8MUE6sa7a/xo6Pykn1s4zdzIZ6///8zMGpKM2pKAB0jqy4UE7/msKat6Jw5mafrsxNtWZ6/fjvNLW29qv25pQd///n+5+/fxDDVbcc//P/zx/36m5Ub9zL8+7t66yEROcHK7q5bldMBAgwADcRBCuVLfoEAAAAASUVORK5CYII=" title="English" alt="English" data-pagespeed-url-hash="1279150446" width="16" height="11"/>
    </li>
  </ul>
</nav>
{/if}
<nav class="nav-logo">
  <a href="https://feriayecla.com" class="logo">
    <img
      src="images/Cabecera_logo.jpeg"
      alt="Logo"
    />
  </a>
</nav>

<style>
  .nav-lang {
    padding: 6px 2%;
    font-size: 17px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-left: 15px;
    text-align: center;
  }

  .nav-logo {
    background-color: #efefef;
    display: flex;
    justify-content: center;
  }

  .flag {
    width: 20px;
    height: auto;
  }

  .lang-selector {
    cursor: pointer;
  }

  .center {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .rs-span {
    border: 2px solid var(--red-color);
    border-radius: 50%;
    width: 20px;
    display: inline-flex;
    justify-content: center;
    font-size: 10px;
    align-items: center;
    color: var(--red-color);
    transition: all .3s ease-out;
  }

  .rs-span:hover {
    color: white;
    background-color: var(--red-color);
  }

  ul.rrss {
    list-style: none;
    margin: 0;
    padding: 0;
    display: inline-flex;
    float: right;
    justify-content: flex-end;
    gap: 10px;
    margin: auto;
  }

  .info {
    color: #000;
  }

  .info:hover {
    color: var(--red-color);
  }

  .underlined {
    text-decoration: underline;
    text-decoration-color: black;
  }

  a.logo {
    height: 98px;
    display: block;
    margin-left: 0px;
  }

  a.logo > img {
    height: 100%;
  }

  .nav-lang > strong {
    margin: 5px 0;    
  }

  @media (min-width: 550px) {
    .nav-lang {
      flex-direction: row;
    }

    ul.rrss {
      margin: 0 0 0 auto;
    }

    .nav-logo {
      justify-content: left;
    }

    a.logo {
      margin-left: 45px;
    }
  }
</style>
