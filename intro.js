(() => {
  const screen = document.getElementById('welcomeScreen');
  const stage = document.getElementById('introStage');
  if (!screen || !stage) return;

  const floral = `
    <svg class="intro-floral" viewBox="0 0 420 420" aria-hidden="true">
      <path class="branch" d="M-10 86 C72 67 119 104 177 153 C228 196 254 247 326 286 C359 304 393 310 438 303"/>
      <path class="twig" d="M78 82 C93 45 114 26 143 11 M128 112 C145 75 174 55 205 48 M181 157 C196 123 219 104 249 96 M224 203 C253 176 281 169 311 172 M277 254 C306 228 337 225 369 233 M323 286 C349 270 378 268 408 278"/>
      <ellipse class="leaf d1" cx="92" cy="58" rx="11" ry="24" transform="rotate(38 92 58)"/>
      <ellipse class="leaf d2" cx="119" cy="40" rx="10" ry="22" transform="rotate(55 119 40)"/>
      <ellipse class="leaf d2" cx="155" cy="83" rx="11" ry="24" transform="rotate(41 155 83)"/>
      <ellipse class="leaf d3" cx="188" cy="70" rx="10" ry="22" transform="rotate(68 188 70)"/>
      <ellipse class="leaf d4" cx="239" cy="116" rx="10" ry="21" transform="rotate(73 239 116)"/>
      <ellipse class="leaf d5" cx="298" cy="190" rx="10" ry="21" transform="rotate(101 298 190)"/>
      <ellipse class="leaf d6" cx="348" cy="244" rx="10" ry="22" transform="rotate(103 348 244)"/>
      <g class="flower d4" transform="translate(158 116)">
        <ellipse cx="0" cy="-15" rx="8" ry="17"/><ellipse cx="14" cy="-5" rx="8" ry="17" transform="rotate(72)"/><ellipse cx="9" cy="12" rx="8" ry="17" transform="rotate(144)"/><ellipse cx="-9" cy="12" rx="8" ry="17" transform="rotate(216)"/><ellipse cx="-14" cy="-5" rx="8" ry="17" transform="rotate(288)"/><circle cx="0" cy="0" r="5" fill="#c89a4f"/>
      </g>
      <circle class="berry d5" cx="246" cy="151" r="5"/><circle class="berry d6" cx="259" cy="158" r="4"/><circle class="berry d7" cx="387" cy="268" r="5"/>
    </svg>`;

  const petalData = [
    ['13%','16%','10px','18deg','22px','5.8s','.5s'],['25%','7%','8px','-26deg','-19px','6.4s','1.4s'],
    ['38%','13%','7px','42deg','16px','5.5s','2.2s'],['70%','9%','9px','12deg','-25px','6.1s','.9s'],
    ['84%','18%','11px','-38deg','-17px','5.7s','1.8s'],['91%','39%','7px','28deg','-28px','6.6s','.3s'],
    ['8%','48%','8px','-14deg','30px','6.2s','1.1s'],['18%','74%','9px','37deg','23px','5.9s','2s'],
    ['33%','85%','7px','-35deg','19px','6.4s','.7s'],['66%','82%','10px','22deg','-21px','5.6s','1.55s'],
    ['80%','73%','8px','-18deg','-25px','6.3s','2.35s'],['54%','4%','6px','47deg','12px','5.4s','1.2s']
  ];
  const petals = petalData.map(p => `<span class="intro-particle" style="--x:${p[0]};--y:${p[1]};--s:${p[2]};--r:${p[3]};--dx:${p[4]};--dur:${p[5]};--delay:${p[6]}"></span>`).join('');
  const sparks = [['17%','31%','.6s'],['29%','63%','1.25s'],['39%','24%','1.9s'],['48%','72%','.4s'],['57%','19%','1.45s'],['69%','61%','2.05s'],['78%','34%','.85s'],['86%','54%','1.7s']]
    .map(s => `<span class="intro-spark" style="--x:${s[0]};--y:${s[1]};--delay:${s[2]}"></span>`).join('');

  stage.innerHTML = `
    <div class="intro-vignette"></div><div class="intro-frame"></div>
    <div class="intro-floral-wrap intro-floral-left">${floral}</div>
    <div class="intro-floral-wrap intro-floral-right">${floral}</div>
    <div class="intro-particles">${petals}${sparks}</div>
    <div class="intro-heartbeat"></div><div class="intro-heartbeat intro-heartbeat-2"></div>
    <div class="intro-center">
      <div class="intro-ornament-top"><span></span><i>♥</i><span></span></div>
      <div class="intro-seal"><div class="intro-ring-dots"></div><div class="intro-monogram">C<small>&amp;</small>E</div></div>
      <p class="intro-kicker">Nuestro mejor comienzo</p>
      <h1 class="intro-names">Carolina &amp; Esthefano</h1>
      <p class="intro-date">06 · 02 · 2027</p>
      <p class="intro-message">Una historia, un sí, para siempre</p>
    </div>
    <button id="introSkip" class="intro-skip" type="button" aria-label="Omitir animación de entrada">Omitir</button>`;

  let done = false;
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const finish = () => {
    if (done) return;
    done = true;
    screen.classList.add('intro-finished');
    stage.setAttribute('aria-hidden', 'true');
  };
  const timer = window.setTimeout(finish, reduced ? 80 : 5600);
  document.getElementById('introSkip')?.addEventListener('click', () => {
    window.clearTimeout(timer);
    finish();
  });
})();
