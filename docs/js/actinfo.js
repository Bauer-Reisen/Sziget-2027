// Infos zu den Acts der 1. Welle: Stil, Herkunft, kurz erklärt, bekannte Songs und wie sie live sind.
// Eigene Zusammenfassung aus Presse und Live-Kritiken, Stand November 2026.
// live: 3 = Live-Tipp (mitreißende Show), 2 = live stark, 1 = eher solide / noch am Anfang, 0 = kaum Kritiken gefunden.
// sp = Kennung der Spotify-Künstlerseite (Bild und Hörproben kommen von dort).
export const INFO_STAND = 'Stand: November 2026';

const IMG = 'https://image-cdn-fa.spotifycdn.com/image/';
const IMG2 = 'https://image-cdn-ak.spotifycdn.com/image/';

export const ACT_INFO = {
  'w1-fontaines-dc': {
    sp: '3SXwqSqAoBz9WCI9PDQzY6', img: IMG + 'ab6761610000517450d562d05673af1ca1380a07',
    genre: 'Post-Punk, Indie-Rock', from: 'Dublin, Irland',
    about: 'Gerade eine der wichtigsten Gitarrenbands Europas. Vier Alben seit 2019, mit „Romance" (2024) kam der große Durchbruch: Festival-Headliner, Grammy-Nominierungen und ein Brit Award als beste internationale Band.',
    hits: ['Starburster', 'Favourite', 'Here\'s the Thing', 'Boys in the Better Land'],
    live: 3, liveText: 'Sänger Grian Chatten hat eine enorme Bühnenpräsenz, die Band spielt laut, dicht und intensiv. Kritiker zählen die Romance-Shows zu den besten Rock-Konzerten der letzten Jahre.',
  },
  'w1-katseye': {
    sp: '3c0gDdb9lhnHGFtP4prQpn', img: IMG + 'ab6761610000517404ba72b2749f90d62152ebec',
    genre: 'Pop, Girlgroup', from: 'Los Angeles, USA',
    about: 'Weltweite Girlgroup, gecastet in einer Netflix-Show (von den Machern von BTS). In kurzer Zeit riesig geworden, über 30 Millionen Hörer im Monat.',
    hits: ['Gnarly', 'Gabriela', 'Touch', 'Animal', 'Debut'],
    live: 2, liveText: 'Perfekt einstudierte Tanz-Show, Kritiken von Coachella und Governors Ball sehr gut. Typisches Pop-Konzert mit Choreografie statt Band. 2026 trat die Gruppe teils mit fehlenden Mitgliedern auf.',
  },
  'w1-lola-young': {
    sp: '67FB4n52MgexGQIG8s0yUH', img: IMG + 'ab67616100005174b9fb07d9832af024020defac',
    genre: 'Soul-Pop, Singer-Songwriterin', from: 'London, England',
    about: 'Rauchige Stimme, sehr ehrliche Texte. Ihr Song „Messy" war 2025 Nummer 1 in England und lief überall. Nach einem Zusammenbruch auf der Bühne Ende 2025 hat sie pausiert, 2026 ist sie zurück.',
    hits: ['Messy', 'Conceited', 'Flicker', 'Wish You Were Dead'],
    live: 2, liveText: 'Seit dem Comeback 2026 sehr gute Kritiken: roh, witzig, stimmlich fast wie auf Platte (Irish Times: 4 von 5 Sternen). Eher Stimme und Gefühl als große Show.',
  },
  'w1-bicep': {
    sp: '73A3bLnfnz5BoQjb4gNCga', img: IMG + 'ab676161000051741a32edf0e6db1fd3a443ab6c',
    genre: 'Elektronisch, Breakbeat, House', from: 'Belfast, Nordirland (leben in London)',
    about: 'Zwei Freunde aus Belfast, die mit ihrem Blog anfingen und heute zu den größten Elektro-Acts gehören. Melancholisch und tanzbar zugleich.',
    hits: ['Glue', 'Apricots', 'Atlas', 'Saku'],
    live: 3, liveText: 'Live mit riesiger Licht- und Videoshow. Wenn „Glue" kommt, singt das ganze Gelände mit. Einer der Momente, für die man auf Festivals fährt.',
  },
  'w1-chris-stussy': {
    sp: '3BxjasMelf9pKaE4f7Y0So', img: IMG + 'ab676161000051744cc3d7f3a3274ecfe6692aa6',
    genre: 'House (DJ)', from: 'Amsterdam, Niederlande',
    about: 'DJ und Produzent, gerade einer der gefragtesten House-DJs, Stammgast im DC-10 auf Ibiza. Auf Spotify heißt er inzwischen „Chris Stassy".',
    hits: ['Desire', 'Wide Awake', 'Breather'],
    live: 2, liveText: 'DJ-Set: lange, groovige Mischungen zum Durchtanzen, kein Konzert zum Zuschauen. Gilt als Garant für Stimmung am Abend.',
  },
  'w1-gogol-bordello': {
    sp: '2SVw939fwuqSobLjF8u78b', img: IMG + 'ab676161000051748fa64d362faa0baa10776df5',
    genre: 'Gypsy-Punk', from: 'New York, USA (Sänger aus der Ukraine)',
    about: 'Punk trifft Balkan-Musik: Geige, Akkordeon, Trommeln. Sänger Eugene Hütz stammt aus der Ukraine. Seit über 20 Jahren eine feste Größe auf Festivals.',
    hits: ['Start Wearing Purple', 'Wonderlust King', 'Pala Tute', 'Through the Roof \'n\' Underground'],
    live: 3, liveText: 'Legendär als Live-Band: wildes, fröhliches Chaos, alle springen, die Band tobt über die Bühne. Auch wer die Songs nicht kennt, tanzt mit.',
  },
  'w1-idles': {
    sp: '75mafsNqNE1WSEVxIKuY5C', img: IMG2 + 'ab6761610000517415a2ab2d3913d5b998e93e71',
    genre: 'Punk, Post-Punk', from: 'Bristol, England',
    about: 'Laut, wütend und trotzdem herzlich: Songs gegen Hass und für Zusammenhalt. Fünf Alben, zuletzt „Tangk" (2024), mehrere Grammy-Nominierungen.',
    hits: ['Never Fight a Man with a Perm', 'Danny Nedelko', 'Dancer', 'Grace'],
    live: 3, liveText: 'Gilt als eine der besten Live-Bands überhaupt. Riesige Pogo-Kreise, der Gitarrist springt in die Menge, enorme Energie. Wer es lieber ruhig mag: weiter hinten stehen.',
  },
  'w1-kelis': {
    sp: '0IF46mUS8NXjgHabxk2MCM', img: IMG + 'ab67616100005174d1222863c4217cf03dde3613',
    genre: 'R&B, Pop', from: 'New York, USA',
    about: 'R&B-Star der 2000er. „Milkshake" kennt jeder. Seit einigen Jahren wieder viel auf Festivals unterwegs.',
    hits: ['Milkshake', 'Caught Out There', 'Bossy', 'Trick Me', 'Acapella'],
    live: 1, liveText: 'Gute Hit-Party zum Mitsingen, z. B. 2026 in Portsmouth im Regen gefeiert. Die Kritiken schwanken aber: manchmal begeisternd, manchmal eher mau.',
  },
  'w1-nothing-but-thieves': {
    sp: '1kDGbuxWknIKx4FlgWxiSp', img: IMG + 'ab676161000051744ac4e37dd1914f5bb575e248',
    genre: 'Alternative Rock', from: 'Southend-on-Sea, England',
    about: 'Gitarrenrock mit großen Refrains. Sänger Conor Mason hat eine außergewöhnlich hohe, kraftvolle Stimme. 2026 kam das Album „Stray Dogs".',
    hits: ['Amsterdam', 'Sorry', 'Impossible', 'Welcome to the DCC'],
    live: 2, liveText: 'Live sehr sauber und kraftvoll, die Stimme hält auch live, was sie auf Platte verspricht. Solide gute Rock-Show, keine wilde.',
  },
  'w1-royel-otis': {
    sp: '5b5bt4mZQpJMoCRbiQ7diH', img: IMG + 'ab67616100005174f9611f076ce2c0d5fbda708d',
    genre: 'Indie-Pop, Indie-Rock', from: 'Sydney, Australien',
    about: 'Duo aus Royel Maddell und Otis Pavlovic. Bekannt geworden mit Coverversionen von „Murder on the Dancefloor" und „Linger", dazu eigene sonnige Gitarrensongs.',
    hits: ['Murder on the Dancefloor', 'Linger', 'Oysters in My Pocket', 'Sofa King'],
    live: 1, liveText: 'Locker, sympathisch, gut gespielt. Kritiker: keine Übertreibung, einfach gute Songs mit entspannter Sicherheit. Schön für den Nachmittag in der Sonne, keine große Show.',
  },
  'w1-sofi-tukker': {
    sp: '586uxXMyD5ObPuzjtrzO1Q', img: IMG2 + 'ab67616100005174061cb05553134ad154422127',
    genre: 'Dance, House', from: 'New York, USA',
    about: 'Duo aus Sophie Hawley-Weld und Tucker Halpern. Tanzbarer House mit Gitarre und portugiesischen Texten. „Best Friend" wurde durch die iPhone-Werbung bekannt.',
    hits: ['Best Friend', 'Drinkee', 'Purple Hat', 'Swing'],
    live: 3, liveText: 'Eine einzige Tanzparty: die beiden springen, feuern das Publikum an und holen Leute mit ins Geschehen. Perfekt am Abend, wenn man feiern will.',
  },
  'w1-tove-lo': {
    sp: '4NHQUGzhtTLFvgF5SZesLK', img: IMG + 'ab67616100005174052316e437e3525c9f9b473b',
    genre: 'Elektro-Pop', from: 'Stockholm, Schweden',
    about: 'Schwedische Popsängerin, frech und direkt. Schreibt auch Songs für andere Stars.',
    hits: ['Habits (Stay High)', 'Talking Body', 'Cool Girl', 'No One Dies from Love'],
    live: 2, liveText: 'Viel Energie, tanzt, flirtet mit dem Publikum, bekannt für ihre ungezügelte Art auf der Bühne. Gute Pop-Show zum Mitsingen.',
  },
  'w1-brina-knauss': {
    sp: '3dAC3NjJnsavHLFC8GCyRZ', img: IMG2 + 'ab67616100005174004ccee26a4cbf0dc068e2e0',
    genre: 'Melodic Techno, Deep House (DJ)', from: 'Slowenien (lebt in Mailand)',
    about: 'DJ und Produzentin, früher Sängerin einer Girlgroup und Model. Legt in Mailand und auf Ibiza auf.',
    hits: [],
    live: 0, liveText: 'Kaum Kritiken gefunden. Ein DJ-Set zum Tanzen, am besten einfach reinhören.',
  },
  'w1-cruz-beckham': {
    sp: '3ZPOiGqgEbfNlKFFKxXVsD', img: IMG + 'ab67616100005174037bb6f9b4f504b07a0c8c29',
    genre: 'Indie-Rock', from: 'London, England',
    about: 'Jüngster Sohn von David und Victoria Beckham, mit seiner Band The Breakers seit 2026 unterwegs: ausverkaufte erste Konzerte, Auftritte in Reading und bei Lollapalooza.',
    hits: ['Lick the Toad', 'For Your Love', 'Waste Your Pain'],
    live: 1, liveText: 'Gemischte Kritiken: Cruz wirkt charismatisch und hat Spaß, die Band spielt sauber, aber noch ohne eigenen Stil. Eher aus Neugier.',
  },
  'w1-florence-road': {
    sp: '0zzKEeF2bAVKrWeKc9CyJV', img: IMG + 'ab67616100005174babecfa2125175dfc5a0679b',
    genre: 'Indie-Rock', from: 'Bray, Irland',
    about: 'Vier junge Frauen, die sich in der Schule kennengelernt haben. Bekannt geworden über TikTok, dann Vorband für Olivia Rodrigo. „Hanging Out to Dry" war Nummer 1 im irischen Radio.',
    hits: ['Heavy', 'Hanging Out to Dry'],
    live: 1, liveText: 'Aufsteigende Band, noch wenige große Kritiken. Gilt als Newcomer, den man früh gesehen haben sollte.',
  },
  'w1-genesis-owusu': {
    sp: '1HvH97rzvCH6lfnLlgyfke', img: IMG + 'ab676161000051743776afbc0055ec4f9163a19c',
    genre: 'Hip-Hop, Funk, Punk', from: 'Canberra, Australien (geboren in Ghana)',
    about: 'Mischt Rap, Funk, Punk und Soul. Sein Album „Smiling with No Teeth" hat in Australien die wichtigsten Preise gewonnen.',
    hits: ['Don\'t Need You', 'The Other Black Dog', 'Gold Chains', 'Leaving the Light'],
    live: 3, liveText: 'Geheimtipp für Live-Fans: wild, körperlich, mit Tänzern und Band, eher Punk-Konzert als Rap-Show. Auch wenn man ihn nicht kennt, lohnt es sich.',
  },
  'w1-kevin-de-vries': {
    sp: '11aPF3sc8lDWNqPVInm4Zx', img: IMG2 + 'ab67616100005174c691e61a687ca030cfe6985a',
    genre: 'Melodic Techno (DJ)', from: 'Deutschland',
    about: 'DJ und Produzent, bekannt von Afterlife-Partys. „Metro" (mit Mau P) hat Millionen Aufrufe.',
    hits: ['Metro', 'Dance With Me', '7 Days'],
    live: 2, liveText: 'Druckvolle, dunkle Techno-Sets für große Bühnen. Für alle, die nachts noch tanzen wollen.',
  },
  'w1-quest': {
    sp: '', img: '',
    genre: 'Techno, Electro (DJ)', from: 'lebt in Berlin (aus Italien)',
    about: 'DJ aus dem Untergrund, mischt Techno, Electro und House mit Einflüssen aus italienischem Hip-Hop. Betreibt das Label „La Nota del Diablo".',
    hits: [],
    live: 0, liveText: 'Kaum Kritiken gefunden. Für Techno-Fans, die es rauer mögen.',
  },
  'w1-rikas': {
    sp: '3OWO2LOPTl1u6XvJHkwHmd', img: IMG2 + 'ab676161000051742da3d2d11a5748865104c74a',
    genre: 'Indie-Pop, Funk', from: 'Stuttgart, Deutschland',
    about: 'Vier Jungs aus Stuttgart, die als Straßenmusiker angefangen haben. Gute-Laune-Musik zwischen Indie und Funk. Zum 10-Jährigen spielten sie in der Stuttgarter Oper.',
    hits: [],
    live: 2, liveText: 'Kritiker: live noch besser als auf Platte, viel Spielfreude, plötzliche Tempowechsel, man tanzt automatisch.',
  },
  'w1-villanelle': {
    sp: '3J9QwmRJDdn9Oq1fB6mfcF', img: IMG2 + 'ab67616100005174c5d59f4a5678231b011a7ae8',
    genre: 'Indie-Rock, Grunge', from: 'England',
    about: 'Junge Band um Gene Gallagher, den Sohn von Liam Gallagher (Oasis). Seit 2024 unterwegs, u. a. als Vorband von Liam Gallagher.',
    hits: ['Hinge', 'Placebo', 'Measly Means'],
    live: 2, liveText: 'Überwiegend gute Kritiken: selbstbewusst, rotzig, mit Grunge-Gitarren. Gene gilt als geborener Frontmann. In kleinen Hallen am stärksten.',
  },
};

export const LIVE_LABEL = ['', 'live solide', 'live stark', 'Live-Tipp'];

export const spotifyArtist = (sp) => `https://open.spotify.com/artist/${sp}`;
export const spotifySearch = (q) => `https://open.spotify.com/search/${encodeURIComponent(q)}`;
export const spotifyEmbed = (sp) => `https://open.spotify.com/embed/artist/${sp}?theme=0`;
