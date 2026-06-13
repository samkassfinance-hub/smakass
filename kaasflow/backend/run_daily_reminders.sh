#!/bin/bash
# ================================================================
#  Daily WhatsApp Reminder Scheduler for Linux/Mac
#  Run this script daily using cron
#  Example cron: 0 9 * * * /path/to/run_daily_reminders.sh
# ================================================================

echo "Starting WhatsApp Reminder System..."
echo "Date: $(date)"
echo ""

# Change to script directory
cd "$(dirname "$0")"

# Activate virtual environment if exists
if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
fi

# Run the reminder script
python3 whatsapp_reminder.py

# Log the execution
echo "Reminder check completed at $(date)" >> whatsapp_reminder.log

exit 0
