/* ============================================================
   ESQUELETO DA FOLHA VIVA — as folhas.

   ⚠️ ESTE ARQUIVO É A CASCA. As folhas (`f01`, `f02`, …) se escrevem abaixo, e
   cada uma nasce de um VERBO impresso numa folha de papel colhida. O crivo —
   comando VERBATIM e veredito de cada uma das trinta — vai em
   `_sequencias/POTE-<assunto>.md`, e é DELE que sai o roteiro.

   ⚠️ A POSIÇÃO É A IDENTIDADE: a folha da posição 7 usa o pote `p7`, grava os
      ids `n7_*` e fala `p7enun`. Não há segunda lista para desencontrar.

   O QUE JÁ VEM PRONTO AQUI (clonar destas peças, não reescrever):
     · `faixa` · `enunciado` · `item` · `fechaItem` · `nomeSecreto`
     · `opcoes` (a fileira de escolhas, com arrastar de brinde)
     · `puxavel` (arrastar com mouse, dedo e caneta — três lições pagas dentro)
     · `gavetas` (classificar em colunas, nas duas portas)
     · `montaLigar` (ligar com linha curva)
     · o teclado (`abreCruz`/`digitaCruz`/`confereCruz`/`rolaParaCruz`)
     · navegação, boletim, relatório do professor, dossiê, retomar 55 min
   ============================================================ */

var livro = document.getElementById("livro"), PAGEL = [], TIRAS = [];
/* ⚠️⚠️ AS FOLHAS DE LIGAR SE DECLARAM AQUI, e o número errado quebra DUAS
   folhas de uma vez — medido no `_rima1`, que estava no ar: a folha que liga
   NUNCA fechava (a criança ligava tudo e continuava faltando) e a folha
   apontada por engano FECHAVA SOZINHA, sem ninguém tocar nela. São as únicas
   cujos ids não nascem de `n<pi>_`, e sim dentro do `montaLigar`
   (`l<pi>g<i>_<chave>`). Conferir com `node _qa/conta_folha.js <pasta>`. */
var LIGAR = [5, 16, 26];
/* a cor da faixa por BLOCO da escada, não por folha: a criança vê que o assunto
   mudou. Uma entrada por folha, de c1 a c5. */
var CORES = ["c1", "c1", "c1", "c1", "c2", "c2", "c2", "c2", "c3", "c3", "c3", "c3", "c3", "c3", "c3", "c3", "c4", "c4", "c4", "c4", "c4", "c4", "c5", "c5", "c5", "c5", "c5", "c5", "c1", "c1", "c1", "c1", "c2", "c2", "c2"];


function faixa(d, i, titulo){ d.appendChild(el("div", "faixa", '<div class="num">' + i + '</div><h2>' + titulo + '</h2>')); }
function aoAbrir(d, fn){ if(!d._aoAbrir) d._aoAbrir = []; d._aoAbrir.push(fn); }
/* ---------- O ALTO-FALANTE ----------
   Regra da casa: tudo o que a criança PRECISA LER tem que poder ser OUVIDO.
   O desenho do botão é CSS puro: nada de emoji (vira quadradinho nos PCs da
   escola). */
function botaoSom(rot, aoTocar, cls){
  var b = el("button", cls || "som");
  b.innerHTML = '<i class="cone"></i><i class="onda o1"></i><i class="onda o2"></i>';
  b.setAttribute("aria-label", rot || "Ouvir");
  b.onclick = function(ev){ ev.stopPropagation(); sPasso(); aoTocar(); };
  return b;
}
function enunciado(d, pi, texto, chave){
  var cx = el("div", "enunlin");
  cx.appendChild(el("div", "enun", texto));
  cx.appendChild(botaoSom("Ouvir o que a folha pede", function(){ falar(chave); }));
  d.appendChild(cx);
}
function item(n){ return el("div", "item", n ? '<span class="n">' + n + '.</span>' : ""); }
function fechaItem(d, box, id){
  if(ST.resp[id]) box.className = "item feito";
  box.setAttribute("data-qa", "item-" + id);
  d.appendChild(box);
}
/* ⚠️ A RESPOSTA NÃO PODE APARECER ANTES DE A CRIANÇA RESPONDER. A palavra não
   some: fica INVISÍVEL (`visibility`, para o espaço ficar guardado e a folha não
   pular) e aparece no instante do acerto. É o que o `_qa/resposta_impressa.py`
   mede. */
function nomeSecreto(txt, id){
  var b = el("b", "segredo" + (ST.resp[id] ? " revelado" : ""), txt);
  b.setAttribute("data-nome", id);
  return b;
}
function chaveQuadro(w){ return String(w).toLowerCase().replace(/[^a-z]/g, ""); }

/* ---------- fileira de opções (a peça que mais se repete) ----------
   `soltarEm` (opcional) liga o ARRASTAR: a criança pode puxar a peça até o
   alvo em vez de só tocar nela. AS DUAS PORTAS, SEMPRE — no PC da escola ela
   usa o mouse e arrastar é o gesto natural; no celular, tocar é. */
function opcoes(pai, pi, id, lista, certa, cls, falaCerto, falaDica, aoAcertar, soltarEm){
  registra(id, pi, certa);
  var box = el("div", "ops"), feito = !!ST.resp[id];
  function responde(o, b){
    if(ST.resp[id]) return;
    sPasso(); if(o.fala) falar(o.fala);
    if(o.v === certa){
      b.className = "op" + (cls ? " " + cls : "") + " certa";
      if(aoAcertar) aoAcertar(b);
      setTimeout(function(){ acertou(id, falaCerto); }, aoAcertar ? 620 : 240);
    } else {
      b.className = "op" + (cls ? " " + cls : "") + " erro";
      setTimeout(function(){ b.className = "op" + (cls ? " " + cls : ""); }, 500);
      errou(id, falaDica);
    }
  }
  lista.forEach(function(o){
    var b = el("button", "op" + (cls ? " " + cls : "") + (feito && o.v === certa ? " certa" : ""), o.rot);
    b.setAttribute("data-qa", "op-" + id + "-" + o.v);
    b.setAttribute("aria-label", o.aria || o.v);
    b.onclick = function(){ if(b._arrastou){ b._arrastou = false; return; } responde(o, b); };
    if(soltarEm) puxavel(b, soltarEm, function(){ responde(o, b); });
    /* ⚠️ O ALTO-FALANTE DA RESPOSTA, e ele é DISCRETO e vem ANTES da escolha.
       Pergunta do Marcos (20/set/2026): *"a atividade tem áudio para ajudar os
       que não sabem ler? O alto-falante discreto para clicar caso o estudante
       queira ouvir"*. A resposta era NÃO: a opção tinha `fala`, mas o motor só
       a tocava DEPOIS do clique — ou seja, a criança tinha de ESCOLHER para
       ouvir, e aí já tinha respondido. O portão `1o` media a metade errada
       (cobrava o campo `fala` existir, não a criança poder ouvir antes).
       ⚠️ Botão IRMÃO, nunca dentro do outro: botão dentro de botão é HTML
       inválido e o clique vaza para a resposta. O `botaoSom` já faz
       `stopPropagation`. */
    if(o.fala){
      var w = el("div", "opw" + (cls && cls.indexOf("frase") > -1 ? " larga" : ""));
      w.appendChild(b);
      w.appendChild(botaoSom("Ouvir esta resposta",
        (function(f){ return function(){ falar(f); }; })(o.fala), "som somop"));
      box.appendChild(w);
    } else {
      box.appendChild(b);
    }
  });
  pai.appendChild(box);
}

/* ---------- PUXAR uma peça até um alvo (mouse, dedo e caneta) ----------
   ⚠️ Pointer Events e não mouse+touch separados: no celular o navegador dispara
   eventos de mouse FANTASMA depois do toque, e foi assim que o arrastar já
   quebrou duas vezes nesta casa.
   ⚠️ E nada de `preventDefault` no início: isso mataria o toque. Só depois de o
   dedo ANDAR 8 px é que vira arrasto — antes disso continua sendo um toque
   normal e o `onclick` responde igual. */
var PUXA = null;

function puxavel(bt, alvos, aoSoltar){
  if(!alvos.push) alvos = [alvos];
  bt.style.touchAction = "none";
  bt.addEventListener("pointerdown", function(ev){
    if(ev.button && ev.button !== 0) return;
    PUXA = {bt: bt, alvos: alvos, aoSoltar: aoSoltar,
            x0: ev.clientX, y0: ev.clientY,
            lx: ev.clientX, ly: ev.clientY,
            andando: false, fantasma: null};
  });
}
/* ⚠️⚠️ TRÊS LIÇÕES PAGAS AQUI, e nenhuma delas dava erro na tela — o arrasto
   simplesmente não acontecia:
   1. ouvir o `pointermove` no PRÓPRIO botão: só o primeiro movimento chegava.
      O padrão certo é ouvir no DOCUMENTO — o dedo precisa poder SAIR de cima da
      peça, que é justamente o que ele faz ao levá-la.
   2. o navegador FUNDE os movimentos: num teste com oito passos chegou UM
      `pointermove`. Quem manda é a SOLTURA, não a contagem de movimentos.
   3. o `pointercancel` chega ANTES do `pointerup` e vem com clientX/clientY
      = 0,0 — quem usasse a coordenada dele concluiria que a criança soltou no
      canto da tela. Por isso o último ponto REAL fica guardado. */
function _puxaAnda(ev){
  var P = PUXA; if(!P) return;
  P.lx = ev.clientX; P.ly = ev.clientY;
  var dx = ev.clientX - P.x0, dy = ev.clientY - P.y0;
  if(!P.andando){
    if(dx * dx + dy * dy < 64) return;
    P.andando = true; P.bt._arrastou = true;
    var f = P.bt.cloneNode(true);
    f.className = "fantasma " + P.bt.className;
    var r = P.bt.getBoundingClientRect();
    f.style.width = r.width + "px"; f.style.height = r.height + "px";
    f._ox = r.left; f._oy = r.top;
    document.body.appendChild(f); P.fantasma = f;
    P.bt.className = P.bt.className + " puxada";
  }
  if(ev.cancelable) ev.preventDefault();
  P.fantasma.style.left = (P.fantasma._ox + dx) + "px";
  P.fantasma.style.top = (P.fantasma._oy + dy) + "px";
  P.alvos.forEach(function(a){
    a.className = a.className.replace(/ ?perto/, "") + (sobre(ev, a) ? " perto" : "");
  });
}
function _puxaSolta(ev){
  var P = PUXA; if(!P) return;
  PUXA = null;
  P.alvos.forEach(function(a){ a.className = a.className.replace(/ ?perto/, ""); });
  P.bt.className = P.bt.className.replace(/ ?puxada/, "");
  if(P.fantasma && P.fantasma.parentNode) P.fantasma.parentNode.removeChild(P.fantasma);
  var px = ev.clientX, py = ev.clientY;
  if(!px && !py){ px = P.lx; py = P.ly; }
  var onde = {clientX: px, clientY: py};
  var andou = (px - P.x0) * (px - P.x0) + (py - P.y0) * (py - P.y0) >= 64;
  if(!andou) return;
  P.bt._arrastou = true;
  var i;
  for(i = 0; i < P.alvos.length; i++){
    if(sobre(onde, P.alvos[i])){ P.aoSoltar(P.alvos[i], i); break; }
  }
  setTimeout(function(){ P.bt._arrastou = false; }, 60);
}
document.addEventListener("dragstart", function(ev){ ev.preventDefault(); });
document.addEventListener("pointermove", _puxaAnda);
document.addEventListener("pointerup", _puxaSolta);
document.addEventListener("pointercancel", _puxaSolta);
function sobre(ev, alvo){
  var r = alvo.getBoundingClientRect(), m = 14;
  return ev.clientX >= r.left - m && ev.clientX <= r.right + m &&
         ev.clientY >= r.top - m && ev.clientY <= r.bottom + m;
}

function monta(){
  livro.innerHTML = ""; PAGEL = []; RESP = {}; TIRAS = [];
  /* ⚠️ UMA ENTRADA POR FOLHA, na ordem, começando pela capa `f0`. */
  var caps = [f0, f1, f2, f3, f4, f5, f6, f7, f8, f9, f10, f11, f12, f13, f14, f15, f16, f17, f18, f19, f20, f21, f22, f23, f24, f25, f26, f27, f28, f29, f30, f31, f32, f33, f34, f35], i;
  for(i = 0; i < caps.length; i++){
    var d = el("div", "pagina" + (i > 0 ? " " + CORES[i - 1] : "")); d.setAttribute("data-pag", i);
    caps[i](d, i);
    if(i > 0) d.appendChild(el("div", "carimbo", "FOLHA<br>PRONTA"));
    livro.appendChild(d); PAGEL.push(d);
  }
}

/* ---------- capa ----------
   A capa não é enfeite: é a primeira coisa que a criança vê, e é ela que diz
   "isto aqui é um lugar bom". O tema sai do PROBLEMA do caderno.
   ⚠️ CAPA CLONADA = TROCAR A CENA, SEMPRE. Numa capa herdada desta casa ficou um
      `img()` de outra atividade: o app abria com um quadradinho vazio e um 404
      no console, e nenhum portão de texto viu. */
function f0(d){
  /* CAPA COM IDENTIDADE PRÓPRIA — gerada por _padrao/identidade_capa.py (editar lá).
     Cena: o motor da frase: as crianças em ação passam na esteira, e embaixo de cada uma o verbo que a nomeia (figuras recortadas da folha de papel d33). O título entra letra a letra (desliza), palavra por palavra
     (nowrap, para não quebrar no meio); as figuras são as do próprio caderno. */
  var c = el("div", "capa"), nome = "Aprendendo o verbo e a concordância verbal", k, letras = "", pos = 0;
  var V = typeof VIMG !== "undefined" ? VIMG : 2;
  nome.split(" ").forEach(function(pal, w){
    var s = "";
    for(k = 0; k < pal.length; k++, pos++){
      s += '<span class="lt" style="animation-delay:' + (0.05 * pos).toFixed(2) + 's">' + pal.charAt(k) + '</span>';
    }
    pos++;
    letras += (w ? '<span class="cpesp"></span>' : '') + '<span class="cptpal">' + s + '</span>';
  });
  c.innerHTML =
    '<div class="ceu"></div>' + '<h1 class="titu">' + letras + '</h1>' +
    '<div class="sub">Língua Portuguesa &middot; 4º ano &middot; 35 folhas sobre o verbo: a palavra que diz a ação, e que combina com quem faz</div>' +
    '<div class="cena">' + '<div class="it" style="animation-delay:0.00s">' + '<img class="capfig" draggable="false" src="img/vr_comer.png?v=' + V + '" alt="">' + '<span class="rt">come</span>' + '</div>' + '<div class="it" style="animation-delay:0.35s">' + '<img class="capfig" draggable="false" src="img/vr_correr.png?v=' + V + '" alt="">' + '<span class="rt">corre</span>' + '</div>' + '<div class="it" style="animation-delay:0.70s">' + '<img class="capfig" draggable="false" src="img/vr_brincar.png?v=' + V + '" alt="">' + '<span class="rt">brincam</span>' + '</div>' + '<div class="it" style="animation-delay:1.05s">' + '<img class="capfig" draggable="false" src="img/vr_ler.png?v=' + V + '" alt="">' + '<span class="rt">lê</span>' + '</div>' + '<div class="it" style="animation-delay:1.40s">' + '<img class="capfig" draggable="false" src="img/vr_estudar.png?v=' + V + '" alt="">' + '<span class="rt">anda</span>' + '</div>' + '</div>' + '<div class="esteira2">' + '<i class="rolo"></i>' + '<i class="rolo"></i>' + '<i class="rolo"></i>' + '<i class="rolo"></i>' + '<i class="rolo"></i>' + '<i class="rolo"></i>' + '<i class="rolo"></i>' + '</div>' +
    '<div class="chamada">Escreva o seu nome ali embaixo e toque em <b>Começar</b>.</div>';
  d.appendChild(c);
}
function gavetas(d, pi, gk, pede){
  faixa(d, pi, NOMES[pi - 1]);
  var G = GAV[gk];
  enunciado(d, pi, pede, "p" + pi + "enun");
  var cols = el("div", "colunas"), caixas = {}, listaC = [];
  G.cols.forEach(function(C){
    var c = el("div", "coluna");
    var t = el("div", "ctit", C.n);
    t.setAttribute("data-alvo", "1");
    /* ⚠️ o alvo é COMPARTILHADO pela folha inteira, então ele se declara no
       nível da página — e com o número da folha no nome, porque as 22 folhas
       moram no mesmo HTML e o jogador da banca busca por `document.querySelector`. */
    c.setAttribute("data-qa", "alvo-gav" + pi + "_" + C.k);
    t.appendChild(botaoSom("Ouvir a regra desta gaveta", function(){ falar("gav_" + gk + "_" + C.k); }));
    c.appendChild(t);
    var dentro = el("div", "cdentro");
    c.appendChild(dentro);
    c._v = C.k; c._dentro = dentro;
    caixas[C.k] = c; listaC.push(c);
    cols.appendChild(c);
  });
  d.appendChild(cols);
  var banco = el("div", "figbanco"), marcada = null;
  ST.folha["p" + pi].forEach(function(n, i){
    var P = G.pal[n], id = "n" + pi + "_" + i;
    registra(id, pi, ">gav" + pi + "_" + P.c);
    var b = el("button", "op pal" + (ST.resp[id] ? " usada" : ""), P.p);
    b.setAttribute("aria-label", P.p);
    b.setAttribute("data-qa", "item-" + id);
    /* a palavra escrita é a PEÇA que a criança pega, não a resposta entregue */
    b.setAttribute("data-alvo", "1");
    if(ST.resp[id]) caixas[P.c]._dentro.appendChild(el("span", "fdentro", P.p));
    function larga(col){
      if(ST.resp[id]) return;
      if(col._v === P.c){
        b.className = "op pal usada";
        col._dentro.appendChild(el("span", "fdentro", P.p));
        if(marcada === b) marcada = null;
        acertou(id, "certo" + pi + "_" + n);
      } else {
        col.className = "coluna erro";
        setTimeout(function(){ col.className = "coluna"; }, 500);
        errou(id, "dica" + pi + "_" + n);
      }
    }
    b._larga = larga;
    b.onclick = function(){
      if(b._arrastou){ b._arrastou = false; return; }
      if(ST.resp[id]) return;
      sPasso(); falar("diz2_" + gk + "_" + n);
      if(marcada === b){ b.className = "op pal"; marcada = null; return; }
      if(marcada) marcada.className = "op pal";
      b.className = "op pal marcada"; marcada = b;
    };
    puxavel(b, listaC, function(col){ larga(col); });
    banco.appendChild(b);
  });
  listaC.forEach(function(col){
    col.onclick = function(){
      if(!marcada){ sPasso(); falar("toque_palavra"); return; }
      marcada._larga(col);
    };
  });
  d.appendChild(banco);
}

/* ============================================================
   AS FOLHAS — escrever daqui para baixo, uma função por folha.

   O MOLDE de uma folha de escolher:

     function f01(d, pi){
       faixa(d, pi, NOMES[pi - 1]);
       enunciado(d, pi, "O que a criança tem de fazer.", "p" + pi + "enun");
       ST.folha["p" + pi].forEach(function(k, i){
         var D = MEUDADO[k], id = "n" + pi + "_" + i, box = item(i + 1);
         // … desenhar a peça …
         opcoes(box, pi, id, lista, certa, "pal",
                "certo" + pi + "_" + k, "dica" + pi + "_" + k);
         fechaItem(d, box, id);
       });
     }

   ⚠️ E CADA PEÇA TEM DE SER ALCANÇÁVEL PELO JOGADOR DA BANCA, senão a folha sai
      como dívida e ninguém a mede. Os contratos, em `_qa/joga_folha.js`:
        `esc-<id>`            → campo de teclado
        `op-<id>-<valor>`     → uma escolha
        `item-<id>` + `>gav`  → pegar a peça e largar na gaveta
        `pinta-<id>-<x>` + `data-lapis="<x>"` e o estojo `lapis-<x>` → pintar
        `cp-<id>-a` / `cp-<id>-z` → as duas pontas da palavra no caça-palavras
        `conferir-<id>`       → marque vários e confirme
   ============================================================ */
/* ---------- o teclado da palavra: uma por vez, letra a letra ----------
   ⚠️ UMA PEÇA SÓ PARA A CRUZADINHA (22) E PARA O REESCREVA (19). As duas
   escrevem palavra letra a letra; escrever dois teclados seria arrumar lugar
   para um segundo defeito. O que muda entre elas é só o rótulo da tarja —
   daí o `E.rot`. */
var CRUZ = null;
/* ---------- ROLAR A PALAVRA PARA CIMA DO TECLADO ----------
   ⚠️⚠️ O TECLADO TAPAVA A ATIVIDADE, e o Marcos viu no celular (15/set/2026):
      *"ele preenche a tela e não dá para ver a atividade"*. Medido: na
      cruzadinha de 360x640 o teclado ocupava 368 px de 640 e a grade ficava
      INTEIRA por baixo dele — a criança escrevia às cegas.
   ⚠️ E A REGRA TEM DOIS DEGRAUS, porque medir só um não bastou:
      1. se a PALAVRA inteira cabe na faixa que sobra, ela sobe inteira;
      2. se não cabe (palavra em pé, tela de 320x568 — medido), sobe a CASINHA
         QUE ESTÁ SENDO ESCRITA, centrada na faixa. É o que um campo de texto
         faz: mantém à vista a letra que a pessoa está digitando.
   Por isso ela é chamada duas vezes: ao abrir o teclado e a cada letra.
   ⚠️⚠️ E ELA ATENDE OS DOIS TECLADOS DA CASA, o que é a lição paga aqui
      (15/set/2026): há dois desenhos de teclado nos cadernos de folha viva —
      o da CRUZADINHA, que escreve numa fila de casinhas (`CRUZ.E.cels`), e o
      da SÍLABA/PALAVRA, que escreve numa quadra só (`ATIVA.q`). Eu escrevi
      esta função ancorada no primeiro e a enfiei nos dezoito cadernos pelo
      `function abreCruz(` — que só existe em TRÊS. Nos outros quinze ficou a
      CHAMADA sem a função: `setTimeout(rolaParaCruz, 60)` estourava
      ReferenceError e matava o resto de `ativa()`, que era justamente quem
      escrevia a dica e falava com a criança. O teclado abria mudo.
      O `node --check` não vê isso (a sintaxe está perfeita); quem vê é o
      `_qa/funcoes.py`, o portão "função que não existe" — que eu não rodei. */
function rolaParaCruz(){
  /* ⚠️ VAZIA DE PROPÓSITO, e ela fica aqui em vez de sumir. Enquanto o
     teclado era uma barra fixa nossa, esta função levava a palavra para
     a faixa que sobrava acima dele. Agora quem abre é o teclado do
     aparelho, e o navegador já rola a página sozinho para o campo com
     foco. Apagá-la quebraria as chamadas que ainda existem por aí. */
}
function abreCruz(E, pi){
  /* ⚠️ SEM BARRA FIXA, SEM ROLAGEM FORÇADA. O teclado da casa era fixo no pé da
     tela e tapava a palavra que a criança escrevia — daí existir o `comtec` e o
     `rolaParaCruz`. Agora quem abre é o teclado do APARELHO, que o próprio
     navegador já trata: ele rola a página para deixar o campo com foco à vista.
     Foi por isso que as duas peças saíram daqui juntas. */
  /* ⚠️ Toque na casinha dispara o `onclick` da casinha E o da grade: a mesma
     palavra pede para abrir duas vezes. Se já está aberta, só devolve o foco —
     fechar e reabrir era o que apagava a letra e (antes do conserto acima)
     estourava. */
  if(CRUZ && CRUZ.E === E){ try{ TECIN && TECIN.focus(); }catch(e){} return; }
  if(CRUZ) fechaCruz();
  CRUZ = {E: E, val: "", pi: pi};
  if(E.bt) E.bt.className = E.bt.className.indexOf("oculta") > -1 ? "pista oculta" : "pista ativa";
  pintaCruz();
  var grade = E.cels && E.cels[0] ? E.cels[0].parentNode : null;
  var c = poeCampoSobre(grade);
  c.value = "";
  c.setAttribute("maxlength", String(E.aceita ? E.cels.length : E.w.length));
  c.setAttribute("aria-label", E.rot || "Escreva a palavra");
  try{ c.focus({preventScroll: false}); }catch(e){ c.focus(); }
  falar("escreva");
}
function fechaCruz(){
  /* ⚠️⚠️ LIÇÃO PAGA — "O ALUNO NÃO CONSEGUIA DIGITAR" (Marcos, 18/set/2026, na
     folha 8 d'A Fábrica de Nomes). Aqui estava `CRUZ = null; pintaCruz();` — e
     `pintaCruz` começa lendo `CRUZ.E`. Estourava TypeError toda vez que se
     fechava a caneta. Como a casinha E a grade tinham `onclick`, um toque na
     casinha chamava `abreCruz` duas vezes: a segunda fechava a primeira, o
     fecho estourava, e o `abreCruz` morria ANTES de reabrir. Resultado: a
     criança tocava, nada abria, digitava e nada acontecia — sem erro na tela.
     O jogador da banca não pegou porque clicava na GRADE (um `onclick` só);
     agora ele clica na CASINHA, como a criança. Aqui: pintar com o E guardado
     ANTES de zerar, e nunca ler CRUZ depois de zerá-lo. */
  if(!CRUZ) return;
  var E = CRUZ.E;
  if(E.bt) E.bt.className = E.bt.className.indexOf("oculta") > -1 ? "pista oculta" : "pista";
  CRUZ = null;
  if(TECIN){ TECIN.value = ""; try{ TECIN.blur(); }catch(e){} }
  limpaCruz(E);
}
function limpaCruz(E){
  (E && E.cels || []).forEach(function(c){
    if(!c || c.className.indexOf(" ok") > -1) return;
    var n = c.querySelector(".cn");
    c.textContent = ""; if(n) c.appendChild(n);
    c.className = "ccel viva";
  });
}
function pintaCruz(){
  if(!CRUZ) return;                       /* nunca ler CRUZ.E sem CRUZ */
  var E = CRUZ.E, v = CRUZ.val;
  E.cels.forEach(function(c, i){
    if(!c) return;
    var n = c.querySelector(".cn");
    c.textContent = v.charAt(i) || "";
    if(n) c.appendChild(n);
    c.className = "ccel viva" + (i === v.length ? " ativa" : "");
  });
}
function digitaCruz(ch){
  if(!CRUZ) return;
  sTecla();
  var E = CRUZ.E;
  /* ⚠️ NA FOLHA DE PRODUÇÃO O TAMANHO NÃO É O DO GABARITO: as palavras aceitas
     têm tamanhos diferentes, e o teto é a maior delas (`E.cels.length`). E ela
     NÃO se confere sozinha ao encher — a criança é que diz quando acabou, no
     botão OK. Conferir sozinho recusaria "GATO" no meio de "GATOS". */
  var teto = E.aceita ? E.cels.length : E.w.length;
  if(ch === "ap") CRUZ.val = CRUZ.val.slice(0, -1);
  else if(ch === "ok"){ confereCruz(); return; }
  else { if(CRUZ.val.length >= teto) return; CRUZ.val += ch; }
  pintaCruz(); rolaParaCruz();
  if(!E.aceita && CRUZ.val.length >= E.w.length) setTimeout(confereCruz, 380);
}
/* ⚠️⚠️ O ACENTO NÃO PODE REPROVAR QUEM ACERTOU A PALAVRA (ordem do Marcos,
   15/set/2026, com a turma na sala: *"faça que tanto com o sem dê certo"*).
   O gabarito de BACTERIAS estava sem acento e o teclado da tela TEM os acentos:
   a criança que escrevia BACTÉRIAS — que é o certo em português — era recusada,
   e ficava olhando para uma palavra certa marcada como errada. O contrário
   também acontecia, em caderno cujo gabarito vinha acentuado.
   ⚠️ E ONDE O ACENTO É O CONTEÚDO, ele continua contando: a folha declara
      `exigeAcento` e aí a comparação é letra por letra, acento incluído. */
function semAcento(s){
  s = String(s || "").toUpperCase();
  var de = "ÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ", para = "AAAAAEEEEIIIIOOOOOUUUUC", i, o = "";
  for(i = 0; i < s.length; i++){
    var n = de.indexOf(s.charAt(i));
    o += n > -1 ? para.charAt(n) : s.charAt(i);
  }
  return o;
}
function mesmaPalavra(a, b, exigeAcento){
  if(exigeAcento) return String(a).toUpperCase() === String(b).toUpperCase();
  return semAcento(a) === semAcento(b);
}
function confereCruz(){
  if(!CRUZ || !CRUZ.val) return;
  var E = CRUZ.E, pi = CRUZ.pi;
  /* ⚠️⚠️ A FOLHA DE PRODUÇÃO (34) ACEITA MUITAS RESPOSTAS, e sem isto ela seria
     uma armadilha: a criança escreveria uma palavra CERTA e o app diria que
     está errada. Quando `E.aceita` existe, vale qualquer palavra da lista —
     e a que fica escrita nas casas é a que ELA escreveu, não a do gabarito.
     ⚠️ E o gabarito continua existindo (`E.w` = a primeira da lista), porque é
        ele que o jogador da banca digita. */
  var vale = E.aceita
    ? E.aceita.some(function(w){ return mesmaPalavra(CRUZ.val, w, E.exigeAcento); })
    : mesmaPalavra(CRUZ.val, E.w, E.exigeAcento);
  var escrita = E.aceita ? CRUZ.val : E.w;
  if(vale){
    E.cels.forEach(function(c, i){
      if(!c) return;
      var n = c.querySelector(".cn");
      c.textContent = escrita.charAt(i); if(n) c.appendChild(n);
      c.className = "ccel viva" + (i < escrita.length ? " ok" : "");
    });
    if(E.bt) E.bt.className = E.bt.className.indexOf("oculta") > -1 ? "pista oculta" : "pista feita";
    CRUZ = null;
    if(TECIN){ TECIN.value = ""; try{ TECIN.blur(); }catch(e){} }
    acertou(E.id, "certo" + pi + "_" + E.k);
  } else {
    CRUZ.val = ""; pintaCruz();
    errou(E.id, "dica" + pi + "_" + E.k);
  }
}
function montaLigar(caixa, pi, tag, pares, pagina){
  var box = el("div", "ligar"), ce = el("div", "col"), cd = el("div", "col");
  var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"); svg.setAttribute("class", "linhas");
  box.appendChild(ce); box.appendChild(cd); box.appendChild(svg); caixa.appendChild(box);
  var ordem = baralha(pares.map(function(_, i){ return i; }));
  var E = {}, D = {}, marcada = null;
  pares.forEach(function(P){ registra("l" + pi + tag + "_" + P.k, pi, P.k); });
  function centro(e, lado){
    var r = e.getBoundingClientRect(), b = box.getBoundingClientRect();
    return {x: (lado === "e" ? r.right : r.left) - b.left, y: r.top + r.height / 2 - b.top};
  }
  function linha(a, b2, cor){
    var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    var dx = Math.max(28, Math.abs(b2.x - a.x) * 0.45);
    var dd = "M" + a.x + "," + a.y + " C" + (a.x + dx) + "," + a.y + " " +
             (b2.x - dx) + "," + b2.y + " " + b2.x + "," + b2.y;
    var halo = document.createElementNS("http://www.w3.org/2000/svg", "path");
    halo.setAttribute("d", dd); halo.setAttribute("fill", "none");
    halo.setAttribute("stroke", "#ffffff"); halo.setAttribute("stroke-width", 11);
    halo.setAttribute("stroke-linecap", "round");
    var l = document.createElementNS("http://www.w3.org/2000/svg", "path");
    l.setAttribute("d", dd); l.setAttribute("fill", "none");
    l.setAttribute("stroke", cor); l.setAttribute("stroke-width", 6);
    l.setAttribute("stroke-linecap", "round");
    g.appendChild(halo); g.appendChild(l);
    [a, b2].forEach(function(p){
      var c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("cx", p.x); c.setAttribute("cy", p.y); c.setAttribute("r", 6);
      c.setAttribute("fill", cor); c.setAttribute("stroke", "#fff"); c.setAttribute("stroke-width", 2.5);
      g.appendChild(c);
    });
    svg.appendChild(g); return g;
  }
  function desmarca(){ if(marcada) marcada.el.className = marcada.el.className.replace(" marcada", ""); marcada = null; }
  function redesenha(){
    while(svg.firstChild) svg.removeChild(svg.firstChild);
    for(var k in E) if(ST.lig["l" + pi + tag + "_" + k]) linha(centro(E[k].el, "e"), centro(D[k].el, "d"), "#15a34a");
  }
  aoAbrir(pagina, redesenha);
  window.addEventListener("resize", function(){ if(pagina.className.indexOf("viva") > -1) redesenha(); });
  function fecha(Re, Rd){
    var id = "l" + pi + tag + "_" + Re.k;
    if(Rd.k === Re.k){
      ST.lig[id] = 1; tentativa(id, true); ST.resp[id] = 1; salvar();
      Re.el.className += " feita"; Rd.el.className += " feita"; desmarca(); redesenha(); sCerto();
      falar(Re.fc); setTimeout(function(){ confereFolha(pi); }, 850);
    } else {
      tentativa(id, false); sErro();
      Rd.el.className += " treme";
      setTimeout(function(){ Rd.el.className = Rd.el.className.replace(" treme", ""); }, 500);
      falar(ST.tent[id].erros >= 2 ? Re.dica : "quase");
      if(ST.tent[id].erros >= 2 && D[Re.k].el.className.indexOf("feita") < 0) D[Re.k].el.className += " mostra";
    }
  }
  pares.forEach(function(P){
    var e = el("div", "ponta" + (ST.lig["l" + pi + tag + "_" + P.k] ? " feita" : ""), P.esq);
    e.setAttribute("role", "button"); e.setAttribute("tabindex", "0");
    e.setAttribute("data-qa", "lig" + tag + "-e-" + P.k);
    e.setAttribute("aria-label", P.ariaE);
    var R = {k: P.k, el: e, fc: P.fc, dica: P.dica};
    E[P.k] = R;
    e.addEventListener("pointerdown", function(ev){
      if(e.className.indexOf("feita") > -1) return;
      ev.preventDefault(); desmarca(); marcada = R; e.className += " marcada"; sPasso(); falar(P.fe);
    });
    e.onkeydown = function(ev){ if(ev.key === "Enter" || ev.key === " "){ ev.preventDefault(); desmarca(); marcada = R; e.className += " marcada"; falar(P.fe); } };
    ce.appendChild(e);
  });
  ordem.forEach(function(j){
    var P = pares[j];
    var e = el("div", "ponta" + (ST.lig["l" + pi + tag + "_" + P.k] ? " feita" : ""), P.dir);
    e.setAttribute("role", "button"); e.setAttribute("tabindex", "0");
    e.setAttribute("data-qa", "lig" + tag + "-d-" + P.k);
    e.setAttribute("aria-label", P.ariaD);
    var R = {k: P.k, el: e}; D[P.k] = R;
    e.addEventListener("pointerdown", function(ev){
      if(e.className.indexOf("feita") > -1) return;
      ev.preventDefault();
      if(marcada) fecha(marcada, R); else { sPasso(); falar(P.fd); falarDepois("ligue", 900); }
    });
    e.onkeydown = function(ev){ if((ev.key === "Enter" || ev.key === " ") && marcada){ ev.preventDefault(); fecha(marcada, R); } };
    cd.appendChild(e);
  });
}

/* ---------- o teclado da tela, e o teclado DE VERDADE ----------
   ⚠️⚠️ O ALFABETO ESTAVA INCOMPLETO, E ISSO TRANCAVA A CRIANÇA (15/set/2026).
   Faltavam K, W e Y — e, pior, faltavam Ê, Â, Ã, Ô, Õ, À e Ü. Quem tentasse
   escrever PÊSSEGO no teclado da tela ou no teclado de verdade ficava com
   "PSSEGO": a tecla não existia, a letra não entrava, e a folha NUNCA FECHAVA.
   Não havia erro nenhum no console; a criança só tentava de novo até desistir.
   Medido com o navegador de verdade, letra por letra, antes deste conserto.
   ⚠️ Quem fecha esta família agora é o portão `_qa/teclado.py`: ele confere que
      o alfabeto tem as 26 letras e os treze acentos do português, e que o
      teclado da tela e o filtro do teclado de verdade usam o MESMO alfabeto —
      porque dois alfabetos diferentes é o mesmo defeito com uma porta só.
   ⚠️ REGRA DAS DUAS PORTAS (Marcos, ago/2026): *"seria interessante se o aluno
   além de teclar no teclado virtual funcionasse se ele tocasse no teclado de
   verdade, as duas opções"*. No PC da escola tem teclado e a criança vai
   digitar; no celular, não tem. Nunca só uma porta. */
/* ============================================================
   O TECLADO DO APARELHO — substitui o teclado de 41 teclas da casa.

   ⭐ ORDEM DO MARCOS (15/set/2026): *"pode remover o teclado das atividades,
      melhor digitar com teclado normal"*. O nosso ocupava 53% de um celular de
      640 px, e mesmo redistribuído para 4 fileiras ainda comia 40%.

   ⚠️ O QUE ELE RESOLVE E O QUE NÃO RESOLVE, dito por inteiro: no PC da escola o
      teclado físico já funcionava (as duas portas são regra da casa desde
      ago/2026) — o campo abaixo não muda nada lá. Ele existe pelo CELULAR, que
      não tem teclado físico: sem um campo de verdade para focar, o aparelho não
      abre teclado nenhum e a criança fica trancada.
   ============================================================ */
var TECIN = null;
function campoTeclado(){
  if(TECIN) return TECIN;
  TECIN = document.createElement("input");
  TECIN.id = "tecIn";
  TECIN.type = "text";
  TECIN.setAttribute("autocomplete", "off");
  TECIN.setAttribute("autocorrect", "off");
  TECIN.setAttribute("autocapitalize", "characters");
  TECIN.setAttribute("spellcheck", "false");
  TECIN.setAttribute("aria-label", "Escreva a palavra");
  TECIN.setAttribute("inputmode", "text");
  /* ⚠️ O EVENTO É `input`, NÃO `keydown`: no celular o teclado do sistema não
     dispara keydown com a letra (ele "compõe" o texto), e um caderno que só
     ouvisse keydown seria mudo justamente no aparelho para o qual este campo
     existe. */
  TECIN.addEventListener("input", function(){
    if(!CRUZ) return;
    var v = (TECIN.value || "").toUpperCase();
    var teto = CRUZ.E.aceita ? CRUZ.E.cels.length : CRUZ.E.w.length;
    if(v.length > teto) v = v.slice(0, teto);
    CRUZ.val = v; TECIN.value = v;
    pintaCruz();
    if(!CRUZ.E.aceita && CRUZ.val.length >= CRUZ.E.w.length) setTimeout(confereCruz, 380);
  });
  TECIN.addEventListener("keydown", function(ev){
    if(ev.key === "Enter"){ ev.preventDefault(); confereCruz(); }
    else if(ev.key === "Escape"){ fechaCruz(); }
  });
  /* ⚠️⚠️ PERDER O FOCO NÃO FECHA MAIS A PALAVRA (18/set/2026). Aqui havia um
     `blur -> fechaCruz()`. Medido no navegador com o gesto da criança: ela toca
     na casinha, toca em "Ouvir a frase" para escutar de novo (o que a folha
     CONVIDA a fazer) e o foco vai para o botão — a palavra fechava, e o que ela
     digitava em seguida caía no vazio. No PC a digitação nem precisa do foco
     (o teclado é ouvido no documento); no celular, tocar de novo na casinha
     devolve o foco e reabre o teclado do aparelho. Então o blur não faz nada. */
  document.body.appendChild(TECIN);
  return TECIN;
}
function poeCampoSobre(grade){
  var c = campoTeclado();
  if(grade && grade.parentNode){
    if(c.parentNode !== grade) grade.appendChild(c);
    c.style.left = "0"; c.style.top = "0";
    c.style.width = "100%"; c.style.height = "100%";
  }
  return c;
}
document.addEventListener("keydown", function(ev){
  if(document.activeElement && document.activeElement.id === "nomeIn") return;
  var k = (ev.key || "").toUpperCase();
  /* ⭐ DIGITAR SEM TER CLICADO ABRE A PRIMEIRA PALAVRA VAZIA DA FOLHA
     (18/set/2026). A criança do 5º ano vê as casinhas e começa a digitar —
     nada dizia "toque nas casinhas primeiro". As DUAS PORTAS valem para o
     gesto também: no PC, o teclado tem de funcionar sem clique. */
  if(!CRUZ && k.length === 1 && "ABCDEFGHIJKLMNOPQRSTUVWXYZÁÀÂÃÉÊÍÓÔÕÚÜÇ".indexOf(k) > -1){
    var alvo = null, todos = document.querySelectorAll('.pagina.viva [data-qa^="esc-"]');
    for(var i = 0; i < todos.length && !alvo; i++){
      var idq = todos[i].getAttribute("data-qa").slice(4);
      if(!ST.resp[idq]) alvo = todos[i];
    }
    if(alvo){ alvo.click(); }
  }
  if(!CRUZ) return;
  if(k.length === 1 && "ABCDEFGHIJKLMNOPQRSTUVWXYZÁÀÂÃÉÊÍÓÔÕÚÜÇ".indexOf(k) > -1){ ev.preventDefault(); digitaCruz(k); }
  else if(ev.key === "Backspace"){ ev.preventDefault(); digitaCruz("ap"); }
  else if(ev.key === "Enter"){ ev.preventDefault(); digitaCruz("ok"); }
  else if(ev.key === "Escape"){ fechaCruz(); }
});

/* ---------- folha pronta e navegação ---------- */
function idsDaPagina(pi){
  /* ⚠️⚠️ ISTO JÁ MENTIU DUAS VEZES NESTA CASA. Antes, cada folha gravava `n6_0`
     à mão e esta função dizia à mão que a página 6 tinha ids `n6_`. Eram DOIS
     lugares a combinar, os dois sintaticamente corretos, e quando a ordem das
     folhas mudava o relatório saía ZERO com a folha toda respondida — sem erro
     nenhum no console. Agora o id NASCE DA POSIÇÃO e aqui se lê a mesma
     posição; a única forma diferente é o LIGAR, que se declara na constante. */
  var ids = [], i, k, L = (ST.folha["p" + pi] || []);
  if(LIGAR.indexOf(pi) > -1){
    for(i = 0; i < L.length; i++)
      for(k = 0; k < L[i].length; k++) ids.push("l" + pi + "g" + i + "_" + L[i][k]);
    return ids;
  }
  for(i = 0; i < L.length; i++) ids.push("n" + pi + "_" + i);
  return ids;
}
function pendentes(pi){
  var ids = idsDaPagina(pi), n = 0, i;
  for(i = 0; i < ids.length; i++) if(!ST.resp[ids[i]]) n++;
  return n;
}
function confereFolha(pi){
  if(pendentes(pi) > 0 || ST.prontas[pi]) return;
  ST.prontas[pi] = 1; salvar();
  PAGEL[pi].className += " pronta"; sFesta(); confete(24);
  if(pi < PAGEL.length - 1){ falar("folhaPronta"); setTimeout(function(){ if(ST.pag === pi) vaiPara(pi + 1); }, 2400); }
  else setTimeout(fim, 1400);
  atualizaNav();
}
function espelhaNome(t){
  var i = document.getElementById("nomeIn"); if(i && i.value !== t) i.value = t;
}
function vaiPara(pi){
  calar(); fechaCruz();
  document.getElementById("barraCapa").className = pi === 0 ? "aberta" : "";
  if(pi === 0) espelhaNome(ST.nome || "");
  document.getElementById("fim").style.display = "none";
  document.getElementById("retomar").style.display = "none";
  document.getElementById("nav").style.display = pi === 0 ? "none" : "flex";
  for(var i = 0; i < PAGEL.length; i++) PAGEL[i].className = PAGEL[i].className.replace(" viva", "");
  ST.pag = pi; salvar();
  /* ⚠️ GUARDA DO ESQUELETO VAZIO: enquanto o caderno ainda não tem folha
     nenhuma, o "Começar" pede a folha 1 e `PAGEL[1]` não existe — estourava
     `TypeError` e o portão do boot reprovava. Não é defeito do caderno em
     construção; é o esqueleto tendo de abrir limpo ANTES de ter conteúdo, que é
     justamente o que torna o pré-voo útil no primeiro minuto. Num caderno com
     folhas esta guarda nunca dispara. */
  var d = PAGEL[pi];
  if(!d){ atualizaNav(); return; }
  d.className += " viva";
  if(pi > 0) window.scrollTo(0, 0);
  if(d._aoAbrir) for(var z = 0; z < d._aoAbrir.length; z++) (function(fn){ setTimeout(fn, 60); })(d._aoAbrir[z]);
  atualizaNav();
  falarDepois(pi === 0 ? "capa" : "p" + pi + "enun", 280);
}
function atualizaNav(){
  var pi = ST.pag, total = PAGEL.length;
  document.getElementById("pg").textContent = pi === 0 ? "Capa" : "Folha " + pi + " de " + (total - 1);
  var feitas = 0, k; for(k in ST.prontas) feitas++;
  document.getElementById("progI").style.width = (feitas / (total - 1) * 100) + "%";
  document.getElementById("bAnt").disabled = pi === 0;
  var prox = document.getElementById("bProx");
  prox.style.visibility = pi === 0 ? "hidden" : "visible";
  var pend = pi > 0 ? pendentes(pi) : 0;
  prox.innerHTML = pi === total - 1 ? (pend ? "Faltam " + pend : "Ver o resultado")
    : (pend ? "Faltam " + pend + '<i class="seta dir"></i>' : 'Próxima<i class="seta dir"></i>');
  prox.className = pend ? "bt cinza" : "bt verde";
  document.getElementById("navTxt").textContent = pi === 0 ? "" : NOMES[pi - 1];
}

/* ---------- fim: boletim, medalha e relatório ---------- */
/* ⭐⭐ O FECHO A QUALQUER MOMENTO.
   O Marcos fixou a sequência em no mínimo 20 folhas (o piso era 25 e ele o
   baixou em 14/set/2026, por velocidade de produção). Este caderno tem 22, e o
   número saiu do inventário de verbos do `POTE`, não de uma meta. Só que a
   criança DEVAGAR leva bem mais nas mesmas 22 folhas — ela não termina. Se o boletim, o parecer e a
   medalha só existissem DEPOIS da última folha, quem mais precisa do elogio
   seria a única a nunca vê-lo.
   ⚠️ E o boletim conta só o que ela TENTOU. Folha que ela não chegou a abrir
      aparece como "ainda não" — jamais como 0 de 6. */
function fim(){
  /* ⭐⭐ AVISA O CONTROLE DA SALA QUE ESTA CRIANÇA TERMINOU.
     Pedido do Marcos (15/set/2026): *"preciso que essas atividades sequências
     didáticas me avisem quando termino no painel de atividades, aquele que tem
     o controle da sala, assim como as atividades que fazíamos antes"*.

     ⚠️ E ELAS NÃO AVISAVAM POR CAMINHO NENHUM — conferido no código do
     laboratório antes de escrever isto. A tela do aluno (`_lab/index.html`)
     reconhece o fim de DOIS jeitos, e a folha viva escapava dos dois:
       1. A ESPIADA — ela olha dentro do quadro e procura a MEDALHA do fim pela
          CLASSE `.medal`. A folha viva chama a dela de `#medalha`, por id, e
          portanto a espiada nunca a via;
       2. O AVISO — o motor manda `postMessage({eduverse:"terminou"})` ao chegar
          no fim. A folha viva não mandava nada, porque nasceu sem essa peça.
     Agora ela manda o aviso aqui, e a medalha ganhou também a classe `medal`
     no HTML: dois caminhos, um cobrindo o buraco do outro, que é a razão pela
     qual o laboratório tem os dois.

     ⚠️ FORA DO LABORATÓRIO NÃO HÁ PAI NENHUM ESCUTANDO e a linha não faz nada —
     por isso ela é segura em qualquer lugar (em casa, no celular, aberta
     direto pelo link). O `try` existe para o caso de a janela de cima ser de
     outro domínio, quando o navegador recusa a leitura de `window.parent`. */
  try{ if(window.parent && window.parent !== window)
         window.parent.postMessage({eduverse: "terminou"}, "*"); }catch(e){}
  calar();
  var abertas = 0, naoAbertas = [], pp;
  for(pp = 1; pp <= NOMES.length; pp++){
    var idp = idsDaPagina(pp), algum = false, z;
    for(z = 0; z < idp.length; z++) if(ST.tent[idp[z]]) { algum = true; break; }
    if(algum) abertas++; else naoAbertas.push(pp);
  }
  var completo = naoAbertas.length === 0;
  var tf = document.getElementById("fimTit");
  if(tf) tf.textContent = completo ? "Caderno completo!" : "O seu boletim de hoje";
  var bv = document.getElementById("bVoltar");
  if(bv) bv.style.display = completo ? "none" : "";
  for(var i = 0; i < PAGEL.length; i++) PAGEL[i].className = PAGEL[i].className.replace(" viva", "");
  document.getElementById("nav").style.display = "none";
  var f = document.getElementById("fim"); f.style.display = "block";
  var tot = 0, prim = 0, pi;
  for(pi = 1; pi <= NOMES.length; pi++){
    var ids = idsDaPagina(pi);
    for(var j = 0; j < ids.length; j++){
      var t = ST.tent[ids[j]];
      if(!t) continue;
      tot++;
      if(t.erros === 0 && t.ok) prim++;
    }
  }
  var pc = tot ? prim / tot : 0;
  var cheias = pc >= .85 ? 3 : pc >= .6 ? 2 : 1, est = "", ke;
  for(ke = 0; ke < 3; ke++)
    est += '<img src="img/vr_selo' + (ke < cheias ? "" : "_off") + '.png?v=' + VIMG + '" alt="" draggable="false">';
  document.getElementById("estrelas").innerHTML = est;
  document.getElementById("estrelas").setAttribute("aria-label", cheias + " de 3 estrelas");
  var bar = document.getElementById("barras"); bar.innerHTML = "";
  for(pi = 1; pi <= NOMES.length; pi++){
    (function(pi){
      var ids = idsDaPagina(pi), p = 0, nt = 0, j;
      for(j = 0; j < ids.length; j++){
        var tt = ST.tent[ids[j]];
        if(tt) nt++;
        if(tt && tt.erros === 0 && tt.ok) p++;
      }
      if(nt === 0){
        bar.appendChild(el("div", "barra naoabriu",
          "<span>" + NOMES[pi - 1] + "</span><div class='tr'></div><b>ainda não</b>"));
        return;
      }
      var b = el("div", "barra", "<span>" + NOMES[pi - 1] + "</span><div class='tr'><i></i></div><b>" + p + "/" + nt + "</b>");
      bar.appendChild(b);
      setTimeout(function(){ b.querySelector("i").style.width = (nt ? p / nt * 100 : 0) + "%"; }, 400);
    })(pi);
  }
  /* ⭐ O PARECER DA CRIANÇA. O currículo de Blumenau diz que a avaliação orienta
     *"o professor E O ESTUDANTE acerca de quais objetivos foram alcançados"*, e
     que *"mostrar o que sabe ou o que não sabe é pertinente, faz parte do
     crescimento e não da exclusão"*. Então ela vê o que já sabe — na linguagem
     dela, sem número, sem a palavra "errou" e sem porcentagem.
     ⚠️ A ORDEM IMPORTA: primeiro o que ela JÁ SABE; o "vale treinar" vem depois
     e no máximo dois, senão a lista vira boletim de defeitos. */
  var jaSabe = [], treinar = [], q;
  for(q = 0; q < OBJETIVOS.length; q++){
    var Oq = OBJETIVOS[q], mq = mede(Oq.f);
    if(mq.tot === 0 || !mq.tent) continue;
    var pcq = Math.round(100 * mq.prim / mq.tent);
    (pcq >= 75 ? jaSabe : treinar).push(pcq >= 75 ? Oq.ok : Oq.n.toLowerCase());
  }
  var txt = "";
  if(jaSabe.length) txt = "Você já " + jaSabe.slice(0, 3).join("; ") + ".";
  else txt = "Você começou a reparar que o mesmo som pode se escrever de cinco jeitos — e isso é o principal!";
  if(treinar.length) txt += " Vale treinar mais: " + treinar.slice(0, 2).join(" e ") + ".";
  if(!completo)
    txt = "você fez " + abertas + " de " + NOMES.length + " folhas hoje — e olhe o "
        + "que já dá para ver: " + txt.charAt(0).toLowerCase() + txt.slice(1);
  /* ⚠️ SEM NOME, SEM PREFIXO. Com o prefixo fixo saía "Você, você já…" para a
     criança que não escreve o nome na capa — que é justamente a que mais precisa
     que a tela fale direito com ela. */
  var quem = (ST.nome || "").replace(/^\s+|\s+$/g, "");
  document.getElementById("resumo").innerHTML = quem
    ? "<b>" + esch(quem) + "</b>, " + txt.charAt(0).toLowerCase() + txt.slice(1)
    : txt.charAt(0).toUpperCase() + txt.slice(1);
  sFesta(); confete(40); falar("fim");
}
(function(){
  var m = document.getElementById("medalha"), t = null;
  function segura(){ t = setTimeout(function(){ abreRelatorio(); }, 2000); }
  function larga(){ if(t){ clearTimeout(t); t = null; } }
  m.addEventListener("pointerdown", segura);
  m.addEventListener("pointerup", larga);
  m.addEventListener("pointerleave", larga);
  m.addEventListener("pointercancel", larga);
})();

/* ============================================================
   O QUE A ATIVIDADE MEDE — e como isso vira PARECER e NOTA

   ⚠️ A NOTA FICA COM O PROFESSOR. A Instrução Normativa SEMED nº 1/2017, art.
   3º, citada no currículo de Blumenau, manda avaliar *"com preponderância dos
   aspectos qualitativos sobre os quantitativos"*. O parecer vai para a criança;
   o número fica só aqui.
   ⚠️ E NÃO SE CONTA TUDO IGUAL: acerto de primeira vale 1,0 e acerto com ajuda
   vale 0,6 — o relatório mostra os dois lado a lado, para o professor ver a
   nota E o esforço que ela custou. O critério sai impresso por exigência da
   mesma Instrução (*"a exposição de critérios utilizados"*).
   ============================================================ */
var PESO_PRIMEIRA = 1.0, PESO_COM_AJUDA = 0.6;

/* ⚠️ ESTA LISTA E O `curriculo.json` SÃO A MESMA COISA, ditas para dois
   leitores: aqui em palavras que o professor lê no relatório, lá no vocabulário
   do currículo da rede. O portão `_qa/pedagogo_curriculo.py` reprova se os nomes
   e as folhas não baterem um a um. Os números são POSIÇÕES de folha: mudou a
   ordem, mudam aqui e no `curriculo.json`, no mesmo commit. *//* ⚠️ ESTA LISTA E O `curriculo.json` SÃO A MESMA COISA, ditas para dois
   leitores: aqui em palavras que o professor lê no relatório, lá no vocabulário
   do currículo da rede. O portão `_qa/pedagogo_curriculo.py` reprova se os
   nomes e as folhas não baterem um a um, e também se alguma folha de trabalho
   ficar sem objetivo que a meça. Os números são POSIÇÕES de folha.
   Ex.: {n: "Distinguir X de Y", f: [1, 2, 3],
         ok:  "faz o que o objetivo pede, em palavras do professor",
         nao: "o que ainda não faz — sem a palavra 'errou'"}  */
var OBJETIVOS = [
  /* ⚠️ ESTA LISTA E O `curriculo.json` SÃO A MESMA COISA, e o portão 0b9 reprova
     se divergirem — nome por nome e folha por folha. */
  {n: "Reconhecer o verbo como a palavra que diz a ação", f: [1, 2, 3, 4],
   ok: "reconhece a palavra que diz a ação"},
  {n: "Relacionar quem faz e o que faz", f: [5, 6, 7, 8],
   ok: "relaciona quem faz ao que faz e completa a frase com o verbo"},
  {n: "Combinar o verbo com o pronome eu, ele e ela", f: [9, 10],
   ok: "combina o verbo com eu, ele e ela"},
  {n: "Combinar o verbo com nós, vocês e eles", f: [11, 12],
   ok: "combina o verbo com nós, vocês e eles"},
  {n: "Julgar se o verbo combina com quem faz", f: [13, 14, 19],
   ok: "julga se o verbo combina com quem faz"},
  {n: "Escrever e ligar o verbo que combina com o pronome", f: [15, 16],
   ok: "escreve e liga o verbo que combina com o pronome"},
  {n: "Combinar o verbo com o substantivo, no singular e no plural", f: [17, 18],
   ok: "combina o verbo com o substantivo"},
  {n: "Achar e corrigir a concordância verbal na notícia", f: [20, 21, 22],
   ok: "acha e corrige o verbo que não combina na notícia"},
  {n: "Reconhecer os verbos de dizer no discurso direto", f: [23, 25, 26, 28],
   ok: "reconhece os verbos de dizer no discurso direto"},
  {n: "Escolher o verbo de dizer pelo sentido da fala", f: [24, 27],
   ok: "escolhe o verbo de dizer pelo sentido da fala"},
  {n: "Achar as formas do verbo nas grades de letras", f: [29, 30, 31, 32],
   ok: "acha as formas do verbo nas grades de letras"},
  {n: "Juntar pronome e verbo, escrever o seu, e nomear o que aprendeu", f: [33, 34, 35],
   ok: "usa o verbo que combina para escrever"}
];

function mede(folhas){
  var prim = 0, ajuda = 0, tot = 0, tentados = 0, k, j;
  for(k = 0; k < folhas.length; k++){
    var ids = idsDaPagina(folhas[k]);
    tot += ids.length;
    for(j = 0; j < ids.length; j++){
      var t = ST.tent[ids[j]];
      if(t) tentados++;
      if(!t || !t.ok) continue;
      if(t.erros === 0) prim++; else ajuda++;
    }
  }
  return {prim: prim, ajuda: ajuda, tot: tot, tent: tentados,
          pontos: prim * PESO_PRIMEIRA + ajuda * PESO_COM_AJUDA,
          pc: tot ? Math.round(100 * prim / tot) : 0};
}

function abreRelatorio(){
  var r = document.getElementById("relatorio");
  var linhas = "", domina = [], retomar = [], k;
  var pontos = 0, total = 0, primG = 0, ajudaG = 0, tentG = 0;
  var naoAlcancou = [];
  var folhasFeitas = 0, fz;
  for(fz = 1; fz <= NOMES.length; fz++){
    var idf = idsDaPagina(fz), tocou = false, y;
    for(y = 0; y < idf.length; y++) if(ST.tent[idf[y]]) { tocou = true; break; }
    if(tocou) folhasFeitas++;
  }
  var inteiro = folhasFeitas >= NOMES.length;

  for(k = 0; k < OBJETIVOS.length; k++){
    var O = OBJETIVOS[k], m = mede(O.f);
    pontos += m.pontos; total += m.tot; primG += m.prim; ajudaG += m.ajuda;
    tentG += m.tent;
    /* ⚠️⚠️ O QUE DECIDE É O QUE ELA FEZ. Antes, num caderno não terminado, o
       objetivo cujas folhas ela nem alcançou entrava em "retomar" com 0% — e o
       parecer dizia "precisa retomar" de uma criança que tinha ido bem no que
       deu tempo de fazer. Um julgamento errado com cara de medida, contra a
       criança. Objetivo não tocado não entra em lista nenhuma. */
    var pcObj = m.tent ? Math.round(100 * m.prim / m.tent) : -1;
    if(pcObj < 0) naoAlcancou.push(O.n.toLowerCase());
    else if(pcObj >= 75) domina.push(O.ok);
    else retomar.push(O.n.toLowerCase() + " (" + pcObj + "%)");
    var pcf = m.tent ? Math.round(100 * m.prim / m.tent) : 0;
    linhas += "<tr><td>" + esch(O.n) + "</td><td>" + m.prim + "/" + m.tot +
      "</td><td><b>" + m.pc + "%</b></td><td>" +
      (m.tent ? "<b>" + pcf + "%</b> <small>(" + m.prim + "/" + m.tent + ")</small>"
              : "<small>não fez</small>") + "</td><td>" + m.ajuda + "</td></tr>";
  }

  /* ⚠️ A NOTA DE UM CADERNO NÃO TERMINADO SE MEDE NO QUE FOI FEITO. Dividir
     pelos itens que ela nunca viu dá uma nota que não fala dela — fala do
     relógio. Com o caderno completo, os dois denominadores são o mesmo número. */
  var baseNota = inteiro ? total : tentG;
  var nota = baseNota ? Math.round(100 * pontos / baseNota) / 10 : 0;
  var pc = baseNota ? Math.round(100 * primG / baseNota) : 0;
  var conceito = !baseNota ? "Sem dados" :
    nota >= 8.5 ? "Dominou" : nota >= 6 ? "Está construindo" : "Precisa retomar";
  if(!inteiro) conceito += " (parcial)";

  var nome = esch(ST.nome || "O aluno");
  var parecer = nome + " ";
  if(domina.length && !retomar.length && !naoAlcancou.length)
    parecer += "domina os objetivos avaliados: " + domina.join("; ") + ".";
  else if(domina.length)
    parecer += "já " + domina.join("; ") + ". Ainda precisa retomar: " + retomar.join(", ") + ".";
  else
    parecer += "está começando a perceber que letras diferentes fazem o mesmo som. Nenhum " +
      "objetivo chegou a 75% de acerto de primeira — vale retomar ORALMENTE, ditando cinco " +
      "palavras por dia e perguntando POR QUE se escreve com aquela letra, antes de voltar " +
      "à tela. A regra dita em voz alta fixa mais do que a palavra copiada dez vezes.";
  if(naoAlcancou.length)
    parecer += " Ainda não chegou a fazer (a aula acabou antes): " + naoAlcancou.join(", ") + ".";

  var h = "<b>Relatório do professor</b> &mdash; " + nome + " &middot; " +
    Math.round((Date.now() - (ST.inicio || Date.now())) / 60000) + " min" +
    "<div class='notao'><span class='nn'>" + nota.toFixed(1).replace(".", ",") + "</span>" +
    "<span class='nl'><b>" + conceito + "</b><br>" + primG + " de " + baseNota +
    " de primeira (" + pc + "%)<br>" + ajudaG + " com ajuda</span></div>" +
    "<p class='parecer'>" + parecer + "</p>" +
    (inteiro ? "" :
      "<p class='avisoparcial'><b>Caderno não terminado:</b> " + folhasFeitas +
      " de " + NOMES.length + " folhas. A coluna <b>%</b> conta o caderno inteiro; " +
      "a coluna <b>do que fez</b> conta só o que a criança chegou a responder — " +
      "é esta que diz como ela foi.</p>") +
    "<table><tr><th>Objetivo</th><th>De primeira</th><th>%</th>" +
    "<th>do que fez</th><th>Com ajuda</th></tr>" + linhas + "</table>" +
    "<p class='comonota'>Nota de 0 a 10: acerto de primeira vale 1,0 e acerto com ajuda vale 0,6. " +
    "A criança não vê este número — ele fica só aqui.</p>" +
    "<p class='comonota'><b>O que este caderno NÃO mede:</b> várias das folhas de papel que " +
    "deram origem a ele terminam em <b>&ldquo;copie no seu caderno&rdquo;</b> e " +
    "<b>&ldquo;classifique no caderno&rdquo;</b> &mdash; e a tela não corrige o que a criança " +
    "escreve à mão. O que dá para medir aqui é reconhecer, marcar e escrever com o teclado. " +
    "<b>A cópia e o ditado no papel continuam sendo do professor</b>, e a folha 22 existe para " +
    "isso: a criança sai daqui com o quadro de regras dela para copiar no caderno.</p>";
  r.innerHTML = h; r.style.display = "block"; sPasso();
}
function esch(t){
  return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* ---------- retomar, chave mestra e a partida ---------- */
var CHAVE_MESTRA = "1275@";
function abreMenuProf(){
  var cx = document.getElementById("mpFolhas");
  if(!cx.childNodes.length){
    var mk = function(rot, alvo){
      var b = el("button", null, rot);
      b.onclick = function(){ fechaMenuProf(); vaiPara(alvo); };
      cx.appendChild(b);
    };
    mk("Capa", 0);
    /* ⚠️ `NOMES.length` e não um número cravado: com "10" escrito aqui, um
       caderno de 25 folhas mostrava só as dez primeiras no menu do professor —
       e as quinze restantes ficavam sem como conferir. */
    for(var k = 1; k <= NOMES.length; k++) mk(k + ". " + NOMES[k - 1], k);
  }
  calar(); document.getElementById("menuProf").className = "aberto";
}
function fechaMenuProf(){ document.getElementById("menuProf").className = ""; }
document.getElementById("mpFechar").onclick = fechaMenuProf;
document.getElementById("menuProf").onclick = function(ev){ if(ev.target === this) fechaMenuProf(); };
document.getElementById("nomeIn").oninput = function(){
  if(this.value.indexOf(CHAVE_MESTRA) > -1){ this.value = ST.nome || ""; abreMenuProf(); return; }
  ST.nome = this.value.slice(0, 24); espelhaNome(ST.nome); salvar();
};
document.getElementById("nomeIn").onkeydown = function(ev){ if(ev.key === "Enter"){ ev.preventDefault(); this.blur(); } };
document.getElementById("bComecar").onclick = function(){ ac(); sPasso(); if(!ST.inicio) ST.inicio = Date.now(); vaiPara(1); };
document.getElementById("bAnt").onclick = function(){ sPasso(); vaiPara(Math.max(0, ST.pag - 1)); };
document.getElementById("bProx").onclick = function(){
  sPasso();
  if(ST.pag === PAGEL.length - 1 && pendentes(ST.pag) === 0) return fim();
  vaiPara(Math.min(PAGEL.length - 1, ST.pag + 1));
};
document.getElementById("bOuvir").onclick = function(){ ac(); if(ultimaFala) falar(ultimaFala); };
document.getElementById("bVoz").onclick = function(){
  vozLigada = !vozLigada; this.className = vozLigada ? "zap" : "zap off";
  if(!vozLigada) calar(); else falar("vozOn");
};
document.getElementById("bRever").onclick = function(){ sPasso(); vaiPara(1); };
document.getElementById("bRecomecar").onclick = function(){
  sPasso(); try{ localStorage.removeItem(CHAVE_LS); }catch(e){}
  ST = {pag: 0, nome: ST.nome, folha: novaFolha(), resp: {}, lig: {}, tent: {}, prontas: {}, inicio: 0};
  monta(); vaiPara(0); falarDepois("novoCaderno", 400);
};
document.getElementById("bContinuar").onclick = function(){ ac(); sPasso(); vaiPara(ST.pag || 1); };
document.getElementById("bZerar").onclick = function(){ document.getElementById("bRecomecar").onclick(); };

(function boot(){
  var velho = carregar();
  if(velho && velho.folha){
    ST = velho;
    if(!ST.resp) ST.resp = {}; if(!ST.lig) ST.lig = {}; if(!ST.tent) ST.tent = {}; if(!ST.prontas) ST.prontas = {};
    /* ⚠️ TRAVA 2 — A REDE DE SEGURANÇA. Se montar a partir da memória estourar
       por qualquer motivo que eu não previ, o caderno joga a memória fora e
       abre LIMPO. Perder o "continuar de onde parou" é ruim; ficar com uma tela
       morta a aula toda é muito pior. */
    try{ monta(); }
    catch(erroMemoria){
      try{ localStorage.removeItem(CHAVE_LS); }catch(e3){}
      ST = {pag: 0, nome: ST.nome, folha: novaFolha(), resp: {}, lig: {}, tent: {}, prontas: {}, inicio: 0};
      monta(); vaiPara(0); return;
    }
    document.getElementById("retomar").style.display = "block";
    document.getElementById("retTxt").textContent =
      (ST.nome ? ST.nome + ", você" : "Você") + " parou na folha " + (ST.pag || 1) + ": " + NOMES[(ST.pag || 1) - 1] + ".";
    document.getElementById("nav").style.display = "none";
  } else {
    ST.folha = novaFolha(); monta(); vaiPara(0);
  }
})();

/*<dossie-js>*/
/* ============================================================
   DOSSIÊ PEDAGÓGICO — o que o PROFESSOR vê quando abre a atividade

   ⭐ PEDIDO DO MARCOS (set/2026): *"preciso que quando um professor olhe e
      analise a atividade ele veja que está ótima"*.

   O buraco que isto fecha: o parecer pedagógico de cada caderno existia — mas
   morava num arquivo `.md` DENTRO DO REPOSITÓRIO, que nenhum professor abre.
   Quem olhava a atividade via um joguinho bonito e não tinha como saber se
   aquilo estava alinhado ao currículo da rede. Agora o alinhamento está DENTRO
   da atividade, a um toque — e a qualquer momento, não só no fim.

   ⚠️ E não é texto solto: cada habilidade citada aqui vem do
   `<pasta>/curriculo.json`, e o portão `_qa/pedagogo_curriculo.py` reprova se a frase
   citada não existir, palavra por palavra, no `_curriculo/blumenau.txt`, ou se
   os objetivos do relatório e os do currículo não baterem um a um. Citação de
   currículo é a única coisa que o professor NÃO tem como conferir sozinho sem
   abrir 440 páginas de PDF — por isso ela é medida.

   Abre por dois caminhos: o botão no menu do professor (chave mestra 1275@,
   vale a qualquer hora) e o botão dentro do relatório, no fim.

   Este arquivo é a FONTE: `python3 _padrao/dossie_professor.py <pasta>` injeta o CSS, o
   trecho de tela e este código no caderno. Não editar a cópia injetada.
   ============================================================ */
function dossieCita(s){
  var m = String(s || "").match(/[“"]([^”"]+)[”"]/);
  return m ? m[1] : String(s || "");
}
function dossieHTML(){
  var C = (typeof CURRICULO === "object" && CURRICULO) ? CURRICULO : null;
  if(!C) return "<p>Este caderno ainda não declarou o currículo.</p>";
  var h = "", k, o;
  h += "<p class='dfonte'><b>" + esch(C.componente) + " &middot; " + C.ano +
       "º ano.</b> " + esch(C.rede) + ". As habilidades abaixo estão " +
       "<b>copiadas do documento oficial, palavra por palavra</b> &mdash; nenhuma " +
       "foi reescrita nem resumida.</p>";
  h += "<table><tr><th>O que a atividade mede</th><th>Folhas</th>" +
       "<th>Habilidade do currículo da rede</th></tr>";
  for(k = 0; k < C.objetivos.length; k++){
    o = C.objetivos[k];
    h += "<tr><td>" + esch(o.objetivo) + "</td><td>" + o.folhas.join(", ") +
         "</td><td>&ldquo;" + esch(dossieCita(o.habilidade)) + "&rdquo;" +
         "<span class='dobj'>" + esch(o.pratica) + " &middot; " +
         esch(o.objeto) + "</span></td></tr>";
  }
  h += "</table>";

  h += "<p class='dsub'><b>A escada didática</b> &mdash; uma folha por degrau, e " +
       "nenhuma repete o gesto da anterior:</p><ol class='descada'>";
  for(k = 0; k < NOMES.length; k++) h += "<li>" + esch(NOMES[k]) + "</li>";
  h += "</ol>";

  h += "<p class='dsub'><b>Como a criança é avaliada</b></p>" +
       "<p class='dtxt'>O relatório do professor (no fim, segurando a medalha por " +
       "2 segundos) traz, por objetivo: quantos itens ela acertou <b>de primeira</b>, " +
       "quantos precisou de ajuda e a porcentagem. A partir de 75% de acerto de " +
       "primeira o objetivo conta como dominado. Sai também um parecer em palavras " +
       "&mdash; do jeito que se escreve no bimestral &mdash; e uma nota de 0 a 10 " +
       "que <b>a criança não vê</b>. Dentro da atividade não há nota, nem ranking, " +
       "nem a palavra &ldquo;errou&rdquo;: o erro responde na hora e diz o que " +
       "olhar, e a ajuda cresce a cada tentativa (dica &rarr; apoio concreto &rarr; " +
       "revelar).</p>";

  if(C.evidencia && C.evidencia.length){
    h += "<p class='dsub'><b>O que foi medido antes de publicar</b></p><ul class='dev'>";
    for(k = 0; k < C.evidencia.length; k++) h += "<li>" + esch(C.evidencia[k]) + "</li>";
    h += "</ul>";
  }
  return h;
}
function abreDossie(){
  var cx = document.getElementById("dsCorpo");
  if(!cx) return;
  if(typeof calar === "function") calar();
  cx.innerHTML = dossieHTML();
  document.getElementById("dossie").className = "aberto";
  cx.scrollTop = 0;
}
function fechaDossie(){ document.getElementById("dossie").className = ""; }
(function(){
  var b = document.getElementById("bDossie"), f = document.getElementById("dsFechar"),
      cx = document.getElementById("dossie");
  if(b) b.onclick = function(){ fechaMenuProf(); abreDossie(); };
  if(f) f.onclick = fechaDossie;
  if(cx) cx.onclick = function(ev){ if(ev.target === this) fechaDossie(); };

  /* o segundo caminho: o botão nasce DENTRO do relatório, quando ele abre.
     Fica ali e não na tela final porque o relatório é a parte que a criança
     não vê — e o dossiê é conversa de adulto. */
  if(typeof abreRelatorio === "function"){
    var antes = abreRelatorio;
    abreRelatorio = function(){
      antes.apply(this, arguments);
      var r = document.getElementById("relatorio");
      if(r && !r.querySelector(".bdossie")){
        var bt = document.createElement("button");
        bt.className = "bt bdossie";
        bt.textContent = "Dossiê pedagógico (currículo da rede)";
        bt.onclick = abreDossie;
        r.appendChild(bt);
      }
    };
  }
}());
/*</dossie-js>*/

/* ⭐ o botão "Terminar" e o "Voltar para o caderno" — ver o comentário do fim() */
(function(){
  var bt = document.getElementById("bTerminar");
  if(bt) bt.onclick = function(){
    var falta = 0, pz;
    for(pz = 1; pz <= NOMES.length; pz++) falta += pendentes(pz);
    if(falta && !confirm("Quer fechar o caderno e ver o seu boletim?\n\nVocê pode voltar depois e continuar de onde parou."))
      return;
    fim();
  };
  var bv = document.getElementById("bVoltar");
  if(bv) bv.onclick = function(){
    document.getElementById("fim").style.display = "none";
    vaiPara(ST.pag || 1);
  };
})();

function figOu(f, cls){ return f ? img("vr_" + f + ".png", cls || "fig", "") : ""; }

/* PEÇA — MARQUE VÁRIAS E SÓ DEPOIS CONFIRA (_sil2) */
function marqueConfira(box, id, pi, pecas, fCerto, fDica){
  var feito = !!ST.resp[id], marcadas = {}, bts = [];
  registra(id, pi, pecas.filter(function(p){ return p.ok; })
                        .map(function(p){ return p.k; }).join(" "));
  var cx = el("div", "sils");
  pecas.forEach(function(P){
    var b = el("button", "sil" + (feito && P.ok ? " ok" : ""), P.t);
    b.setAttribute("aria-label", P.t);
    b.setAttribute("data-qa", (P.ok ? "op-" : "no-") + id + "-" + P.k);
    b.onclick = function(){
      if(ST.resp[id]) return;
      sPasso();
      if(P.fala) P.fala();
      if(marcadas[P.k]){ delete marcadas[P.k]; b.className = "sil"; }
      else { marcadas[P.k] = 1; b.className = "sil marcada"; }
    };
    cx.appendChild(b); bts.push({b: b, P: P});
  });
  box.appendChild(cx);
  var cf = el("button", "bt verde pronto", "Conferir");
  cf.setAttribute("data-qa", "conferir-" + id);
  cf.onclick = function(){
    if(ST.resp[id]) return;
    var certo = true;
    bts.forEach(function(x){ if(!!marcadas[x.P.k] !== !!x.P.ok) certo = false; });
    if(certo){
      bts.forEach(function(x){ if(x.P.ok) x.b.className = "sil ok"; });
      acertou(id, fCerto); box.className = "item feito"; cf.style.display = "none";
    } else {
      sErro(); cx.className = "sils erro";
      setTimeout(function(){ cx.className = "sils"; }, 480);
      errou(id, fDica);
    }
  };
  if(feito) cf.style.display = "none";
  box.appendChild(cf);
}

/* PEÇA — ACHAR DENTRO DO TEXTO (_ponto2, f25/f26) */
function noTexto(d, pi, T, fCerto, fDica){
  var id = "n" + pi + "_0", box = item(0);
  registra(id, pi, T.ok.map(function(w){ return "w" + chaveQuadro(w); }).join(" "));
  var marcadas = {}, bts = [];
  var cx = el("div", "texto");
  cx.appendChild(el("h3", "ttit", T.titulo));
  var nw = 0;
  T.linhas.forEach(function(lin){
    var l = el("p", "tlin");
    lin.forEach(function(w) {
      var ok = T.ok.indexOf(w) > -1, meu = nw;
      var b = el("button", "palav", w);
      b.setAttribute("aria-label", w);
      b.setAttribute("data-qa", ok ? ("op-" + id + "-w" + chaveQuadro(w))
                                   : ("no-" + id + "-x" + meu));
      nw++;
      b.onclick = function(){
        if(ST.resp[id]) return;
        sPasso(); falar("tx" + pi + "_" + meu);
        if(marcadas[w]){ delete marcadas[w]; b.className = "palav"; }
        else { marcadas[w] = 1; b.className = "palav marcada"; }
      };
      l.appendChild(b); l.appendChild(document.createTextNode(" "));
      bts.push({b: b, w: w, ok: ok});
    });
    cx.appendChild(l);
  });
  box.appendChild(cx);
  var cf = el("button", "bt verde pronto", "Conferir");
  cf.setAttribute("data-qa", "conferir-" + id);
  cf.onclick = function(){
    if(ST.resp[id]) return;
    var certo = true;
    bts.forEach(function(x){ if(!!marcadas[x.w] !== !!x.ok) certo = false; });
    if(certo){
      bts.forEach(function(x){ if(x.ok) x.b.className = "palav ok"; });
      acertou(id, fCerto); box.className = "item feito"; cf.style.display = "none";
    } else {
      sErro(); cx.className = "texto erro";
      setTimeout(function(){ cx.className = "texto"; }, 480);
      errou(id, fDica);
    }
  };
  if(ST.resp[id]) cf.style.display = "none";
  box.appendChild(cf);
  fechaItem(d, box, id);
}

/* PEÇA — PINTAR PELA LEGENDA (_sil2): dois toques, a canetinha e depois a palavra.
   CONTRATO: o estojo publica `lapis-<cor>` e cada alvo `pinta-<id>-0` + `data-lapis`. */
var LAPIS = null;
function estojo(d, cores){
  var cx = el("div", "estojo");
  cores.forEach(function(C){
    var b = el("button", "cnt cnt-" + C.k, C.n + ": irmã de " + C.de);
    b.setAttribute("data-qa", "lapis-" + C.k);
    b.setAttribute("aria-label", "canetinha " + C.n);
    b.onclick = function(){
      sPasso(); LAPIS = C.k;
      var t = cx.querySelectorAll(".cnt"), i;
      for(i = 0; i < t.length; i++) t[i].className = t[i].className.replace(" pega", "");
      b.className += " pega";
      falar("lapis_" + C.k);
    };
    cx.appendChild(b);
  });
  d.appendChild(cx);
  return cx;
}
function pintavel(el2, id, pi, cor, fCerto, fDica, box){
  el2.setAttribute("data-qa", "pinta-" + id + "-0");
  el2.setAttribute("data-lapis", cor);
  if(ST.resp[id]) el2.className += " pin pin-" + cor;
  el2.onclick = function(){
    if(ST.resp[id]) return;
    if(!LAPIS){ sPasso(); falar("pegue_lapis"); return; }
    sPasso();
    if(LAPIS === cor){
      el2.className += " pin pin-" + cor;
      acertou(id, fCerto); if(box) box.className = "item feito";
    } else {
      el2.className += " sacode";
      setTimeout(function(){ el2.className = el2.className.replace(" sacode", ""); }, 420);
      errou(id, fDica);
    }
  };
}

/* PEÇA — O TECLADO NUMA FILA DE CASINHAS (_ponto2, f24/f32): a grade com o
   número exato de letras, aberta pelo teclado do aparelho ou pelo de verdade. */
function gradeEscrever(box, id, pi, k, w, rot, aceita){
  registra(id, pi, aceita ? aceita[0] : w);
  var mx = w.length, t;
  if(aceita) aceita.forEach(function(x){ if(x.length > mx) mx = x.length; });
  var grade = el("div", "cruz uma" + (aceita ? " livre" : "")), cels = [];
  grade.setAttribute("data-qa", "esc-" + id);
  for(t = 0; t < mx; t++){
    var c = el("button", "ccel viva" + (ST.resp[id] ? " ok" : ""),
               ST.resp[id] ? ((aceita ? aceita[0] : w).charAt(t) || "") : "");
    c.setAttribute("aria-label", "Casa da palavra");
    cels.push(c); grade.appendChild(c);
  }
  box.appendChild(grade);
  var E = {k: k, w: aceita ? aceita[0] : w, id: id, cels: cels, rot: rot || "Escreva a palavra",
           bt: el("span", "pista oculta", "")};
  if(aceita) E.aceita = aceita;
  cels.forEach(function(c){ c.onclick = function(){ if(!ST.resp[id]) abreCruz(E, pi); }; });
  grade.onclick = function(){ if(!ST.resp[id]) abreCruz(E, pi); };
  return E;
}

/* PEÇA — A CRUZADINHA QUE SE MONTA SOZINHA (_ort5b, f21): a primeira palavra
   deita e as outras se penduram nela pela letra em comum. A pista aqui é TEXTO
   (o contrário de…), não figura. */
function cruzadinha(d, pi, DADOSC, prefFala){
  var pool = ST.folha["p" + pi];
  var mapa = {}, maxX = 0, maxY = 0, entradas = [];
  function poe(w, x, y, hor){
    var i;
    for(i = 0; i < w.length; i++){
      var cx = x + (hor ? i : 0), cy = y + (hor ? 0 : i);
      mapa[cx + "," + cy] = w.charAt(i);
      if(cx > maxX) maxX = cx;
      if(cy > maxY) maxY = cy;
    }
  }
  function cabe(w, x, y, hor){
    var i;
    for(i = 0; i < w.length; i++){
      var cx = x + (hor ? i : 0), cy = y + (hor ? 0 : i);
      var q = mapa[cx + "," + cy];
      if(q && q !== w.charAt(i)) return false;
      if(!q){
        var a = hor ? mapa[cx + "," + (cy - 1)] : mapa[(cx - 1) + "," + cy];
        var b = hor ? mapa[cx + "," + (cy + 1)] : mapa[(cx + 1) + "," + cy];
        if(a || b) return false;
      }
    }
    var antes = hor ? mapa[(x - 1) + "," + y] : mapa[x + "," + (y - 1)];
    var dep = hor ? mapa[(x + w.length) + "," + y] : mapa[x + "," + (y + w.length)];
    return !antes && !dep;
  }
  var linhaLivre = 0;
  pool.forEach(function(k, n){
    var w = DADOSC[k].p.replace(/[^A-ZÁÂÃÉÊÍÓÔÕÚÇ]/g, ""), col = null;
    if(!entradas.length){ col = {x: 0, y: 0, hor: true}; }
    else {
      var i, j, achou = null;
      for(i = 0; i < w.length && !achou; i++)
        for(j = 0; j < entradas.length && !achou; j++){
          var E = entradas[j], p;
          for(p = 0; p < E.w.length; p++){
            if(E.w.charAt(p) !== w.charAt(i)) continue;
            var hor = !E.hor;
            var x = hor ? E.x - i : E.x + p;
            var y = hor ? E.y + p : E.y - i;
            if(cabe(w, x, y, hor)){ achou = {x: x, y: y, hor: hor}; break; }
          }
        }
      col = achou || {x: 0, y: maxY + 2 + (linhaLivre++), hor: true};
    }
    poe(w, col.x, col.y, col.hor);
    entradas.push({k: k, w: w, x: col.x, y: col.y, hor: col.hor, n: n + 1});
  });
  var minX = 0, minY = 0, key;
  for(key in mapa){
    var pxy = key.split(","), px = +pxy[0], py = +pxy[1];
    if(px < minX) minX = px;
    if(py < minY) minY = py;
  }
  var env = el("div", "cruzenv"), grade = el("div", "cruz");
  var larg = maxX - minX + 1, alt = maxY - minY + 1;
  grade.style.gridTemplateColumns = "repeat(" + larg + ",-webkit-max-content)";
  grade.style.gridTemplateColumns = "repeat(" + larg + ",max-content)";
  var celula = {}, yy, xx;
  for(yy = 0; yy < alt; yy++) for(xx = 0; xx < larg; xx++){
    var ch = mapa[(xx + minX) + "," + (yy + minY)];
    if(!ch){ grade.appendChild(el("span", "ccel")); continue; }
    var c = el("button", "ccel viva", "");
    c.setAttribute("aria-label", "Casa da cruzadinha");
    c._x = xx + minX; c._y = yy + minY;
    celula[c._x + "," + c._y] = c;
    grade.appendChild(c);
  }
  env.appendChild(grade); d.appendChild(env);
  var pistas = el("div", "pistas");
  entradas.forEach(function(E, i){
    var id = "n" + pi + "_" + i;
    registra(id, pi, E.w);
    E.id = id; E.cels = []; E.rot = "Escreva a palavra " + E.n;
    var t;
    for(t = 0; t < E.w.length; t++){
      var cc = celula[(E.x + (E.hor ? t : 0)) + "," + (E.y + (E.hor ? 0 : t))];
      E.cels.push(cc);
      if(t === 0 && cc && !cc.querySelector(".cn")) cc.appendChild(el("span", "cn", E.n));
    }
    if(ST.resp[id]) E.cels.forEach(function(c, t2){
      if(c){ c.className = "ccel viva ok"; c.textContent = E.w.charAt(t2);
             if(t2 === 0) c.appendChild(el("span", "cn", E.n)); } });
    var p = el("button", "pista" + (ST.resp[id] ? " feita" : ""),
               '<span class="pn">' + E.n + ".</span> " + DADOSC[E.k].d);
    p.setAttribute("data-qa", "esc-" + id);
    p.setAttribute("aria-label", "Pista " + E.n + " da cruzadinha");
    E.bt = p;
    p.onclick = function(){
      if(ST.resp[id]) return;
      sPasso(); falar(prefFala + E.k);
      abreCruz(E, pi);
    };
    pistas.appendChild(p);
    E.cels.forEach(function(c){
      if(!c) return;
      c.addEventListener("click", function(){ if(!ST.resp[id]) abreCruz(E, pi); });
    });
  });
  d.appendChild(pistas);
}

/* PEÇA — O CAÇA-PALAVRAS (_ponto2, f27). CONTRATO: `cp-<id>-a` e `cp-<id>-z`. */
function cacaPalavras(d, pi, C, rotulo){
  var cels = {};
  var g = el("div", "cpgrade");
  C.grade.forEach(function(lin, y){
    var l = el("div", "cplin");
    lin.forEach(function(L, x){
      var b = el("button", "cpcel", L);
      b.setAttribute("aria-label", L);
      cels[y + "," + x] = b; l.appendChild(b);
    });
    g.appendChild(l);
  });
  d.appendChild(g);
  var lista = el("div", "cplista");
  ST.folha["p" + pi].forEach(function(k, i){
    var P = C.pal[k], id = "n" + pi + "_" + i;
    registra(id, pi, "cpa cpz");
    var rot = el("div", "cprot" + (ST.resp[id] ? " achada" : ""), rotulo + " <b>" + P.pista + "</b>");
    rot.appendChild(botaoSom("Ouvir a pista", function(){ falar("cp_" + k); }));
    lista.appendChild(rot);
    var ca = cels[P.a[0] + "," + P.a[1]], cz = cels[P.z[0] + "," + P.z[1]];
    ca.setAttribute("data-qa", "cp-" + id + "-a");
    cz.setAttribute("data-qa", "cp-" + id + "-z");
    function marca(){
      var y = P.a[0], x;
      for(x = P.a[1]; x <= P.z[1]; x++) cels[y + "," + x].className = "cpcel achada";
      rot.className = "cprot achada";
    }
    if(ST.resp[id]) marca();
    var passo = 0;
    [ca, cz].forEach(function(cel, n){
      cel.addEventListener("click", function(){
        if(ST.resp[id]) return;
        sPasso();
        if(n === 0){ passo = 1; cel.className = "cpcel pega"; return; }
        if(passo !== 1){ falar("cacatoque"); return; }
        marca(); acertou(id, "certo" + pi + "_" + k);
      });
    });
  });
  d.appendChild(lista);
}

/* PEÇA — PEGAR E SOLTAR NUM ALVO COMPARTILHADO (_ponto2, f1): a peça é o item,
   o alvo se declara no nível da página como `alvo-<chave>`, e a resposta do item
   é ">chave". As duas portas: puxar OU tocar-tocar. */
function pegaSolta(d, pi, alvosHTML, itens, chaveAlvo, falaItem, cls){
  var alvos = [], marcada = null;
  var linha = el("div", "figalvos");
  baralha(alvosHTML.slice(0)).forEach(function(A){
    var a = el("div", "figalvo gr");
    a.innerHTML = A.html;
    a.setAttribute("data-alvo", "1");
    a.setAttribute("data-qa", "alvo-" + chaveAlvo + pi + "_" + A.k);
    a._v = A.k; a._dentro = el("div", "fdentro2"); a.appendChild(a._dentro);
    if(A.fala) a.appendChild(botaoSom("Ouvir", function(){ falar(A.fala); }));
    alvos.push(a); linha.appendChild(a);
  });
  d.appendChild(linha);
  var banco = el("div", "figbanco");
  itens.forEach(function(I, i){
    var id = "n" + pi + "_" + i;
    registra(id, pi, ">" + chaveAlvo + pi + "_" + I.alvo);
    var b = el("button", "op pal" + (cls ? " " + cls : "") + (ST.resp[id] ? " usada" : ""), I.rot);
    b.setAttribute("aria-label", I.aria || I.rot);
    b.setAttribute("data-qa", "item-" + id);
    b.setAttribute("data-alvo", "1");
    if(ST.resp[id]) alvos.forEach(function(a){ if(a._v === I.alvo) a._dentro.appendChild(el("span", "fdentro", I.rot)); });
    function larga(a){
      if(ST.resp[id]) return;
      if(a._v === I.alvo){
        b.className = "op pal" + (cls ? " " + cls : "") + " usada";
        a._dentro.appendChild(el("span", "fdentro", I.rot));
        if(marcada === b) marcada = null;
        acertou(id, "certo" + pi + "_" + I.k);
      } else {
        a.className = "figalvo gr erro";
        setTimeout(function(){ a.className = "figalvo gr"; }, 500);
        errou(id, "dica" + pi + "_" + I.k);
      }
    }
    b._larga = larga;
    b.onclick = function(){
      if(b._arrastou){ b._arrastou = false; return; }
      if(ST.resp[id]) return;
      sPasso(); falar(falaItem(I));
      if(marcada === b){ b.className = "op pal" + (cls ? " " + cls : ""); marcada = null; return; }
      if(marcada) marcada.className = "op pal" + (cls ? " " + cls : "");
      b.className = "op pal" + (cls ? " " + cls : "") + " marcada"; marcada = b;
    };
    puxavel(b, alvos, function(a){ larga(a); });
    banco.appendChild(b);
  });
  alvos.forEach(function(a){ a.onclick = function(){ if(marcada && marcada._larga) marcada._larga(a); }; });
  d.appendChild(banco);
}


/* ============================================================
   AS 35 FOLHAS — e a ordem É a escada (ver o comentário dos DADOS).
   ============================================================ */
function opsPal(ws){ return baralha(ws.map(function(w){ return {v: chaveQuadro(w), rot: w, aria: w, fala: "pal_" + chaveQuadro(w)}; })); }

/* 1 e 4 — QUAL PALAVRA É A AÇÃO? */
function montaAcao(d, pi, DA){
  ST.folha["p" + pi].forEach(function(k, i){
    var X = DA[k], id = "n" + pi + "_" + i, box = item(i + 1);
    /* a figura vem da MESMA folha de papel de onde veio o gesto (d33): a criança
       VÊ a ação antes de procurar a palavra que a nomeia. */
    if(X.fig) box.appendChild(el("div", "cena1", figOu(X.fig, "figacao")));
    var lin = el("div", "enunlin");
    lin.appendChild(el("div", "frasegrande", X.f));
    lin.appendChild(botaoSom("Ouvir a frase", function(){ falar("fra_" + k); }));
    box.appendChild(lin);
    opcoes(box, pi, id, baralha(X.ops.map(function(w){
      return {v: "w" + chaveQuadro(w), rot: w, aria: w, fala: "pal_" + chaveQuadro(w)};
    })), "w" + chaveQuadro(X.r), "pal", "certo" + pi + "_" + k, "dica" + pi + "_" + k);
    fechaItem(d, box, id);
  });
}
function f1(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Leia a frase. Uma das três palavras diz o que alguém <b>faz</b>: a ação. Qual é?", "p" + pi + "enun");
  montaAcao(d, pi, ACAO);
}
function f4(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "A palavra que diz a ação tem um nome: <b>VERBO</b>. Você já achou treze. Agora ache o verbo de cada frase.", "p" + pi + "enun");
  montaAcao(d, pi, ACAO2);
}

/* 2 e 13 — MARQUE VÁRIOS E CONFIRA */
function montaMarq(d, pi, DM, falaPeca){
  ST.folha["p" + pi].forEach(function(k, i){
    var M = DM[k], id = "n" + pi + "_" + i, box = item(i + 1);
    box.appendChild(el("div", "legfig", M.p));
    marqueConfira(box, id, pi, M.pecas.map(function(P){
      return {k: P.k, t: P.t, ok: P.ok, fala: function(){ falar(falaPeca(k, P)); }};
    }), "certo" + pi + "_" + k, "dica" + pi + "_" + k);
    fechaItem(d, box, id);
  });
}
function f2(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Em cada grupo há palavras de <b>ação</b> e palavras que são nomes de coisas. Marque só as ações e toque em Conferir.", "p" + pi + "enun");
  montaMarq(d, pi, MARQ, function(k, P){ return "pal_" + chaveQuadro(P.t); });
}
function f13(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Leia as quatro frases de cada grupo. Marque só as que estão <b>certas</b>: o verbo combina com quem faz. Depois confira.", "p" + pi + "enun");
  montaMarq(d, pi, MARQ2, function(k, P){ return "marq_" + k + "_" + P.k; });
}

/* 3, 12, 19 e 25 — AS GAVETAS */
function f3(d, pi){ gavetas(d, pi, "gA", "Leia cada palavra. Ela diz uma <b>ação</b> ou é o <b>nome</b> de uma coisa? Leve para a gaveta certa."); }
function f12(d, pi){ gavetas(d, pi, "gB", "Leia a peça. Quem faz é <b>um só</b>, ou é <b>mais de um</b>? Repare no fim do verbo antes de escolher a gaveta."); }
function f19(d, pi){ gavetas(d, pi, "gC", "Leia a frase em voz alta. O verbo <b>combina</b> com quem faz, ou soa errado? Leve para a gaveta certa."); }
function f25(d, pi){ gavetas(d, pi, "gD", "Alguns verbos mostram que alguém <b>falou</b>. Esses são os verbos de dizer. Separe: verbo de dizer, ou outro verbo?"); }

/* 5, 16 e 26 — LIGAR */
function montaLig(d, pi, DL, falaE, falaD){
  var pares = ST.folha["p" + pi][0].map(function(k){
    var L = DL[k];
    return {k: k, esq: L.a, dir: L.b, ariaE: L.a, ariaD: L.b, fe: falaE(k, L), fd: falaD(k, L),
            fc: "certo" + pi + "_" + k, dica: "dica" + pi + "_" + k};
  });
  /* ⚠️ SEM EMBRULHO: o `montaLigar` recebe a PÁGINA direto. Antes havia um
     um <div> de embrulho com classe própria no meio, que nunca teve uma linha
     de CSS — um <div>
     de nada. O `_qa/classes.py`, depois que passou a ler o `folhas.js`
     (20/set/2026), acusou `.ligcx` em cinco cadernos; a resposta certa não era
     inventar uma regra para ele, era tirar o embrulho. O `_corpo5`, que nasceu
     do esqueleto novo, já fazia assim. */
  montaLigar(d, pi, "g0", pares, d);
}
function f5(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Do lado esquerdo está <b>quem faz</b>. Do direito, <b>o que faz</b>. Toque num e depois no outro para ligar.", "p" + pi + "enun");
  montaLig(d, pi, LIGA, function(k){ return "lg_" + k + "_e"; }, function(k){ return "lg_" + k + "_d"; });
}
function f16(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Ligue cada pronome à forma do verbo que <b>combina</b> com ele. Diga os dois juntos em voz alta.", "p" + pi + "enun");
  montaLig(d, pi, LIGP, function(k, L){ return "pal_" + chaveQuadro(L.a); }, function(k, L){ return "pal_" + chaveQuadro(L.b); });
}
function f26(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Cada fala pede um verbo de dizer. Ligue a fala ao verbo que mostra <b>como</b> ela foi dita.", "p" + pi + "enun");
  montaLig(d, pi, LIGD, function(k){ return "lg_" + k + "_e"; }, function(k, L){ return "pal_" + chaveQuadro(L.b); });
}

/* 6, 9, 10, 11, 17, 18, 23, 24 — COMPLETE A FRASE */
function montaLacuna(d, pi, DF){
  ST.folha["p" + pi].forEach(function(k, i){
    var F = DF[k], id = "n" + pi + "_" + i, box = item(i + 1);
    var lin = el("div", "enunlin");
    lin.appendChild(el("div", "frasegrande", F.f.replace("___", '<i class="lacuna peq"></i>')));
    lin.appendChild(botaoSom("Ouvir a frase", function(){ falar("fra_" + k); }));
    box.appendChild(lin);
    opcoes(box, pi, id, opsPal(F.ops), chaveQuadro(F.r), "pal", "certo" + pi + "_" + k, "dica" + pi + "_" + k);
    fechaItem(d, box, id);
  });
}
function f6(d, pi){ faixa(d, pi, NOMES[pi - 1]); enunciado(d, pi, "A frase está sem a ação. Das três palavras, só uma é <b>verbo</b>. Preencha.", "p" + pi + "enun"); montaLacuna(d, pi, FRASE1); }
function f9(d, pi){ faixa(d, pi, NOMES[pi - 1]); enunciado(d, pi, "Quem faz é <b>EU</b>. Das três formas do verbo, qual combina com eu? Diga a frase inteira em voz alta.", "p" + pi + "enun"); montaLacuna(d, pi, CONC1); }
function f10(d, pi){ faixa(d, pi, NOMES[pi - 1]); enunciado(d, pi, "Agora quem faz é <b>ELE</b> ou <b>ELA</b>: uma pessoa só. Escolha a forma que combina.", "p" + pi + "enun"); montaLacuna(d, pi, CONC2); }
function f11(d, pi){ faixa(d, pi, NOMES[pi - 1]); enunciado(d, pi, "Quem faz é <b>NÓS</b> ou <b>ELES</b>: mais de um. Repare como o fim do verbo muda.", "p" + pi + "enun"); montaLacuna(d, pi, CONC3); }
function f17(d, pi){ faixa(d, pi, NOMES[pi - 1]); enunciado(d, pi, "Agora quem faz é um <b>nome</b>: o cachorro, os pássaros. Um só ou mais de um? Escolha o verbo que combina.", "p" + pi + "enun"); montaLacuna(d, pi, CONC4); }
function f18(d, pi){ faixa(d, pi, NOMES[pi - 1]); enunciado(d, pi, "Cuidado: quem faz agora são <b>duas pessoas</b>, ou um grupo inteiro. Pense bem antes de escolher.", "p" + pi + "enun"); montaLacuna(d, pi, CONC5); }
function f23(d, pi){ faixa(d, pi, NOMES[pi - 1]); enunciado(d, pi, "Alguém falou. A palavra que falta diz <b>quem falou e como</b>. Qual verbo mostra a fala?", "p" + pi + "enun"); montaLacuna(d, pi, DIZ1); }
function f24(d, pi){ faixa(d, pi, NOMES[pi - 1]); enunciado(d, pi, "As três opções são verbos de fala. Só uma combina com o <b>jeito</b> de falar: alto, baixinho, perguntando… Escolha.", "p" + pi + "enun"); montaLacuna(d, pi, DIZ2); }

/* 7, 15 e 27 — ESCREVA NAS CASINHAS */
function montaGrade(d, pi, DG, rot){
  ST.folha["p" + pi].forEach(function(k, i){
    var G = DG[k], id = "n" + pi + "_" + i, box = item(i + 1);
    var lin = el("div", "enunlin");
    lin.appendChild(el("div", "frasegrande", G.p.replace("___", '<i class="lacuna peq"></i>')));
    lin.appendChild(botaoSom("Ouvir a frase", function(){ falar("grd_" + k); }));
    box.appendChild(lin);
    box.appendChild(el("div", "ajuda cent", G.d));
    gradeEscrever(box, id, pi, k, G.w, rot);
    fechaItem(d, box, id);
  });
}
function f7(d, pi){ faixa(d, pi, NOMES[pi - 1]); enunciado(d, pi, "As casinhas dizem quantas letras tem o verbo. Leia a pista e <b>escreva</b>: toque nas casinhas ou digite.", "p" + pi + "enun"); montaGrade(d, pi, GRADE1, "Escreva o verbo"); }
function f15(d, pi){ faixa(d, pi, NOMES[pi - 1]); enunciado(d, pi, "O verbo está entre parênteses, sem forma. <b>Escreva</b> a forma que combina com quem faz.", "p" + pi + "enun"); montaGrade(d, pi, GRADE2, "Escreva o verbo que combina"); }
function f27(d, pi){ faixa(d, pi, NOMES[pi - 1]); enunciado(d, pi, "Leia a fala e o jeito de falar. <b>Escreva</b> o verbo de dizer que falta.", "p" + pi + "enun"); montaGrade(d, pi, GRADE3, "Escreva o verbo de dizer"); }

/* 8 — NUMERE QUEM FAZ */
function f8(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "A coluna da esquerda tem <b>quem faz</b>, numerado. Para cada ação da direita, toque no número de quem faz.", "p" + pi + "enun");
  var lista = ST.folha["p" + pi];
  var col = el("div", "pergcol");
  lista.forEach(function(k, n){
    var a = el("div", "pergunta2");
    a.appendChild(el("span", "ptxt", "<b>" + (n + 1) + ".</b> " + NUM[k].a));
    a.appendChild(botaoSom("Ouvir", function(){ falar("qfz_" + k + "_a"); }));
    col.appendChild(a);
  });
  d.appendChild(col);
  baralha(lista.slice(0)).forEach(function(k){
    var i = lista.indexOf(k), id = "n" + pi + "_" + i, box = item(0);
    var lin = el("div", "enunlin");
    lin.appendChild(el("div", "palgrande", NUM[k].b));
    lin.appendChild(botaoSom("Ouvir", function(){ falar("pal_" + chaveQuadro(NUM[k].b)); }));
    box.appendChild(lin);
    var ops = lista.map(function(_, n){ return {v: "n" + (n + 1), rot: String(n + 1), aria: "número " + (n + 1), fala: "num_" + (n + 1)}; });
    opcoes(box, pi, id, ops, "n" + (i + 1), "pal num", "certo" + pi + "_" + k, "dica" + pi + "_" + k);
    fechaItem(d, box, id);
  });
}

/* 14 e 22 — QUAL FRASE FICOU CERTA? */
function montaReesc(d, pi, DR){
  ST.folha["p" + pi].forEach(function(k, i){
    var R = DR[k], id = "n" + pi + "_" + i, box = item(i + 1);
    var lin = el("div", "enunlin");
    lin.appendChild(el("div", "legfig", R.f));
    lin.appendChild(botaoSom("Ouvir", function(){ falar("ree_" + k); }));
    box.appendChild(lin);
    opcoes(box, pi, id, baralha([
      {v: "certa", rot: R.certa, aria: R.certa, fala: "pal_" + chaveQuadro(R.certa)},
      {v: "outra", rot: R.outra, aria: R.outra, fala: "pal_" + chaveQuadro(R.outra)}]),
      "certa", "pal frase", "certo" + pi + "_" + k, "dica" + pi + "_" + k);
    fechaItem(d, box, id);
  });
}
function f14(d, pi){ faixa(d, pi, NOMES[pi - 1]); enunciado(d, pi, "As duas frases são quase iguais: só o <b>verbo</b> muda. Toque na frase em que o verbo combina com quem faz.", "p" + pi + "enun"); montaReesc(d, pi, REESC1); }
function f22(d, pi){ faixa(d, pi, NOMES[pi - 1]); enunciado(d, pi, "O jornal da escola escreveu duas manchetes para cada notícia. Só uma está certa. Qual?", "p" + pi + "enun"); montaReesc(d, pi, REESC2); }

/* 20, 21 e 28 — ACHE NO TEXTO */
function f20(d, pi){ faixa(d, pi, NOMES[pi - 1]); enunciado(d, pi, "Leia a notícia e toque em " + TXT.tx1.pede + ". Depois confira.", "p" + pi + "enun"); noTexto(d, pi, TXT.tx1, "certo" + pi + "_t", "dica" + pi + "_t"); }
function f21(d, pi){ faixa(d, pi, NOMES[pi - 1]); enunciado(d, pi, "Este texto tem erros. Toque em " + TXT.tx2.pede + ". Depois confira.", "p" + pi + "enun"); noTexto(d, pi, TXT.tx2, "certo" + pi + "_t", "dica" + pi + "_t"); }
function f28(d, pi){ faixa(d, pi, NOMES[pi - 1]); enunciado(d, pi, "Leia o diálogo e toque em " + TXT.tx3.pede + ". Depois confira.", "p" + pi + "enun"); noTexto(d, pi, TXT.tx3, "certo" + pi + "_t", "dica" + pi + "_t"); }

/* 29 e 30 — OS CAÇA-VERBOS */
function f29(d, pi){ faixa(d, pi, NOMES[pi - 1]); enunciado(d, pi, "Ache na grade a forma do verbo que a pista pede: toque na primeira letra e depois na última.", "p" + pi + "enun"); cacaPalavras(d, pi, CACA, "Ache:"); }
function f30(d, pi){ faixa(d, pi, NOMES[pi - 1]); enunciado(d, pi, "Agora o pronome muda: eu, nós, eles. Ache a forma que combina. Primeira letra, depois a última.", "p" + pi + "enun"); cacaPalavras(d, pi, CACA2, "Ache:"); }

/* 31 e 32 — AS CRUZADINHAS */
function f31(d, pi){ faixa(d, pi, NOMES[pi - 1]); enunciado(d, pi, "Toque numa pista, escute e escreva a forma do verbo que combina com o pronome.", "p" + pi + "enun"); cruzadinha(d, pi, CRZD, "crz_"); }
function f32(d, pi){ faixa(d, pi, NOMES[pi - 1]); enunciado(d, pi, "Agora são os verbos de dizer. Leia a fala e escreva o verbo que mostra como ela foi dita.", "p" + pi + "enun"); cruzadinha(d, pi, CRZD2, "crz_"); }

/* 33 — ARRASTE O PRONOME ATÉ O VERBO */
function f33(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Em cima estão as formas do verbo. <b>Puxe</b> cada pronome até a forma que combina com ele, ou toque num e depois no outro.", "p" + pi + "enun");
  var lista = ST.folha["p" + pi];
  pegaSolta(d, pi,
    lista.map(function(k){ return {k: k, html: '<span class="cartex">' + PARES[k].b + "</span>", fala: "pal_" + chaveQuadro(PARES[k].b)}; }),
    lista.map(function(k){ return {k: k, alvo: k, rot: PARES[k].a, aria: PARES[k].a}; }),
    "par", function(I){ return "pal_" + chaveQuadro(I.rot); }, "frase");
}

/* 34 — ESCREVA O SEU VERBO (produção: vale qualquer verbo que combine) */
function f34(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Agora o verbo é seu. Escreva um verbo que <b>combine</b> com quem faz. Vale qualquer um que caiba na frase.", "p" + pi + "enun");
  ST.folha["p" + pi].forEach(function(k, i){
    var X = PROD[k], id = "n" + pi + "_" + i, box = item(i + 1);
    var lin = el("div", "enunlin");
    lin.appendChild(el("div", "ajuda", "Escreva " + X.q + "."));
    lin.appendChild(botaoSom("Ouvir o pedido", function(){ falar("prd_" + k); }));
    box.appendChild(lin);
    gradeEscrever(box, id, pi, k, X.ok[0], "Escreva o seu verbo", X.ok);
    fechaItem(d, box, id);
  });
}

/* 35 — O CARTAZ DO VERBO ⭐⭐ O CONCEITO (concordância) VEM POR ÚLTIMO */
function f35(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Você já sabe tudo isto. Agora os nomes: leve cada exemplo para a " +
            "linha dele no cartaz.", "p" + pi + "enun");
  var cart = el("div", "cartaz"), linhas = {}, listaC = [];
  CART.linhas.forEach(function(L){
    var l = el("div", "cartlin");
    var t = el("div", "cartit");
    t.innerHTML = "<b>" + L.t + "</b><span>" + L.d + "</span>";
    t.appendChild(botaoSom("Ouvir", function(){ falar("cart_" + L.k); }));
    l.appendChild(t);
    var alvo = el("div", "cartalvo");
    alvo.setAttribute("data-alvo", "1");
    alvo.setAttribute("data-qa", "alvo-cart" + pi + "_" + L.k);
    alvo.appendChild(el("span", "cartex", L.e));
    l.appendChild(alvo);
    l._v = L.k; l._dentro = alvo;
    linhas[L.k] = l; listaC.push(l);
    cart.appendChild(l);
  });
  d.appendChild(cart);
  var banco = el("div", "figbanco"), marcada = null;
  ST.folha["p" + pi].forEach(function(k, i){
    var X = CART.exem[k], id = "n" + pi + "_" + i;
    registra(id, pi, ">cart" + pi + "_" + X.c);
    var b = el("button", "op pal frase" + (ST.resp[id] ? " usada" : ""), X.p);
    b.setAttribute("aria-label", X.p);
    b.setAttribute("data-qa", "item-" + id);
    b.setAttribute("data-alvo", "1");
    if(ST.resp[id]) linhas[X.c]._dentro.appendChild(el("span", "fdentro", X.p));
    function larga(l){
      if(ST.resp[id]) return;
      if(l._v === X.c){
        b.className = "op pal frase usada";
        l._dentro.appendChild(el("span", "fdentro", X.p));
        if(marcada === b) marcada = null;
        acertou(id, "certo" + pi + "_" + k);
      } else {
        l.className = "cartlin erro";
        setTimeout(function(){ l.className = "cartlin"; }, 500);
        errou(id, "dica" + pi + "_" + k);
      }
    }
    b._larga = larga;
    b.onclick = function(){
      if(b._arrastou){ b._arrastou = false; return; }
      if(ST.resp[id]) return;
      sPasso(); falar("ex_" + k);
      if(marcada === b){ b.className = "op pal frase"; marcada = null; return; }
      if(marcada) marcada.className = "op pal frase";
      b.className = "op pal frase marcada"; marcada = b;
    };
    puxavel(b, listaC, function(l){ larga(l); });
    banco.appendChild(b);
  });
  listaC.forEach(function(l){ l.onclick = function(){ if(marcada && marcada._larga) marcada._larga(l); }; });
  d.appendChild(banco);
}
