@echo off
set "PYTHON=C:\Users\ASUS\AppData\Local\Programs\Python\Python313\python.exe"
title Sentrion — Hardware Simulator
color 0E

echo.
echo  ╔══════════════════════════════════════════════════════════╗
echo  ║       SENTRION — Hardware Simulator (No ESP32)          ║
echo  ║   Sends fake motion events to the backend API           ║
echo  ╚══════════════════════════════════════════════════════════╝
echo.
echo  Make sure start.bat is already running before using this!
echo  (Backend must be on http://localhost:8000)
echo.

:menu
echo  Pick a test scenario:
echo.
echo    [1]  Safe event — daytime entry (no alarm)
echo    [2]  Violation — 11:47 PM entry (triggers AI agents + alarm)
echo    [3]  Violation — 2:15 AM entry (triggers AI agents + alarm)
echo    [4]  Scheduled exception night (should NOT alarm)
echo    [5]  Manually trigger alarm (buzzer on)
echo    [6]  Silence alarm
echo    [7]  View current system status
echo    [8]  View last agent decision
echo    [9]  View incident log
echo    [0]  Exit
echo.
set /p choice="  Enter number: "

if "%choice%"=="1" goto safe_event
if "%choice%"=="2" goto violation_night
if "%choice%"=="3" goto violation_early
if "%choice%"=="4" goto exception_night
if "%choice%"=="5" goto trigger_alarm
if "%choice%"=="6" goto silence_alarm
if "%choice%"=="7" goto view_status
if "%choice%"=="8" goto view_decision
if "%choice%"=="9" goto view_incidents
if "%choice%"=="0" goto done
goto menu

:safe_event
echo.
echo  Sending: Daytime entry at 09:30 AM (should be CLEARED)...
curl -s -X POST http://localhost:8000/event ^
  -H "Content-Type: application/json" ^
  -d "{\"timestamp\":\"2026-08-02T09:30:00+05:30\",\"sensor_id\":\"sim_pir\",\"location\":\"main_entrance\"}" | python -m json.tool
goto ask_again

:violation_night
echo.
echo  Sending: After-hours entry at 11:47 PM (should ALARM)...
curl -s -X POST http://localhost:8000/event ^
  -H "Content-Type: application/json" ^
  -d "{\"timestamp\":\"2026-08-02T23:47:00+05:30\",\"sensor_id\":\"sim_pir\",\"location\":\"main_entrance\"}" | python -m json.tool
goto ask_again

:violation_early
echo.
echo  Sending: Early morning entry at 2:15 AM (should ALARM)...
curl -s -X POST http://localhost:8000/event ^
  -H "Content-Type: application/json" ^
  -d "{\"timestamp\":\"2026-08-02T02:15:00+05:30\",\"sensor_id\":\"sim_pir\",\"location\":\"main_entrance\"}" | python -m json.tool
goto ask_again

:exception_night
echo.
echo  Sending: Maintenance night 2026-08-05 at 11:30 PM (exception — should NOT alarm)...
curl -s -X POST http://localhost:8000/event ^
  -H "Content-Type: application/json" ^
  -d "{\"timestamp\":\"2026-08-05T23:30:00+05:30\",\"sensor_id\":\"sim_pir\",\"location\":\"main_entrance\"}" | python -m json.tool
goto ask_again

:trigger_alarm
echo.
echo  Triggering alarm manually...
curl -s -X POST http://localhost:8000/trigger-alarm | python -m json.tool
goto ask_again

:silence_alarm
echo.
echo  Silencing alarm...
curl -s -X POST http://localhost:8000/silence-alarm | python -m json.tool
goto ask_again

:view_status
echo.
echo  System status:
curl -s http://localhost:8000/status | python -m json.tool
goto ask_again

:view_decision
echo.
echo  Last agent decision:
curl -s http://localhost:8000/decision | python -m json.tool
goto ask_again

:view_incidents
echo.
echo  Incident log:
curl -s http://localhost:8000/incidents | python -m json.tool
goto ask_again

:ask_again
echo.
echo  ──────────────────────────────────
echo  (Then check dashboard at http://localhost:3000 to see changes live!)
echo  ──────────────────────────────────
echo.
pause
goto menu

:done
echo.
echo  Goodbye!
exit /b 0
