@echo off
setlocal
cd /d "%~dp0"

echo =======================================================
echo   TransGribator Studio - Windows Launcher
echo =======================================================

if exist "bin\server-windows.exe" goto run_bin
where node >nul 2>nul
if %errorlevel% equ 0 goto run_node
where python >nul 2>nul
if %errorlevel% equ 0 goto run_py
goto err

:run_bin
echo [1/3] Launching portable static server...
start http://localhost:8080
bin\server-windows.exe -w sws.toml
goto finish

:run_node
echo [2/3] Launching Node.js server...
start http://localhost:8080
node serve.js
goto finish

:run_py
echo [3/3] Launching Python server...
start http://localhost:8080
python server.py
goto finish

:err
echo Error: No server found. Please ensure bin\server-windows.exe exists.
pause

:finish
endlocal
