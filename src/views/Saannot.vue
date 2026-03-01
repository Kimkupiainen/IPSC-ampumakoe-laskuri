<template>
  <div class="saannot">

    <h1 class="saannot_otsikko">IPSC-ampumakoe – Säännöt ja ohjeet</h1>

    <hr />

    <h2>Pisteytys (Minor Power Factor)</h2>
    <table class="pisteet">
      <thead>
        <tr><th>Osumaluokka</th><th>Pisteet</th></tr>
      </thead>
      <tbody>
        <tr><td>A (Alpha)</td><td>+5</td></tr>
        <tr><td>C (Charlie)</td><td>+3</td></tr>
        <tr><td>D (Delta)</td><td>+1</td></tr>
        <tr><td>Ohi (Miss)</td><td>−10</td></tr>
        <tr><td>Rang (Procedural)</td><td>−10</td></tr>
      </tbody>
    </table>

    <p>
      <strong>Hit Factor (HF)</strong> = Kokonaispisteet / Kokonaisaika (sekunteina).<br/>
      Hyväksytty suoritus: HF ≥ 1,30.
    </p>

    <hr />

    <h2>Rastit</h2>

    <h3>Rasti 1 – Perustarkkuus</h3>
    <p>
      10 m. Lähtöasento seisten kohti tauluja, pistooli kotelossa.<br/>
      <strong>1. sarja (ohjeaika 5 s):</strong> 2 lk./taulu molemmin käsin.<br/>
      <strong>2. sarja (ohjeaika 5 s):</strong> 2 lk./taulu vahvemmalla kädellä.<br/>
      <strong>3. sarja (ohjeaika 5 s):</strong> 2 lk./taulu heikommalla kädellä.<br/>
      Jokaisesta sarjasta kirjataan oma aika. Yhteensä 12 laukausta (6/taulu).
    </p>

    <h3>Rasti 2 – Käännökset</h3>
    <p>
      10 m. Pistooli ladattuna kotelossa.<br/>
      <strong>1. sarja (ohjeaika 5 s):</strong> lähtöasento selkä kohti tauluja, käännös 180° ja 2 lk./taulu.<br/>
      <strong>2. sarja (ohjeaika 5 s):</strong> lähtöasento vasen kylki kohti tauluja, käännös 90° ja 2 lk./taulu.<br/>
      <strong>3. sarja (ohjeaika 5 s):</strong> lähtöasento oikea kylki kohti tauluja, käännös 90° ja 2 lk./taulu.<br/>
      Jokaisesta sarjasta kirjataan oma aika. Yhteensä 12 laukausta (6/taulu).
    </p>

    <h3>Rasti 3 – Siirtyminen sivulle ja lippaan vaihto</h3>
    <p>
      10 m. Lähtöasento selin, kädet ylhäällä, pistooli ladattuna kotelossa. Ohjeaika 15 s.<br/>
      Suoritus: käännös 180° ja 2 lk. tauluun paikasta A tai B, siirtyminen toiselle puolelle
      lippaanvaihdon aikana ja 2 lk. toiseen tauluun, siirtyminen takaisin lähtöpaikkaan
      lippaanvaihdon aikana ja 2 lk. lähtöpaikasta.<br/>
      Yhteensä 6 laukausta (4 tauluun 1, 2 tauluun 2).
    </p>

    <h3>Rasti 4 – Siirtyminen eteen päin ja lippaan vaihto</h3>
    <p>
      20–15–10 m. Ohjeaika 25 s. Lähtöasento seisten kohti tauluja, pistooli kotelossa.<br/>
      2 lk./taulu 20 m:stä seisaaltaan, siirtyminen lippaanvaihdon aikana 15 m:iin ja
      2 lk./taulu polvelta, siirtyminen lippaanvaihdon aikana 10 m:iin ja
      2 lk./taulu makuulta tai polvelta.<br/>
      Yhteensä 12 laukausta (6/taulu).
    </p>

    <h3>Rasti 5 – Valinnaissuoritus</h3>
    <p>
      10–15 m. Pistooli ladattuna kotelossa. Ohjeaika 15 s.<br/>
      Ampuja valitsee aloittaako paikasta A vai B.<br/>
      2 lk. kumpaankin tauluun paikasta A, siirtyminen paikkaan B ja
      2 lk. kumpaankin tauluun, siirtyminen paikkaan C ja
      2 lk. kumpaankin tauluun.<br/>
      Yhteensä 8 laukausta (4/taulu).
    </p>

    <hr />

    <h2>Turvalliset aseenkäsittelysäännöt</h2>
    <ol>
      <li><strong>Asetta on aina käsiteltävä kuin se olisi ladattu.</strong></li>
      <li><strong>Aseen piipun on aina osoitettava turvalliseen suuntaan.</strong></li>
      <li><strong>Sormi pidetään pois liipaisimelta ennen ampumapäätöstä.</strong></li>
      <li><strong>Tunnista maali ja varmista tausta.</strong></li>
    </ol>

    <hr />

    <h2>Lisätietoja</h2>
    <ul>
      <li><a href="https://www.ipsc.org/">IPSC – International Practical Shooting Confederation</a></li>
      <li><a href="https://www.ipsc.fi/">IPSC Finland</a></li>
    </ul>

  </div>
</template>

<style scoped>

.saannot {
  padding: 1rem;
  max-width: 38rem;
  margin: auto;
  line-height: 1.6;
}

.saannot_otsikko {
  color: var(--vari1);
}

h2 {
  color: var(--vari1);
  margin-top: 1.5rem;
}

h3 {
  margin-top: 1rem;
}

table.pisteet {
  border-collapse: collapse;
  margin: .5rem 0 1rem 0;
}

table.pisteet th, table.pisteet td {
  border: 1px solid #ccc;
  padding: .3rem .8rem;
  text-align: left;
}

table.pisteet th {
  background-color: var(--vari2);
}

ol li, ul li {
  margin-top: .5rem;
}

a {
  color: var(--color-text);
}

hr {
  margin: 1.5rem 0;
  border: none;
  border-top: 1px solid #ccc;
}

</style>
