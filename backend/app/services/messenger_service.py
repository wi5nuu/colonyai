import logging
from datetime import datetime, timezone
from typing import Optional

logger = logging.getLogger(__name__)

# Messenger notification service
class MessengerService:
    """
    Enterprise-grade Messenger Integration (WhatsApp/Telegram).
    For competition demo purposes, this simulates the connection and payload formatting
    using standard logging, but the architecture is ready to be connected to Twilio API or Telegram Bot API.
    """
    
    @staticmethod
    async def send_whatsapp_report(
        phone_number: str, 
        report_data: dict, 
        user_name: str
    ) -> bool:
        """
        Simulate sending a WhatsApp message via Business API (e.g., Twilio).
        """
        timestamp = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M')
        
        message = (
            f"\U0001f52c *ColonyAI ISO-17025 Automated Report*\n"
            f"\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n"
            f"Generated: {timestamp} UTC\n"
            f"Analyst: {user_name}\n\n"
            f"\U0001f4ca *Summary:*\n"
            f"\u2022 Total Analyses: {report_data.get('total', 0)}\n"
            f"\u2022 Completed: {report_data.get('completed', 0)}\n"
            f"\u2022 Total Colonies: {report_data.get('colonies', 0)}\n"
            f"\u2022 Avg CFU/ml: {report_data.get('avg_cfu', 'N/A')}\n\n"
            f"\u2705 *Status*: All systems nominal.\n"
            f"\U0001f517 View full ledger on the Neural Control Center."
        )
        
        logger.info(f"[WHATSAPP API] Sent message to {phone_number} (content redacted for privacy)")
        return True

    @staticmethod
    async def send_telegram_report(
        chat_id: str, 
        report_data: dict, 
        user_name: str
    ) -> bool:
        """
        Simulate sending a Telegram message via Telegram Bot API.
        """
        timestamp = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M')
        
        message = (
            f"\U0001f52c <b>ColonyAI ISO-17025 Automated Report</b>\n"
            f"\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n"
            f"Generated: <code>{timestamp} UTC</code>\n"
            f"Analyst: <b>{user_name}</b>\n\n"
            f"\U0001f4ca <b>Summary:</b>\n"
            f"\u2022 Total Analyses: <b>{report_data.get('total', 0)}</b>\n"
            f"\u2022 Completed: <b>{report_data.get('completed', 0)}</b>\n"
            f"\u2022 Total Colonies: <b>{report_data.get('colonies', 0)}</b>\n"
            f"\u2022 Avg CFU/ml: <b>{report_data.get('avg_cfu', 'N/A')}</b>\n\n"
            f"\u2705 <b>Status</b>: All systems nominal.\n"
            f"\U0001f517 View full ledger on the Neural Control Center."
        )
        
        logger.info(f"[TELEGRAM API] Sent HTML message to {chat_id} (content redacted for privacy)")
        return True

    @staticmethod
    async def send_instant_analysis_alert(
        platform: str,
        target_id: str,
        analysis_data: dict,
        image_url: Optional[str] = None
    ) -> bool:
        """
        Send an immediate real-time alert after an analysis completes.
        Supports sending the annotated image along with the CFU results.
        """
        timestamp = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
        status_icon = "\U0001f7e2" if analysis_data.get('status') == "completed" else "\U0001f534"
        
        message = (
            f"\u26a1 *REAL-TIME ANALYSIS ALERT* \u26a1\n"
            f"\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n"
            f"ID: `{analysis_data.get('sample_id')}`\n"
            f"Time: {timestamp} UTC\n\n"
            f"\U0001f9ea *Result Data:*\n"
            f"\u2022 Protocol: {analysis_data.get('media_type')}\n"
            f"\u2022 Colonies Detected: {analysis_data.get('colony_count', 0)}\n"
            f"\u2022 CFU/ml: {analysis_data.get('cfu_per_ml', 'N/A')}\n"
            f"\u2022 Confidence: {analysis_data.get('confidence_score', 0) * 100:.1f}%\n\n"
            f"{status_icon} *Status*: {str(analysis_data.get('status')).upper()}\n"
        )
        
        if image_url:
            message += f"\n\U0001f4f7 *Annotated Image*: {image_url}"

        logger.info(f"[{platform.upper()} API] Instant Alert queued and sent to {target_id}:\n{message}")
        return True

messenger_service = MessengerService()
