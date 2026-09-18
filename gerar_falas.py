# -*- coding: utf-8 -*-
u"""
============================================================
 ESQUELETO — gerador das falas da folha viva

 ⚠️ REGRA DA CASA: o `falas.json` é a VERDADE. Texto escrito aqui = voz gravada.
    Texto mudou = voz regravada (o `entregar.yml` compara o carimbo sha1). É isto
    que acaba com "a tela diz uma coisa e a voz diz outra" — e atividade sem
    `falas.json` NÃO TEM COMO SER CONFERIDA, porque mp3 não se lê.

 ⚠️ UMA FONTE SÓ. As palavras, as frases e os textos moram no bloco
    `/*DADOS-INI*/` do `index.html` e são LIDOS daqui. Nada de segunda lista
    para desencontrar: já custou caro nesta casa um relatório sair zero com a
    folha inteira respondida.

 ⚠️ TODA TELA É NARRADA, e o alto-falante entra também em CADA RESPOSTA que a
    criança toca. Regra do Marcos: *"o alto-falante nas respostas também, para
    ajudar os alunos que não sabem ler"*. Sem isso a criança que ainda soletra
    escolhe pelo tamanho da palavra e a folha vira sorteio.

 ⚠️ A DICA NUNCA DIZ A RESPOSTA. Ela manda olhar uma pista, ou faz outra
    pergunta. Responder no segundo erro não é ajudar: é tirar da criança a única
    chance de pensar de novo.

 ⚠️ PALAVRAS QUE A VOZ ERRA (medido, e o portão `_qa/falas.py` reprova):
    "complete" vira "complite" — usar "preencha". Letra solta ("som S") sai como
    o NOME da letra: ancorar num exemplo ("o som de SAPO").

 Uso:  python3 <pasta>/gerar_falas.py
 Saída: reescreve os blocos FALAS e VOZOK do index.html, o `falas.json` e o
        `voz.txt`.
============================================================
"""
from __future__ import print_function

import collections
import io
import json
import os
import re
import unicodedata

AQUI = os.path.dirname(os.path.abspath(__file__))
CAM = os.path.join(AQUI, u"index.html")
PREFIXO = u"vr_"                     # <- o prefixo desta atividade
VOZ = u"pt-BR-AntonioNeural"

D = io.open(CAM, encoding=u"utf-8").read()


def bloco(nome):
    u"""Lê um objeto do bloco DADOS do index.html. Uma fonte só.

    ⚠️ ELE CONTA AS CHAVES, e isso foi conserto de 15/set/2026. O esqueleto
       procurava o fim do objeto por uma marca de texto (`\n});`) — e QUALQUER
       objeto que não terminasse exatamente assim fazia a leitura passar
       adiante e engolir o bloco seguinte. No primeiro caderno do 2º ano os
       vinte e três blocos falharam de uma vez, todos com o mesmo erro, e a
       mensagem do json não dizia nada sobre a causa. Contar chave por chave
       (pulando as que estão DENTRO de texto) acha o fim de qualquer objeto.
    """
    i = D.find(u"var " + nome + u" = ")
    if i < 0:
        raise SystemExit(u"nao achei o bloco `var %s` no index.html" % nome)
    i = D.index(u"{", i)
    nivel, j, dentro, escapa = 0, i, False, False
    while j < len(D):
        c = D[j]
        if dentro:
            if escapa:
                escapa = False
            elif c == u"\\":
                escapa = True
            elif c == u'"':
                dentro = False
        else:
            if c == u'"':
                dentro = True
            elif c == u"{":
                nivel += 1
            elif c == u"}":
                nivel -= 1
                if nivel == 0:
                    j += 1
                    break
        j += 1
    txt = D[i:j]
    txt = re.sub(r"/\*.*?\*/", "", txt, flags=re.S)
    txt = re.sub(r'"\s*\+\s*\n\s*"', "", txt)                 # junta "a" + "b"
    txt = re.sub(r'([\{,]\s*)"?([A-Za-zÀ-ÿ_0-9]+)"?\s*:', r'\1"\2":', txt)
    txt = re.sub(r",(\s*[\}\]])", r"\1", txt)
    return json.loads(txt)


# ⚠️⚠️ A ENTIDADE HTML TAMBÉM É MARCAÇÃO, e isto foi lição paga (15/set/2026,
#    caderno de inglês do 8º ano). O `lp` tirava as TAGS e deixava as
#    ENTIDADES, então a lista de ingredientes da pizza — escrita com `&middot;`
#    para virar o ponto que separa os itens — ia para a fila de gravação como
#    *"Oil and middot Tomato sauce and middot Some onions"*. O portão
#    `_qa/revisor.py` pegou; se não pegasse, a voz teria dito isso à criança.
_ENT = {u"&middot;": u",", u"&nbsp;": u" ", u"&amp;": u" e ", u"&mdash;": u" ",
        u"&ndash;": u" ", u"&hellip;": u" ", u"&quot;": u'"', u"&lt;": u"",
        u"&gt;": u"", u"&#39;": u"'", u"&apos;": u"'"}


def lp(s):
    u"""tira a marcação e deixa o texto do jeito que a voz vai dizer"""
    t = re.sub(r"<[^>]+>", " ", s or u"")
    for _e, _v in _ENT.items():
        t = t.replace(_e, _v)
    t = re.sub(r"\s+", u" ", t)
    # ⚠️ e a tag que vira espaco deixa um vao ANTES da pontuacao ("o cinema ."),
    #    que o `_qa/revisor.py` acusa — com razao: a voz faz a pausa no lugar
    #    errado. Cola a pontuacao de volta na palavra.
    t = re.sub(r"\s+([,.;:!?])", r"\1", t)
    # ⚠️ E A VIRGULA DA PAUSA PODE ENCOSTAR NUMA QUE JA EXISTIA (15/set/2026):
    #    a frase "My dad, ___ travels a lot" virou "My dad,, travels a lot" —
    #    duas virgulas coladas, que o Edge TTS le como uma pausa estranha e
    #    longa demais. Uma so, sempre.
    t = re.sub(r",\s*,+", u",", t)
    return t.strip()


def ch(w):
    return re.sub(r"[^a-z]", "",
                  unicodedata.normalize("NFKD", w.lower())
                  .encode("ascii", "ignore").decode())


F = collections.OrderedDict()


def p(k, v):
    u"""⚠️ TODA fala passa por aqui LIMPA. Não é enfeite: quando a frase perde o
    travessão do discurso direto (`— Socorro! — gritou`), sobram dois espaços; a
    pista `ele ___ (correr)` vira `ele lacuna , verbo correr`; e um texto que já
    acaba em ponto ganha outro e sai `ela..`. Os TRÊS aconteceram neste caderno e
    quem pegou foi o portão `0o` (`_qa/revisor.py`) — a criança OUVIRIA isso."""
    t = re.sub(r"\s+", u" ", (v or u"")).strip()
    t = re.sub(r"\s+([,.;:!?])", r"\1", t)     # espaço antes da pontuação
    t = re.sub(r"([,.;:!?])\1+", r"\1", t)     # ".." e ",,"
    t = re.sub(r"\.\s*\.", u".", t)
    F[k] = t


# ---------------------------------------------------------------------------
# AS FALAS DO MOTOR — estas toda folha viva tem
# ---------------------------------------------------------------------------
p(u"capa", u"O Motor da Frase. Trinta e cinco folhas sobre o verbo: a palavra que faz a frase "
           u"andar, e que combina com quem faz. Escreva o seu nome ali embaixo e toque em Começar.")
p(u"folhaPronta", u"Folha pronta! Muito bem.")
p(u"escreva", u"Escreva a palavra usando o teclado.")
p(u"ligue", u"Toque numa peça do lado esquerdo e depois na do lado direito.")
p(u"toque_palavra", u"Primeiro toque numa peça ali embaixo. Depois toque na gaveta dela.")
p(u"vozOn", u"Narração ligada!")
p(u"fim", u"Você chegou ao fim! Agora preste atenção na próxima conversa que ouvir: quem fala, "
          u"e como fala? Perguntou, gritou, sussurrou? O verbo conta isso. Repare também se o "
          u"verbo combina com quem faz.")
p(u"quase", u"Quase! Tente de novo.")
p(u"cacatoque", u"Toque primeiro na primeira letra da palavra.")
p(u"pegue_lapis", u"Primeiro pegue uma canetinha ali em cima. Depois toque na palavra.")
p(u"novoCaderno", u"Caderno novo! Escreva o seu nome e toque em Começar.")


def cq(w):
    return re.sub(r"[^a-z]", u"", (w or u"").lower())


ENUN = [
 u"Leia a frase. Uma das três palavras diz o que alguém faz: a ação. Qual é?",
 u"Em cada grupo há palavras de ação e palavras que são nomes de coisas. Marque só as ações e toque em Conferir.",
 u"Leia cada palavra. Ela diz uma ação, ou é o nome de uma coisa? Leve para a gaveta certa.",
 u"A palavra que diz a ação tem um nome: verbo. Você já achou treze. Agora ache o verbo de cada frase.",
 u"Do lado esquerdo está quem faz. Do direito, o que faz. Toque num e depois no outro para ligar.",
 u"A frase está sem a ação. Das três palavras, só uma é verbo. Preencha.",
 u"As casinhas dizem quantas letras tem o verbo. Leia a pista e escreva: toque nas casinhas ou digite.",
 u"A coluna da esquerda tem quem faz, numerado. Para cada ação da direita, toque no número de quem faz.",
 u"Quem faz é EU. Das três formas do verbo, qual combina com eu? Diga a frase inteira em voz alta.",
 u"Agora quem faz é ele ou ela: uma pessoa só. Escolha a forma que combina.",
 u"Quem faz é nós ou eles: mais de um. Repare como o fim do verbo muda.",
 u"Leia a peça. Quem faz é um só, ou é mais de um? Repare no fim do verbo antes de escolher a gaveta.",
 u"Leia as quatro frases de cada grupo. Marque só as que estão certas: o verbo combina com quem faz. Depois confira.",
 u"As duas frases são quase iguais: só o verbo muda. Toque na frase em que o verbo combina com quem faz.",
 u"O verbo está entre parênteses, sem forma. Escreva a forma que combina com quem faz.",
 u"Ligue cada pronome à forma do verbo que combina com ele. Diga os dois juntos em voz alta.",
 u"Agora quem faz é um nome: o cachorro, os pássaros. Um só ou mais de um? Escolha o verbo que combina.",
 u"Cuidado: quem faz agora são duas pessoas, ou um grupo inteiro. Pense bem antes de escolher.",
 u"Leia a frase em voz alta. O verbo combina com quem faz, ou soa errado? Leve para a gaveta certa.",
 u"Leia a notícia e toque nos verbos: as palavras que dizem o que cada um fez ou faz. Depois confira.",
 u"Este texto tem erros. Toque nos verbos que não combinam com quem faz. Depois confira.",
 u"O jornal da escola escreveu duas manchetes para cada notícia. Só uma está certa. Qual?",
 u"Alguém falou. A palavra que falta diz quem falou e como. Qual verbo mostra a fala?",
 u"As três opções são verbos de fala. Só uma combina com o jeito de falar: alto, baixinho, perguntando. Escolha.",
 u"Alguns verbos mostram que alguém falou. Esses são os verbos de dizer. Separe: verbo de dizer, ou outro verbo?",
 u"Cada fala pede um verbo de dizer. Ligue a fala ao verbo que mostra como ela foi dita.",
 u"Leia a fala e o jeito de falar. Escreva o verbo de dizer que falta.",
 u"Leia o diálogo e toque nos verbos de dizer: os que mostram quem falou e como. Depois confira.",
 u"Ache na grade a forma do verbo que a pista pede: toque na primeira letra e depois na última.",
 u"Agora o pronome muda: eu, nós, eles. Ache a forma que combina. Primeira letra, depois a última.",
 u"Toque numa pista, escute e escreva a forma do verbo que combina com o pronome.",
 u"Agora são os verbos de dizer. Leia a fala e escreva o verbo que mostra como ela foi dita.",
 u"Em cima estão as formas do verbo. Puxe cada pronome até a forma que combina com ele, ou toque num e depois no outro.",
 u"Agora o verbo é seu. Escreva um verbo que combine com quem faz. Vale qualquer um que caiba na frase.",
 u"Você já sabe tudo isto. Agora os nomes: leve cada exemplo para a linha dele no cartaz."]
assert len(ENUN) == 35, len(ENUN)
for _i, _t in enumerate(ENUN):
    p(u"p%denun" % (_i + 1), _t)

ELOGIO = [u"Isso mesmo!", u"Muito bem!", u"Você acertou!", u"Boa!", u"Exatamente!", u"É isso aí!"]
DICAS_V = [u"Pergunte: o que essa pessoa está fazendo? A resposta é o verbo.",
           u"Verbo é palavra de fazer: dá para pôr EU na frente e ela vira uma ação.",
           u"Nome de coisa não é ação. Procure a palavra que mostra movimento ou acontecimento."]
DICAS_C = [u"Diga a frase inteira em voz alta, com cada opção. Só uma soa certa.",
           u"Olhe quem faz: é um só, ou mais de um? O fim do verbo tem que combinar.",
           u"Troque quem faz por ele ou por eles e escute o verbo de novo."]


def elogio(n):
    return ELOGIO[n % len(ELOGIO)]


def dicaV(n):
    return DICAS_V[n % len(DICAS_V)]


def dicaC(n):
    return DICAS_C[n % len(DICAS_C)]


ITENS = bloco(u"ITENS")


def pote(pi):
    v = ITENS[u"p%d" % pi]
    return v[0] if v and isinstance(v[0], list) else v


def palavras(*ws):
    for _w in ws:
        if _w:
            _t = lp(_w)
            _t = _t[0].upper() + _t[1:]
            p(u"pal_" + cq(_w), _t if _t[-1:] in u".!?" else _t + u".")


# --- 1 e 4: qual palavra é a ação --------------------------------------------
for _pi, _nome in ((1, u"ACAO"), (4, u"ACAO2")):
    _D = bloco(_nome)
    for _n, _k in enumerate(pote(_pi)):
        _X = _D[_k]
        palavras(*_X[u"ops"])
        p(u"fra_" + _k, lp(_X[u"f"]))
        p(u"certo%d_%s" % (_pi, _k), elogio(_n) + u" " + _X[u"r"].capitalize() + u" é a ação" + (u": é o verbo." if _pi == 4 else u"."))
        p(u"dica%d_%s" % (_pi, _k), dicaV(_n))

# --- 2 e 13: marque vários ---------------------------------------------------
MARQ = bloco(u"MARQ")
for _n, _k in enumerate(pote(2)):
    _M = MARQ[_k]
    palavras(*[_q[u"t"] for _q in _M[u"pecas"]])
    _ok = [_q[u"t"] for _q in _M[u"pecas"] if _q[u"ok"]]
    p(u"certo2_" + _k, elogio(_n) + u" As ações são " + u", ".join(_ok) + u".")
    p(u"dica2_" + _k, u"Ponha EU na frente de cada palavra. Eu correr, eu mesa… qual dá para fazer?")
MARQ2 = bloco(u"MARQ2")
for _n, _k in enumerate(pote(13)):
    _M = MARQ2[_k]
    for _q in _M[u"pecas"]:
        p(u"marq_%s_%s" % (_k, _q[u"k"]), lp(_q[u"t"]))
    p(u"certo13_" + _k, elogio(_n) + u" Você achou as frases em que o verbo combina com quem faz.")
    p(u"dica13_" + _k, u"Leia cada frase em voz alta. Nas erradas, o verbo não combina: eles vai, eu cantamos. Soa estranho.")

# --- 3, 12, 19 e 25: gavetas ---------------------------------------------------
GAV = bloco(u"GAV")
_GAVTXT = {u"v": u"Gaveta das palavras de ação.", u"n": u"Gaveta dos nomes de coisas.",
           u"s": u"Gaveta de quem faz sozinho: um só.", u"p": u"Gaveta de mais de um fazendo.",
           u"c": u"Gaveta das frases em que o verbo combina com quem faz.", u"e": u"Gaveta das frases em que o verbo não combina.",
           u"d": u"Gaveta dos verbos de dizer.", u"o": u"Gaveta dos outros verbos."}
for _gk, _G in GAV.items():
    for _C in _G[u"cols"]:
        p(u"gav_%s_%s" % (_gk, _C[u"k"]), _GAVTXT[_C[u"k"]])
_GAVCERTO = {u"v": u" é uma ação.", u"n": u" é o nome de uma coisa.", u"s": u": um só faz.", u"p": u": mais de um fazem.",
             u"c": u": o verbo combina.", u"e": u": o verbo não combina com quem faz.", u"d": u" é verbo de dizer.", u"o": u" não é verbo de dizer."}
_GAVDICA = {u"gA": u"Dá para fazer isso? Se dá, é ação. Se é uma coisa que a gente pega ou vê, é nome.",
            u"gB": u"Olhe o começo: eu, ele, ela é um só. Nós, vocês, eles é mais de um.",
            u"gC": u"Leia em voz alta. Se soar estranho, como 'nós vai', o verbo não combina.",
            u"gD": u"Verbo de dizer é o que vem depois de uma fala: disse, perguntou, gritou."}
for _pi, _gk in ((3, u"gA"), (12, u"gB"), (19, u"gC"), (25, u"gD")):
    for _n, _k in enumerate(pote(_pi)):
        _X = GAV[_gk][u"pal"][_k]
        p(u"diz2_%s_%s" % (_gk, _k), lp(_X[u"p"]).capitalize() + u".")
        p(u"certo%d_%s" % (_pi, _k), elogio(_n) + u" " + lp(_X[u"p"]).capitalize() + _GAVCERTO[_X[u"c"]])
        p(u"dica%d_%s" % (_pi, _k), _GAVDICA[_gk])

# --- 5, 16 e 26: ligar -------------------------------------------------------
LIGA = bloco(u"LIGA")
for _n, _k in enumerate(pote(5)):
    _L = LIGA[_k]
    p(u"lg_" + _k + u"_e", lp(_L[u"a"]) + u".")
    p(u"lg_" + _k + u"_d", lp(_L[u"b"]).capitalize() + u".")
    p(u"certo5_" + _k, elogio(_n) + u" " + _L[u"a"] + u" " + _L[u"b"] + u".")
    p(u"dica5_" + _k, u"Pense: o que " + _L[u"a"].lower() + u" faz? Procure essa ação do lado direito.")
LIGP = bloco(u"LIGP")
for _n, _k in enumerate(pote(16)):
    _L = LIGP[_k]
    palavras(_L[u"a"], _L[u"b"])
    p(u"certo16_" + _k, elogio(_n) + u" " + _L[u"a"].capitalize() + u" " + _L[u"b"] + u".")
    p(u"dica16_" + _k, u"Diga " + _L[u"a"] + u" e depois cada verbo da direita. Só um soa certo.")
LIGD = bloco(u"LIGD")
for _n, _k in enumerate(pote(26)):
    _L = LIGD[_k]
    palavras(_L[u"b"])
    p(u"lg_" + _k + u"_e", lp(_L[u"a"]).replace(u"—", u"").strip())
    p(u"certo26_" + _k, elogio(_n) + u" " + lp(_L[u"a"]).replace(u"—", u"").strip() + u" " + _L[u"b"] + u".")
    p(u"dica26_" + _k, u"Como essa fala foi dita? Perguntando, gritando, baixinho, agradecendo? O verbo diz isso.")

# --- 6, 9, 10, 11, 17, 18, 23, 24: complete a frase --------------------------------
for _pi, _nome, _tipo in ((6, u"FRASE1", u"v"), (9, u"CONC1", u"c"), (10, u"CONC2", u"c"), (11, u"CONC3", u"c"),
                          (17, u"CONC4", u"c"), (18, u"CONC5", u"c"), (23, u"DIZ1", u"d"), (24, u"DIZ2", u"d")):
    _D = bloco(_nome)
    for _n, _k in enumerate(pote(_pi)):
        _F = _D[_k]
        palavras(*_F[u"ops"])
        p(u"fra_" + _k, lp(_F[u"f"]).replace(u"—", u"").replace(u"___", u"lacuna"))
        p(u"certo%d_%s" % (_pi, _k), elogio(_n) + u" " + lp(_F[u"f"]).replace(u"—", u"").replace(u"___", _F[u"r"]))
        if _tipo == u"v":
            p(u"dica%d_%s" % (_pi, _k), dicaV(_n))
        elif _tipo == u"c":
            p(u"dica%d_%s" % (_pi, _k), dicaC(_n + _pi))
        else:
            p(u"dica%d_%s" % (_pi, _k), u"Leia a fala e pense em como ela foi dita. O verbo depois do travessão mostra isso.")

# --- 7, 15 e 27: escreva nas casinhas ------------------------------------------
for _pi, _nome in ((7, u"GRADE1"), (15, u"GRADE2"), (27, u"GRADE3")):
    _D = bloco(_nome)
    for _n, _k in enumerate(pote(_pi)):
        _G = _D[_k]
        p(u"grd_" + _k, lp(_G[u"p"]).replace(u"—", u"").replace(u"___", u"lacuna") + u" " + _G[u"d"] + u".")
        p(u"certo%d_%s" % (_pi, _k), elogio(_n) + u" " + lp(_G[u"p"]).replace(u"—", u"").replace(u"___", _G[u"w"].lower()))
        p(u"dica%d_%s" % (_pi, _k), u"Conte as casinhas: são " + str(len(_G[u"w"])) + u" letras. " + _G[u"d"] + u".")

# --- 8: numere quem faz ---------------------------------------------------------
NUM = bloco(u"NUM")
for _n in range(1, 6):
    p(u"num_%d" % _n, u"Número %d." % _n)
for _n, _k in enumerate(pote(8)):
    _P = NUM[_k]
    p(u"qfz_" + _k + u"_a", _P[u"a"] + u".")
    palavras(_P[u"b"])
    p(u"certo8_" + _k, elogio(_n) + u" " + _P[u"a"] + u" " + _P[u"b"] + u": é o número " + str(_n + 1) + u".")
    p(u"dica8_" + _k, u"Quem " + _P[u"b"] + u"? Leia a coluna da esquerda de novo.")

# --- 14 e 22: qual frase ficou certa ---------------------------------------------
for _pi, _nome in ((14, u"REESC1"), (22, u"REESC2")):
    _D = bloco(_nome)
    for _n, _k in enumerate(pote(_pi)):
        _R = _D[_k]
        palavras(_R[u"certa"], _R[u"outra"])
        p(u"ree_" + _k, lp(_R[u"f"]) + u".")
        p(u"certo%d_%s" % (_pi, _k), elogio(_n) + u" " + _R[u"certa"])
        p(u"dica%d_%s" % (_pi, _k), u"Leia as duas em voz alta. Numa delas o verbo não combina com quem faz: soa estranho.")

# --- 20, 21 e 28: ache no texto -----------------------------------------------
TXT = bloco(u"TXT")
for _pi, _tk in ((20, u"tx1"), (21, u"tx2"), (28, u"tx3")):
    _T = TXT[_tk]
    _nw = 0
    for _lin in _T[u"linhas"]:
        for _w in _lin:
            p(u"tx%d_%d" % (_pi, _nw), u"Travessão." if _w == u"—" else _w)
            _nw += 1
    p(u"certo%d_t" % _pi, u"Muito bem! Você achou todos.")
    p(u"dica%d_t" % _pi, u"Leia linha por linha. São " + str(len(_T[u"ok"])) + u" palavras. Toque em cada uma e depois confira.")

# --- 29 e 30: os caça-verbos --------------------------------------------------------
for _pi, _nome in ((29, u"CACA"), (30, u"CACA2")):
    _C = bloco(_nome)
    for _n, _k in enumerate(pote(_pi)):
        _P = _C[u"pal"][_k]
        p(u"cp_" + _k, _P[u"pista"].replace(u"___", u"lacuna").replace(u"(", u"do verbo ").replace(u")", u"") + u".")
        p(u"certo%d_%s" % (_pi, _k), elogio(_n) + u" " + _P[u"p"].capitalize() + u".")
        p(u"dica%d_%s" % (_pi, _k), u"Diga a frase com o verbo certo e procure a primeira letra dele na grade. Siga para o lado.")

# --- 31 e 32: as cruzadinhas --------------------------------------------------
for _pi, _nome in ((31, u"CRZD"), (32, u"CRZD2")):
    _C = bloco(_nome)
    for _n, _k in enumerate(pote(_pi)):
        _P = _C[_k]
        p(u"crz_" + _k, lp(_P[u"d"]).replace(u"—", u"").replace(u"___", u"lacuna").replace(u"(", u"do verbo ").replace(u")", u"") + u".")
        p(u"certo%d_%s" % (_pi, _k), elogio(_n) + u" " + _P[u"p"].capitalize() + u".")
        p(u"dica%d_%s" % (_pi, _k), u"Diga a frase inteira em voz alta com o verbo certo. Conte as casinhas.")

# --- 33: arraste o pronome até o verbo -----------------------------------------
PARES = bloco(u"PARES")
for _n, _k in enumerate(pote(33)):
    _P = PARES[_k]
    palavras(_P[u"a"], _P[u"b"])
    p(u"certo33_" + _k, elogio(_n) + u" " + _P[u"a"].capitalize() + u" " + _P[u"b"] + u".")
    p(u"dica33_" + _k, u"Diga " + _P[u"a"] + u" e depois cada forma de cima. Qual soa certa?")

# --- 34: escreva o seu verbo -----------------------------------------------------
PROD = bloco(u"PROD")
for _n, _k in enumerate(pote(34)):
    _X = PROD[_k]
    p(u"prd_" + _k, u"Escreva " + _X[u"q"].replace(u"___", u"lacuna") + u".")
    p(u"certo34_" + _k, u"Essa vale! O verbo é seu, e ele combina.")
    p(u"dica34_" + _k, u"Pense no que essas pessoas fazem nesse lugar. Escreva o verbo combinando com quem faz.")

# --- 35: o cartaz do verbo ---------------------------------------------------------
CART = bloco(u"CART")
for _L in CART[u"linhas"]:
    p(u"cart_" + _L[u"k"], _L[u"t"].capitalize() + u": " + _L[u"d"] + u". Por exemplo, " + lp(_L[u"e"]).replace(u"—", u"") + u".")
_CARTN = {u"v": u" é um verbo: uma ação.", u"c": u": o verbo combina com quem faz, é a concordância.", u"d": u" é um verbo de dizer."}
for _n, _k in enumerate(pote(35)):
    _X = CART[u"exem"][_k]
    p(u"ex_" + _k, lp(_X[u"p"]).capitalize() + u".")
    p(u"certo35_" + _k, elogio(_n) + u" " + lp(_X[u"p"]).capitalize() + _CARTN[_X[u"c"]])
    p(u"dica35_" + _k, u"É uma ação sozinha, é uma frase em que o verbo combina com quem faz, ou é um verbo que mostra uma fala?")


# ==============================================================================
#  AS SÍLABAS FALADAS — e este bloco é obrigatório em caderno que fale sílaba
#
#  ⚠️⚠️ POR QUE NÃO DÁ PARA SINTETIZAR A SÍLABA SOLTA (e a casa já pagou por
#     isto DUAS vezes — set/2026 e 16/set/2026, as duas o Marcos ouvindo):
#     a voz não lê SOM, lê PALAVRA. Entregue "SA" a ela e ela soletra "esse-á";
#     "VA" vira "vê-á"; "ÇÃ" ela nem tenta, porque ç não começa palavra em
#     português. Escrever a sílaba "como se fala" conserta UM caso e nunca
#     fecha a família.
#
#  O QUE FUNCIONA é o contrário: gravar a PALAVRA INTEIRA — que a voz pronuncia
#  certo, porque é palavra de verdade — alinhar letra a letra com o
#  `ctc-forced-aligner` e CORTAR a sílaba de dentro dela. Quem faz isso é o
#  `_padrao/silabas_voz.py`, dentro do `entregar.yml`, lendo o `silabas.json`
#  que sai daqui. O portão é o `_qa/silabas.py`.
#
#  COMO SE USA: para cada palavra do caderno, uma linha
#      _reg(u"CAVALO", [u"CA", u"VA", u"LO"])
#  e, no app, a sílaba fala por `falarSilaba(null, 0, "VA")` — nunca por
#  `falar("sil_va")`. Caderno que não fala sílaba não escreve nada: o
#  `silabas.json` sai com `"palavras": {}` e o `entregar.yml` nem baixa o
#  alinhador por ele.
#
#  ⚠️ NÃO HÁ FALA DE RESERVA POR SÍLABA. Faltando o recorte, o app diz a
#     PALAVRA INTEIRA. Uma reserva sintetizada seria o defeito voltando pela
#     porta dos fundos — e calado, que é pior.
# ==============================================================================
_SIL_DE = {}          # palavra -> [sílabas, NA ORDEM da palavra]
_MAPA_SIL = {}        # sílaba  -> [palavra, posição]
_RECUSADAS = []


def _reg(palavra, silabas):
    u"""⚠️ A LISTA TEM DE ESTAR NA ORDEM DA PALAVRA. O alinhador corta pelos
    limites das letras: ["RO","CAR"] para CARRO faz sair "ro" onde devia sair
    "car" — e a criança ouve o pedaço errado, sem erro nenhum na tela. Folha de
    ORDENAR guarda as sílabas EMBARALHADAS: passe-as por `_ordena` antes.
    ⚠️ E ganha sempre a partição MAIS FINA: "PIPO"+"CA" fecha PIPOCA sem ser
    separação silábica, e sobrescrevendo PI-PO-CA deixaria a sílaba PI muda."""
    silabas = list(silabas)
    if u"".join(silabas).upper() != palavra.upper():
        _RECUSADAS.append((palavra, silabas))
        return
    velha = _SIL_DE.get(palavra.lower())
    if velha and len(velha) >= len(silabas):
        return
    _SIL_DE[palavra.lower()] = silabas


def _ordena(palavra, embaralhadas):
    u"""as mesmas sílabas na ORDEM em que formam a palavra — sem inventar
    nenhuma: encaixa da esquerda para a direita e desiste se não fechar."""
    resto, saida, alvo = list(embaralhadas), [], palavra.upper()
    while alvo:
        for _i, _sb in enumerate(resto):
            if alvo.startswith(_sb.upper()):
                saida.append(_sb)
                alvo = alvo[len(_sb):]
                resto.pop(_i)
                break
        else:
            return None
    return saida if not resto else None


def _achaSilaba(s):
    u"""a palavra de onde a sílaba será recortada. Ganha a MAIS CURTA: menos
    letras na gravação, menos lugar para o alinhador errar."""
    cand = [_w for _w in sorted(_SIL_DE) if s in _SIL_DE[_w]]
    if not cand:
        return None
    _w = min(cand, key=lambda w: (len(_SIL_DE[w]), len(w), w))
    return [_w, _SIL_DE[_w].index(s)]


def _mapeia(soltas):
    u"""monta o SILMAP das sílabas que o app fala sozinhas, e DEVOLVE as órfãs.
    ⚠️ Sílaba órfã não é erro — o app diz a palavra inteira — mas tem de sair
    IMPRESSA, senão aquele botão emudece sem ninguém saber. Distratora que não
    mora em palavra nenhuma do caderno pede uma PALAVRA-CARREGADORA: uma
    palavra de verdade, curta, registrada só para ser gravada e cortada."""
    orfas = []
    for _s in sorted(set(soltas)):
        _achou = _achaSilaba(_s)
        if _achou:
            _MAPA_SIL[_s] = _achou
        else:
            orfas.append(_s)
    # e a PALAVRA INTEIRA de cada uma precisa existir como fala: é dela que o
    # recorte sai, e é ela que o app diz quando o recorte falta.
    for _w in sorted(_SIL_DE):
        p(u"pal_" + ch(_w), _w.upper() + u".")
    return orfas


_ORFAS = _mapeia([])          # <- passe aqui TODA sílaba que o app fala sozinha


# ---------------------------------------------------------------------------
# A SAÍDA
# ---------------------------------------------------------------------------
def chave(s):
    u"""O nome do mp3 sai do TEXTO, não da chave da fala — assim duas chaves que
    dizem a mesma frase gravam um arquivo só."""
    s = re.sub(r"\s+", u" ", s or u"").strip().lower()
    hh = 5381
    for c in s:
        hh = ((hh * 33) ^ ord(c)) & 0xFFFFFFFF
    d, out = hh, u""
    if d == 0:
        return u"0"
    while d:
        out = u"0123456789abcdefghijklmnopqrstuvwxyz"[d % 36] + out
        d //= 36
    return out


falas, vistos = [], {}
for k in sorted(F.keys()):
    txt = F[k]
    if not txt:
        continue
    c = chave(txt)
    if c in vistos:
        continue
    vistos[c] = 1
    falas.append({u"id": PREFIXO + c, u"texto": txt, u"voz": VOZ})

html = io.open(CAM, encoding=u"utf-8").read()
blocoF = (u"/*FALAS-INI*/\nvar FALAS = "
          + json.dumps(F, ensure_ascii=False, indent=1, sort_keys=True) + u";\n/*FALAS-FIM*/")
blocoV = (u"/*VOZOK-INI*/var VOZOK = "
          + json.dumps(dict((c, 1) for c in vistos), ensure_ascii=False) + u";/*VOZOK-FIM*/")
novo = re.sub(r"/\*FALAS-INI\*/.*?/\*FALAS-FIM\*/", lambda m: blocoF, html, flags=re.S)
novo = re.sub(r"/\*VOZOK-INI\*/.*?/\*VOZOK-FIM\*/", lambda m: blocoV, novo, flags=re.S)

# ⭐ o `silabas.json` é o que o `entregar.yml` lê para cortar cada sílaba de
#    dentro do mp3 da palavra inteira, e o `SILMAP` é o que o app usa para saber
#    de qual palavra veio cada pedaço. Uma fonte só para os dois.
io.open(os.path.join(AQUI, u"silabas.json"), u"w", encoding=u"utf-8").write(
    json.dumps({u"prefixo": PREFIXO, u"voz": VOZ,
                u"palavras": dict((w, _SIL_DE[w]) for w in sorted(_SIL_DE))},
               ensure_ascii=False, indent=1))
blocoS = (u"/*SILMAP-INI*/var SILMAP = "
          + json.dumps(_MAPA_SIL, ensure_ascii=False, sort_keys=True) + u";/*SILMAP-FIM*/")
novo = re.sub(r"/\*SILMAP-INI\*/.*?/\*SILMAP-FIM\*/", lambda m: blocoS, novo, flags=re.S)
io.open(CAM, u"w", encoding=u"utf-8").write(novo)
io.open(os.path.join(AQUI, u"falas.json"), u"w", encoding=u"utf-8").write(
    json.dumps(falas, ensure_ascii=False, indent=1))
io.open(os.path.join(AQUI, u"voz.txt"), u"w", encoding=u"utf-8").write(VOZ + u"\n")
print(u"FALAS: %d chaves; falas.json: %d fala(s) para gravar; "
      u"silabas: %d palavra(s) para recortar, %d silaba(s) no mapa"
      % (len(F), len(falas), len(_SIL_DE), len(_MAPA_SIL)))
if _ORFAS:
    print(u"   \u26a0\ufe0f %d silaba(s) SEM palavra de origem (o app dira a palavra "
          u"inteira): %s" % (len(_ORFAS), u", ".join(_ORFAS)))
if _RECUSADAS:
    print(u"   \u26a0\ufe0f %d lista(s) recusada(s) por nao formarem a palavra: %s"
          % (len(_RECUSADAS), u", ".join(
              u"%s=%s" % (w, u"-".join(sl)) for w, sl in _RECUSADAS[:8])))
