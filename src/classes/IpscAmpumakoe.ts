export class IpscAmpumakoe {
    static laukausMaaratPistoolilla = [
        // Asema 1–6: min 4 laukausta (2 lk./taulu)
        [2, 2],
        [2, 2],
        [2, 2],
        [2, 2],
        [2, 2],
        [2, 2],
        // Asema 7–8: min 8 laukausta (4 lk./taulu, 2 paikkaa)
        [4, 4],
        [4, 4],
        // Asema 9: min 12 laukausta (6 lk./taulu, 3 paikkaa)
        [6, 6],
    ]

    static osumaluokat = ['A', 'C', 'D', 'Ohi', 'Rang']

    static rastit = [0, 1, 2, 3, 4, 5, 6, 7, 8]

    static osumaPisteytys = { 'A': 5, 'C': 3, 'D': 1, 'Ohi': -10, 'Rang': -10 }

    // Hyväksytty: HF ≥ 1,4 vähintään 7 asemalla
    static hyvaksymisRaja = 1.4
    static hyvaksymisAsemia = 7

    static rastikuvaus = (rasti: number): string => {
        switch (rasti) {
            case 0: return "Asema 1 – 10 m. Lähtöasento sääntö 8.2.2 mukainen. Ammu taulut. Minimilaukausmäärä 4 (2 lk./taulu)."
            case 1: return "Asema 2 – 10 m. Lähtöasento sääntö 8.2.2 mukainen. Ammu taulut vain vahvempaa kättä käyttäen. Minimilaukausmäärä 4 (2 lk./taulu)."
            case 2: return "Asema 3 – 10 m. Lähtöasento: ase ladattuna pöydällä. Ammu taulut vain heikompaa kättä käyttäen. Minimilaukausmäärä 4 (2 lk./taulu)."
            case 3: return "Asema 4 – 10 m. Lähtöasento: selkä kohti tauluja. Käänny ja ammu taulut. Minimilaukausmäärä 4 (2 lk./taulu)."
            case 4: return "Asema 5 – 10 m. Lähtöasento: heikompi kylki kohti tauluja. Käänny ja ammu taulut. Minimilaukausmäärä 4 (2 lk./taulu)."
            case 5: return "Asema 6 – 10 m. Lähtöasento: vahvempi kylki kohti tauluja. Käänny ja ammu taulut. Minimilaukausmäärä 4 (2 lk./taulu)."
            case 6: return "Asema 7 – 10 m. Alueet A ja B, kumpikin noin 1×1 m, alueiden välillä 1 m. Lähtöasento seisten selin ampumasuuntaan, ranteet hartialinjan yläpuolella. Aloita alueelta A tai B. Käänny ja ammu taulut, siirry toiselle alueelle ja ammu taulut uudelleen. Vähintään 1 lataus. Minimilaukausmäärä 8 (4 lk./taulu)."
            case 7: return "Asema 8 – 15 m. Lähtöasento seisten ampumasuuntaan, kädet ristissä rinnalla. Ammu taulut, vaihda polviasentoon ja ammu taulut uudelleen polvelta. Vähintään 1 lataus. Minimilaukausmäärä 8 (4 lk./taulu)."
            case 8: return "Asema 9 – 20–15–10 m. Alueet A (20 m), B (15 m) ja C (10 m), kaikki noin 1×1 m. Lähtö alueelta A. Ammu taulut alueelta A, siirry alueelle B ja ammu taulut, siirry alueelle C ja ammu taulut. Vähintään 2 latausta. Minimilaukausmäärä 12 (6 lk./taulu)."
        }
        return ''
    }

    static osumaLuokatLausuttuna = (osumaluokka: string): string => {
        switch(osumaluokka) {
            case 'A':
                return 'alpha'
            case 'C':
                return 'charlie'
            case 'D':
                return 'delta'
            case 'Ohi':
                return 'mike'
            case 'Rang':
                return 'procedural'
        }
        return ''
    }


}

export enum RastiSuorituksenTila {
    Suorittamatta,
    Kesken,
    Suoritettu
}

export enum KokeenSuorituksenTila {
    Suorittamatta,
    Kesken,
    Hylatty,
    Hyvaksytty
}
