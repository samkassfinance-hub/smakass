"""
Email Templates for SamKass Finance Manager
Professional HTML emails with founder's message
"""

def get_welcome_email_html(user_name):
    """
    Generate welcome email with founder's message
    Optimized to avoid spam filters
    """
    return f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Welcome to SamKass Finance Manager</title>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }}
        .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; }}
        .header {{ background: #667eea; color: white; padding: 30px 20px; text-align: center; }}
        .header h1 {{ margin: 0; font-size: 28px; font-weight: 600; }}
        .header p {{ margin: 5px 0 0 0; font-size: 14px; opacity: 0.9; }}
        .content {{ padding: 30px 20px; }}
        .section {{ margin-bottom: 30px; }}
        .section-title {{ font-size: 20px; font-weight: 600; color: #667eea; border-bottom: 3px solid #667eea; padding-bottom: 10px; margin-bottom: 15px; }}
        .founder-message {{ background: #f8f9fa; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; }}
        .founder-message strong {{ color: #764ba2; font-size: 16px; }}
        .founder-message p {{ margin: 10px 0; line-height: 1.8; }}
        .highlight {{ color: #764ba2; font-weight: 600; }}
        .steps {{ counter-reset: step-counter; }}
        .step {{ counter-increment: step-counter; margin-bottom: 15px; display: flex; gap: 15px; }}
        .step-num {{ background: #667eea; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; }}
        .step-content {{ flex: 1; }}
        .step-content strong {{ color: #333; }}
        .features {{ list-style: none; padding: 0; }}
        .features li {{ padding: 8px 0; padding-left: 25px; position: relative; }}
        .features li:before {{ content: "✓"; position: absolute; left: 0; color: #667eea; font-weight: bold; }}
        .pricing {{ background: #f0f4ff; padding: 20px; border-radius: 8px; margin: 15px 0; }}
        .pricing-row {{ display: flex; justify-content: space-between; margin: 10px 0; }}
        .pricing-value {{ font-weight: 600; color: #667eea; }}
        .best-value {{ background: #667eea; color: white; padding: 5px 10px; border-radius: 4px; font-size: 12px; margin-left: 10px; }}
        .cta-button {{ display: inline-block; background: #667eea; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 20px 0; }}
        .cta-button:hover {{ background: #764ba2; }}
        .contact-info {{ background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }}
        .contact-row {{ margin: 10px 0; }}
        .contact-row strong {{ color: #667eea; }}
        .footer {{ background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #eee; }}
        .divider {{ border-bottom: 2px solid #e0e0e0; margin: 20px 0; }}
        .signature {{ color: #764ba2; font-weight: 600; }}
    </style>
</head>
<body>
    <div class="container">
        <!-- HEADER -->
        <div class="header">
            <h1>🚀 Welcome to SamKass</h1>
            <p>Your Smart Loan Manager is Ready!</p>
        </div>

        <!-- MAIN CONTENT -->
        <div class="content">
            <p>Hi <strong>{user_name}</strong>,</p>

            <!-- FOUNDER MESSAGE -->
            <div class="section">
                <div class="section-title">A WORD FROM THE FOUNDER</div>
                <div class="founder-message">
                    <p>Hi, I'm <span class="highlight">Mohanakannan S</span> — the founder of SamKass.</p>
                    <p>I built SamKass because I saw a real problem. Thousands of small-scale financiers across India are still managing their entire loan business in paper notebooks, Excel sheets, and WhatsApp chats. Missed EMIs, lost records, manual reminders — it was costing them time, money, and trust.</p>
                    <p>So I built <strong>SamKass Finance Manager</strong> — a smart, offline-first app designed specifically for small financiers like you. No complicated software. No expensive subscriptions to start. Just a clean, simple tool that works even without internet, right from your phone.</p>
                    <p>Every feature in SamKass was built with one goal in mind: <span class="highlight">to make your daily loan management effortless, organized, and secure.</span></p>
                    <p>Thank you for trusting SamKass. This is just the beginning — and I'm excited to be part of your journey.</p>
                    <p>— <strong>Mohanakannan S</strong><br>Founder, SamKass | samkass.site</p>
                </div>
            </div>

            <div class="divider"></div>

            <!-- WELCOME SECTION -->
            <div class="section">
                <div class="section-title">Welcome to SamKass Finance Manager!</div>
                <p>You've just taken the smartest step toward managing your loans, clients, and collections — the digital way.</p>
                <p><strong>No more notebooks. No more Excel sheets. No more missed EMIs.</strong></p>
                <p>SamKass is now your all-in-one finance management system.</p>
            </div>

            <!-- GET STARTED -->
            <div class="section">
                <div class="section-title">Get Started in 3 Simple Steps</div>
                <div class="steps">
                    <div class="step">
                        <div class="step-num">1</div>
                        <div class="step-content">
                            <strong>Add Your First Client</strong>
                            <p style="margin: 5px 0 0 0; font-size: 14px;">Go to Clients → Add Client → Enter name, phone, and ID details.</p>
                        </div>
                    </div>
                    <div class="step">
                        <div class="step-num">2</div>
                        <div class="step-content">
                            <strong>Create a Loan</strong>
                            <p style="margin: 5px 0 0 0; font-size: 14px;">Go to Loans → New Loan → Choose your interest type and set the EMI schedule.</p>
                        </div>
                    </div>
                    <div class="step">
                        <div class="step-num">3</div>
                        <div class="step-content">
                            <strong>Record Payments & Share Receipts</strong>
                            <p style="margin: 5px 0 0 0; font-size: 14px;">Collect payments, auto-generate PDF receipts, and share them instantly on WhatsApp.</p>
                        </div>
                    </div>
                </div>
                <p style="margin-top: 20px; font-weight: 600; color: #667eea;">That's it — your business is now running on SamKass.</p>
            </div>

            <!-- FEATURES -->
            <div class="section">
                <div class="section-title">What You Can Do with SamKass</div>
                <ul class="features">
                    <li>Manage unlimited client profiles with full contact & ID details</li>
                    <li>Create loans with flexible interest — percentage, fixed, or custom</li>
                    <li>Track monthly & weekly EMI collections in one dashboard</li>
                    <li>Generate & share payment receipts via WhatsApp in one tap</li>
                    <li>View reports — outstanding balances, collection history & more</li>
                    <li>Ask the AI Assistant anything about your loans or clients</li>
                    <li>PIN-protected security with OTP-based account recovery</li>
                    <li>Works OFFLINE — no internet needed for daily operations</li>
                </ul>
            </div>

            <!-- INSTALL PWA -->
            <div class="section">
                <div class="section-title">Install SamKass on Your Phone</div>
                <p>SamKass is a Progressive Web App (PWA) — install it on your home screen for instant access, just like a native app.</p>
                <p><strong>On Android:</strong> Open samkass.site in Chrome → tap the menu → "Add to Home Screen"</p>
                <p><strong>On iOS:</strong> Open samkass.site in Safari → tap Share → "Add to Home Screen"</p>
                <p style="color: #667eea; font-weight: 600;">It's fast, offline-ready, and always available.</p>
            </div>

            <!-- PRICING -->
            <div class="section">
                <div class="section-title">Your Free Plan Includes</div>
                <ul class="features">
                    <li>Up to 20 clients</li>
                    <li>Full loan creation & EMI tracking</li>
                    <li>Payment recording & receipt generation</li>
                    <li>AI Assistant & built-in calculator</li>
                    <li>Offline access</li>
                </ul>
                <p style="margin-top: 20px;"><strong>Want unlimited clients and full premium access?</strong></p>
                <div class="pricing">
                    <div class="pricing-row">
                        <span>Monthly</span>
                        <span class="pricing-value">₹270 <span style="font-size: 12px; color: #666;">(30 days)</span></span>
                    </div>
                    <div class="pricing-row">
                        <span>Quarterly</span>
                        <span class="pricing-value">₹850 <span style="font-size: 12px; color: #666;">(90 days) — Save ₹60</span></span>
                    </div>
                    <div class="pricing-row">
                        <span>Yearly</span>
                        <span class="pricing-value">₹1,999 <span style="font-size: 12px; color: #666;">(365 days) — Save ₹1,241</span></span>
                        <span class="best-value">BEST VALUE</span>
                    </div>
                </div>
                <a href="https://samkass.site/upgrade" class="cta-button">→ UPGRADE NOW</a>
            </div>

            <!-- SECURITY -->
            <div class="section">
                <div class="section-title">Your Account is Secure</div>
                <p>Your data is protected with:</p>
                <ul class="features">
                    <li>PIN-lock access on every session</li>
                    <li>Bcrypt password hashing</li>
                    <li>JWT-secured authentication</li>
                    <li>OTP email verification</li>
                    <li>Automatic Supabase cloud backups</li>
                </ul>
                <p style="margin-top: 15px; color: #667eea; font-weight: 600;">We never sell your data. Ever.</p>
            </div>

            <!-- CONTACT -->
            <div class="section">
                <div class="section-title">Need Help?</div>
                <p>We're always here for you.</p>
                <div class="contact-info">
                    <div class="contact-row"><strong>📧 Email:</strong> samkassfinance@gmail.com</div>
                    <div class="contact-row"><strong>💬 WhatsApp:</strong> +91 7904987242</div>
                    <div class="contact-row"><strong>📱 Instagram:</strong> @samkassfinance</div>
                    <div class="contact-row"><strong>🌐 Website:</strong> samkass.site</div>
                </div>
                <p style="font-size: 14px; color: #666;">Or use the built-in Help & FAQ section right inside the app.</p>
            </div>

            <!-- CLOSING -->
            <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">Built with passion for every small financier in India who deserves a smarter, simpler way to run their business.</p>
            <p style="color: #667eea; font-weight: 600;">Let's grow together.</p>
            <p style="margin-bottom: 5px;">Warm regards,</p>
            <p class="signature">Mohanakannan S<br>Founder, SamKass Finance Manager<br>samkass.site</p>
        </div>

        <!-- FOOTER -->
        <div class="footer">
            <p style="margin: 0 0 10px 0;">© 2026 SamKass. All rights reserved.</p>
            <p style="margin: 0;">You received this email because you signed up at samkass.site</p>
        </div>
    </div>
</body>
</html>
"""

def get_otp_email_html(otp_code):
    """Generate OTP email for password reset"""
    return f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; background: #fff; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }}
        .content {{ padding: 30px 20px; }}
        .otp-box {{ background: #f0f4ff; padding: 30px; text-align: center; border-radius: 8px; margin: 20px 0; border: 2px solid #667eea; }}
        .otp-box h2 {{ color: #667eea; margin: 0 0 10px 0; }}
        .otp-code {{ font-size: 48px; font-weight: bold; letter-spacing: 8px; color: #764ba2; margin: 20px 0; font-family: 'Courier New', monospace; }}
        .warning {{ background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }}
        .footer {{ background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #eee; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Password Reset Request</h1>
        </div>
        <div class="content">
            <p>Hello,</p>
            <p>You requested a password reset for your SamKass account. Use the OTP below to proceed:</p>
            <div class="otp-box">
                <h2>Your One-Time Password (OTP)</h2>
                <div class="otp-code">{otp_code}</div>
                <p style="color: #666; margin-top: 10px;">Valid for 10 minutes</p>
            </div>
            <div class="warning">
                <strong>🔒 Security Reminder:</strong>
                <p style="margin: 5px 0 0 0;">Never share this OTP with anyone. SamKass support will never ask for your OTP.</p>
            </div>
            <p style="margin-top: 20px;">If you didn't request this, please ignore this email.</p>
        </div>
        <div class="footer">
            <p>© 2026 SamKass Finance Manager | samkass.site</p>
        </div>
    </div>
</body>
</html>
"""
