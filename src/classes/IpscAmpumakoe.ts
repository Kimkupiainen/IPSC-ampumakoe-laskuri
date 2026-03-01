export class IpscAmpumakoe {
    static laukausMaaratPistoolilla = [
        // Rasti 1: Perustarkkuus – molemmin käsin, vahvemmalla, heikommalla
        [6, 6],
        // Rasti 2: Käännökset – 180° ja 90°
        [6, 6],
        // Rasti 3: Siirtyminen sivulle ja lippaan vaihto
        [4, 2],
        // Rasti 4: Siirtyminen eteen päin ja lippaan vaihto
        [6, 6],
        // Rasti 5: Valinnaissuoritus
        [4, 4]]

    static osumaluokat = ['A', 'C', 'D', 'Ohi', 'Rang']

    static rastit = [0, 1, 2, 3, 4]

    static osumaPisteytys = { 'A': 5, 'C': 3, 'D': 1, 'Ohi': -10, 'Rang': -10 }

    static rastikuvaus = (rasti: number): string => {
        switch (rasti) {
            case 0: return "10 m. Lähtöasento seisten kohti tauluja, pistooli kotelossa. 1. SARJA (ohjeaika 5 s): 2 lk./taulu molemmin käsin. 2. SARJA (ohjeaika 5 s): 2 lk./taulu vahvemmalla kädellä. 3. SARJA (ohjeaika 5 s): 2 lk./taulu heikommalla kädellä."
            case 1: return "10 m. Pistooli ladattuna kotelossa. 1. SARJA (ohjeaika 5 s): lähtöasento selkä kohti tauluja, käännös 180° ja 2 lk./taulu. 2. SARJA (ohjeaika 5 s): lähtöasento vasen kylki kohti tauluja, käännös 90° ja 2 lk./taulu. 3. SARJA (ohjeaika 5 s): lähtöasento oikea kylki kohti tauluja, käännös 90° ja 2 lk./taulu."
            case 2: return "10 m. Lähtöasento selin kädet ylhäällä, pistooli ladattuna kotelossa, ohjeaika 15 s. Suoritus: käännös 180° ja 2 lk. tauluun paikasta A tai B, siirtyminen toiselle puolelle lippaanvaihdon aikana ja 2 lk. toiseen tauluun, siirtyminen takaisin lähtöpaikkaan lippaanvaihdon aikana ja 2 lk. lähtöpaikasta."
            case 3: return "20–15–10 m, ohjeaika 25 s. Lähtöasento seisten kohti tauluja, pistooli kotelossa. 2 lk./taulu 20 m:stä seisaaltaan, siirtyminen lippaanvaihdon aikana 15 m:iin ja 2 lk./taulu polvelta, siirtyminen lippaanvaihdon aikana 10 m:iin ja 2 lk./taulu makuulta tai polvelta."
            case 4: return "10–15 m. Pistooli ladattuna kotelossa, ohjeaika 15 s. Ampuja valitsee aloittaako paikasta A vai B. 2 lk. kumpaankin tauluun paikasta A, siirtyminen paikkaan B ja 2 lk. kumpaankin tauluun, siirtyminen paikkaan C ja 2 lk. kumpaankin tauluun."
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
