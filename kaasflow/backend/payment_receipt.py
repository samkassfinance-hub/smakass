"""
Payment Receipt Generator - Creates PDF receipts for subscription payments
"""

from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib import colors
from datetime import datetime
import pytz
import io

SUBSCRIPTION_PLANS = {
    'oneday': {'name': '1-Day Trial', 'price': 8, 'duration': 1},
    'monthly': {'name': 'Monthly Plan', 'price': 270, 'duration': 30},
    'quarterly': {'name': 'Quarterly Plan', 'price': 850, 'duration': 90},
    'yearly': {'name': 'Yearly Plan', 'price': 1999, 'duration': 365}
}

def generate_payment_receipt_pdf(user_email, plan_type, payment_id, amount_paise, payment_time_utc=None):
    """
    Generate PDF receipt for subscription payment
    
    Args:
        user_email: User's email
        plan_type: 'oneday', 'monthly', 'quarterly', 'yearly'
        payment_id: Razorpay payment ID
        amount_paise: Amount in paise (e.g., 80000 for ₹800)
        payment_time_utc: Payment completion time (ISO format or None for now)
    
    Returns:
        PDF bytes that can be sent as response
    """
    
    if plan_type not in SUBSCRIPTION_PLANS:
        raise ValueError(f"Invalid plan type: {plan_type}")
    
    plan = SUBSCRIPTION_PLANS[plan_type]
    amount_rupees = amount_paise / 100
    
    # Get current time if not provided
    if not payment_time_utc:
        payment_time_utc = datetime.now(pytz.UTC).isoformat()
    else:
        try:
            # Parse ISO format
            if isinstance(payment_time_utc, str):
                payment_time_utc = datetime.fromisoformat(payment_time_utc)
        except:
            pass
    
    # Convert to IST for display
    try:
        if isinstance(payment_time_utc, str):
            dt_utc = datetime.fromisoformat(payment_time_utc.replace('Z', '+00:00'))
        else:
            dt_utc = payment_time_utc
        
        ist = pytz.timezone('Asia/Kolkata')
        dt_ist = dt_utc.astimezone(ist) if dt_utc.tzinfo else dt_utc
        formatted_time = dt_ist.strftime('%d %B %Y at %I:%M %p IST')
    except:
        formatted_time = str(payment_time_utc)
    
    # Calculate expiry date
    from subscription_manager import get_utc_now
    expiry_utc = get_utc_now() + __import__('datetime').timedelta(days=plan['duration'])
    ist = pytz.timezone('Asia/Kolkata')
    expiry_ist = expiry_utc.astimezone(ist) if expiry_utc.tzinfo else expiry_utc
    formatted_expiry = expiry_ist.strftime('%d %B %Y at %I:%M %p IST')
    
    # Create PDF
    pdf_buffer = io.BytesIO()
    doc = SimpleDocTemplate(pdf_buffer, pagesize=A4, rightMargin=0.5*inch, leftMargin=0.5*inch)
    
    # Styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#2E7D32'),
        spaceAfter=6,
        alignment=1  # Center
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#1976D2'),
        spaceAfter=12,
        spaceBefore=12
    )
    
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=11,
        spaceAfter=6
    )
    
    # Content
    elements = []
    
    # Header
    elements.append(Paragraph("SamKass Finance Manager", title_style))
    elements.append(Paragraph("Subscription Payment Receipt", heading_style))
    elements.append(Spacer(1, 0.1*inch))
    
    # Receipt info
    receipt_data = [
        ['Receipt Number:', payment_id],
        ['Payment Date:', formatted_time],
        ['User Email:', user_email],
    ]
    
    receipt_table = Table(receipt_data, colWidths=[2*inch, 3*inch])
    receipt_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#F5F5F5')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
        ('ALIGN', (1, 0), (1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey)
    ]))
    
    elements.append(receipt_table)
    elements.append(Spacer(1, 0.15*inch))
    
    # Plan details
    elements.append(Paragraph("Subscription Details", heading_style))
    
    plan_data = [
        ['Plan Type:', plan['name']],
        ['Duration:', f"{plan['duration']} day(s)"],
        ['Amount Paid:', f"₹{amount_rupees:,.2f}"],
        ['Valid From:', formatted_time],
        ['Valid Until:', formatted_expiry],
        ['Status:', '✓ ACTIVE'],
    ]
    
    plan_table = Table(plan_data, colWidths=[2*inch, 3*inch])
    plan_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#F5F5F5')),
        ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#C8E6C9')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
        ('ALIGN', (1, 0), (1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, -1), (1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey)
    ]))
    
    elements.append(plan_table)
    elements.append(Spacer(1, 0.2*inch))
    
    # Features
    elements.append(Paragraph("Included Features", heading_style))
    
    features = [
        "✓ Unlimited client additions",
        "✓ All premium features unlocked",
        "✓ Full app access",
        "✓ Collection mode enabled",
        "✓ WhatsApp reminders",
        "✓ Excel & PDF export",
        "✓ Cloud backup"
    ]
    
    for feature in features:
        elements.append(Paragraph(feature, normal_style))
    
    elements.append(Spacer(1, 0.2*inch))
    
    # Footer
    elements.append(Paragraph("_" * 80, normal_style))
    elements.append(Spacer(1, 0.05*inch))
    
    footer_text = f"""
    <b>Thank you for your payment!</b><br/>
    This receipt confirms your subscription is active until {formatted_expiry}.<br/>
    For support, contact: support@samkass.com<br/>
    <br/>
    <i>Generated on {datetime.now(pytz.timezone('Asia/Kolkata')).strftime('%d %B %Y at %I:%M %p IST')}</i>
    """
    
    elements.append(Paragraph(footer_text, ParagraphStyle(
        'FooterStyle',
        parent=styles['Normal'],
        fontSize=9,
        alignment=1,
        textColor=colors.HexColor('#666666')
    )))
    
    # Build PDF
    doc.build(elements)
    pdf_buffer.seek(0)
    return pdf_buffer.getvalue()

def generate_receipt_filename(user_email, plan_type, payment_id):
    """Generate a safe filename for the receipt"""
    now = datetime.now(pytz.UTC).strftime('%Y%m%d_%H%M%S')
    user_part = user_email.split('@')[0][:10]
    return f"SamKass_Receipt_{plan_type}_{user_part}_{now}.pdf"
