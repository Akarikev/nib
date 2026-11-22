import sharp from 'sharp';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT = join(process.cwd(), 'store-assets');
mkdirSync(OUT, { recursive: true });

const f500 = readFileSync('node_modules/@expo-google-fonts/fredoka/500Medium/Fredoka_500Medium.ttf').toString('base64');
const f600 = readFileSync('node_modules/@expo-google-fonts/fredoka/600SemiBold/Fredoka_600SemiBold.ttf').toString('base64');
const n600 = readFileSync('node_modules/@expo-google-fonts/nunito/600SemiBold/Nunito_600SemiBold.ttf').toString('base64');
const n800 = readFileSync('node_modules/@expo-google-fonts/nunito/800ExtraBold/Nunito_800ExtraBold.ttf').toString('base64');

const fontDefs = `<defs>
  <style type="text/css">
    @font-face { font-family: 'Fredoka600'; src: url(data:font/ttf;base64,${f600}) format('truetype'); font-weight: 600; }
    @font-face { font-family: 'Fredoka500'; src: url(data:font/ttf;base64,${f500}) format('truetype'); font-weight: 500; }
    @font-face { font-family: 'Nunito600'; src: url(data:font/ttf;base64,${n600}) format('truetype'); font-weight: 600; }
    @font-face { font-family: 'Nunito800'; src: url(data:font/ttf;base64,${n800}) format('truetype'); font-weight: 800; }
    .f600 { font-family: 'Fredoka600', 'Fredoka', sans-serif; font-weight: 600; }
    .f500 { font-family: 'Fredoka500', 'Fredoka', sans-serif; font-weight: 500; }
    .n600 { font-family: 'Nunito600', 'Nunito', sans-serif; font-weight: 600; }
    .n800 { font-family: 'Nunito800', 'Nunito', sans-serif; font-weight: 800; }
  </style>
  <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="125%">
    <feDropShadow dx="0" dy="18" stdDeviation="24" flood-color="#354F47" flood-opacity="0.11" />
  </filter>
  <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
    <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#354F47" flood-opacity="0.08" />
  </filter>
  <clipPath id="studioClip">
    <rect x="0" y="0" width="780" height="1116" rx="46" />
  </clipPath>
</defs>`;

function roomSvg({
  atmosphere = 'sunny',
  catOwned = true,
  lamp = true,
  plant = true,
  rug = true,
  poster = true,
  lights = true,
  espresso = true,
  headphones = true,
  keyboard = true,
  monitor = true,
  working = true,
  celebrating = false,
  screenMode = 'editor',
}: {
  atmosphere?: 'sunny' | 'rainy' | 'moonlit';
  catOwned?: boolean;
  lamp?: boolean;
  plant?: boolean;
  rug?: boolean;
  poster?: boolean;
  lights?: boolean;
  espresso?: boolean;
  headphones?: boolean;
  keyboard?: boolean;
  monitor?: boolean;
  working?: boolean;
  celebrating?: boolean;
  screenMode?: 'editor' | 'studio';
}) {
  const night = atmosphere === 'moonlit';
  const rain = atmosphere === 'rainy';
  const wall = night ? '#C8D1DB' : rain ? '#D7E4E2' : '#E2EDE2';
  const stroke = '#4D5C55';

  const cat = catOwned
    ? `<g>
      <ellipse cx="112" cy="205" rx="27" ry="4" fill="#8E755C" opacity=".18"/>
      <path d="M93 198 Q91 179 116 181 Q138 180 137 198 Q135 207 112 206Z" fill="#EFBA88" stroke="${stroke}" stroke-width="3"/>
      <path d="M93 198 Q78 207 90 211 Q109 216 119 204" fill="#E4A06B" stroke="${stroke}" stroke-width="3" stroke-linecap="round"/>
      <path d="M91 185 L89 169 Q90 166 99 176 Q107 172 114 177 L123 169 L123 188 Q123 201 108 202 Q92 202 91 185Z" fill="#EFBA88" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M94 175 L95 183 L101 179 M118 176 L113 180 L120 183" fill="#D58E77"/>
      <path d="M98 190 Q101 193 104 190 M111 190 Q114 193 117 190 M105 196 Q108 198 111 195" fill="none" stroke="${stroke}" stroke-width="1.7" stroke-linecap="round"/>
      <path d="M107 177 V182 M114 179 L113 183 M126 186 L124 190" stroke="#CC8B5E" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M106 193 H110 L108 195Z" fill="#B47C6B"/>
      <path d="M123 198 Q135 203 140 198" stroke="${stroke}" stroke-width="8" fill="none" stroke-linecap="round"/>
      <path d="M123 198 Q135 203 140 198" stroke="#EFBA88" stroke-width="5" fill="none" stroke-linecap="round"/>
    </g>`
    : '';

  const developerSeated = `<g>
    <path d="M175 247 Q180 260 198 263 Q205 264 205 272 L201 295 Q196 298 191 294 L194 272 Q172 270 168 257Z" fill="#927568" stroke="${stroke}" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M195 247 Q207 249 224 257 Q231 260 230 270 L226 295 Q220 298 216 294 L218 270 Q201 268 190 260Z" fill="#AA8978" stroke="${stroke}" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M191 293 L190 300 Q201 304 212 300 Q211 295 201 293Z M216 293 L215 300 Q226 304 237 300 Q236 295 226 293Z" fill="#F6E7CF" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M194 190 Q202 187 208 196 L216 207 L231 198 L238 205 L219 217 Q212 221 206 213 L191 201Z" fill="#7FA58F" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M230 199 Q234 196 240 197 L247 199 Q250 201 247 203 L238 203 L235 206Z" fill="#C98E6B" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M239 199 L246 200" stroke="#A86F52" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M162 250 Q160 218 167 201 Q173 190 187 191 L204 191 Q216 194 220 207 L222 252 Q194 261 162 250Z" fill="#91B5A0" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M183 184 V197 Q191 204 201 198 V183" fill="#C98E6B" stroke="${stroke}" stroke-width="3"/>
    <path d="M173 196 Q188 211 205 196 Q202 211 190 212 Q177 211 173 196Z" fill="#A8C5AF" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M174 240 Q191 245 209 241" fill="none" stroke="#6E9583" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M208 192 Q218 189 223 199 L232 210 L251 199 L258 207 L236 220 Q228 225 220 216 L205 203 Q201 196 208 192Z" fill="#91B5A0" stroke="${stroke}" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M249 200 L255 208" stroke="#6E9583" stroke-width="2" stroke-linecap="round"/>
    <path d="M252 199 Q257 196 262 198 L269 201 Q271 204 267 205 L259 205 L256 208Z" fill="#C98E6B" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M261 200 L267 202" stroke="#A86F52" stroke-width="1.4" stroke-linecap="round"/>
    ${working ? `<path d="M240 204 H246" stroke="#FFF1BF" stroke-width="1.5" stroke-linecap="round" opacity="0.7"/>` : ''}
    <rect x="166" y="231" width="47" height="34" rx="13" fill="#A4BFAE" stroke="${stroke}" stroke-width="4"/>
    <path d="M158 165 Q147 156 153 141 Q149 131 160 127 Q159 115 175 118 Q185 107 196 116 Q211 112 218 125 Q229 128 225 143 L223 166 Q220 187 201 193 Q170 198 158 176Z" fill="#4B403A" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M214 141 Q225 145 225 161 L234 166 Q237 170 229 173 L226 179 Q221 189 207 189 L206 177 Q213 168 210 159Z" fill="#C98E6B" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>
    <ellipse cx="208" cy="167" rx="6" ry="8" fill="#C98E6B" stroke="${stroke}" stroke-width="2.5"/>
    <path d="M207 165 Q211 163 210 169 M221 164 L225 164 M222 179 L226 178" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round"/>
    <ellipse cx="221" cy="173" rx="4" ry="2.5" fill="#DBA086"/>
  </g>`;

  const developerCelebrating = `<g transform="translate(46, -2)">
    <path d="M166 246 Q190 242 215 246 L213 295 Q207 300 200 295 L195 270 H187 L182 295 Q175 300 168 295Z" fill="#9B7C70" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M168 293 L164 302 Q174 307 185 302 L182 294 M200 294 L199 302 Q213 307 223 301 Q221 296 212 293" fill="#F6E7CF" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M157 247 Q157 216 171 208 Q189 201 210 209 Q222 219 221 249 Q193 260 157 247Z" fill="#91B5A0" stroke="${stroke}" stroke-width="4"/>
    <path d="M176 213 Q190 224 206 213 M177 242 Q191 247 204 241" fill="none" stroke="#6E9583" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M184 204 V215 Q192 219 199 214 V203" fill="#C98E6B" stroke="${stroke}" stroke-width="3"/>
    <g transform="rotate(150 166 216)">
      <path d="M166 216 Q156 230 170 237" stroke="${stroke}" stroke-width="16" fill="none" stroke-linecap="round"/>
      <path d="M166 216 Q156 230 166 235" stroke="#91B5A0" stroke-width="11" fill="none" stroke-linecap="round"/>
      <ellipse cx="171" cy="238" rx="7" ry="5" fill="#C98E6B" stroke="${stroke}" stroke-width="2.5"/>
    </g>
    <g transform="rotate(-150 214 216)">
      <path d="M214 216 Q228 230 215 238" stroke="${stroke}" stroke-width="16" fill="none" stroke-linecap="round"/>
      <path d="M214 216 Q228 230 220 235" stroke="#91B5A0" stroke-width="11" fill="none" stroke-linecap="round"/>
      <ellipse cx="214" cy="239" rx="7" ry="5" fill="#C98E6B" stroke="${stroke}" stroke-width="2.5"/>
    </g>
    <ellipse cx="157" cy="179" rx="7" ry="9" fill="#C98E6B" stroke="${stroke}" stroke-width="3"/>
    <ellipse cx="225" cy="179" rx="6" ry="8" fill="#C98E6B" stroke="${stroke}" stroke-width="3"/>
    <path d="M157 166 Q157 137 190 136 Q223 137 225 169 L223 187 Q219 211 191 213 Q160 211 158 187Z" fill="#C98E6B" stroke="${stroke}" stroke-width="4"/>
    <path d="M155 175 Q148 168 153 155 Q148 145 161 141 Q160 129 176 134 Q186 123 198 133 Q213 128 219 142 Q230 145 226 160 L224 172 Q216 167 211 155 Q202 165 190 157 Q177 170 165 163 L162 176Z" fill="#4B403A" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="176" cy="180" r="11" fill="#E5CCAF" fill-opacity=".22" stroke="${stroke}" stroke-width="2.5"/>
    <circle cx="207" cy="180" r="11" fill="#E5CCAF" fill-opacity=".22" stroke="${stroke}" stroke-width="2.5"/>
    <path d="M187 179 H196 M165 178 L158 176 M218 178 L224 176" stroke="${stroke}" stroke-width="2"/>
    <path d="M172 181 Q176 177 180 181 M203 181 Q207 177 211 181 M183 194 Q192 207 202 194Z" fill="${stroke}" stroke="${stroke}" stroke-width="2" stroke-linecap="round"/>
    <path d="M191 185 L189 190 H193" fill="none" stroke="#AE7255" stroke-width="2" stroke-linecap="round"/>
    <ellipse cx="170" cy="192" rx="6" ry="3" fill="#DBA086"/>
    <ellipse cx="214" cy="192" rx="6" ry="3" fill="#DBA086"/>
  </g>`;

  const windowSky = night
    ? `<path d="M121 59 A17 17 0 1 0 129 86 A18 18 0 0 1 121 59" fill="#FAEAC5"/>
       <g transform="translate(46, 44)">
         <path d="M14 31 h4 M16 29 v4 M39 13 h4 M41 11 v4 M74 43 h4 M76 41 v4 M27 57 h4 M29 55 v4 M85 22 h4 M87 20 v4" stroke="#FFF5D8" stroke-width="1.3" stroke-linecap="round"/>
       </g>`
    : rain
    ? `<g><ellipse cx="110" cy="74" rx="24" ry="11" fill="#DCE6E9"/><circle cx="102" cy="68" r="11" fill="#DCE6E9"/><circle cx="118" cy="68" r="13" fill="#DCE6E9"/></g>
       <g transform="translate(46, 44)">
         <path d="M12 18 l-4 12 M33 24 l-4 12 M54 16 l-4 12 M75 28 l-4 12 M22 58 l-4 12 M48 62 l-4 12 M72 55 l-4 12" stroke="#E9F3F6" stroke-width="1.5" stroke-linecap="round"/>
       </g>`
    : `<circle cx="115" cy="76" r="17" fill="#FFF2B7"/>
       <g transform="translate(46, 44)">
         <circle cx="24" cy="39" r="2" fill="#FFF8DE"/><circle cx="72" cy="71" r="1.5" fill="#FFF8DE"/><circle cx="42" cy="88" r="1.5" fill="#FFF8DE"/>
       </g>`;

  const sw = monitor ? 77 : 55;
  const monitorDisplay =
    screenMode === 'studio'
      ? `<g>
          <rect x="235" y="134" width="${sw}" height="48" rx="3" fill="#23322E"/>
          <line x1="239" y1="144" x2="266" y2="144" stroke="#E9A4AA" stroke-width="1.8" stroke-linecap="round"/>
          <line x1="241" y1="151" x2="268" y2="151" stroke="#9AD1AE" stroke-width="1.8" stroke-linecap="round"/>
          <line x1="241" y1="158" x2="264" y2="158" stroke="#F6D488" stroke-width="1.8" stroke-linecap="round"/>
          <line x1="239" y1="165" x2="266" y2="165" stroke="#C7B6E8" stroke-width="1.8" stroke-linecap="round"/>
          <rect x="275" y="138" width="${sw - 43}" height="40" rx="3" fill="#F8FAF2"/>
          <rect x="278" y="142" width="${sw - 49}" height="13" rx="2" fill="#D5E7CE"/>
          <line x1="278" y1="160" x2="${235 + sw - 7}" y2="160" stroke="#8EA597" stroke-width="2" stroke-linecap="round"/>
          <rect x="278" y="165" width="${sw - 49}" height="6" rx="2" fill="#5C8A74"/>
        </g>`
      : `<g>
          <rect x="235" y="134" width="${sw}" height="48" rx="3" fill="#23322E"/>
          <rect x="235" y="134" width="11" height="48" rx="2" fill="#1B2824"/>
          <line x1="238" y1="142" x2="243" y2="142" stroke="#6E8E81" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="238" y1="148" x2="243" y2="148" stroke="#88B59B" stroke-width="1.5" stroke-linecap="round"/>
          <rect x="248" y="153" width="${sw - 15}" height="6" rx="1.5" fill="#314640"/>
          <line x1="250" y1="143" x2="262" y2="143" stroke="#E9A4AA" stroke-width="2" stroke-linecap="round"/>
          <line x1="266" y1="143" x2="286" y2="143" stroke="#9AD1AE" stroke-width="2" stroke-linecap="round"/>
          <line x1="253" y1="149" x2="274" y2="149" stroke="#F6D488" stroke-width="2" stroke-linecap="round"/>
          <line x1="253" y1="156" x2="270" y2="156" stroke="#C7B6E8" stroke-width="2" stroke-linecap="round"/>
          <line x1="274" y1="156" x2="294" y2="156" stroke="#D5E8DC" stroke-width="2" stroke-linecap="round"/>
          <line x1="253" y1="163" x2="279" y2="163" stroke="#9AD1AE" stroke-width="2" stroke-linecap="round"/>
          <line x1="250" y1="170" x2="266" y2="170" stroke="#E9A4AA" stroke-width="2" stroke-linecap="round"/>
        </g>`;

  const fairyLights = lights
    ? `<g>
        <path d="M12 14 Q96 34 185 18 Q280 34 388 12" fill="none" stroke="${stroke}" stroke-width="2"/>
        ${[
          [46, 21],
          [94, 26],
          [142, 23],
          [218, 22],
          [268, 26],
          [322, 22],
          [364, 16],
        ]
          .map(
            ([lx, ly]) =>
              `<circle cx="${lx}" cy="${ly + 4}" r="8" fill="#FFEAA7" opacity="${night ? 0.55 : 0.3}"/><circle cx="${lx}" cy="${ly + 4}" r="3.2" fill="#FFF7D6" stroke="#D6A954" stroke-width="1"/>`
          )
          .join('')}
      </g>`
    : '';

  return `<svg viewBox="0 0 400 354" width="100%" height="100%">
    <rect width="400" height="354" rx="28" fill="${wall}"/>
    <path d="M0 259 Q200 242 400 259 V354 H0Z" fill="${night ? '#B6A89F' : '#D5BC9E'}"/>
    <path d="M0 259 Q200 242 400 259" stroke="#B5997F" stroke-width="3" fill="none"/>
    <line x1="0" y1="288" x2="400" y2="288" stroke="#C8AB8D" stroke-width="2"/>
    <line x1="0" y1="320" x2="400" y2="320" stroke="#C8AB8D" stroke-width="2"/>
    <line x1="0" y1="350" x2="400" y2="350" stroke="#C8AB8D" stroke-width="2"/>
    <rect x="37" y="35" width="119" height="133" rx="54" fill="#FDF6DE" stroke="${stroke}" stroke-width="4"/>
    <rect x="46" y="44" width="101" height="114" rx="46" fill="${night ? '#596987' : rain ? '#9EB7C3' : '#AFD7E0'}"/>
    ${windowSky}
    <path d="M48 129 Q72 100 97 128 Q121 111 145 137 V156 H48Z" fill="${night ? '#6C8893' : rain ? '#7F9F9C' : '#8AB7A6'}"/>
    <path d="M97 42 V160 M43 103 H151" stroke="#FDF6DE" stroke-width="6"/>
    <rect x="28" y="160" width="138" height="12" rx="6" fill="#FDF6DE" stroke="${stroke}" stroke-width="3"/>
    <path d="M270 52 H354 V64 H270Z" fill="#B8997B" stroke="${stroke}" stroke-width="3"/>
    <rect x="282" y="22" width="13" height="30" rx="3" fill="#E69F82" stroke="${stroke}" stroke-width="2"/>
    <rect x="297" y="17" width="13" height="35" rx="3" fill="#F8D37F" stroke="${stroke}" stroke-width="2"/>
    <path d="M316 30 L325 26 L335 50 L326 54Z" fill="#91B8A6" stroke="${stroke}" stroke-width="2"/>
    ${fairyLights}
    ${poster ? `<g><rect x="198" y="33" width="53" height="70" rx="4" fill="#FDF6DE" stroke="${stroke}" stroke-width="3"/><rect x="204" y="39" width="41" height="58" fill="#777EA8"/><path d="M229 49 A15 15 0 1 0 235 75 A17 17 0 0 1 229 49" fill="#F9DC9B"/><circle cx="214" cy="49" r="2" fill="#FFF5D2"/></g>` : ''}
    ${rug ? `<ellipse cx="210" cy="311" rx="127" ry="29" fill="#E9A68E" stroke="#B87764" stroke-width="3"/>` : ''}
    <ellipse cx="205" cy="306" rx="87" ry="17" fill="#9B806A" opacity=".2"/>
    <path d="M108 220 L101 303 M291 220 L299 303" stroke="${stroke}" stroke-width="12" stroke-linecap="round"/>
    <path d="M108 220 L101 303 M291 220 L299 303" stroke="#BA9676" stroke-width="7" stroke-linecap="round"/>
    <rect x="83" y="207" width="232" height="18" rx="8" fill="#D9AD85" stroke="${stroke}" stroke-width="4"/>
    <rect x="228" y="127" width="${monitor ? 91 : 69}" height="65" rx="8" fill="${monitor ? '#B7A6D8' : '#667D75'}" stroke="${stroke}" stroke-width="4"/>
    ${monitorDisplay}
    <path d="M263 193 V204 M250 205 H278" stroke="${stroke}" stroke-width="5" stroke-linecap="round"/>
    <rect x="211" y="200" width="69" height="7" rx="3" fill="${keyboard ? '#E9A4AA' : '#71867D'}" stroke="${stroke}" stroke-width="2"/>
    ${lamp ? `<g><ellipse cx="182" cy="187" rx="22" ry="13" fill="#FFF3B8" opacity="${night ? '.48' : '.28'}"/><path d="M180 205 H196 M188 205 V186 L181 174" stroke="${stroke}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M170 175 Q179 164 189 175Z" fill="#F6C376" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/><circle cx="179" cy="176" r="3" fill="#FFF7D6"/></g>` : ''}
    <rect x="137" y="187" width="20" height="20" rx="5" fill="#FFF4D9" stroke="${stroke}" stroke-width="3"/>
    <path d="M157 190 Q167 191 158 201" fill="none" stroke="${stroke}" stroke-width="3"/>
    <path d="M144 178 Q139 173 146 167" fill="none" stroke="#8C9D8B" stroke-width="2" stroke-linecap="round"/>
    ${espresso ? `<g><rect x="87" y="172" width="24" height="34" rx="5" fill="#7FA692" stroke="${stroke}" stroke-width="2.8"/><rect x="91" y="177" width="16" height="8" rx="2" fill="#FDF6DE" stroke="${stroke}" stroke-width="1.8"/><circle cx="96" cy="181" r="1.5" fill="#D97A64"/><circle cx="102" cy="181" r="1.5" fill="#658A6C"/><rect x="93" y="191" width="12" height="12" rx="2" fill="#4D5C55"/><rect x="95" y="196" width="8" height="7" rx="2" fill="#FFF4D9"/></g>` : ''}
    ${headphones ? `<g><path d="M291 196 A10 10 0 0 1 309 196" fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="round"/><rect x="287" y="194" width="6" height="11" rx="3" fill="#E69F82" stroke="${stroke}" stroke-width="2"/><rect x="307" y="194" width="6" height="11" rx="3" fill="#E69F82" stroke="${stroke}" stroke-width="2"/></g>` : ''}
    ${plant ? `<g><path d="M48 143 H74 L70 161 H52Z" fill="#EAA787" stroke="${stroke}" stroke-width="2"/><path d="M61 144 V117" stroke="${stroke}" stroke-width="3"/><ellipse cx="51" cy="125" rx="9" ry="5" fill="#749E70" transform="rotate(30 51 125)"/><ellipse cx="70" cy="115" rx="10" ry="5" fill="#749E70" transform="rotate(-35 70 115)"/></g>` : ''}
    ${celebrating ? `<rect x="166" y="231" width="47" height="34" rx="13" fill="#A4BFAE" stroke="${stroke}" stroke-width="4"/>` : ''}
    <rect x="162" y="265" width="62" height="10" rx="5" fill="#8AABA0" stroke="${stroke}" stroke-width="4"/>
    ${
      celebrating
        ? `<path d="M191 274 V300 M191 300 L167 308 M191 300 L216 308" stroke="${stroke}" stroke-width="5" stroke-linecap="round"/>`
        : `<g><path d="M182 275 V309 M182 309 L160 315 M182 309 L205 315" stroke="#788A83" stroke-width="3.5" stroke-linecap="round"/><circle cx="160" cy="315" r="3" fill="#788A83"/><circle cx="205" cy="315" r="3" fill="#788A83"/></g>`
    }
    ${cat}
    ${celebrating ? developerCelebrating : developerSeated}
  </svg>`;
}

// Mascot Portrait Bust helper for Screenshot 3
function mascotCardSvg(x: number, y: number, w: number, name: string, sub: string, tag: string, bg: string, hoodie: string, hair: string, skin: string, variant: 'curly' | 'straight' | 'cap' | 'bob', selected: boolean) {
  const ink = '#4D5C55';
  const backHair =
    variant === 'bob'
      ? `<path d="M148 202 Q144 166 155 144 Q190 128 227 144 Q238 166 234 202 Q224 209 216 198 V165 H165 V198 Q156 209 148 202Z" fill="${hair}" stroke="${ink}" stroke-width="3.2"/>`
      : variant === 'straight'
      ? `<circle cx="191" cy="123" r="14" fill="${hair}" stroke="${ink}" stroke-width="3.2"/>`
      : '';
  const frontHair =
    variant === 'cap'
      ? `<path d="M153 164 Q152 131 191 128 Q230 131 229 164 Q211 155 191 156 Q171 155 153 164Z" fill="#E67D68" stroke="${ink}" stroke-width="3.2"/><path d="M161 157 Q191 151 221 157" fill="none" stroke="#D36B58" stroke-width="3" stroke-linecap="round"/>`
      : variant === 'straight'
      ? `<path d="M155 168 Q154 135 191 133 Q227 135 226 168 Q216 154 202 150 Q191 156 178 150 Q164 155 155 168Z" fill="${hair}" stroke="${ink}" stroke-width="3.2"/>`
      : variant === 'bob'
      ? `<path d="M153 174 Q151 137 191 133 Q230 137 228 174 Q218 157 205 151 Q191 162 175 152 Q162 158 153 174Z" fill="${hair}" stroke="${ink}" stroke-width="3.2"/>`
      : `<path d="M155 173 Q148 166 153 153 Q148 143 161 139 Q160 127 176 132 Q186 121 198 131 Q213 126 219 140 Q230 143 226 158 L224 170 Q216 165 211 153 Q202 163 190 155 Q177 168 165 161 L162 174Z" fill="${hair}" stroke="${ink}" stroke-width="3.2"/>`;

  return `<g transform="translate(${x}, ${y})">
    <rect x="0" y="0" width="${w}" height="248" rx="30" fill="${selected ? '#EEF5E8' : '#FFFFFF'}" stroke="${selected ? '#426E5C' : '#E3E9DC'}" stroke-width="${selected ? 3 : 2}"/>
    ${selected ? `<circle cx="${w - 28}" cy="28" r="15" fill="#426E5C"/><path d="M${w - 34} 28 l4 4 l8 -8" fill="none" stroke="#FFFDF4" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>` : ''}
    <rect x="${w / 2 - 52}" y="22" width="104" height="104" rx="34" fill="${bg}"/>
    <svg x="${w / 2 - 52}" y="22" width="104" height="104" viewBox="132 106 118 128">
      ${backHair}
      <path d="M148 238 Q152 208 171 202 Q191 196 211 202 Q230 208 234 238Z" fill="${hoodie}" stroke="${ink}" stroke-width="3.6"/>
      <path d="M184 196 V209 Q191 214 198 209 V196" fill="${skin}" stroke="${ink}" stroke-width="3"/>
      <ellipse cx="157" cy="177" rx="6.5" ry="8.5" fill="${skin}" stroke="${ink}" stroke-width="3"/>
      <ellipse cx="225" cy="177" rx="6.5" ry="8.5" fill="${skin}" stroke="${ink}" stroke-width="3"/>
      <path d="M158 165 Q158 137 191 136 Q223 137 224 167 L222 185 Q218 207 191 209 Q161 207 159 185Z" fill="${skin}" stroke="${ink}" stroke-width="3.6"/>
      ${frontHair}
      <circle cx="176" cy="177" r="2.8" fill="${ink}"/>
      <circle cx="206" cy="177" r="2.8" fill="${ink}"/>
      <ellipse cx="169" cy="187" rx="5.5" ry="2.8" fill="#DBA086" opacity=".75"/>
      <ellipse cx="213" cy="187" rx="5.5" ry="2.8" fill="#DBA086" opacity=".75"/>
      <path d="M184 191 Q191 197 198 191" fill="none" stroke="${ink}" stroke-width="2.6" stroke-linecap="round"/>
    </svg>
    <text x="${w / 2}" y="162" text-anchor="middle" class="f600" font-size="25" fill="#354F47">${name}</text>
    <text x="${w / 2}" y="188" text-anchor="middle" class="n600" font-size="18" fill="#788A7E">${sub}</text>
    <rect x="${w / 2 - 42}" y="202" width="84" height="28" rx="14" fill="${selected ? '#DCEAD0' : '#F3F6EE'}"/>
    <text x="${w / 2}" y="221" text-anchor="middle" class="n800" font-size="14" fill="${selected ? '#426E5C' : '#788A7E'}">${tag}</text>
  </g>`;
}

// 1. Feature Graphic (1024 x 500)
const featureGraphicSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500" viewBox="0 0 1024 500">
  ${fontDefs}
  <rect width="1024" height="500" fill="#F8FAF2"/>
  <circle cx="120" cy="60" r="240" fill="#E5EEDC" opacity="0.65"/>
  <circle cx="920" cy="450" r="260" fill="#F7E4D1" opacity="0.55"/>

  <g transform="translate(72, 84)">
    <rect x="0" y="0" width="248" height="38" rx="19" fill="#E5EEDC"/>
    <circle cx="22" cy="19" r="5" fill="#426E5C"/>
    <text x="38" y="24" class="n800" font-size="13.5" fill="#426E5C" letter-spacing="1.2">REMEMBER CODING BY HAND</text>

    <text x="0" y="122" class="f600" font-size="88" fill="#354F47">Nib<tspan fill="#D69F6A">.</tspan></text>
    <text x="2" y="174" class="f500" font-size="29" fill="#354F47">Quiet focus. Real craft.</text>
    <text x="2" y="210" class="f500" font-size="29" fill="#426E5C">A cozy offline dev studio.</text>

    <text x="2" y="260" class="n600" font-size="17.5" fill="#788A7E">Pick a mascot, watch live terminal logs,</text>
    <text x="2" y="286" class="n600" font-size="17.5" fill="#788A7E">pet your desk cat, and ship small projects.</text>

    <g transform="translate(0, 320)">
      <rect x="0" y="0" width="144" height="40" rx="20" fill="#F7EDCE"/>
      <text x="72" y="25" text-anchor="middle" class="n800" font-size="14" fill="#A47A2A">100% Offline</text>
      <rect x="156" y="0" width="186" height="40" rx="20" fill="#FFFFFF" stroke="#E4EADB" stroke-width="1.5"/>
      <text x="249" y="25" text-anchor="middle" class="n800" font-size="14" fill="#354F47">No Ads · No AI Hype</text>
    </g>
  </g>

  <g transform="translate(520, 44)" filter="url(#cardShadow)">
    <rect x="-10" y="-10" width="452" height="404" rx="38" fill="#FFFFFF"/>
    <svg x="0" y="0" width="432" height="382" viewBox="0 0 400 354">
      ${roomSvg({ atmosphere: 'sunny', catOwned: true, lamp: true, plant: true, rug: true, poster: true, lights: true, espresso: true, headphones: true, keyboard: true, monitor: true, working: true, screenMode: 'editor' })}
    </svg>
  </g>
</svg>`;

function phoneFrame({
  pill,
  headline,
  subhead,
  bgAccent = '#E5EEDC',
  screenContent,
}: {
  pill: string;
  headline: string;
  subhead: string;
  bgAccent?: string;
  screenContent: string;
}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
    ${fontDefs}
    <rect width="1080" height="1920" fill="#F8FAF2"/>
    <circle cx="140" cy="180" r="360" fill="${bgAccent}" opacity="0.6"/>
    <circle cx="960" cy="1720" r="420" fill="#F7E4D1" opacity="0.5"/>

    <g transform="translate(540, 114)">
      <rect x="-175" y="0" width="350" height="48" rx="24" fill="#E5EEDC"/>
      <text x="0" y="31" text-anchor="middle" class="n800" font-size="17" fill="#426E5C" letter-spacing="1.5">${pill}</text>
      <text x="0" y="122" text-anchor="middle" class="f600" font-size="62" fill="#354F47">${headline}</text>
      <text x="0" y="178" text-anchor="middle" class="n600" font-size="29" fill="#788A7E">${subhead}</text>
    </g>

    <g transform="translate(96, 356)" filter="url(#cardShadow)">
      <rect x="0" y="0" width="888" height="1460" rx="68" fill="#354F47"/>
      <rect x="16" y="16" width="856" height="1428" rx="54" fill="#F8FAF2"/>
      <rect x="394" y="32" width="100" height="12" rx="6" fill="#DCE5D5"/>
      <g transform="translate(54, 72)">
        ${screenContent}
      </g>
    </g>
  </svg>`;
}

// Sticky Header inside phone (width 780)
function appHeader(coins: string, energy = '3/3', badge = 2) {
  return `<g transform="translate(0, 0)">
    <text x="0" y="52" class="f600" font-size="54" fill="#354F47">Nib<tspan fill="#D69F6A">.</tspan></text>
    <g transform="translate(414, 6)">
      <rect x="0" y="0" width="114" height="56" rx="28" fill="#E6EEDC"/>
      <text x="57" y="36" text-anchor="middle" class="n800" font-size="22" fill="#426E5C">${energy}</text>
      <rect x="126" y="0" width="152" height="56" rx="28" fill="#F7EDCE"/>
      <circle cx="158" cy="28" r="13" fill="#A47A2A"/>
      <text x="158" y="34" text-anchor="middle" class="n800" font-size="16" fill="#FFFDF4">$</text>
      <text x="224" y="37" text-anchor="middle" class="f600" font-size="28" fill="#354F47">${coins}</text>
      <rect x="290" y="0" width="66" height="56" rx="20" fill="#F7EDCE" stroke="#E5CFA0" stroke-width="2"/>
      <circle cx="323" cy="24" r="9" fill="none" stroke="#A47A2A" stroke-width="2.5"/>
      <path d="M318 32 l-2 11 l7 -4 l7 4 l-2 -11" fill="none" stroke="#A47A2A" stroke-width="2.3" stroke-linejoin="round"/>
      ${badge > 0 ? `<circle cx="352" cy="4" r="14" fill="#A47A2A" stroke="#F8FAF2" stroke-width="3"/><text x="352" y="10" text-anchor="middle" class="n800" font-size="15" fill="#FFFDF4">${badge}</text>` : ''}
    </g>
    <line x1="-20" y1="76" x2="800" y2="76" stroke="#E8EDE0" stroke-width="2"/>
  </g>`;
}

// Icon-only Bottom Navigation Bar inside phone (y=1246, width=780)
function bottomTabBar(active: 'studio' | 'projects' | 'settings') {
  return `<g transform="translate(0, 1236)">
    <line x1="-20" y1="0" x2="800" y2="0" stroke="#E8EDE0" stroke-width="2"/>
    <rect x="0" y="16" width="780" height="84" rx="30" fill="#EEF3E7"/>
    <!-- Tab 1: Studio -->
    <rect x="10" y="24" width="246" height="68" rx="22" fill="${active === 'studio' ? '#FFFFFF' : 'transparent'}"/>
    <path d="M119 60 L133 46 L147 60 M123 56 V71 H143 V56" fill="none" stroke="${active === 'studio' ? '#426E5C' : '#788A7E'}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- Tab 2: Projects -->
    <rect x="267" y="24" width="246" height="68" rx="22" fill="${active === 'projects' ? '#FFFFFF' : 'transparent'}"/>
    <path d="M376 50 H404 M376 60 H404 M376 70 H396" fill="none" stroke="${active === 'projects' ? '#426E5C' : '#788A7E'}" stroke-width="3.2" stroke-linecap="round"/>
    <!-- Tab 3: Settings -->
    <rect x="524" y="24" width="246" height="68" rx="22" fill="${active === 'settings' ? '#FFFFFF' : 'transparent'}"/>
    <circle cx="647" cy="60" r="10" fill="none" stroke="${active === 'settings' ? '#426E5C' : '#788A7E'}" stroke-width="3.2"/>
    <circle cx="647" cy="60" r="3" fill="${active === 'settings' ? '#426E5C' : '#788A7E'}"/>
  </g>`;
}

// Screenshot 1: Full-Screen Studio + Interactive Dev Terminal + Live Code Editor Monitor
const shot1Screen = `
  ${appHeader('480', '3/3', 2)}
  <g transform="translate(0, 96)">
    <!-- Rounded Full-Screen Studio Card (clipped cleanly to 46px radius) -->
    <g clip-path="url(#studioClip)">
      <rect x="0" y="0" width="780" height="1116" fill="#E2EDE2"/>
      <rect x="0" y="810" width="780" height="306" fill="#D5BC9E"/>
      <line x1="0" y1="810" x2="780" y2="810" stroke="#B5997F" stroke-width="4"/>
      <svg x="-30" y="290" width="840" height="743" viewBox="0 0 400 354">
        ${roomSvg({ atmosphere: 'sunny', catOwned: true, lamp: true, plant: true, rug: true, poster: true, lights: true, espresso: true, headphones: true, keyboard: true, monitor: true, working: true, screenMode: 'editor' })}
      </svg>
    </g>
    <rect x="0" y="0" width="780" height="1116" rx="46" fill="none" stroke="#E1E9DA" stroke-width="3"/>

    <!-- Interactive Multi-Line Dev Terminal Overlay -->
    <g transform="translate(24, 24)" filter="url(#softShadow)">
      <rect x="0" y="0" width="732" height="264" rx="26" fill="#22332EF5" stroke="#3D544C" stroke-width="2"/>
      <rect x="0" y="0" width="732" height="44" rx="20" fill="#1B2824"/>
      <circle cx="24" cy="22" r="6" fill="#E37A6F"/>
      <circle cx="44" cy="22" r="6" fill="#E4BF64"/>
      <circle cx="64" cy="22" r="6" fill="#6FA882"/>
      <text x="366" y="28" text-anchor="middle" class="n800" font-size="16" fill="#98B3A7">elorm@studio · dev-server</text>

      <text x="22" y="78" class="n800" font-size="18" fill="#7AC993">elorm:~$ <tspan fill="#FFFFFF">gh auth status</tspan></text>
      <text x="22" y="106" class="n600" font-size="17" fill="#8AE0A4">› logged in to github.com as elorm</text>
      <text x="22" y="134" class="n600" font-size="17" fill="#F6D98B">› tuning warm Rhodes piano chords @ 72 BPM</text>
      <text x="22" y="162" class="n600" font-size="17" fill="#CBE0D4">› hmr: updated module in 11ms · 0 errors</text>

      <!-- Interactive Quick Command Chips -->
      <rect x="0" y="182" width="732" height="48" fill="#1C2A26"/>
      <rect x="20" y="191" width="114" height="30" rx="12" fill="#2B3E38" stroke="#3E574F" stroke-width="1.5"/>
      <text x="77" y="211" text-anchor="middle" class="n800" font-size="15" fill="#B9D6C7">git status</text>
      <rect x="146" y="191" width="102" height="30" rx="12" fill="#2B3E38" stroke="#3E574F" stroke-width="1.5"/>
      <text x="197" y="211" text-anchor="middle" class="n800" font-size="15" fill="#B9D6C7">whoami</text>
      <rect x="260" y="191" width="90" height="30" rx="12" fill="#2B3E38" stroke="#3E574F" stroke-width="1.5"/>
      <text x="305" y="211" text-anchor="middle" class="n800" font-size="15" fill="#B9D6C7">coffee</text>
      <rect x="362" y="191" width="80" height="30" rx="12" fill="#2B3E38" stroke="#3E574F" stroke-width="1.5"/>
      <text x="402" y="211" text-anchor="middle" class="n800" font-size="15" fill="#B9D6C7">clear</text>

      <!-- Progress bar -->
      <rect x="20" y="242" width="636" height="8" rx="4" fill="#354B43"/>
      <rect x="20" y="242" width="440" height="8" rx="4" fill="#7AC993"/>
      <text x="710" y="251" text-anchor="end" class="n800" font-size="15" fill="#89A89A">69%</text>
    </g>

    <!-- Floating Ambient Status Pill -->
    <g transform="translate(154, 1024)" filter="url(#softShadow)">
      <rect x="0" y="0" width="472" height="66" rx="33" fill="#FFFFFFF2" stroke="#E0E7D6" stroke-width="2"/>
      <circle cx="34" cy="33" r="8" fill="#5C946E"/>
      <text x="58" y="40" class="n800" font-size="20" fill="#354F47">Coding Lo-fi beat script · 00:38</text>
    </g>
  </g>
  ${bottomTabBar('studio')}
`;

// Screenshot 2: Projects Tab with Rank, Daily Streak, Coffee Boost & New Projects
const shot2Screen = `
  ${appHeader('1,420', '2/3', 1)}
  <g transform="translate(0, 98)">
    <!-- Active Focus Card -->
    <rect x="0" y="0" width="780" height="340" rx="36" fill="#EEF3E7"/>
    <text x="34" y="48" class="n800" font-size="16" fill="#788A7E" letter-spacing="2">A LITTLE FOCUS</text>
    <text x="34" y="92" class="f500" font-size="36" fill="#354F47">Train a cozy chatbot</text>
    <rect x="34" y="122" width="712" height="18" rx="9" fill="#DCE5D5"/>
    <rect x="34" y="122" width="490" height="18" rx="9" fill="#83A68B"/>
    <text x="34" y="176" class="n600" font-size="21" fill="#788A7E">Keeps going while you’re away.</text>
    <text x="746" y="176" text-anchor="end" class="n800" font-size="24" fill="#354F47">03:12</text>
    <rect x="34" y="206" width="712" height="74" rx="24" fill="#E5EEDC"/>
    <text x="390" y="252" text-anchor="middle" class="n800" font-size="24" fill="#426E5C">Boost · 1 energy</text>
    <text x="390" y="314" text-anchor="middle" class="n600" font-size="18" fill="#788A7E">Remove 25% of the time left · once per project</text>

    <!-- Rank & Streak Strip -->
    <g transform="translate(0, 364)">
      <rect x="0" y="0" width="380" height="68" rx="24" fill="#FFFFFF" stroke="#E6EBDE" stroke-width="2"/>
      <text x="190" y="42" text-anchor="middle" class="n800" font-size="22" fill="#354F47">Cozy Crafter</text>
      <rect x="400" y="0" width="380" height="68" rx="24" fill="#FDF4DC" stroke="#EAD5A5" stroke-width="2"/>
      <text x="590" y="42" text-anchor="middle" class="n800" font-size="22" fill="#A47A2A">5-day coding streak</text>
    </g>

    <!-- Project Cards -->
    <g transform="translate(0, 464)">
      <text x="0" y="32" class="f500" font-size="34" fill="#354F47">One small thing at a time</text>
      <text x="780" y="30" text-anchor="end" class="n600" font-size="21" fill="#788A7E">2.75× earnings</text>

      <!-- Card 1 -->
      <g transform="translate(0, 56)">
        <rect x="0" y="0" width="780" height="202" rx="34" fill="#FFFFFF" stroke="#E9EEE2" stroke-width="2"/>
        <rect x="26" y="24" width="72" height="72" rx="24" fill="#EBEFDD"/>
        <text x="62" y="70" text-anchor="middle" class="n800" font-size="28" fill="#354F47">♫</text>
        <text x="120" y="54" class="n800" font-size="25" fill="#354F47">Lo-fi beat script</text>
        <text x="120" y="88" class="n600" font-size="20" fill="#788A7E">2 min · 426 coins</text>
        <text x="26" y="132" class="n600" font-size="20" fill="#788A7E">Code a chill rain-and-piano loop for late focus.</text>
        <rect x="26" y="148" width="728" height="38" rx="16" fill="#E5EEDC"/>
        <text x="390" y="174" text-anchor="middle" class="n800" font-size="19" fill="#426E5C">Start project →</text>
      </g>

      <!-- Card 2 -->
      <g transform="translate(0, 276)">
        <rect x="0" y="0" width="780" height="202" rx="34" fill="#FFFFFF" stroke="#E9EEE2" stroke-width="2"/>
        <rect x="26" y="24" width="72" height="72" rx="24" fill="#EBEFDD"/>
        <text x="62" y="70" text-anchor="middle" class="n800" font-size="26" fill="#354F47">&lt;/&gt;</text>
        <text x="120" y="54" class="n800" font-size="25" fill="#354F47">Launch a pocket app</text>
        <text x="120" y="88" class="n600" font-size="20" fill="#788A7E">20 min · 4,812 coins</text>
        <text x="26" y="132" class="n600" font-size="20" fill="#788A7E">Smooth buttons, zero clutter, built with love.</text>
        <rect x="26" y="148" width="728" height="38" rx="16" fill="#E5EEDC"/>
        <text x="390" y="174" text-anchor="middle" class="n800" font-size="19" fill="#426E5C">Start project →</text>
      </g>

      <!-- Card 3 -->
      <g transform="translate(0, 496)">
        <rect x="0" y="0" width="780" height="156" rx="34" fill="#FFFFFF" stroke="#E9EEE2" stroke-width="2"/>
        <rect x="26" y="24" width="72" height="72" rx="24" fill="#EBEFDD"/>
        <text x="62" y="70" text-anchor="middle" class="n800" font-size="26" fill="#354F47">CPU</text>
        <text x="120" y="54" class="n800" font-size="25" fill="#354F47">Write a tiny OS</text>
        <text x="120" y="88" class="n600" font-size="20" fill="#788A7E">60 min · 16,500 coins</text>
        <text x="26" y="132" class="n600" font-size="20" fill="#788A7E">Bootloader, kernel, and a blinking cursor from scratch.</text>
      </g>
    </g>
  </g>
  ${bottomTabBar('projects')}
`;

// Screenshot 3: Full-Screen Mascot Picker & Cozy Upgrades
const shot3Screen = `
  <g transform="translate(0, 4)">
    <text x="0" y="46" class="n800" font-size="18" fill="#426E5C" letter-spacing="2">CHOOSE YOUR DEVELOPER</text>
    <text x="0" y="102" class="f600" font-size="52" fill="#354F47">Pick your studio mascot.</text>
    <text x="0" y="142" class="n600" font-size="23" fill="#788A7E">Switch mascots anytime &amp; personalize your terminal.</text>

    <!-- 2x2 Mascot Grid -->
    ${mascotCardSvg(0, 174, 376, 'Leo', 'Sage Curls', 'Male', '#E4EFE4', '#91B5A0', '#4B403A', '#C98E6B', 'curly', true)}
    ${mascotCardSvg(404, 174, 376, 'Maya', 'Amber Bun', 'Female', '#F8EAE1', '#E7A98F', '#382B24', '#D69E7B', 'straight', false)}
    ${mascotCardSvg(0, 444, 376, 'Kai', 'Denim Cap', 'Male', '#E4ECF3', '#7C93A8', '#2B2523', '#B97E5C', 'cap', false)}
    ${mascotCardSvg(404, 444, 376, 'Zoe', 'Cozy Bob', 'Female', '#EFEAF7', '#A999C6', '#6B4232', '#E2B494', 'bob', false)}

    <!-- Upgrades & Desk Cat Preview -->
    <text x="0" y="756" class="f500" font-size="34" fill="#354F47">Studio upgrades &amp; companions</text>

    <g transform="translate(0, 782)">
      <rect x="0" y="0" width="780" height="148" rx="32" fill="#F8EADC" stroke="#EED9C5" stroke-width="2"/>
      <rect x="24" y="28" width="90" height="90" rx="28" fill="#F1D6BA"/>
      <path d="M51 82 L50 64 Q52 61 58 69 Q69 65 80 69 L88 62 L87 82 Q86 93 69 93 Q52 93 51 82Z" fill="#EFBA88" stroke="#4D5C55" stroke-width="2.5" stroke-linejoin="round"/>
      <text x="136" y="64" class="n800" font-size="26" fill="#354F47">Desk cat</text>
      <text x="136" y="96" class="n600" font-size="21" fill="#788A7E">Adopt a sleepy friend — tap to pet anytime!</text>
      <rect x="616" y="50" width="138" height="46" rx="20" fill="#E6EEDC"/>
      <text x="685" y="80" text-anchor="middle" class="n800" font-size="18" fill="#426E5C">Adopted</text>
    </g>

    <g transform="translate(0, 952)">
      <rect x="0" y="0" width="376" height="146" rx="30" fill="#FFFFFF" stroke="#E6EBDD" stroke-width="2"/>
      <text x="28" y="54" class="n800" font-size="24" fill="#354F47">Espresso maker</text>
      <text x="28" y="88" class="n600" font-size="19" fill="#788A7E">+65% project earnings</text>
      <rect x="28" y="102" width="122" height="28" rx="14" fill="#E6EEDC"/>
      <text x="89" y="121" text-anchor="middle" class="n800" font-size="14" fill="#426E5C">Equipped</text>

      <rect x="404" y="0" width="376" height="146" rx="30" fill="#FFFFFF" stroke="#E6EBDD" stroke-width="2"/>
      <text x="432" y="54" class="n800" font-size="24" fill="#354F47">Fairy lights</text>
      <text x="432" y="88" class="n600" font-size="19" fill="#788A7E">Warm bulbs on your wall</text>
      <rect x="432" y="102" width="136" height="28" rx="14" fill="#E6EEDC"/>
      <text x="500" y="121" text-anchor="middle" class="n800" font-size="14" fill="#426E5C">In your room</text>
    </g>

    <rect x="0" y="1130" width="780" height="82" rx="26" fill="#426E5C"/>
    <text x="390" y="1181" text-anchor="middle" class="n800" font-size="26" fill="#FFFDF4">Enter my studio →</text>
  </g>
`;

// Screenshot 4: Moonlit Celebration Full-Screen Studio
const shot4Screen = `
  ${appHeader('2,340', '3/3', 3)}
  <g transform="translate(0, 96)">
    <g clip-path="url(#studioClip)">
      <rect x="0" y="0" width="780" height="1116" fill="#C8D1DB"/>
      <rect x="0" y="760" width="780" height="356" fill="#B6A89F"/>
      <line x1="0" y1="760" x2="780" y2="760" stroke="#9B897F" stroke-width="4"/>
      <svg x="-30" y="210" width="840" height="743" viewBox="0 0 400 354">
        ${roomSvg({ atmosphere: 'moonlit', catOwned: true, lamp: true, plant: true, rug: true, poster: true, lights: true, espresso: true, headphones: true, keyboard: true, monitor: true, working: false, celebrating: true, screenMode: 'studio' })}
      </svg>
    </g>
    <rect x="0" y="0" width="780" height="1116" rx="46" fill="none" stroke="#BFC9D4" stroke-width="3"/>

    <!-- Collapsed Console Pill -->
    <g transform="translate(26, 26)" filter="url(#softShadow)">
      <rect x="0" y="0" width="268" height="52" rx="22" fill="#263833EE" stroke="#3D544C" stroke-width="1.5"/>
      <circle cx="24" cy="26" r="5" fill="#E37A6F"/>
      <circle cx="38" cy="26" r="5" fill="#E4BF64"/>
      <circle cx="52" cy="26" r="5" fill="#6FA882"/>
      <text x="72" y="32" class="n800" font-size="17" fill="#D4E6DC">elorm · ready!</text>
    </g>

    <!-- Gold Ready-to-Ship Pill -->
    <g transform="translate(154, 1022)" filter="url(#softShadow)">
      <rect x="0" y="0" width="472" height="68" rx="34" fill="#FDF7E7" stroke="#E5CFA0" stroke-width="2.5"/>
      <circle cx="36" cy="34" r="8" fill="#A47A2A"/>
      <text x="60" y="42" class="n800" font-size="21" fill="#A47A2A">Ready to ship! (+850 coins)</text>
    </g>
  </g>
  ${bottomTabBar('studio')}
`;

const shot1Svg = phoneFrame({
  pill: 'REMEMBER CODING BY HAND',
  headline: 'Your quiet coding studio',
  subhead: 'Watch live terminal logs, code editor screens, and your desk cat',
  screenContent: shot1Screen,
});

const shot2Svg = phoneFrame({
  pill: '8 HANDCRAFTED PROJECTS',
  headline: 'Build one small thing',
  subhead: 'From lo-fi beat scripts to a tiny OS — progress continues offline',
  bgAccent: '#D8E2EC',
  screenContent: shot2Screen,
});

const shot3Svg = phoneFrame({
  pill: 'MASCOTS &amp; UPGRADES',
  headline: 'Make the studio yours',
  subhead: 'Choose from 4 mascots, adopt a desk cat, and unlock cozy gear',
  bgAccent: '#F7E4D1',
  screenContent: shot3Screen,
});

const shot4Svg = phoneFrame({
  pill: 'SUNNY, RAINY OR MOONLIT',
  headline: 'Late nights &amp; small wins',
  subhead: 'Glowing fairy lights, warm desk lamp, zero ads, 100% offline',
  bgAccent: '#D7E4E2',
  screenContent: shot4Screen,
});

// 1. 512x512 High-Res Play Store Icon
await sharp('assets/cat-icon.svg').resize(512, 512).png().toFile(join(OUT, 'play-store-icon-512x512.png'));

// 2. 1024x500 Feature Graphic
await sharp(Buffer.from(featureGraphicSvg)).resize(1024, 500).png().toFile(join(OUT, 'feature-graphic-1024x500.png'));

// 3. Four 1080x1920 Phone Screenshots
const shots = [
  ['phone-screenshot-1-studio-1080x1920.png', shot1Svg],
  ['phone-screenshot-2-ship-1080x1920.png', shot2Svg],
  ['phone-screenshot-3-upgrades-1080x1920.png', shot3Svg],
  ['phone-screenshot-4-moods-1080x1920.png', shot4Svg],
] as const;

for (const [name, svg] of shots) {
  await sharp(Buffer.from(svg)).resize(1080, 1920).png().toFile(join(OUT, name));
}

console.log('Generated updated Play Store assets in store-assets/');
