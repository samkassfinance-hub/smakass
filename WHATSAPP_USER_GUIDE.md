# 📱 WhatsApp Reminder System - User Guide

## Quick Start (5 Minutes)

### Step 1: One-Time Setup
1. Open **WhatsApp Settings** page in your app
2. Enter your WhatsApp number (e.g., `+919876543210`)
3. Enter your business name
4. Click **Save Settings**
5. Click **Send Test Message** to verify

### Step 2: That's It!
The system now runs automatically every day and sends reminders to clients whose loan payment is due TODAY.

---

## 🎯 How It Works

**Every Day, Automatically:**
1. System checks all your active loans
2. Finds loans with due date = today
3. Sends WhatsApp reminder to those clients
4. Uses the phone numbers saved in client profiles

**Message Example:**
```
Dear Rajesh Kumar,

This is a friendly reminder that your loan EMI payment 
of ₹5,000 is due today (15-Jan-2026).

Please make the payment at your earliest convenience 
to avoid late charges.

Thank you,
KaasFlow Finance
```

---

## 📋 Requirements

### Before Using:
- ✅ You must be logged into **WhatsApp Web** on your computer
- ✅ Your computer must be running during reminder time (default: 9 AM)
- ✅ All clients must have valid WhatsApp numbers in their profile
- ✅ Phone numbers must include country code (e.g., +91 for India)

### Phone Number Format:
```
✓ CORRECT:  +919876543210
✓ CORRECT:  +91 9876543210
✗ WRONG:    9876543210 (missing country code)
✗ WRONG:    919876543210 (missing + sign)
```

---

## 🔧 Settings Page

Access from your dashboard: **Settings** → **WhatsApp Reminders**

### Settings Options:

**1. WhatsApp Number**
- Your personal WhatsApp number
- Messages will be sent from this number
- Must include country code (+91 for India)

**2. Business Name**
- Shows in reminder messages
- Default: "KaasFlow"
- Can be your company name

**3. Enable/Disable**
- Toggle to turn reminders on/off
- Disabled = no reminders sent
- Settings are saved even when disabled

---

## 🧪 Testing

### Send Test Message
1. Go to WhatsApp Settings page
2. Enter your WhatsApp number
3. Click **Send Test Message**
4. Wait 2 minutes
5. You'll receive a test message on WhatsApp

**If test works:** ✅ System is ready!
**If test fails:** Check troubleshooting section below

---

## 📊 What Triggers a Reminder?

A reminder is sent when **ALL** these conditions are met:

1. ✅ Loan status = "Active"
2. ✅ Next due date = Today's date
3. ✅ Remaining balance > 0
4. ✅ Client has WhatsApp number saved
5. ✅ WhatsApp reminders enabled in settings

**Example:**
- Loan start date: 1-Jan-2026
- Loan type: Monthly
- Duration: 12 months
- Payment #1 made on 1-Jan-2026
- **Next due date: 1-Feb-2026** ← Reminder sent on this date

---

## 🕒 When Are Reminders Sent?

**Default Schedule:** Every day at **9:00 AM**

The system administrator can change this time in the scheduler settings.

**Note:** Your computer must be:
- Turned ON
- Connected to internet
- Logged into WhatsApp Web

---

## 📱 Client Phone Numbers

### Adding Client Phone Numbers:

When creating/editing a client:
1. Go to **Clients** section
2. Click **Add Client** or **Edit**
3. Enter phone number in **Phone** field
4. Use format: `+919876543210` or `+91 9876543210`
5. Save

### Bulk Update Phone Numbers:

If you need to add country code to existing numbers:
1. Export clients data
2. Add "+91" prefix to all phone numbers
3. Import back into system

---

## 📈 Viewing Reminder History

### Check Sent Reminders:

Your admin can check the database for reminder logs:
```sql
SELECT * FROM kf_whatsapp_logs 
WHERE user_id = 'your-user-id'
ORDER BY created_at DESC;
```

Shows:
- When reminder was sent
- To which client
- Success or failure
- Error messages (if any)

---

## ❓ Frequently Asked Questions

### Q: Do I need to do anything daily?
**A:** No! After one-time setup, everything is automatic.

### Q: Can I disable reminders temporarily?
**A:** Yes! Uncheck "Enable automatic WhatsApp reminders" in settings.

### Q: Will clients know it's automated?
**A:** Messages come from your WhatsApp, appear as regular messages.

### Q: What if my computer is off?
**A:** Reminders won't be sent. Keep computer on or use a server.

### Q: Can I customize the message?
**A:** Currently no. Contact admin to modify message template.

### Q: What if client doesn't have WhatsApp?
**A:** Reminder is skipped for that client. No error occurs.

### Q: How many reminders per day?
**A:** One reminder per loan due that day. Not repeated.

### Q: What about overdue loans?
**A:** Currently only sends for TODAY's due date. Contact admin for overdue reminders.

### Q: Can I send reminders manually?
**A:** Yes! Use the "Send Reminder" button in loan details (coming soon).

### Q: What if I change my WhatsApp number?
**A:** Just update in WhatsApp Settings page anytime.

---

## 🐛 Troubleshooting

### Problem: Test message not received

**Solutions:**
1. Check if WhatsApp Web is logged in
2. Verify phone number format (+91 included)
3. Wait full 2 minutes
4. Check if popup blockers are disabled
5. Try Chrome or Firefox browser

### Problem: Clients not receiving reminders

**Check:**
1. ✅ Is WhatsApp enabled in settings?
2. ✅ Is computer on at reminder time?
3. ✅ Are client phone numbers correct format?
4. ✅ Do clients have active WhatsApp accounts?
5. ✅ Are loan due dates calculated correctly?

### Problem: WhatsApp Web keeps logging out

**Solutions:**
1. Don't logout manually from WhatsApp Web
2. Keep "Stay signed in" checked
3. Don't use WhatsApp on multiple computers
4. Clear browser cache and re-login

### Problem: Too many messages at once

**Contact admin to:**
- Increase delay between messages
- Split reminders into batches
- Adjust scheduler timing

---

## 💡 Tips for Best Results

1. **Test First:** Send test message to yourself before going live
2. **Verify Numbers:** Check client phone numbers are correct
3. **Stay Logged In:** Keep WhatsApp Web session active
4. **Monitor Initially:** Check logs for first week
5. **Client Feedback:** Ask clients if they received reminders
6. **Update Settings:** Keep business name and number current
7. **Backup:** Take note of your settings somewhere safe

---

## 🎯 Success Indicators

You'll know it's working when:
- ✅ Test message received successfully
- ✅ Clients confirm receiving reminders
- ✅ Reminder logs show "success" status
- ✅ No error notifications from system
- ✅ Clients paying on time after reminders

---

## 📞 Need Help?

**Technical Issues:**
- Contact your system administrator
- Share exact error messages
- Provide screenshot if possible

**System Modifications:**
- Custom message templates
- Different reminder schedules
- Multiple reminder types
- Integration with other systems

---

## ✨ Benefits

**For You:**
- ⏱️ Saves time (no manual reminders)
- 📈 Better collection rates
- 🎯 Never miss a due date
- 📊 Track all communications
- 💼 Professional image

**For Clients:**
- 🔔 Timely payment reminders
- 📱 Convenient WhatsApp notification
- ⚡ Quick access to payment info
- 🤝 Better relationship with you

---

## 🎉 You're All Set!

After completing the 5-minute setup, you can:
- Focus on your business
- Let the system handle reminders
- Check logs occasionally
- Update settings anytime

**The system works silently in the background, sending reminders exactly when needed!**

---

*Last Updated: January 2026*
*Version: 1.0*
