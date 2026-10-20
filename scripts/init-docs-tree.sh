#!/usr/bin/env bash
###############################################################################
# init-docs-tree.sh
#
# Cria (idempotentemente) a árvore de documentação do projeto Enki conforme
# o protocolo de governança SbD/ISO 27001/42001.
#
# Uso:
#   ./scripts/init-docs-tree.sh           # cria estrutura
#   ./scripts/init-docs-tree.sh --dry-run # mostra o que seria feito
#   ./scripts/init-docs-tree.sh --force   # sobrescreve placeholders
#
# Cursorrules: §4 (higiene), §7 (governança)
###############################################################################

set -euo pipefail

readonly SCRIPT_NAME="$(basename "$0")"
readonly PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
readonly TODAY_UTC="$(date -u +%Y-%m-%d)"

DRY_RUN=false
FORCE=false

# ─── Cores (apenas em TTY) ───────────────────────────────────────────────────
if [[ -t 1 ]]; then
    C_RESET='\033[0m'; C_BOLD='\033[1m'
    C_GREEN='\033[0;32m'; C_YELLOW='\033[0;33m'
    C_BLUE='\033[0;34m'; C_RED='\033[0;31m'; C_DIM='\033[2m'
else
    C_RESET=''; C_BOLD=''; C_GREEN=''; C_YELLOW=''
    C_BLUE=''; C_RED=''; C_DIM=''
fi

# ─── Helpers de log ──────────────────────────────────────────────────────────
log_info()    { printf "${C_BLUE}i${C_RESET}  %s\n" "$*"; }
log_ok()      { printf "${C_GREEN}OK${C_RESET} %s\n" "$*"; }
log_skip()    { printf "${C_DIM}-- %s${C_RESET}\n" "$*"; }
log_warn()    { printf "${C_YELLOW}!${C_RESET}  %s\n" "$*"; }
log_error()   { printf "${C_RED}X${C_RESET}  %s\n" "$*" >&2; }
log_section() { printf "\n${C_BOLD}> %s${C_RESET}\n" "$*"; }

usage() {
    cat <<EOF
${SCRIPT_NAME} - Inicializa arvore de docs do Enki

Uso:
  ${SCRIPT_NAME} [opcoes]

Opcoes:
  --dry-run    Mostra o que seria criado, sem escrever
  --force      Sobrescreve placeholders existentes
  -h, --help   Esta mensagem
EOF
}

# ─── Parse de argumentos ─────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
    case "$1" in
        --dry-run) DRY_RUN=true; shift ;;
        --force)   FORCE=true;   shift ;;
        -h|--help) usage; exit 0 ;;
        *) log_error "Opcao desconhecida: $1"; usage; exit 1 ;;
    esac
done

# ─── Validação inicial ───────────────────────────────────────────────────────
if [[ ! -d "${PROJECT_ROOT}/.git" ]]; then
    log_error "Diretorio atual nao e um repositorio git."
    log_error "Esperado: ${PROJECT_ROOT}/.git"
    exit 1
fi

cd "${PROJECT_ROOT}"

log_info "Projeto: ${PROJECT_ROOT}"
log_info "Data UTC: ${TODAY_UTC}"
$DRY_RUN && log_warn "Modo DRY-RUN ativo (nada sera escrito)"
$FORCE   && log_warn "Modo FORCE ativo (placeholders serao sobrescritos)"

# ─── Funções de criação ──────────────────────────────────────────────────────
mkdir_safe() {
    local dir="$1"
    if [[ -d "$dir" ]]; then
        log_skip "dir existe: $dir"
        return 0
    fi
    if $DRY_RUN; then
        log_info "[dry-run] criaria dir: $dir"
    else
        mkdir -p "$dir"
        log_ok "dir criado: $dir"
    fi
}

write_placeholder() {
    local path="$1"
    local content="$2"

    if [[ -f "$path" ]] && ! $FORCE; then
        log_skip "arquivo existe (use --force): $path"
        return 0
    fi

    if $DRY_RUN; then
        log_info "[dry-run] escreveria: $path"
        return 0
    fi

    printf '%s\n' "$content" > "$path"
    log_ok "placeholder criado: $path"
}

# ─── Estrutura de diretórios ─────────────────────────────────────────────────
log_section "Criando arvore de diretorios"

DIRS=(
    "docs"
    "docs/templates"
    "docs/orders"
    "docs/audits"
    "docs/diagnostics"
    "docs/plans"
    "docs/governance"
    "scripts"
)

for d in "${DIRS[@]}"; do
    mkdir_safe "$d"
done

# ─── .gitkeep para diretórios que podem ficar vazios ─────────────────────────
log_section "Criando .gitkeep"

GITKEEP_DIRS=(
    "docs/orders"
    "docs/audits"
    "docs/diagnostics"
    "docs/plans"
)

for d in "${GITKEEP_DIRS[@]}"; do
    write_placeholder "$d/.gitkeep" "# Mantem o diretorio versionado quando vazio."
done

# ─── README do diretório docs/ ───────────────────────────────────────────────
log_section "Criando READMEs"

DOCS_README='# Documentacao do Projeto Enki

Estrutura de governanca documental sob ISO 27001 / 42001.

## Diretorios

| Diretorio | Conteudo |
|---|---|
| templates/ | Moldes de Ordem de Servico (OS) |
| orders/ | OSs executadas, arquivadas |
| audits/ | Relatorios de auditoria |
| diagnostics/ | Diagnosticos tecnicos |
| plans/ | Planos de reconstrucao / refatoracao |
| governance/ | Politicas, ADRs, conformidade |

## Hierarquia de Autoridade

1. cursorrules.md (raiz) - Regras de Ouro
2. prompt.md (raiz) - Diretrizes Gerais
3. docs/templates/ - Moldes de execucao
4. docs/orders/ - Instancias executadas

Em conflito, o item de menor numero vence.'

write_placeholder "docs/README.md" "$DOCS_README"

# ─── Placeholder do README de templates ──────────────────────────────────────
TPL_README='# Templates de Ordens de Servico

> Substituir este placeholder pelo conteudo completo do README de
> templates aprovado.

## Catalogo

- prompt-retomada.md - Molde vazio
- exemplo-doc-sync.md - Perfil Documentacao
- exemplo-implementacao.md - Perfil Implementacao
- exemplo-governanca.md - Perfil Governanca/Release'

write_placeholder "docs/templates/README.md" "$TPL_README"

# ─── Placeholders dos templates ──────────────────────────────────────────────
log_section "Criando placeholders de templates"

create_template_placeholder() {
    local path="$1"
    local desc="$2"
    local body="# ${desc}

> PLACEHOLDER - substituir pelo template aprovado.
>
> Criado por: ${SCRIPT_NAME}
> Data UTC: ${TODAY_UTC}
"
    write_placeholder "$path" "$body"
}

create_template_placeholder "docs/templates/prompt-retomada.md" \
    "Molde vazio (preencher com a versao aprovada)"
create_template_placeholder "docs/templates/exemplo-doc-sync.md" \
    "Exemplo Perfil Documentacao"
create_template_placeholder "docs/templates/exemplo-implementacao.md" \
    "Exemplo Perfil Implementacao"
create_template_placeholder "docs/templates/exemplo-governanca.md" \
    "Exemplo Perfil Governanca/Release"

# ─── README de governance/ ───────────────────────────────────────────────────
GOV_README='# Governanca

Este diretorio abriga:

- ADRs (Architecture Decision Records): ADR-NNNN-<slug>.md
- Politicas de conformidade ISO 27001 / 42001
- Registros de revisao dos templates e cursorrules
- Historico de incidentes e licoes aprendidas

## Convencoes

- ADRs numerados sequencialmente: ADR-0001, ADR-0002, ...
- Toda mudanca no cursorrules.md deve ter ADR correspondente.'

write_placeholder "docs/governance/README.md" "$GOV_README"

# ─── Verificação de .gitignore (regras macOS) ────────────────────────────────
log_section "Verificando .gitignore (macOS)"

GITIGNORE_PATH="${PROJECT_ROOT}/.gitignore"
MACOS_RULES=(".DS_Store" ".AppleDouble" ".LSOverride" "Icon?" "._*")

if [[ ! -f "$GITIGNORE_PATH" ]]; then
    log_warn ".gitignore ausente - criar conforme cursorrules §4.1"
else
    missing=()
    for rule in "${MACOS_RULES[@]}"; do
        if ! grep -qxF "$rule" "$GITIGNORE_PATH" 2>/dev/null; then
            missing+=("$rule")
        fi
    done

    if [[ ${#missing[@]} -gt 0 ]]; then
        log_warn "Regras macOS ausentes em .gitignore:"
        for r in "${missing[@]}"; do
            printf "      - %s\n" "$r"
        done
    else
        log_ok ".gitignore com regras macOS OK"
    fi
fi

# ─── Verificação de .gitattributes (EOL=LF) ──────────────────────────────────
log_section "Verificando .gitattributes (EOL=LF)"

GITATTR_PATH="${PROJECT_ROOT}/.gitattributes"

if [[ ! -f "$GITATTR_PATH" ]]; then
    log_warn ".gitattributes ausente - criar com: * text=auto eol=lf"
elif ! grep -qF "eol=lf" "$GITATTR_PATH" 2>/dev/null; then
    log_warn ".gitattributes existe mas nao forca eol=lf (cursorrules §4.2)"
else
    log_ok ".gitattributes com EOL=LF OK"
fi

# ─── Resumo final ────────────────────────────────────────────────────────────
log_section "Resumo"

if $DRY_RUN; then
    log_warn "Execucao em DRY-RUN - nenhum arquivo foi escrito."
    log_info "Para aplicar: ./scripts/${SCRIPT_NAME}"
else
    log_ok "Estrutura de docs inicializada."
    log_info "Proximos passos:"
    printf "      1. Substituir placeholders em docs/templates/*.md\n"
    printf "      2. Validar .gitignore e .gitattributes\n"
    printf "      3. Commitar conforme template Documentacao:\n"
    printf "         git add docs/ scripts/\n"
    printf "         git commit -m \"docs(governance): inicializa arvore de docs SbD\"\n"
fi

exit 0