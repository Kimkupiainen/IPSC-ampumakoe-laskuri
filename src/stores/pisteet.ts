import {defineStore} from 'pinia'
import {RastiSuorituksenTila, IpscAmpumakoe} from "@/classes/IpscAmpumakoe";

type AmpujaPisteet = {
  [nimi: string]: Array<Array<Array<number>>>
}
type AmpujaAjat = {
  [nimi: string]: Array<Array<number>>
}
type Hylkaykset = {
  [nimi: string]: string
}

const jarjestysOnSama = (a: string[], b: string[]) => {
  return a.length === b.length && a.every((el, idx) => el === b[idx]);
}

export const usePisteetStore = defineStore('pisteet', {
  state: () => ({
    turvallisuuskoulutusSuoritettu: false,
    mute: true,
    count: 0,
    pisteet: {} as AmpujaPisteet,
    ajat: {} as AmpujaAjat,
    hylkaykset: {} as Hylkaykset,
    jarjestys: ''
  }),
  persist: true,
  actions: {
    lisaaPelaaja(nimi: any) {
      // 9 asemaa × 6 osumaluokkaa × 2 taulua
      this.pisteet[nimi] = new Array(9).fill(0).map(() => new Array(6).fill(0).map(() => new Array(2).fill(0)))
      // 9 asemaa × 1 aika per asema (Comstock, ei sarja-aikoja)
      this.ajat[nimi] = new Array(9).fill(0).map(() => new Array(1).fill(0))
      // Jos lisätään uusi ampuja, tarvitaan uusi vahvistus, että turvallisuuskoulutus on annettu kaikille
      this.turvallisuuskoulutusSuoritettu = false
    },
    getPelaajanPisteet(nimi: any): number[][][] {
      return this.pisteet[nimi]
    },
    getPelaajanRastiAika(nimi: string, rasti: number) {
      return this.ajat[nimi][rasti].reduce((a, b) => Number(a) + Number(b), 0)
    },
    getPelaajanRastiAjat(nimi: any, rasti: any) {
      return this.ajat[nimi][rasti]
    },
    osumaSumma(pist: Array<Array<number>>, luokka: number) : number {
      return pist[luokka].reduce((a, b) => Number(a) + Number(b), 0)
    },

    getPelaajaRastiLuokkaOsumat(ampuja: string, rasti: number) {
      return this.pisteet[ampuja][rasti].map((it) => it.reduce((a,b) => a+b, 0))
    },
    getLuPi(luokka: number, osumat: number) {
      switch(luokka) {
        case 0:
          return 5 * osumat
        case 1:
          return 3 * osumat
        case 2:
          return osumat
        case 3:
        case 4:
          return -10 * osumat
      }
      return 0
    },
    getPelaajaRastiPisteet(pelaaja: string, rasti: number) {
      return this.getPelaajaRastiLuokkaOsumat(pelaaja, rasti).map((osumat, index) => this.getLuPi(index, osumat))
    },
    getPelaajaRastiPisteSumma(pelaaja: string, rasti: number) {
      const summa = this.getPelaajaRastiPisteet(pelaaja, rasti).reduce((a, b) => a + b, 0)
      // TODO: Voiko kokeessa rastin pistesumma olla alle 0? Oletus: ei.
      return Math.max(0, summa)
    },
    // Ampujan yhteispisteet (osittain suoritettuja rasteja ei lasketa)
    getPelaajanPisteSumma(ampuja: string) : number {
      return [0,1,2,3,4,5,6,7,8].map((rasti) =>
          this.getRastiSuorituksenTila(ampuja, rasti) == RastiSuorituksenTila.Suoritettu ? this.getPelaajaRastiPisteSumma(ampuja, rasti) : 0).reduce((a,b) => a + b)
    },

    // Ampujan kokonaisaika (osittain suoritettuja rasteja ei lasketa)
    getPelaajanAikaSumma(ampuja: string) : number {
      return [0, 1, 2, 3, 4, 5, 6, 7, 8].map(rasti =>
          this.getRastiSuorituksenTila(ampuja, rasti) == RastiSuorituksenTila.Suoritettu ? this.ajat[ampuja][rasti].reduce((a,b)=> a + b, 0) : 0)
          .reduce((a,b)=>a+b,0)
    },
    getPelaajanOsumakerroin(ampuja: string) : number {
      return this.getPelaajanPisteSumma(ampuja) / this.getPelaajanAikaSumma(ampuja)
    },
    // Montako asemaa on hyväksytty (HF ≥ 1,4)
    getPelaajanHyvaksyttyjenAsemienLkm(ampuja: string) : number {
      return [0,1,2,3,4,5,6,7,8]
        .filter(rasti => this.getRastiSuorituksenTila(ampuja, rasti) === RastiSuorituksenTila.Suoritettu)
        .filter(rasti => {
          const pts = this.getPelaajaRastiPisteSumma(ampuja, rasti)
          const t = this.getPelaajanRastiAika(ampuja, rasti)
          return t > 0 && Math.round((pts / t) * 100) / 100 >= IpscAmpumakoe.hyvaksymisRaja
        }).length
    },
    getRastiSuorituksenTila(ampuja: string, rasti: number) {

      // Onko kaikki laukaukset pisteytetty?
      const pisteytetytOsumat = this.getPelaajaRastiLuokkaOsumat(ampuja, rasti).reduce((a,b) => a + b, 0)

      const rastinLaukausmaara = IpscAmpumakoe.laukausMaaratPistoolilla[rasti].reduce((a,b)=> a + b, 0)

      // Onko aika kirjattu (yksi aika per asema, Comstock)
      const ajatKirjattu = (this.ajat[ampuja][rasti][0] > 0)

      // Kesken: vain osa osumista on kirjattu tai aikakirjaus puuttuu
      if ((pisteytetytOsumat > 0 && pisteytetytOsumat < rastinLaukausmaara) || (pisteytetytOsumat > 0 && !ajatKirjattu) || (pisteytetytOsumat == 0 && ajatKirjattu)) {
        return RastiSuorituksenTila.Kesken
      }
      // Kaikki laukaukset on pisteytetty ja aika on kirjattu
      if (pisteytetytOsumat >= rastinLaukausmaara && ajatKirjattu) {
        return RastiSuorituksenTila.Suoritettu
      }
      // Muutoin rasti on suorittamatta
      return RastiSuorituksenTila.Suorittamatta
    },
    poistaAmpuja(ampuja: string) {
      delete this.pisteet[ampuja]
      delete this.ajat[ampuja]
      delete this.hylkaykset[ampuja]

      // Merkintä turvallisuuskouluksesta vanhenee jos kaikki osallistujat poistetaan.
      if (Object.keys(this.ajat).length == 0) {
        this.turvallisuuskoulutusSuoritettu = false
      }


    },
    getKaikkiRastitSuoritettu(ampuja: string) {
      return [0,1,2,3,4,5,6,7,8].map((x) => this.getRastiSuorituksenTila(ampuja, x)).filter((x) => x === RastiSuorituksenTila.Suoritettu).length === 9
    },
    getHylkaysperuste(ampuja: string) {
      return this.hylkaykset[ampuja]
    },
    kirjaaHylkays(ampuja: string, peruste: string) {
      this.hylkaykset[ampuja] = peruste
    },
    peruHylkays(ampuja: string) {
      delete this.hylkaykset[ampuja]
    },
    reset() {
      this.pisteet = {}
      this.ajat =  {}
      this.hylkaykset = {}
      this.turvallisuuskoulutusSuoritettu = false
      this.jarjestys = "kiertava"
    },
    // Järjestä ampujien lista satunnaisesti
    satunnaistaJarjestys() {
      const nykyinenJarjestys = Object.keys(this.pisteet)
      let uusiJarjestys = nykyinenJarjestys
      do {
        uusiJarjestys = Object.keys(this.pisteet).sort(() => Math.random() - 0.5)
      } while (jarjestysOnSama(nykyinenJarjestys, uusiJarjestys))
      this.pisteet = Object.fromEntries(uusiJarjestys.map(k => [k, this.pisteet[k]]))
    }
  },
})
