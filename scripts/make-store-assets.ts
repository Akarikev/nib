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
    <feDropShadow dx="0" dy="18" stdDeviation="24" flood-color="#354F47" flood-opacity="0.10" />
  </filter>
  <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
    <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#354F47" flood-opacity="0.06" />
  </filter>
</defs>`;

function roomSvg({
  atmosphere = 'sunny',
  catOwned = true,
  lamp = true,
  plant = true,
  rug = true,
  poster = true,
  keyboard = true,
  monitor = true,
  working = true,
  celebrating = false,
}: {
  atmosphere?: 'sunny' | 'rainy' | 'moonlit';
  catOwned?: boolean;
  lamp?: boolean;
  plant?: boolean;
  rug?: boolean;
  poster?: boolean;
  keyboard?: boolean;
  monitor?: boolean;
  working?: boolean;
  celebrating?: boolean;
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
    ${poster ? `<g><rect x="198" y="33" width="53" height="70" rx="4" fill="#FDF6DE" stroke="${stroke}" stroke-width="3"/><rect x="204" y="39" width="41" height="58" fill="#777EA8"/><path d="M229 49 A15 15 0 1 0 235 75 A17 17 0 0 1 229 49" fill="#F9DC9B"/><circle cx="214" cy="49" r="2" fill="#FFF5D2"/></g>` : ''}
    ${rug ? `<ellipse cx="210" cy="311" rx="127" ry="29" fill="#E9A68E" stroke="#B87764" stroke-width="3"/>` : ''}
    <ellipse cx="205" cy="306" rx="87" ry="17" fill="#9B806A" opacity=".2"/>
    <path d="M108 220 L101 303 M291 220 L299 303" stroke="${stroke}" stroke-width="12" stroke-linecap="round"/>
    <path d="M108 220 L101 303 M291 220 L299 303" stroke="#BA9676" stroke-width="7" stroke-linecap="round"/>
    <rect x="83" y="207" width="232" height="18" rx="8" fill="#D9AD85" stroke="${stroke}" stroke-width="4"/>
    <rect x="228" y="127" width="${monitor ? 91 : 69}" height="65" rx="8" fill="${monitor ? '#B7A6D8' : '#667D75'}" stroke="${stroke}" stroke-width="4"/>
    <rect x="235" y="134" width="${monitor ? 77 : 55}" height="48" rx="3" fill="#D0E6C3"/>
    <path d="M246 147 L253 152 L246 157 M261 160 H275" fill="none" stroke="#658A6C" stroke-width="3" stroke-linecap="round"/>
    <path d="M263 193 V204 M250 205 H278" stroke="${stroke}" stroke-width="5" stroke-linecap="round"/>
    <rect x="211" y="200" width="69" height="7" rx="3" fill="${keyboard ? '#E9A4AA' : '#71867D'}" stroke="${stroke}" stroke-width="2"/>
    ${lamp ? `<g><ellipse cx="182" cy="187" rx="22" ry="13" fill="#FFF3B8" opacity="${night ? '.45' : '.28'}"/><path d="M180 205 H196 M188 205 V186 L181 174" stroke="${stroke}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M170 175 Q179 164 189 175Z" fill="#F6C376" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/><circle cx="179" cy="176" r="3" fill="#FFF7D6"/></g>` : ''}
    <rect x="137" y="187" width="20" height="20" rx="5" fill="#FFF4D9" stroke="${stroke}" stroke-width="3"/>
    <path d="M157 190 Q167 191 158 201" fill="none" stroke="${stroke}" stroke-width="3"/>
    <path d="M144 178 Q139 173 146 167" fill="none" stroke="#8C9D8B" stroke-width="2" stroke-linecap="round"/>
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

// 1. Feature Graphic (1024 x 500)
const featureGraphicSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500" viewBox="0 0 1024 500">
  ${fontDefs}
  <rect width="1024" height="500" fill="#F8FAF2"/>
  <circle cx="120" cy="60" r="240" fill="#E5EEDC" opacity="0.65"/>
  <circle cx="920" cy="450" r="260" fill="#F7E4D1" opacity="0.55"/>

  <!-- Left Editorial Branding -->
  <g transform="translate(76, 92)">
    <rect x="0" y="0" width="214" height="38" rx="19" fill="#E5EEDC"/>
    <circle cx="22" cy="19" r="5" fill="#426E5C"/>
    <text x="38" y="24" class="n800" font-size="14" fill="#426E5C" letter-spacing="1.2">COZY OFFLINE STUDIO</text>

    <text x="0" y="124" class="f600" font-size="88" fill="#354F47">Nib<tspan fill="#D69F6A">.</tspan></text>
    <text x="2" y="176" class="f500" font-size="30" fill="#354F47">Code small things.</text>
    <text x="2" y="214" class="f500" font-size="30" fill="#426E5C">Build a quiet little room.</text>

    <text x="2" y="264" class="n600" font-size="18" fill="#788A7E">Pick a timed coding project, adopt a sleepy</text>
    <text x="2" y="290" class="n600" font-size="18" fill="#788A7E">desk cat, and make your studio feel like home.</text>

    <!-- Feature Pills -->
    <g transform="translate(0, 322)">
      <rect x="0" y="0" width="148" height="40" rx="20" fill="#F7EDCE"/>
      <text x="74" y="25" text-anchor="middle" class="n800" font-size="14" fill="#A47A2A">100% Offline</text>
      <rect x="160" y="0" width="166" height="40" rx="20" fill="#FFFFFF" stroke="#E4EADB" stroke-width="1.5"/>
      <text x="243" y="25" text-anchor="middle" class="n800" font-size="14" fill="#354F47">No Ads · No Stress</text>
    </g>
  </g>

  <!-- Right Room Illustration Card -->
  <g transform="translate(520, 44)" filter="url(#cardShadow)">
    <rect x="-10" y="-10" width="452" height="404" rx="38" fill="#FFFFFF"/>
    <svg x="0" y="0" width="432" height="382" viewBox="0 0 400 354">
      ${roomSvg({ atmosphere: 'sunny', catOwned: true, lamp: true, plant: true, rug: true, poster: true, keyboard: true, monitor: true, working: true })}
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

    <!-- Top Marketing Header -->
    <g transform="translate(540, 118)">
      <rect x="-150" y="0" width="300" height="48" rx="24" fill="#E5EEDC"/>
      <text x="0" y="31" text-anchor="middle" class="n800" font-size="18" fill="#426E5C" letter-spacing="1.6">${pill}</text>
      <text x="0" y="122" text-anchor="middle" class="f600" font-size="64" fill="#354F47">${headline}</text>
      <text x="0" y="178" text-anchor="middle" class="n600" font-size="30" fill="#788A7E">${subhead}</text>
    </g>

    <!-- Phone Container -->
    <g transform="translate(96, 360)" filter="url(#cardShadow)">
      <rect x="0" y="0" width="888" height="1450" rx="68" fill="#354F47"/>
      <rect x="16" y="16" width="856" height="1418" rx="54" fill="#F8FAF2"/>
      <!-- Camera Pill -->
      <rect x="394" y="34" width="100" height="12" rx="6" fill="#DCE5D5"/>
      <g transform="translate(54, 76)">
        ${screenContent}
      </g>
    </g>
  </svg>`;
}

// App Header inside phone (width 780)
function appHeader(coins: string, energy = '3/3') {
  return `<g transform="translate(0, 0)">
    <text x="0" y="54" class="f600" font-size="56" fill="#354F47">Nib<tspan fill="#D69F6A">.</tspan></text>
    <g transform="translate(490, 8)">
      <rect x="0" y="0" width="118" height="58" rx="29" fill="#E6EEDC"/>
      <text x="59" y="37" text-anchor="middle" class="n800" font-size="24" fill="#426E5C">☕ ${energy}</text>
      <rect x="132" y="0" width="158" height="58" rx="29" fill="#F7EDCE"/>
      <circle cx="166" cy="29" r="14" fill="#A47A2A"/>
      <text x="166" y="35" text-anchor="middle" class="n800" font-size="17" fill="#FFFDF4">$</text>
      <text x="234" y="38" text-anchor="middle" class="f600" font-size="30" fill="#354F47">${coins}</text>
    </g>
  </g>`;
}

// Screenshot 1: Cozy Studio & Active Project
const shot1Screen = `
  ${appHeader('340', '3/3')}
  <g transform="translate(0, 88)">
    <svg x="0" y="0" width="780" height="690" viewBox="0 0 400 354">
      ${roomSvg({ atmosphere: 'sunny', catOwned: true, lamp: true, plant: true, rug: true, poster: true, keyboard: true, monitor: true, working: true })}
    </svg>
    <g transform="translate(8, 718)">
      <circle cx="8" cy="-7" r="5" fill="#789B78"/>
      <text x="24" y="0" class="n600" font-size="22" fill="#354F47">In the zone</text>
      <text x="764" y="0" text-anchor="end" class="n600" font-size="22" fill="#788A7E">12 shipped</text>
    </g>
    <!-- Upgrades Bar -->
    <g transform="translate(0, 742)">
      <rect x="0" y="0" width="780" height="104" rx="32" fill="#FFFFFF" stroke="#E6EBDE" stroke-width="2"/>
      <rect x="22" y="20" width="64" height="64" rx="22" fill="#F7E4D1"/>
      <path d="M42 46 h24 l-2 22 h-20 z M48 46 v-5 a6 6 0 0 1 12 0 v5" fill="none" stroke="#354F47" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="108" y="47" class="n800" font-size="25" fill="#354F47">Upgrades</text>
      <text x="108" y="77" class="n600" font-size="20" fill="#788A7E">1 milestone reward waiting</text>
      <rect x="652" y="32" width="60" height="40" rx="16" fill="#F7EDCE"/>
      <text x="682" y="59" text-anchor="middle" class="n800" font-size="20" fill="#A47A2A">+1</text>
      <text x="742" y="60" text-anchor="middle" class="n800" font-size="28" fill="#426E5C">→</text>
    </g>
    <!-- Active Focus Card -->
    <g transform="translate(0, 870)">
      <rect x="0" y="0" width="780" height="390" rx="36" fill="#EEF3E7"/>
      <text x="34" y="48" class="n800" font-size="16" fill="#788A7E" letter-spacing="2">A LITTLE FOCUS</text>
      <text x="34" y="92" class="f500" font-size="36" fill="#354F47">Build a little website</text>
      <rect x="34" y="122" width="712" height="18" rx="9" fill="#DCE5D5"/>
      <rect x="34" y="122" width="485" height="18" rx="9" fill="#83A68B"/>
      <text x="34" y="178" class="n600" font-size="21" fill="#788A7E">Keeps going while you’re away.</text>
      <text x="746" y="178" text-anchor="end" class="n800" font-size="24" fill="#354F47">01:36</text>
      <rect x="34" y="214" width="712" height="82" rx="26" fill="#E5EEDC"/>
      <text x="390" y="264" text-anchor="middle" class="n800" font-size="25" fill="#426E5C">Boost · 1 energy</text>
      <text x="390" y="338" text-anchor="middle" class="n600" font-size="19" fill="#788A7E">Remove 25% of the time left · once per project</text>
    </g>
  </g>
`;

// Screenshot 2: Moonlit Studio & Ready to Collect Celebration
const shot2Screen = `
  ${appHeader('1,280', '2/3')}
  <g transform="translate(0, 88)">
    <svg x="0" y="0" width="780" height="690" viewBox="0 0 400 354">
      ${roomSvg({ atmosphere: 'moonlit', catOwned: true, lamp: true, plant: true, rug: true, poster: true, keyboard: true, monitor: true, working: false, celebrating: true })}
    </svg>
    <g transform="translate(8, 718)">
      <circle cx="8" cy="-7" r="5" fill="#789B78"/>
      <text x="24" y="0" class="n600" font-size="22" fill="#354F47">A little victory awaits</text>
      <text x="764" y="0" text-anchor="end" class="n600" font-size="22" fill="#788A7E">18 shipped</text>
    </g>
    <!-- Ready to Ship Card -->
    <g transform="translate(0, 748)">
      <rect x="0" y="0" width="780" height="310" rx="36" fill="#EEF3E7"/>
      <text x="34" y="48" class="n800" font-size="16" fill="#788A7E" letter-spacing="2">NICELY DONE, LITTLE DEV</text>
      <text x="34" y="92" class="f500" font-size="36" fill="#354F47">Ready to ship!</text>
      <rect x="34" y="120" width="712" height="18" rx="9" fill="#83A68B"/>
      <text x="34" y="174" class="n600" font-size="21" fill="#788A7E">Your project is finished.</text>
      <text x="746" y="174" text-anchor="end" class="n800" font-size="24" fill="#A47A2A">+700 coins</text>
      <rect x="34" y="202" width="712" height="82" rx="26" fill="#426E5C"/>
      <text x="390" y="252" text-anchor="middle" class="n800" font-size="26" fill="#FFFDF4">Collect 700 coins</text>
    </g>
    <!-- Project Card Preview -->
    <g transform="translate(0, 1086)">
      <rect x="0" y="0" width="780" height="176" rx="34" fill="#FFFFFF" stroke="#E9EEE2" stroke-width="2"/>
      <rect x="28" y="28" width="76" height="76" rx="24" fill="#EBEFDD"/>
      <text x="66" y="76" text-anchor="middle" class="n800" font-size="32" fill="#354F47">&lt;/&gt;</text>
      <text x="126" y="60" class="n800" font-size="26" fill="#354F47">Ship an indie game</text>
      <text x="126" y="96" class="n600" font-size="21" fill="#788A7E">30 min · 4,725 coins (1.75× earnings)</text>
      <text x="28" y="146" class="n600" font-size="21" fill="#788A7E">A small idea, ready for the world.</text>
    </g>
  </g>
`;

// Screenshot 3: Upgrades Shop & Studio Moods
const shot3Screen = `
  <g transform="translate(0, 4)">
    <text x="0" y="48" class="f600" font-size="46" fill="#354F47">Little upgrades</text>
    <text x="0" y="84" class="n600" font-size="22" fill="#788A7E">Good things for your little corner.</text>
    <rect x="708" y="10" width="72" height="72" rx="24" fill="#E9EFDF"/>
    <text x="744" y="56" text-anchor="middle" class="n800" font-size="28" fill="#354F47">✕</text>

    <rect x="0" y="110" width="780" height="78" rx="26" fill="#F7EDCE"/>
    <text x="28" y="157" class="n600" font-size="22" fill="#A47A2A">Your coin jar</text>
    <text x="752" y="159" text-anchor="end" class="f600" font-size="34" fill="#354F47">520 coins</text>

    <!-- Room Moods -->
    <text x="0" y="238" class="f500" font-size="34" fill="#354F47">Room decor &amp; moods</text>
    <g transform="translate(0, 260)">
      <rect x="0" y="0" width="246" height="148" rx="28" fill="#E5EEDC" stroke="#6E9078" stroke-width="3"/>
      <text x="123" y="54" text-anchor="middle" class="n800" font-size="34" fill="#426E5C">☀</text>
      <text x="123" y="96" text-anchor="middle" class="n800" font-size="21" fill="#354F47">Sunny studio</text>
      <text x="123" y="124" text-anchor="middle" class="n600" font-size="18" fill="#788A7E">Your mood</text>

      <rect x="267" y="0" width="246" height="148" rx="28" fill="#FFFFFF" stroke="#E1E7DA" stroke-width="2"/>
      <text x="390" y="54" text-anchor="middle" class="n800" font-size="34" fill="#788A7E">☂</text>
      <text x="390" y="96" text-anchor="middle" class="n800" font-size="21" fill="#354F47">Rainy day</text>
      <text x="390" y="124" text-anchor="middle" class="n600" font-size="18" fill="#788A7E">Free</text>

      <rect x="534" y="0" width="246" height="148" rx="28" fill="#FFFFFF" stroke="#E1E7DA" stroke-width="2"/>
      <text x="657" y="54" text-anchor="middle" class="n800" font-size="34" fill="#788A7E">☾</text>
      <text x="657" y="96" text-anchor="middle" class="n800" font-size="21" fill="#354F47">Moonlit nook</text>
      <text x="657" y="124" text-anchor="middle" class="n600" font-size="18" fill="#788A7E">Free</text>
    </g>

    <!-- Adoptable Desk Cat Card -->
    <g transform="translate(0, 434)">
      <rect x="0" y="0" width="780" height="176" rx="34" fill="#F8EADC" stroke="#EED9C5" stroke-width="2"/>
      <rect x="28" y="28" width="78" height="78" rx="26" fill="#F1D6BA"/>
      <path d="M49 74 L48 56 Q50 53 56 61 Q67 57 78 61 L86 54 L85 74 Q84 85 67 85 Q50 85 49 74Z" fill="#EFBA88" stroke="#4D5C55" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M58 70 Q60 72 62 70 M72 70 Q74 72 76 70" fill="none" stroke="#4D5C55" stroke-width="2" stroke-linecap="round"/>
      <text x="128" y="60" class="n800" font-size="26" fill="#354F47">Desk cat</text>
      <text x="128" y="94" class="n600" font-size="21" fill="#788A7E">A sleepy ginger friend for your coffee breaks.</text>
      <text x="28" y="148" class="n800" font-size="21" fill="#426E5C">♥ Part of the family</text>
    </g>

    <!-- Warm Desk Lamp Card -->
    <g transform="translate(0, 634)">
      <rect x="0" y="0" width="780" height="226" rx="34" fill="#FFFFFF" stroke="#E6EBDD" stroke-width="2"/>
      <rect x="28" y="28" width="78" height="78" rx="26" fill="#F7E5D4"/>
      <path d="M56 84 H78 M67 84 V66 L61 56" stroke="#4D5C55" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <path d="M51 58 Q61 46 71 58Z" fill="#F6C376" stroke="#4D5C55" stroke-width="2.5" stroke-linejoin="round"/>
      <text x="128" y="60" class="n800" font-size="26" fill="#354F47">Warm desk lamp</text>
      <text x="128" y="94" class="n600" font-size="21" fill="#788A7E">A soft amber glow for late hours</text>
      <rect x="28" y="126" width="144" height="36" rx="18" fill="#E6EEDC"/>
      <text x="100" y="150" text-anchor="middle" class="n800" font-size="17" fill="#426E5C">In your room</text>
      <rect x="28" y="172" width="724" height="38" rx="19" fill="#E5EEDC"/>
      <text x="390" y="198" text-anchor="middle" class="n800" font-size="19" fill="#426E5C">Tuck away or place anytime</text>
    </g>

    <!-- Studio Milestones Card -->
    <text x="0" y="914" class="f500" font-size="34" fill="#354F47">Studio milestones</text>
    <g transform="translate(0, 936)">
      <rect x="0" y="0" width="780" height="218" rx="34" fill="#FFFFFF" stroke="#D8BE82" stroke-width="2.5"/>
      <rect x="28" y="28" width="72" height="72" rx="22" fill="#F7EDCE"/>
      <circle cx="64" cy="58" r="12" fill="none" stroke="#A47A2A" stroke-width="2.8"/>
      <path d="M58 68 L55 82 L64 77 L73 82 L70 68" fill="none" stroke="#A47A2A" stroke-width="2.5" stroke-linejoin="round"/>
      <text x="122" y="58" class="n800" font-size="25" fill="#354F47">Warm company</text>
      <text x="122" y="90" class="n600" font-size="21" fill="#788A7E">Adopt the desk cat</text>
      <text x="752" y="72" text-anchor="end" class="n800" font-size="24" fill="#A47A2A">+75 coins</text>
      <rect x="28" y="122" width="724" height="72" rx="24" fill="#426E5C"/>
      <text x="390" y="167" text-anchor="middle" class="n800" font-size="24" fill="#FFFDF4">Claim 75 coins</text>
    </g>
  </g>
`;

// Screenshot 4: Rainy Day Studio & Project Catalog
const shot4Screen = `
  ${appHeader('195', '3/3')}
  <g transform="translate(0, 88)">
    <svg x="0" y="0" width="780" height="690" viewBox="0 0 400 354">
      ${roomSvg({ atmosphere: 'rainy', catOwned: true, lamp: true, plant: true, rug: true, poster: false, keyboard: true, monitor: false, working: false })}
    </svg>
    <g transform="translate(8, 718)">
      <circle cx="8" cy="-7" r="5" fill="#789B78"/>
      <text x="24" y="0" class="n600" font-size="22" fill="#354F47">Home sweet studio</text>
      <text x="764" y="0" text-anchor="end" class="n600" font-size="22" fill="#788A7E">4 shipped</text>
    </g>

    <g transform="translate(0, 756)">
      <text x="0" y="34" class="f500" font-size="34" fill="#354F47">One small thing at a time</text>
      <text x="780" y="32" text-anchor="end" class="n600" font-size="21" fill="#788A7E">1.25× earnings</text>

      <!-- Card 1 -->
      <g transform="translate(0, 58)">
        <rect x="0" y="0" width="780" height="220" rx="34" fill="#FFFFFF" stroke="#E9EEE2" stroke-width="2"/>
        <rect x="26" y="24" width="74" height="74" rx="24" fill="#EBEFDD"/>
        <text x="63" y="71" text-anchor="middle" class="n800" font-size="30" fill="#354F47">&gt;_</text>
        <text x="122" y="54" class="n800" font-size="25" fill="#354F47">Hello, world</text>
        <text x="122" y="88" class="n600" font-size="20" fill="#788A7E">15 sec · 25 coins</text>
        <text x="26" y="132" class="n600" font-size="20" fill="#788A7E">One tiny program. One big beginning.</text>
        <rect x="26" y="150" width="728" height="52" rx="18" fill="#E5EEDC"/>
        <text x="390" y="184" text-anchor="middle" class="n800" font-size="21" fill="#426E5C">Start project →</text>
      </g>

      <!-- Card 2 -->
      <g transform="translate(0, 296)">
        <rect x="0" y="0" width="780" height="220" rx="34" fill="#FFFFFF" stroke="#E9EEE2" stroke-width="2"/>
        <rect x="26" y="24" width="74" height="74" rx="24" fill="#EBEFDD"/>
        <text x="63" y="71" text-anchor="middle" class="n800" font-size="30" fill="#354F47">{}</text>
        <text x="122" y="54" class="n800" font-size="25" fill="#354F47">Squash a bug</text>
        <text x="122" y="88" class="n600" font-size="20" fill="#788A7E">1 min · 88 coins</text>
        <text x="26" y="132" class="n600" font-size="20" fill="#788A7E">It was a missing semicolon. Probably.</text>
        <rect x="26" y="150" width="728" height="52" rx="18" fill="#E5EEDC"/>
        <text x="390" y="184" text-anchor="middle" class="n800" font-size="21" fill="#426E5C">Start project →</text>
      </g>
    </g>
  </g>
`;

const shot1Svg = phoneFrame({
  pill: 'COZY CODING STUDIO',
  headline: 'Code at your own gentle pace',
  subhead: 'Start a project, sip a coffee boost, and let your little dev work',
  screenContent: shot1Screen,
});

const shot2Svg = phoneFrame({
  pill: 'OFFLINE PROGRESS',
  headline: 'Come back to small wins',
  subhead: 'Projects finish while you are away — collect coins &amp; celebrate',
  bgAccent: '#D8E2EC',
  screenContent: shot2Screen,
});

const shot3Svg = phoneFrame({
  pill: 'UPGRADES &amp; COMPANION',
  headline: 'Make the studio yours',
  subhead: 'Adopt a sleepy desk cat, unlock desk gear, and claim milestones',
  bgAccent: '#F7E4D1',
  screenContent: shot3Screen,
});

const shot4Svg = phoneFrame({
  pill: 'SUNNY, RAINY OR MOONLIT',
  headline: 'Made for slow days',
  subhead: 'Free studio moods, zero ads, saved safely on your phone',
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

// 4. Ready-to-paste Google Play Store Listing Copy
const listingMd = `# Nib — Google Play Store Listing Assets & Copy

All required image assets are generated in this folder (\`store-assets/\`) at Google Play's exact pixel specifications:

| Asset | File | Dimensions |
| --- | --- | --- |
| **App Icon** | \`play-store-icon-512x512.png\` | \`512 × 512 px\` (32-bit PNG) |
| **Feature Graphic** | \`feature-graphic-1024x500.png\` | \`1024 × 500 px\` (PNG) |
| **Phone Screenshot 1** | \`phone-screenshot-1-studio-1080x1920.png\` | \`1080 × 1920 px\` (9:16 PNG) |
| **Phone Screenshot 2** | \`phone-screenshot-2-ship-1080x1920.png\` | \`1080 × 1920 px\` (9:16 PNG) |
| **Phone Screenshot 3** | \`phone-screenshot-3-upgrades-1080x1920.png\` | \`1080 × 1920 px\` (9:16 PNG) |
| **Phone Screenshot 4** | \`phone-screenshot-4-moods-1080x1920.png\` | \`1080 × 1920 px\` (9:16 PNG) |

*(Tip: Google Play also allows uploading these same 1080×1920 screenshots into the 7-inch and 10-inch tablet screenshot slots if required by the console form.)*

---

## Ready-to-Paste Store Listing Text

- **App name** *(max 30 chars)*:
  \`Nib\` (or \`Nib: Cozy Coding Studio\`)
- **Short description** *(max 80 chars)*:
  \`A cozy offline idle game. Code small projects, adopt a desk cat & decorate.\`
- **Full description** *(max 4000 chars)*:
  \`\`\`text
  Settle into a quiet little studio and build one small project at a time.

  Nib is a gentle, offline-first idle game about a tiny developer and a cozy room. Pick a coding project—from a 15-second "Hello, world" to shipping an indie game—let your developer type away while you take a break, and come back to collect your coins.

  FEATURES
  • Cozy Timed Projects: Progress continues while you’re away using your device clock.
  • Adopt a Desk Cat: Save up earned coins to adopt a sleepy ginger friend who naps beside your coffee mug.
  • Upgrade Your Setup: Equip a clicky keyboard and dream monitor to boost your project earnings.
  • Decorate & Pick Your Mood: Add a leafy windowsill plant, warm desk lamp, peachy rug, and moon print, and switch freely between Sunny, Rainy, and Moonlit atmospheres.
  • Coffee Energy Boosts: Energy refills automatically every 30 minutes—spend a cup to trim 25% off a running project’s remaining time.
  • Studio Milestones: Claim bonus coin jars as your studio grows.
  • 100% Offline & Private: No accounts, no internet required, no ads, and no in-app purchases.
  \`\`\`

## Google Play App Content Declarations (Quick Guide)
- **Ads**: No, my app does not contain ads.
- **App Access**: All functionality is available without special access (no login).
- **Data Safety**: No user data is collected or shared (all saves remain locally on the device).
- **Target Audience**: 13+ / General audience (Simulation / Casual Game).
`;

writeFileSync(join(OUT, 'README.md'), listingMd);
console.log('Generated Play Store assets in store-assets/');
