@echo off
REM ================================================================
REM  Daily WhatsApp Reminder Scheduler for Windows
REM  Run this batch file daily using Windows Task Scheduler
REM ================================================================

echo Starting WhatsApp Reminder System...
echo Date: %date%
echo Time: %time%
echo.

REM Change to backend directory
cd /d "%~dp0"

REM Activate virtual environment if exists
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
)

REM Run the reminder script
python whatsapp_reminder.py

REM Log the execution
echo Reminder check completed at %time% >> whatsapp_reminder.log

pause
