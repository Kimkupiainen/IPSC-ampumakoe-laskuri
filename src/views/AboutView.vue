<script setup lang="ts">
const version = __APP_VERSION__
</script>


<template>
  <div class="about">
    <h1>Tietoja</h1>

    <p>
      Sovelluksen versio {{ version }}
    </p>

    <p>
      Tämä on IPSC-ampumakokeen pistelaskuri, jota voidaan käyttää ampumakoetilaisuuksissa pisteenlaskun apuna.
      IPSC (International Practical Shooting Confederation) on kansainvälinen toiminnallisen ammunnan laji.
      Sovellus laskee osumat IPSC Minor -pisteytyksellä (A=5, C=3, D=1, Ohi=−10, Rang=−10) ja
      Hit Factorin (pisteet / aika).
    </p>

    <h2>Yksityisyys</h2>
    <p>
      Pistelaskurin tallentamat tiedot ovat: ampujan nimi ja ampumasuorituksien aika- ja pistelukemat. Tiedot
      tallentuvat ainoastaan päätelaitteen (selainohjelman) muistiin. Tietoja ei tallenneta verkkopalvelimille tai
      pilvipalveluihin.
    </p>

    <h2>Linkkejä</h2>
    <ul>
      <li><a href="https://www.ipsc.org/">IPSC – International Practical Shooting Confederation</a></li>
      <li><a href="https://www.ipsc.fi/">IPSC Finland</a></li>
    </ul>

    <h2>Versiohistoria</h2>

    <h3>1.0.0 (1.3.2026)</h3>
    <ul>
      <li>IPSC-ampumakoe-laskuri – mukaeltu SRA-laskurista IPSC-käyttöön</li>
      <li>IPSC Minor -pisteytys (A=5, C=3, D=1, Ohi=−10, Rang=−10)</li>
      <li>5 kiinteää IPSC-rastisuoritusta</li>
      <li>PDF-tuloskortti ilman ulkoisia riippuvuuksia</li>
      <li>Kiväärivaihtoehto poistettu (pistoolikokeeseen)</li>
    </ul>

  </div>
</template>

<style>


.about h1,h2 {
  color: var(--vari1);
  font-weight: bold;
  padding-top: 1rem;
}

.about {
  padding: 1rem;
}

a {
  color: var(--color-text);
}

p {
  margin-top: 1rem;
}

</style>
