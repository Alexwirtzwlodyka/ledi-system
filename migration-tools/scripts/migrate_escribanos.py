from __future__ import annotations
import csv
from pathlib import Path
INPUT = Path('input_escribanos.csv')
OUTPUT = Path('output_escribanos.csv')
def normalize(value: str) -> str: return (value or '').strip()
def main() -> None:
    if not INPUT.exists(): raise SystemExit(f'No existe {INPUT}')
    with INPUT.open('r', encoding='utf-8', newline='') as fin, OUTPUT.open('w', encoding='utf-8', newline='') as fout:
        reader = csv.DictReader(fin)
        writer = csv.DictWriter(fout, fieldnames=['apellido','nombre','dni','matricula','registro','email','telefono'])
        writer.writeheader()
        for row in reader:
            writer.writerow({'apellido': normalize(row.get('apellido')), 'nombre': normalize(row.get('nombre')), 'dni': ''.join(ch for ch in normalize(row.get('dni')) if ch.isdigit()), 'matricula': normalize(row.get('matricula')), 'registro': normalize(row.get('registro')), 'email': normalize(row.get('email')).lower(), 'telefono': normalize(row.get('telefono'))})
if __name__ == '__main__': main()
