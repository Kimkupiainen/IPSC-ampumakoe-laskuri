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
  const { StandardFonts } = await import('pdf-lib')

  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const page = pdfDoc.addPage([595, 842]) // A4

  const BLACK = rgb(0, 0, 0)
  const GREEN = rgb(0, 0.45, 0)
  const RED = rgb(0.7, 0, 0)
  const GRAY = rgb(0.45, 0.45, 0.45)
  const LGRAY = rgb(0.75, 0.75, 0.75)
  const BLUE = rgb(0.1, 0.1, 0.6)

  // Column x positions
  const COL = {
    asema: 50,       // "Asema N"
    t1A: 130, t1C: 155, t1D: 180, t1M: 205,
    t2A: 240, t2C: 265, t2D: 290, t2M: 315,
    proc: 348,
    pts:  380,
    aika: 420,
    hf:   468,
    ok:   516,
  }

  let y = 810

  // ── Header ──────────────────────────────────────────────────────────────
  page.drawText('PRACTICAL-PERUSKURSSI AMPUMAKOE – PISTOOLI', {
    x: 50, y, size: 13, font: boldFont, color: BLACK
  })
  y -= 16
  page.drawText(`Ampuja: ${ampuja}`, { x: 50, y, size: 10, font, color: BLACK })
  page.drawText(`Päivämäärä: ${new Date().toLocaleDateString('fi-FI')}`, { x: 310, y, size: 10, font, color: BLACK })
  y -= 8
  page.drawLine({ start: { x: 50, y }, end: { x: 545, y }, thickness: 0.5, color: LGRAY })
  y -= 14

  // ── Column headers ───────────────────────────────────────────────────────
  const hdrY = y
  page.drawText('Asema', { x: COL.asema, y: hdrY, size: 8, font: boldFont, color: GRAY })
  // T1 group header
  page.drawText('T1', { x: COL.t1A + 22, y: hdrY + 8, size: 8, font: boldFont, color: GRAY })
  page.drawText('A',  { x: COL.t1A,  y: hdrY, size: 8, font: boldFont, color: GRAY })
  page.drawText('C',  { x: COL.t1C,  y: hdrY, size: 8, font: boldFont, color: GRAY })
  page.drawText('D',  { x: COL.t1D,  y: hdrY, size: 8, font: boldFont, color: GRAY })
  page.drawText('M',  { x: COL.t1M,  y: hdrY, size: 8, font: boldFont, color: GRAY })
  // T2 group header
  page.drawText('T2', { x: COL.t2A + 22, y: hdrY + 8, size: 8, font: boldFont, color: GRAY })
  page.drawText('A',  { x: COL.t2A,  y: hdrY, size: 8, font: boldFont, color: GRAY })
  page.drawText('C',  { x: COL.t2C,  y: hdrY, size: 8, font: boldFont, color: GRAY })
  page.drawText('D',  { x: COL.t2D,  y: hdrY, size: 8, font: boldFont, color: GRAY })
  page.drawText('M',  { x: COL.t2M,  y: hdrY, size: 8, font: boldFont, color: GRAY })

  page.drawText('Proc', { x: COL.proc, y: hdrY, size: 8, font: boldFont, color: GRAY })
  page.drawText('Pts',  { x: COL.pts,  y: hdrY, size: 8, font: boldFont, color: GRAY })
  page.drawText('Aika s', { x: COL.aika, y: hdrY, size: 8, font: boldFont, color: GRAY })
  page.drawText('HF',   { x: COL.hf,   y: hdrY, size: 8, font: boldFont, color: GRAY })
  page.drawText('≥1,4', { x: COL.ok,   y: hdrY, size: 8, font: boldFont, color: GRAY })

  y -= 6
  page.drawLine({ start: { x: 50, y }, end: { x: 545, y }, thickness: 0.5, color: LGRAY })
  y -= 4

  // ── Per-stage rows ────────────────────────────────────────────────────────
  for (let rasti = 0; rasti < 9; rasti++) {
    const rastiPisteet = pisteetStore.getPelaajaRastiPisteSumma(ampuja, rasti)
    const rastiAika = pisteetStore.getPelaajanRastiAika(ampuja, rasti)
    const rastiHF = rastiAika > 0 ? rastiPisteet / rastiAika : 0
    const suoritettu = pisteetStore.getRastiSuorituksenTila(ampuja, rasti)
    const hyvaksyttyAsema = suoritettu === 2 /* Suoritettu */ && rastiHF >= IpscAmpumakoe.hyvaksymisRaja

    // Shade alternating rows
    if (rasti % 2 === 0) {
      page.drawRectangle({ x: 50, y: y - 2, width: 495, height: 13, color: rgb(0.96, 0.96, 0.96), opacity: 1 })
    }

    const rowY = y
    const osumat = IpscAmpumakoe.osumaluokat.map((_, idx) => ({
      t1: pisteetStore.pisteet[ampuja][rasti][idx][0],
      t2: pisteetStore.pisteet[ampuja][rasti][idx][1],
    }))

    page.drawText(`Asema ${rasti + 1}`, { x: COL.asema, y: rowY, size: 9, font: boldFont, color: BLACK })

    // T1 columns: A=idx0, C=idx1, D=idx2, Miss=idx3
    page.drawText(muotoileLuku(osumat[0].t1), { x: COL.t1A, y: rowY, size: 9, font, color: BLACK })
    page.drawText(muotoileLuku(osumat[1].t1), { x: COL.t1C, y: rowY, size: 9, font, color: BLACK })
    page.drawText(muotoileLuku(osumat[2].t1), { x: COL.t1D, y: rowY, size: 9, font, color: BLACK })
    page.drawText(muotoileLuku(osumat[3].t1), { x: COL.t1M, y: rowY, size: 9, font, color: osumat[3].t1 > 0 ? RED : BLACK })
    // T2 columns
    page.drawText(muotoileLuku(osumat[0].t2), { x: COL.t2A, y: rowY, size: 9, font, color: BLACK })
    page.drawText(muotoileLuku(osumat[1].t2), { x: COL.t2C, y: rowY, size: 9, font, color: BLACK })
    page.drawText(muotoileLuku(osumat[2].t2), { x: COL.t2D, y: rowY, size: 9, font, color: BLACK })
    page.drawText(muotoileLuku(osumat[3].t2), { x: COL.t2M, y: rowY, size: 9, font, color: osumat[3].t2 > 0 ? RED : BLACK })
    // Procedural (Rang, idx4)
    const proc = osumat[4].t1 + osumat[4].t2
    page.drawText(muotoileLuku(proc), { x: COL.proc, y: rowY, size: 9, font, color: proc > 0 ? RED : BLACK })
    // Pts, Aika, HF
    page.drawText(muotoileLuku(rastiPisteet), { x: COL.pts, y: rowY, size: 9, font: boldFont, color: BLACK })
    page.drawText(muotoileAika(rastiAika), { x: COL.aika, y: rowY, size: 9, font, color: BLACK })
    if (rastiHF > 0) {
      page.drawText(rastiHF.toFixed(2), { x: COL.hf, y: rowY, size: 9, font: boldFont, color: hyvaksyttyAsema ? GREEN : RED })
    }
    // Pass/fail tick for this stage
    if (suoritettu === 2) {
      page.drawText(hyvaksyttyAsema ? '✓' : '✗', { x: COL.ok, y: rowY, size: 10, font: boldFont, color: hyvaksyttyAsema ? GREEN : RED })
    }

    y -= 13
  }

  // ── Separator ─────────────────────────────────────────────────────────────
  page.drawLine({ start: { x: 50, y }, end: { x: 545, y }, thickness: 1, color: LGRAY })
  y -= 16

  // ── Summary ───────────────────────────────────────────────────────────────
  const totalPisteet = pisteetStore.getPelaajanPisteSumma(ampuja)
  const totalAika = pisteetStore.getPelaajanAikaSumma(ampuja)
  const totalHF = totalAika > 0 ? totalPisteet / totalAika : 0
  const hyvaksyttyjenLkm = pisteetStore.getPelaajanHyvaksyttyjenAsemienLkm(ampuja)
  const kaikkiSuoritettu = pisteetStore.getKaikkiRastitSuoritettu(ampuja)
  const hyvaksytty = !(ampuja in pisteetStore.hylkaykset) && kaikkiSuoritettu && hyvaksyttyjenLkm >= IpscAmpumakoe.hyvaksymisAsemia

  page.drawText(`Hyväksytyt asemat: ${hyvaksyttyjenLkm} / 9  (vaatimus: vähintään ${IpscAmpumakoe.hyvaksymisAsemia})`, { x: 50, y, size: 10, font, color: BLACK })
  y -= 14
  page.drawText(`Kokonaispisteet: ${totalPisteet}   Kokonaisaika: ${muotoileAika(totalAika)} s   Yht. HF: ${totalHF > 0 ? totalHF.toFixed(2) : '–'}`, { x: 50, y, size: 10, font, color: BLACK })
  y -= 18

  if (pisteetStore.hylkaykset[ampuja] !== undefined) {
    page.drawText(`DQ: ${pisteetStore.hylkaykset[ampuja]}`, { x: 50, y, size: 11, font: boldFont, color: RED })
    y -= 16
  }

  const tulosTeksti = ampuja in pisteetStore.hylkaykset
    ? 'HYLÄTTY (DQ)'
    : !kaikkiSuoritettu
      ? 'KESKEN'
      : hyvaksytty ? 'HYVÄKSYTTY' : 'HYLÄTTY'
  const tulosVari = tulosTeksti === 'HYVÄKSYTTY' ? GREEN : tulosTeksti === 'KESKEN' ? BLUE : RED
  page.drawText(tulosTeksti, { x: 50, y, size: 20, font: boldFont, color: tulosVari })
  y -= 30

  // ── Signature line ────────────────────────────────────────────────────────
  page.drawLine({ start: { x: 50, y }, end: { x: 250, y }, thickness: 0.5, color: LGRAY })
  page.drawLine({ start: { x: 310, y }, end: { x: 545, y }, thickness: 0.5, color: LGRAY })
  y -= 12
  page.drawText('Ampujan allekirjoitus', { x: 50, y, size: 8, font, color: GRAY })
  page.drawText('Tuomarin allekirjoitus', { x: 310, y, size: 8, font, color: GRAY })

  // ── Footer note ───────────────────────────────────────────────────────────
  page.drawText(
    'Pistelaskutapa: Comstock. Hyväksytty suoritus: HF ≥ 1,4 vähintään 7 asemalla, ei turvallisuusrikettä.',
    { x: 50, y: 30, size: 7.5, font, color: GRAY }
  )

  const pdfBytes = await pdfDoc.save()
  download(pdfBytes, 'ipsc-ampumakoe-' + new Date().toISOString().substring(0, 10) + '-' + ampuja.replace(' ', '-') + '.pdf', 'application/pdf')
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
