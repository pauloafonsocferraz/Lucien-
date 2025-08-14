@echo off
setlocal

echo.
echo =========================================
echo  Iniciando o processo de Publicacao
echo =========================================
echo.

:: 1. Adicionar todas as mudancas ao staging do Git
echo [Git] Adicionando arquivos...
git add .
if %errorlevel% neq 0 (
    echo ERRO: Falha ao adicionar arquivos ao Git.
    goto :eof
)
echo [Git] Arquivos adicionados com sucesso.
echo.

:: 2. Perguntar pela mensagem de commit
set /p commit_msg="[Git] Digite a mensagem do commit: "
if "%commit_msg%"=="" (
    echo ERRO: Mensagem de commit nao pode ser vazia.
    goto :eof
)
echo [Git] Commitando mudancas...
git commit -m "%commit_msg%"
if %errorlevel% neq 0 (
    echo ERRO: Falha ao commitar mudancas.
    goto :eof
)
echo [Git] Mudancas commitadas com sucesso.
echo.

:: 3. Enviar as mudancas para o repositorio remoto
echo [Git] Enviando para o repositorio remoto (origin main)...
git push origin main
if %errorlevel% neq 0 (
    echo ERRO: Falha ao enviar para o repositorio remoto.
    goto :eof
)
echo [Git] Enviado com sucesso para o repositorio remoto.
echo.

:: 4. Construir a aplicacao React para producao
echo [Build] Iniciando o build da aplicacao React...
npm run build
if %errorlevel% neq 0 (
    echo ERRO: Falha ao construir a aplicacao.
    goto :eof
)
echo [Build] Build concluido com sucesso.
echo.

:: 5. Fazer o deploy para producao usando Netlify CLI
echo [Deploy] Iniciando o deploy para Netlify em producao...
netlify deploy --prod --dir=build
if %errorlevel% neq 0 (
    echo ERRO: Falha ao realizar o deploy no Netlify.
    goto :eof
)
echo [Deploy] Deploy para Netlify concluido com sucesso!
echo.

echo =========================================
echo  Processo de Publicacao Concluido!
echo =========================================
echo.

endlocal
pause
