# DOLOŽENO 2.0 — funkční náhled

Náhled: http://127.0.0.1:4182/ . Samostatná pracovní kopie a větev `redesign/dolozeno-2-preview`. Produkce, DNS a původní pracovní složky zůstaly beze změny. Nic nebylo pushnuto ani veřejně nasazeno.

## Spuštění

Potřebujete Node.js 20+. Samotný build nemá externí závislosti.

```powershell
npm.cmd run build
npm.cmd run dev
```

Server poslouchá pouze na localhostu, zpřístupňuje jen `dist`, posílá `noindex, nofollow`, nepovoluje zápisy, nepublikuje administraci ani zdrojové soubory. Náhled nevolá původní analytiku, newsletter ani GitHub API. YouTube se načte až po výslovném kliknutí.

## Co je hotové

- Nová responzivní úvodní stránka, šest tematických kategorií, Velké spisy, archiv a metodika.
- 93 aktuálních článků z GitHub main `0d7f0547c2dd37fc2caab2b0fc3985e30308cf30` (23. 9. 2026). Historický počet 80 se nepoužil.
- Všech 93 původních URL. Duplicitní ID `mars-leopardi-skvrny` má stejné rozlišení URL jako dosavadní generátor; záznamům bez ID se ID nevymýšlí.
- Plné statické HTML článků, původní datum, text, zdroje a verdikty. Čtení funguje bez JavaScriptu.
- Hledání v názvu i obsahu, kombinace tématu a typu, stránkování, reset, stav bez výsledků a stav v URL.
- 115 odstraněných explicitních polí nebo celých bloků glos; přesný obsah a pozice v `reports/migration.json`.
- Původní bitmapy zachované; 87 existujících obálek má optimalizované WebP velikosti 720/1600 px. Hero a logo se nepřebarvují. Hlavní banner má stejnou kompozici, text a poměr stran jako dodaný originál.
- Samostatná nová ilustrace připravovaných Spisů, vytvořená vestavěným imagegen. Podrobný prompt a původ v `assets/GENERATION.json`.
- Samostatná sitemap, robots, canonical, OG a strukturovaná data.

## Co ještě vyžaduje rozhodnutí před produkcí

1. Pět původních článků je tvořeno dialogy Franty a Pepana. Věcný obsah je ponechán celý a označen jako historický formát, jejich portrétní obálky se nezobrazují. Mechanické smazání dialogu by odstranilo i fakta. Přesné pasáže jsou v migračním reportu. Toto není definitivně dokončené redakční odstranění postav.
2. Historické typy `franta` (5) a `uap` (1) jsou dostupné v „Další původní typy“. Nejsou svévolně převedeny na Zprávu/Spekulaci/Svědectví.
3. Soubor `img/tutanchamon-dyka-vesmir-v2.jpg` v aktuálním repozitáři chybí. Datové pole a URL článku zůstaly zachované; rozhraní uvádí, že obrázek chybí. Potřebujeme skutečný původní soubor, žádná AI náhrada se nevytvořila.
4. Desktopové/mobilní návrhy celé stránky zmiňované v zadání nebyly v přílohách. Kompozice je proto nový návrh. Amber `#F4A430` je odebrán z loga; sekundární žlutá `#F2C40F` dočasně pochází ze starého webu. Obě barvy jsou v CSS proměnných.
5. HeroHero nemá dodanou ověřenou URL. Katalog je prázdný, zobrazuje se „připravujeme“. Žádná fiktivní cena, spis ani odkaz.
6. **Automatické novinky: vypnuté.** RSS, překladač Helsinki ani GitHub Actions pro novinky nejsou spuštěné. Není zde ručně stárnoucí obsah. Před jejich případným zavedením je nutné ověřit zdroje/licence, předložit vzorky překladů a teprve pak povolit publikaci.
7. Původní newsletter a analytika mají společný Google Apps Script endpoint; původní implementace je zachovaná ve zdrojovém `index.html`. Nový vzhled je zatím nevolá. Před přepnutím produkce je nutné rozhodnout o jejich zapojení, nikoli potichu tvrdit, že jsou migrované.

## Přidání článku

Současný admin i `index.html` s polem `FEED` zůstaly beze změny. Admin dál ukládá původní formát přes GitHub Contents API. Nový build čte tentýž FEED, nepřevádí jej do nekompatibilní databáze. Původní generátor a GitHub workflow jsou zachované, aby ostrý web během práce fungoval.

Pro novou stránku aktualizujte FEED obvyklým postupem a v `content/topics.json` doplňte přiřazení URL klíče k jednomu ze šesti témat. Další build přidá statickou stránku i vyhledávací index. Bez explicitního přiřazení přebírá kategorie `uap/ufo/disclosure` do UFO/UAP, ostatní do Vědy a vesmíru; toto výchozí přiřazení redakčně ověřte.

Pro samostatné lokální koncepty je `content/articles-extra.json`. Vložte objekt podle `content/article-template.json`, vyplňte skutečné texty/zdroje a nastavte `status: "draft"` nebo `"published"`. Build validuje povinná pole a odmítne chybu s názvem pole. Draft není v archivu ani sitemapě; v lokálním náhledu má samostatnou stránku `/clanky/<id>.html` s označením konceptu. Při změně na published se zařadí do archivu. Přidání do extra souboru se musí provést lokálně nebo editací souboru v GitHubu; starý admin tento nový soubor needituje.

Původní údaje článků včetně nezvyklých formulací zůstávají beze změny. Nový design není novou faktickou verifikací jednotlivých starých tvrzení.

## Přidání videa

Do článku vložte `youtubeVideoId` se skutečným 11znakovým ID. Podporuje se i původní pole `video`. MP4 se do repozitáře nevkládá. Žádný iframe se nevytváří před kliknutím na přehrávání.

## Přidání Velkého spisu

Položky jsou v `content/spisy.json`. Každá potřebuje `id`, `title`, `description`, `image`, `format`, `order`, `status` a `url`. Publikují se jen položky s `status: "published"` a platnou HTTPS URL; neúplné koncepty se nezobrazí. Obrázek je samostatný podklad, nikoli screenshot stránky. Nula položek zobrazí přípravu, jedna nebo více vytvoří pružný grid. Obecná ověřená adresa HeroHero patří do `content/site.json`.

## Ověření

```powershell
npm.cmd test
npm.cmd run test:browser
```

První kontrola porovnává původní data, seznam URL, zachovaný text mimo odstraněné bloky, zdroje, verdikty, obrázky, sitemapu a lokální odkazy. Prohlížečová kontrola ověřuje filtraci, hledání uvnitř textu, stránkování, stav URL, reset, menu, video po kliknutí, plné články bez JS a šířky 360, 390, 768, 1280 a 1440 px. Test prohlížeče používá Playwright z prostředí Codex a nainstalovaný Edge. Jeho cesta není závislostí webu.

Výsledky: `reports/verification.json`, `reports/browser-report.json`. Snímky: `reports/screenshots/`. Migrační protokol: `reports/migration.md` a podrobný `reports/migration.json`.

## Přístupy a náklady

Lokální náhled, build a hledání nepotřebují API klíč, databázi ani placené inference API. Vygenerování jedné ilustrace proběhlo vestavěným nástrojem; nemám samostatné měření jeho nákladu. Budoucí nasazení vyžaduje váš GitHub a Cloudflare účet a souhlas s přepnutím. HeroHero URL a chybějící originální obrázek je potřeba doplnit. Žádná placená služba ani automatizace nebyla objednána.

## Cloudflare a návrat

Před nasazením vyřešte otevřené body výše a znovu synchronizujte aktuální FEED. Tento náhled je určený k revizi, ne k okamžitému přepnutí domény. Produkční build má záměrnou kontrolu nevyřešených dialogů; po jejich skutečném posouzení lze spustit `node tools/build.cjs --production --allow-reviewed-legacy` (pouze pokud je zachování historických dialogů schválenou volbou), jinak je nejprve redakčně vypořádejte.

Navržené nastavení Pages po schválení: GitHub repozitář webu, produkční větev schválená pro redesign, build `npm run build:production`, výstup `dist`, Node 20+. Statické soubory nepotřebují Workers, databázi ani další služby. Nastavení hostingu je návrh, nebylo provedeno ani ověřeno veřejným deployem. Preview build musí nadále mít noindex; vlastní doménu nepřipojovat před schválením.

Původní GitHub Pages a jeho workflow mohou zůstat aktivní do okamžiku kontrolovaného přepnutí. Při napojení nového hostingu ověřte oprávnění adminu, větev zápisů, následný build a analytiku na testovacím nasazení. Staré URL se nemění, takže nejsou potřeba plošná 301 přesměrování.

Záloha kompletní historie: sousední `dolozeno-2-before-redesign.bundle`, ověřená příkazem `git bundle verify`. Návrat: obnovit předchozí nasazení hostingu a případně původní směrování domény; data a původní generátor jsou i v commitu `0d7f0547...`. Změna DNS ani produkce se v této práci nestala.
