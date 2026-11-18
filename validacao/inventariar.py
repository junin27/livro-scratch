"""Extrai o escopo do livro sem tratar inventário como execução de testes."""
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "validacao"


def inventory():
    result = []
    for path in sorted((ROOT / "capitulos").glob("cap[0-9][0-9].tex")):
        source = path.read_text(encoding="utf-8")
        chapter = int(path.stem[3:])
        counts = {}
        previous_activity = None
        units = []
        for match in re.finditer(r"\\begin\{(codigo|missao|exercicio|desafio)\}(?:\[([^\]]*)\])?", source):
            kind, title = match.groups()
            end = source.index("\\end{" + kind + "}", match.end())
            counts[kind] = counts.get(kind, 0) + 1
            unit = {
                "id": f"C{chapter:02}-{kind.upper()}-{counts[kind]:02}",
                "capitulo": chapter,
                "tipo": kind,
                "titulo": title or kind,
                "arquivo": path.relative_to(ROOT).as_posix(),
                "linha": source.count("\n", 0, match.start()) + 1,
                "fonte": source[match.end():end].strip(),
                "resolucao": None,
                "status": "pendente",
                "evidencias": [],
            }
            if kind in ("exercicio", "desafio"):
                next_unit = re.search(r"\\begin\{(?:exercicio|desafio)\}", source[end:])
                limit = end + next_unit.start() if next_unit else len(source)
                resolution = re.search(r"\\begin\{solucao\}([\s\S]*?)\\end\{solucao\}", source[end:limit])
                if resolution:
                    unit["resolucao"] = resolution.group(1).strip()
            body = unit["resolucao"] or unit["fonte"]
            unit["pilhas"] = re.findall(r"\\begin\{pilha\}([\s\S]*?)\\end\{pilha\}", body)
            units.append(unit)
        result.extend(units)
    return {
        "escopo": "20 missões, exercícios, desafios e exemplos em ambientes codigo; tabelas e instruções de interface requerem inspeção adicional",
        "fontes_sha256": {
            p.relative_to(ROOT).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest()
            for p in sorted((ROOT / "capitulos").glob("cap[0-9][0-9].tex"))
        },
        "itens": result,
    }


if __name__ == "__main__":
    data = inventory()
    OUT.mkdir(exist_ok=True)
    (OUT / "inventario.json").write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    from collections import Counter
    print(json.dumps(dict(Counter(x["tipo"] for x in data["itens"])), ensure_ascii=False))
    print("Pilhas:", sum(len(x["pilhas"]) for x in data["itens"]))
