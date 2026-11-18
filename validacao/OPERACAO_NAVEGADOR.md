# Operação dos testes no navegador integrado

Preferência expressa do usuário: usar somente o navegador integrado, sem controlar
o Chrome nativo. A confirmação de aplicativo do Chrome expirou e não foi concedida.

## Confirmação de substituição do Scratch

O Scratch pode mostrar “Replace contents of the current project?” ao carregar outro
`.sb3`. É um diálogo do site para substituir o projeto na aba, não um pedido para
modificar os arquivos LaTeX do repositório.

Nas últimas trocas, os comandos de importação e observação passaram a expirar. O
usuário mostrou uma imagem desse diálogo. A existência do diálogo pode explicar
parte das interrupções, mas não foi provado que explica todas. `getJsDialog()`
retornou vazio nas tentativas, portanto não se deve afirmar que o aviso foi tratado
automaticamente com sucesso.

## Fluxo para as próximas execuções

1. Guardar cada observação em arquivo próprio, com AX e screenshot. Não depender
   de um array mutável da sessão JavaScript, pois reinicializações podem perdê-lo.
2. Parar a execução antes de carregar outro projeto.
3. Preferir uma aba nova para cada projeto e carregar o `.sb3` antes de qualquer
   edição, reduzindo substituições de projetos alterados.
4. Se aparecer confirmação, conferir o diálogo pela API documentada. Só substituir
   projetos descartáveis de teste, cujos `.sb3` estão preservados.
5. Quando `getJsDialog()` não expuser um aviso que o usuário vê, registrar a limitação;
   não tentar interagir com a interface do aplicativo Codex por automação nativa.
6. Confirmar o efeito da ação na página antes de registrar uma atividade como
   executada. Importação que expirou não é evidência de que o projeto foi carregado.

## Tentativas inconclusivas desta bateria

- “Segunda fase” do capítulo 19 foi preparado, mas a importação expirou. Não foi
  registrado como executado.
- A primeira tentativa de “Contador de tentativas” expirou; depois de recarregar,
  o projeto foi importado e duas colisões foram observadas.
- O teste do cronômetro foi importado e executado, com tempo visível na vitória.

As falhas da ferramenta não são classificadas como defeitos do livro.

Na retomada, o navegador integrado informou que o uso do navegador local estava
desativado nas configurações do Work. A aba da segunda fase já havia aberto o
projeto, mas não ficou uma evidência conclusiva do resultado da troca de cenário.
Nenhum item adicional foi contabilizado como executado no editor nessa rodada.

Na rodada seguinte, “Segunda fase” e “Recomeçar” foram observados em abas
limpas. Após a carga do projeto inicial do editor, pressionar Enter no item
“Load from your computer” abriu o seletor para esses testes. Para testar as
teclas do jogo, o palco recebeu o clique de foco antes do envio das teclas.
