<script setup lang="ts">


// https://www.flickr.com/photos/30478819@N08/44723128954
// https://commons.wikimedia.org/wiki/File:200909-F-NS874-1163_-_7th_SFG_Soldiers_conduct_Best_ODA_Competition_(Image_12_of_13).jpg

import { usePisteetStore } from '@/stores/pisteet'
import { ref } from "vue";
import { RastiSuorituksenTila, IpscAmpumakoe } from "@/classes/IpscAmpumakoe";
import { PDFDocument, rgb } from 'pdf-lib'
import download from "downloadjs"

const pisteetStore = usePisteetStore()

let lisattavapelaaja = ref('')

// Ampujien listaus näytetään heti muokkaustilassa jos lista on tyhjä
let muokkausTila = ref(Object.keys(pisteetStore.pisteet).length < 1)

const lisaaPelaaja = (nimi: string) => {
  if (nimi == null || nimi == '') {
    return
  }
  const lisattavanEtunimi = nimi.split(' ')[0]
  const toisellaSamaEtunimi = Object.keys(pisteetStore.pisteet).map((it) => it.split(' ')[0]).filter(x => x === lisattavanEtunimi).length > 0
  if (pisteetStore.pisteet[nimi] !== undefined) {
    console.warn("Ampuja nimellä " + nimi + " on jo listalla.")
    return
  }
  if (toisellaSamaEtunimi && nimi.split(' ').length == 1) {
    console.warn("Ampuja etunimellä " + lisattavanEtunimi + " on jo listalla. Lisää sukunimi.")
    return
  }
  pisteetStore.lisaaPelaaja(nimi)
  lisattavapelaaja.value = ''
}

const muotoileOsumakerroin = (osumakerroin: number) => {
  if (osumakerroin == null || isNaN(osumakerroin)) {
    return ""
  }
  else {
    return "(" + osumakerroin.toFixed(2) + ")"
  }
}

const muotoileOsumakerroinPdf = (osumakerroin: number) => {
  if (osumakerroin == null || isNaN(osumakerroin)) {
    return ""
  }
  else {
    return osumakerroin.toFixed(2)
  }
}

const muotoileTulos = (kaikkiRastitSuoritettu: boolean, ampuja: string) => {
  if (ampuja in pisteetStore.hylkaykset) {
    return "HYLÄTTY"
  }
  if (!kaikkiRastitSuoritettu) {
    return "KESKEN"
  }
  return pisteetStore.getPelaajanHyvaksyttyjenAsemienLkm(ampuja) >= IpscAmpumakoe.hyvaksymisAsemia ? "HYVÄKSYTTY" : "HYLÄTTY"
}

const jatkaLinkkki = () => {
  if (pisteetStore.turvallisuuskoulutusSuoritettu !== true) {
    return 'turvallisuus'
  } else {
    return 'kirjaus/0/' + Object.keys(pisteetStore.pisteet)[0]
  }
}

const mapClass = (tila: RastiSuorituksenTila) => {
  switch (tila) {
    case RastiSuorituksenTila.Kesken:
      return 'incomplete'
    case RastiSuorituksenTila.Suorittamatta:
      return 'notdone'
    case RastiSuorituksenTila.Suoritettu:
      return 'done'
  }
}

const vahvistaPoisto = (ampuja: string) => {
  if (confirm(`Poista ampujan ${ampuja} tulostiedot?`)) {
    pisteetStore.poistaAmpuja(ampuja)
  }
}

const reset = () => {
  if (confirm("Haluatko todella tyhjentää listan ja poistaa kaikki tulokset?")) {
    pisteetStore.reset()
  }
}

const kirjaaHylkays = (ampuja: string) => {
  const peruste = window.prompt("Ampujan " + ampuja + " hylkäämisen syy?", "") as string
  if (peruste != null && peruste !== "") {
    pisteetStore.kirjaaHylkays(ampuja, peruste)
  }
}



const muokkaaLabel = () => {
  return muokkausTila.value ? "Jatka" : "Muokkaa listaa"
}

const muotoileLuku = (luku: number) : string => {
  if (luku == 0) {
    return ""
  } else {
    return luku.toString()
  }
}

const muotoileAika = (luku: number) : string => {
  if (luku == 0 || luku == undefined) {
    return ""
  } else {
    return luku.toFixed(2)
  }
}





async function createPdf(ampuja: string) {
  try {
  const { StandardFonts } = await import('pdf-lib')

  // Ladataan PDF-pohja
  const resp = await fetch(import.meta.env.BASE_URL + 'IPSC-ampumakoe.pdf')
  if (!resp.ok) throw new Error(`PDF-pohjan lataus epäonnistui: HTTP ${resp.status} — URL: ${import.meta.env.BASE_URL}IPSC-ampumakoe.pdf`)
  const templateBytes = await resp.arrayBuffer()
  const pdfDoc = await PDFDocument.load(templateBytes)
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  // Sivu 2 (indeksi 1) on pisteytyslomake
  const page = pdfDoc.getPages()[1]

  const BLACK = rgb(0, 0, 0)
  const GREEN = rgb(0, 0.45, 0)
  const RED   = rgb(0.7, 0, 0)

  // Apufunktio: ei piirretä tyhjiä merkkijonoja
  const txt = (text: string, x: number, y: number, size = 9, f = font, color = BLACK) => {
    if (text) page.drawText(text, { x, y, size, font: f, color })
  }

  // ── Kokelaan tiedot ──────────────────────────────────────────────────────
  const parts = ampuja.trim().split(' ')
  const etunimet = parts.slice(0, -1).join(' ') || ampuja
  const sukunimi = parts.length > 1 ? parts[parts.length - 1] : ''
  txt(etunimet, 385, 768)
  txt(sukunimi,  385, 754)

  // ── Pistetaulukko (9 asemaa, T1 ja T2) ───────────────────────────────────
  // Sarakkeiden x-koordinaatit (vasemmasta reunasta mitattuna)
  // HUOM: Nämä ovat arvioja — säädä tarvittaessa testauksen perusteella
  const X = { A: 344, C: 368, D: 376, M: 394, Pr: 412, Pist: 440, Aika: 473, HF: 523 }

  for (let rasti = 0; rasti < 9; rasti++) {
    // Kukin asema vie 42pt: otsikkorivi (sisältää "A C D M Pr Pist Aika HF") + T1-rivi + T2-rivi (à ~14pt)
    // t1Y = T1-datarivi, t2Y = T2-datarivi (otsikkorivi on 14pt korkeammalla)
    const t1Y = 684 - rasti * 50.5
    const t2Y = 670 - rasti * 50.5

    const p = pisteetStore.pisteet[ampuja][rasti]
    const rastiAika    = pisteetStore.getPelaajanRastiAika(ampuja, rasti)
    const rastiPisteet = pisteetStore.getPelaajaRastiPisteSumma(ampuja, rasti)
    const rastiHF      = rastiAika > 0 ? rastiPisteet / rastiAika : 0
    const suoritettu   = pisteetStore.getRastiSuorituksenTila(ampuja, rasti)
    const ok           = suoritettu === 2 && rastiHF >= IpscAmpumakoe.hyvaksymisRaja

    // T1-rivi: A, C, D, M (Ohi), Pr (Rang)
    txt(muotoileLuku(p[0][0]), X.A,  t1Y, 8, font, BLACK)
    txt(muotoileLuku(p[1][0]), X.C,  t1Y, 8, font, BLACK)
    txt(muotoileLuku(p[2][0]), X.D,  t1Y, 8, font, BLACK)
    txt(muotoileLuku(p[3][0]), X.M,  t1Y, 8, font, p[3][0] > 0 ? RED : BLACK)
    txt(muotoileLuku(p[4][0]), X.Pr, t1Y, 8, font, p[4][0] > 0 ? RED : BLACK)

    // T2-rivi
    txt(muotoileLuku(p[0][1]), X.A,  t2Y, 8, font, BLACK)
    txt(muotoileLuku(p[1][1]), X.C,  t2Y, 8, font, BLACK)
    txt(muotoileLuku(p[2][1]), X.D,  t2Y, 8, font, BLACK)
    txt(muotoileLuku(p[3][1]), X.M,  t2Y, 8, font, p[3][1] > 0 ? RED : BLACK)
    txt(muotoileLuku(p[4][1]), X.Pr, t2Y, 8, font, p[4][1] > 0 ? RED : BLACK)

    // Aseman yhteistiedot (Pist, Aika, HF) — T1-rivillä
    if (suoritettu === 2) {
      txt(rastiPisteet.toString(), X.Pist, t1Y, 8, boldFont, BLACK)
      txt(muotoileAika(rastiAika), X.Aika, t1Y, 8, font,     BLACK)
      txt(rastiHF.toFixed(2),      X.HF,   t1Y, 8, boldFont, ok ? GREEN : RED)
    }
  }

  // ── Tulos ────────────────────────────────────────────────────────────────
  const kaikkiSuoritettu  = pisteetStore.getKaikkiRastitSuoritettu(ampuja)
  const hyvaksyttyjenLkm  = pisteetStore.getPelaajanHyvaksyttyjenAsemienLkm(ampuja)
  const dq                = ampuja in pisteetStore.hylkaykset
  const hyvaksytty        = !dq && kaikkiSuoritettu && hyvaksyttyjenLkm >= IpscAmpumakoe.hyvaksymisAsemia

  if (hyvaksytty) {
    txt('X', 289, 305, 11, boldFont, GREEN)
  } else if (kaikkiSuoritettu || dq) {
    txt('X', 289, 283, 11, boldFont, RED)
    if (dq) txt(pisteetStore.hylkaykset[ampuja], 340, 283, 8, font, RED)
  }

  // Päivämäärä
  txt(new Date().toLocaleDateString('fi-FI'), 370, 248, 9)

  const pdfBytes = await pdfDoc.save()
  download(pdfBytes, 'ipsc-ampumakoe-' + new Date().toISOString().substring(0, 10) + '-' + ampuja.replace(' ', '-') + '.pdf', 'application/pdf')
  } catch (err) {
    alert('PDF-luonti epäonnistui:\n' + (err instanceof Error ? err.message : String(err)))
    console.error('createPdf error:', err)
  }
}

// onMounted(() => {
//   lisaaPelaaja('Katriina')
//   lisaaPelaaja('Maija')
//   lisaaPelaaja('Heidi')
//   lisaaPelaaja('Tiina')
// })

</script>

<template>
  <main v-bind:class="{ muok: !muokkausTila }">

    <div class="sisalto">

    <div class="intro" v-if="muokkausTila">
      Tervetuloa IPSC-ampumakokeeseen. Syötä ampumakokeeseen osallistuvien henkilöiden nimet alla. Sovellukseen
      kirjatut tiedot tallentuvat ainoastaan päätelaitteen muistiin. Tietoja ei tallenneta eikä jaeta verkossa. Voit
      ladata PDF-muotoiset tuloskortat tuloksien kirjaamisen jälkeen.
    </div>

    <h2 v-if="muokkausTila">Ampujat</h2>
    <h2 v-if="!muokkausTila">Tuloslista</h2>

    <ul v-if="muokkausTila" class="ampujat">
      <li v-bind:key="ampuja" v-for="(ampujanPisteet, ampuja) in pisteetStore.pisteet">{{ ampuja }} <span @click="vahvistaPoisto(ampuja as string)" class="remove">ⓧ</span></li>
    </ul>

    <table id="tuloslista" cellspacing="0" v-if="!muokkausTila">
      <tr>
        <th class="nimi">Nimi</th>
        <th class="rastipallot">Rastit</th>
        <th class="osumakerroin">Tulos ja HF</th>
        <th class="tulos">Pöytäkirja</th>
        <th v-if="muokkausTila">Poista</th>
      </tr>
      <tr v-bind:key="ampuja" v-for="(ampujanPisteet, ampuja) in pisteetStore.pisteet" v-bind:class="{dq: pisteetStore.getHylkaysperuste(ampuja as string) }">
        <td class="nimi">
          {{ ampuja }} <span v-if="ampuja in pisteetStore.hylkaykset">🚫</span>
        </td>
        <td class="rastipallot">
          <div v-bind:key="rasti" class="rastipallo" v-bind:class="mapClass(pisteetStore.getRastiSuorituksenTila(ampuja as string, rasti))"  v-for="rasti in [0,1,2,3,4,5,6,7,8]">
            <a :href="'kirjaus/' + rasti + '/' + ampuja">{{ rasti+1 }}</a></div>
        </td>
        <td>
          <span id="tulos" v-bind:class="muotoileTulos(pisteetStore.getKaikkiRastitSuoritettu(ampuja as string), ampuja as string)">
          {{ muotoileTulos(pisteetStore.getKaikkiRastitSuoritettu(ampuja as string), ampuja as string) }}
          </span>
          <span class="hyvaksytyt" v-if="pisteetStore.getKaikkiRastitSuoritettu(ampuja as string)">
            ({{ pisteetStore.getPelaajanHyvaksyttyjenAsemienLkm(ampuja as string) }}/9 ≥ 1,4)
          </span>
        </td>

        <td><button @click="createPdf(ampuja as string)">PDF</button></td>

        <td v-if="muokkausTila"><button class="danger" @click="vahvistaPoisto(ampuja as string)">🗑 POISTA</button></td>
      </tr>

    </table>

    <fieldset v-if="muokkausTila" >
      <legend>Lisää ampuja</legend>
      <input placeholder="Ampujan nimi" id="uusinimi" name="uusinimi" v-model="lisattavapelaaja" v-on:keyup.enter="lisaaPelaaja(lisattavapelaaja)"/>
      <input type="submit" value="Lisää" @click="lisaaPelaaja(lisattavapelaaja);pisteetStore.turvallisuuskoulutusSuoritettu = false;"  />
    </fieldset>

      <fieldset v-if="muokkausTila">
        <legend>Kokeen ampumajärjestys</legend>
        <input type="radio" id="kiertavaJarjestys" name="ampumajarjestys" v-model="pisteetStore.jarjestys" value="kiertava" checked />
        <label for="kiertavaJarjestys">Kiertävä järjestys: ensimmäisenä ampunut siirtyy seuraavalla rastilla viimeiseksi</label>
        <br/>
        <input type="radio" id="eiKiertavaJarjestys" name="ampumajarjestys" v-model="pisteetStore.jarjestys" value="pysyva" />
        <label for="eiKiertavaJarjestys">Sama järjestys joka rastilla</label>
      </fieldset>

    <div class="actions">
      <button class="action danger" v-if="muokkausTila && Object.keys(pisteetStore.pisteet).length > 0" @click="reset()">Poista kaikki</button>
      <button v-if="muokkausTila && Object.keys(pisteetStore.pisteet).length > 1" @click="pisteetStore.satunnaistaJarjestys()" class="action">⤭ Järjestä satunnaisesti</button>

<!--      <button class="action" v-if="Object.keys(pisteetStore.pisteet).length > 0 || !muokkausTila" @click="muokkausTila = !muokkausTila">{{ muokkaaLabel() }}</button>-->

      <button class="action" v-if="Object.keys(pisteetStore.pisteet).length > 0 && !muokkausTila" @click="muokkausTila = !muokkausTila">Muokkaa osallistujia</button>
      <button class="action" v-if="Object.keys(pisteetStore.pisteet).length > 0 && muokkausTila && pisteetStore.turvallisuuskoulutusSuoritettu" @click="muokkausTila = !muokkausTila">Jatka</button>
      <button class="action" v-if="Object.keys(pisteetStore.pisteet).length > 0 && muokkausTila && pisteetStore.turvallisuuskoulutusSuoritettu == false" @click="$router.push('turvallisuus')">Jatka</button>

      <button v-if="!muokkausTila && pisteetStore.turvallisuuskoulutusSuoritettu" class="action" @click="$router.push('kirjaus/0/' + Object.keys(pisteetStore.pisteet)[0])">Aloita IPSC-ampumakoe</button>
    </div>

    </div>
  </main>
</template>
<style scoped>


body {
  background-color: red;

}


main {
  background-image: linear-gradient(to bottom, rgba(233, 233, 233, .2), rgba(233, 233, 233, 1)), url("../assets/tausta.jpg");
  background-repeat: no-repeat;
  padding: 9rem 0 0 0;

  &.muok {
    padding: 0 0 0 0;
  }

}

.sisalto {


  background-color: rgba(233,233,233, .7);
  padding: 1rem;
  line-height: 1.5;

}


table#tuloslista {
  border-radius: .3rem;
  width: 100%;


  tr {

    height: 3rem;

    &:nth-child(odd) {
      background-color: #f5f5f5;
    }
    &:nth-child(even) {
      background-color: #e7e7e7;
    }

    td {
      text-align: center;
    }

    th {
      word-wrap: anywhere;
      font-size: 105%;
      background-color: #ececec;
      border-bottom: 2px solid #145014;
      color: var(--vari1);
      font-weight: bold;

      &.rastipallot {
        min-width: 6rem;
      }
    }

    &.dq {
      div.rastipallo {
        background-color: #ccc;
        a {
          color: #333;
        }
      }
    }
  }
}

#tulos {
  font-weight: bold;
  &.KESKEN {
    color: #2f2f2f;
  }
  &.HYVÄKSYTTY {
    color: darkgreen;
  }
  &.HYLÄTTY {
    color: darkred;
    :before {
      content: 'g';
      background-color: blue;
    }
  }
}

.hyvaksytyt {
  font-size: 80%;
  color: #555;
}

.rastipallot {
  .rastipallo:first-child {
    border-bottom-left-radius: 40%;
    border-top-left-radius: 40%;
  }
  .rastipallo:last-child {
    border-top-right-radius: 40%;
    border-bottom-right-radius: 40%;
  }
}

.rastipallo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.1rem;
  height: 1.1rem;
  margin: 0;
  font-size: 70%;

  &.done {
    background-color: var(--vari1);
    a {
      color: rgba(255, 255, 255, 0.8);
      font-weight: bold;
    }
  }
  &.notdone {
    background-color: var(--vari2);
    a {
      color: var(--vari1);
      font-weight: bold;
    }
  }
  &.incomplete {
    background-color: #dea187;
    a {
      color: var(--vari1);
      font-weight: bold;
    }
  }

}

.ampujat {

  margin: 0;
  padding: .5rem 0 .5rem 0;

  li {
    display: inline-block;
    background-color: var(--vari1);
    color: #f1f1f1;
    border-radius: .8rem;
    padding: 0 .6rem 0 .6rem;
    margin: .1rem;

    .remove {
      display: inherit;
      padding: .2rem 0 .3rem 0;

      &:hover {
        color: darkred;
      }
    }
  }
}


fieldset {
  margin: 1rem 0 1.5rem 0;
}

</style>
