"""Traduz as pilhas LaTeX para uma AST auditável; não corrige o livro."""
import json
import re
from pathlib import Path
from inventariar import inventory, ROOT


def command(s, i=0):
    m = re.match(r"\\([A-Za-z]+)(?:\[([^\]]*)\])?", s[i:])
    if not m:
        raise ValueError(s[i:])
    name, color = m.groups()
    j = i + m.end()
    if j >= len(s) or s[j] != "{":
        return name, color, "", j
    start = j + 1
    depth = 1
    j += 1
    while depth:
        if s[j] == "{" and s[j - 1] != "\\":
            depth += 1
        elif s[j] == "}" and s[j - 1] != "\\":
            depth -= 1
        j += 1
    return name, color, s[start:j - 1], j


def node(op, **inputs):
    return {"op": op, "inputs": inputs}


def normalize(s):
    return s.replace("$", "").replace(r"\times", "*").replace(r"\ldots", "...").replace(r"\%", "%").strip()


def flatten(s):
    values = []
    out = ""
    i = 0
    while i < len(s):
        if s[i:i + 2] == "\\%":
            out += "%"
            i += 2
            continue
        if s[i:i + 2] == "\\ ":
            out += " "
            i += 2
            continue
        if s[i] == "\\":
            name, color, content, end = command(s, i)
            if name in ("entrada", "menu"):
                # Espaços dentro de entradas de texto são significativos.
                value = content.replace("$", "").replace(r"\ldots", "...")
            elif name == "variavel":
                special = {"resposta": "sensing_answer", "y": "motion_yposition", "cronômetro": "sensing_timer", "número da fantasia": "looks_costumenumbername"}
                value = node(special[content]) if content in special else node("data_variable", VARIABLE=content)
            elif name in ("reporter", "booleano"):
                value = expression(content)
            elif name == "textbf":
                out += content
                i = end
                continue
            elif name == "bandeira":
                out += "BANDEIRA"
                i = end
                continue
            else:
                out += "\\" + name
                i = end
                continue
            out += f"@{len(values)}@"
            values.append(value)
            i = end
        else:
            out += s[i]
            i += 1
    return normalize(out), values


def expression(s):
    text, values = flatten(s)
    def val(token):
        return values[int(token.strip('@'))]
    if re.fullmatch(r"@\d+@", text):
        return val(text)
    for pattern, opcode, args in [
        (r"número aleatório entre (@\d+@) e (@\d+@)", "operator_random", ["FROM", "TO"]),
        (r"junte (@\d+@) (@\d+@)", "operator_join", ["STRING1", "STRING2"]),
        (r"item (@\d+@) de (@\d+@)", "data_itemoflist", ["INDEX", "LIST"]),
        (r"tamanho de (@\d+@)", "data_lengthoflist", ["LIST"]),
        (r"tocando em (@\d+@)\?", "sensing_touchingobject", ["TOUCHINGOBJECTMENU"]),
        (r"tocando na cor (@\d+@)\?", "sensing_touchingcolor", ["COLOR"]),
        (r"tecla (@\d+@) pressionada\?", "sensing_keypressed", ["KEY_OPTION"]),
    ]:
        match = re.fullmatch(pattern, text)
        if match:
            return node(opcode, **dict(zip(args, map(val, match.groups()))))
    if text == "mouse pressionado?":
        return node("sensing_mousedown")
    match = re.fullmatch(r"(@\d+@)\s*([+*/<>=-]|e|ou)\s*(@\d+@)", text)
    if match:
        a, op, b = match.groups()
        names = {"+": "add", "-": "subtract", "*": "multiply", "/": "divide", "<": "lt", ">": "gt", "=": "equals", "e": "and", "ou": "or"}
        keys = ["OPERAND1", "OPERAND2"] if op in "<>=" or op in ("e", "ou") else ["NUM1", "NUM2"]
        return node("operator_" + names[op], **dict(zip(keys, [val(a), val(b)])))
    raise ValueError("Expressão não traduzida: " + text)


def block(raw):
    text, values = flatten(raw)
    def val(token):
        return values[int(token.strip('@'))]
    patterns = [
        (r"mova (@\d+@) passos", "motion_movesteps", ["STEPS"]),
        (r"gire (@\d+@) graus", "motion_turnright", ["DEGREES"]),
        (r"vá para x: (@\d+@) y: (@\d+@)", "motion_gotoxy", ["X", "Y"]),
        (r"deslize por (@\d+@) seg até x: (@\d+@) y: (@\d+@)", "motion_glidesecstoxy", ["SECS", "X", "Y"]),
        (r"mude x em (@\d+@)", "motion_changexby", ["DX"]),
        (r"mude y em (@\d+@)", "motion_changeyby", ["DY"]),
        (r"aponte para a direção (@\d+@)", "motion_pointindirection", ["DIRECTION"]),
        (r"defina o estilo de rotação (@\d+@)", "motion_setrotationstyle", ["STYLE"]),
        (r"vá para (@\d+@)", "motion_goto", ["TO"]),
        (r"diga (@\d+@) por (@\d+@) segundos", "looks_sayforsecs", ["MESSAGE", "SECS"]),
        (r"pense (@\d+@) por (@\d+@) segundos", "looks_thinkforsecs", ["MESSAGE", "SECS"]),
        (r"diga (@\d+@)", "looks_say", ["MESSAGE"]),
        (r"mude o tamanho para (@\d+@) %", "looks_setsizeto", ["SIZE"]),
        (r"mude o tamanho em (@\d+@)", "looks_changesizeby", ["CHANGE"]),
        (r"mude o efeito (@\d+@) em (@\d+@)", "looks_changeeffectby", ["EFFECT", "CHANGE"]),
        (r"mude o cenário para (@\d+@)", "looks_switchbackdropto", ["BACKDROP"]),
        (r"mude para a fantasia (@\d+@)", "looks_switchcostumeto", ["COSTUME"]),
        (r"vá para trás (@\d+@) camadas", "looks_goforwardbackwardlayers", ["NUM"]),
        (r"inicie o som (@\d+@)", "sound_play", ["SOUND_MENU"]),
        (r"toque o som (@\d+@) até o fim", "sound_playuntildone", ["SOUND_MENU"]),
        (r"defina o volume para (@\d+@) %", "sound_setvolumeto", ["VOLUME"]),
        (r"mude o volume em (@\d+@)", "sound_changevolumeby", ["VOLUME"]),
        (r"toque a nota (@\d+@) por (@\d+@) tempos", "music_playNoteForBeats", ["NOTE", "BEATS"]),
        (r"toque o tambor (@\d+@) por (@\d+@) tempos", "music_playDrumForBeats", ["DRUM", "BEATS"]),
        (r"espere (@\d+@) segundos", "control_wait", ["DURATION"]),
        (r"espere até que (@\d+@)", "control_wait_until", ["CONDITION"]),
        (r"repita (@\d+@) vezes", "control_repeat", ["TIMES"]),
        (r"repita até que (@\d+@)", "control_repeat_until", ["CONDITION"]),
        (r"se (@\d+@) então", "control_if", ["CONDITION"]),
        (r"pare (@\d+@)", "control_stop", ["STOP_OPTION"]),
        (r"quando a tecla (@\d+@) for pressionada", "event_whenkeypressed", ["KEY_OPTION"]),
        (r"quando eu receber (@\d+@)", "event_whenbroadcastreceived", ["BROADCAST_OPTION"]),
        (r"envie (@\d+@)", "event_broadcast", ["BROADCAST_INPUT"]),
        (r"pergunte (@\d+@) e espere", "sensing_askandwait", ["QUESTION"]),
        (r"defina (@\d+@) para (@\d+@)", "data_setvariableto", ["VARIABLE", "VALUE"]),
        (r"mude (@\d+@) em (@\d+@)", "data_changevariableby", ["VARIABLE", "VALUE"]),
        (r"apague tudo de (@\d+@)", "data_deletealloflist", ["LIST"]),
        (r"adicione (@\d+@) a (@\d+@)", "data_addtolist", ["ITEM", "LIST"]),
        (r"crie um clone de (@\d+@)", "control_create_clone_of", ["CLONE_OPTION"]),
    ]
    fixed = {
        "quando BANDEIRA for clicado": "event_whenflagclicked",
        "quando este ator for clicado": "event_whenthisspriteclicked",
        "quando eu começar como um clone": "control_start_as_clone",
        "próxima fantasia": "looks_nextcostume", "próximo cenário": "looks_nextbackdrop",
        "esconda": "looks_hide", "mostre": "looks_show", "sempre": "control_forever",
        "se tocar na borda, volte": "motion_ifonedgebounce", "apague este clone": "control_delete_this_clone",
        "zere o cronômetro": "sensing_resettimer",
    }
    if text in fixed:
        return node(fixed[text])
    for pattern, opcode, args in patterns:
        match = re.fullmatch(pattern, text)
        if match:
            return node(opcode, **dict(zip(args, map(val, match.groups()))))
    if text.startswith("defina "):
        return node("procedures_definition", signature=text[7:], arguments=values)
    if text.startswith(("quadrado", "pular", "triângulo", "dar pontos", "polígono")):
        return node("procedures_call", signature=text, arguments=values)
    raise ValueError("Bloco não traduzido: " + text)


def pile(text):
    root = []
    containers = [root]
    for match in re.finditer(r"\\(bk|sbh|sbc|sbcelse|sbcend)\b", text):
        name, _, content, _ = command(text, match.start())
        if name == "sbcend":
            containers.pop()
        elif name == "sbcelse":
            containers.pop()
            parent = containers[-1][-1]
            parent["op"] = "control_if_else"
            parent["else"] = []
            containers.append(parent["else"])
        else:
            b = block(content)
            b["fonte"] = content
            containers[-1].append(b)
            if name == "sbc":
                b["body"] = []
                containers.append(b["body"])
    assert len(containers) == 1
    return root


if __name__ == "__main__":
    data = inventory()
    errors = []
    for item in data["itens"]:
        item["ast"] = []
        for i, raw in enumerate(item["pilhas"]):
            try:
                item["ast"].append(pile(raw))
            except Exception as e:
                errors.append({"id": item["id"], "pilha": i, "erro": str(e)})
                item["ast"].append(None)
    data["erros_traducao"] = errors
    (ROOT / "validacao/pilhas.json").write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("Pilhas traduzidas:", sum(p is not None for u in data["itens"] for p in u["ast"]))
    print(json.dumps(errors, ensure_ascii=False, indent=2))
