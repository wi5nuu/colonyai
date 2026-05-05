import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

async def send_mfa_email(email_to: str, code: str):
    """
    Send a 6-digit MFA code via SMTP.
    """
    if not settings.SMTP_USER or not settings.SMTP_PASS:
        logger.warning(f"[EMAIL] SMTP not configured. Printing code for {email_to}: {code}")
        return False

    message = MIMEMultipart()
    message["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
    message["To"] = email_to
    message["Subject"] = f"🔐 {code} is your ColonyAI Access Token"

    html_content = f"""
    <html>
        <body style="font-family: sans-serif; background-color: #f8fafc; padding: 40px;">
            <div style="max-width: 500px; margin: 0 auto; background-color: white; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                <div style="text-align: center; margin-bottom: 32px;">
                    <h2 style="color: #0f172a; margin: 0; text-transform: uppercase; letter-spacing: 2px; font-weight: 900;">ColonyAI</h2>
                    <p style="color: #64748b; font-size: 12px; margin-top: 4px;">LABORATORY OPERATING SYSTEM</p>
                </div>

                <div style="border-top: 2px solid #3b82f6; padding-top: 24px;">
                    <p style="color: #334155; font-size: 16px; line-height: 24px;">
                        A login attempt was detected for your account. Use the following <b>Phase II Authorization Token</b> to grant access:
                    </p>

                    <div style="background-color: #f1f5f9; border-radius: 12px; padding: 24px; text-align: center; margin: 32px 0;">
                        <span style="font-family: monospace; font-size: 36px; font-weight: 900; color: #1e293b; letter-spacing: 8px;">{code}</span>
                    </div>

                    <p style="color: #64748b; font-size: 13px; line-height: 20px;">
                        This token is valid for 5 minutes and can only be used once. If you did not request this code, your account security may be compromised. Please contact your Organization Administrator immediately.
                    </p>
                </div>

                <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e2e8f0; text-align: center;">
                    <p style="color: #94a3b8; font-size: 11px; margin: 0;">
                        ColonyAI Tech Platform | ISO-17025 Compliance Infrastructure
                    </p>
                    <p style="color: #94a3b8; font-size: 11px; margin-top: 4px;">
                        Node: ID-WEST-01 | Encrypted Transmission
                    </p>
                </div>
            </div>
        </body>
    </html>
    """

    message.attach(MIMEText(html_content, "html"))

    import ssl
    context = ssl.create_default_context()
    context.check_hostname = False
    context.verify_mode = ssl.CERT_NONE

    try:
        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASS,
            start_tls=settings.SMTP_TLS,
            tls_context=context if settings.SMTP_TLS else None
        )
        logger.info(f"[EMAIL] MFA code sent successfully to {email_to}")
        return True
    except Exception as e:
        logger.error(f"[EMAIL] Failed to send email to {email_to}: {e}")
        return False
