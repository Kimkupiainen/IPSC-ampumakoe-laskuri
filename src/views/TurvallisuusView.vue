<script setup lang="ts">

import { usePisteetStore } from '@/stores/pisteet'

const pisteetStore = usePisteetStore()

//const saannotChecked : boolean = false

</script>


<template>

  <main class="turvallisuus">
    <div class="sisalto">

  <h1>Turvallisuus</h1>
  <p>
    Kaikissa aseenkäsittelytilanteissa on noudatettava seuraavia turvallisen aseenkäsittelyn sääntöjä:
  </p>
  <ol>
    <li><b>Käsittele asetta aina kuin se olisi ladattu</b>.
      Älä koskaan oleta aseen olevan tyhjä, vaan tarkista sen tila jokaisen käsittelykerran aluksi ja lopuksi.</li>
    <li>Älä osoita aseella mitään, mitä et ole valmis tuhoamaan<b>. Pidä piippu aina turvalliseen suuntaan.</b>.</li>
    <li>Pidä sormi liipaisinkaaren ulkopuolella<b>. Sormi saa mennä liipaisimelle vasta, kun olet valmis ampumaan</b>.</li>
    <li><b>Ole varma maalistasi ja siitä, mitä sen takana on</b>.
      Tunnista kohde ja varmista, ettei taustalla ole sivullisia ja ettei maalin ampuminen luo vaaratilannetta.</li>
  </ol>

  <div class="turvallisuuscheckbox">
    <input v-model="pisteetStore.turvallisuuskoulutusSuoritettu" type="checkbox" id="turvallisuuskuittaus"/>
    <label for="checkbox">Kaikki ampumakokeen osallistujat tuntevat yllä olevat turvalliset aseen käsittelyn säännöt.</label>
  </div>

  <div class="actions jatka">
    <button class="action" :disabled="!pisteetStore.turvallisuuskoulutusSuoritettu" @click="pisteetStore.turvallisuuskoulutusSuoritettu = true; $router.push('/')">Jatka</button>
  </div>
    </div>
  </main>
</template>

<style>

main.turvallisuus {
  background-image: linear-gradient(to bottom, rgba(233, 233, 233, .3), rgba(233, 233, 233, 2)), url("../assets/9mm.jpg");
  padding: 8rem 0 0 0;

}

.sisalto {
  background-color: rgba(233,233,233,.8);
  padding: 1rem;
}


.about h1,h2 {
  color: var(--vari1);
  font-weight: bold;
  padding-top: 1rem;
}

.about {
  padding: 1rem;
}

li {
  margin-top: 1rem;
}

a {
  color: var(--color-text);
}

.actions.jatka {
  flex-direction: row-reverse;
}

.turvallisuuscheckbox {
  padding: 1rem 0 1rem 0;


  input[type=checkbox] {
    transform: scale(2.0);
    padding: 1rem;
    margin: 1rem;
  }
}



</style>
