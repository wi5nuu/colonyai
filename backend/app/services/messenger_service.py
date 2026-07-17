import logging
from datetime import datetime, timezone
from typing import Optional

logger = logging.getLogger(__name__)

# Messenger notification service\nclass MessengerService:
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
            f"ðŸ”¬ *ColonyAI ISO-17025 Automated Report*\n"
            f"â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”\n"
            f"Generated: {timestamp} UTC\n"
            f"Analyst: {user_name}\n\n"
            f"ðŸ“Š *Summary:*\n"
            f"â€¢ Total Analyses: {report_data.get('total', 0)}\n"
            f"â€¢ Completed: {report_data.get('completed', 0)}\n"
            f"â€¢ Total Colonies: {report_data.get('colonies', 0)}\n"
            f"â€¢ Avg CFU/ml: {report_data.get('avg_cfu', 'N/A')}\n\n"
            f"âœ… *Status*: All systems nominal.\n"
            f"ðŸ”— View full ledger on the Neural Control Center."
        )
        
        logger.info(f"[WHATSAPP API] Sent message to {phone_number}:\n{message}")
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
            f"ðŸ”¬ <b>ColonyAI ISO-17025 Automated Report</b>\n"
            f"â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”\n"
            f"Generated: <code>{timestamp} UTC</code>\n"
            f"Analyst: <b>{user_name}</b>\n\n"
            f"ðŸ“Š <b>Summary:</b>\n"
            f"â€¢ Total Analyses: <b>{report_data.get('total', 0)}</b>\n"
            f"â€¢ Completed: <b>{report_data.get('completed', 0)}</b>\n"
            f"â€¢ Total Colonies: <b>{report_data.get('colonies', 0)}</b>\n"
            f"â€¢ Avg CFU/ml: <b>{report_data.get('avg_cfu', 'N/A')}</b>\n\n"
            f"âœ… <b>Status</b>: All systems nominal.\n"
            f"ðŸ”— View full ledger on the Neural Control Center."
        )
        
        logger.info(f"[TELEGRAM API] Sent HTML message to {chat_id}:\n{message}")
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
        status_icon = "ðŸŸ¢" if analysis_data.get('status') == "completed" else "ðŸ”´"
        
        message = (
            f"âš¡ *REAL-TIME ANALYSIS ALERT* âš¡\n"
            f"â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”\n"
            f"ID: `{analysis_data.get('sample_id')}`\n"
            f"Time: {timestamp} UTC\n\n"
            f"ðŸ§ª *Result Data:*\n"
            f"â€¢ Protocol: {analysis_data.get('media_type')}\n"
            f"â€¢ Colonies Detected: {analysis_data.get('colony_count', 0)}\n"
            f"â€¢ CFU/ml: {analysis_data.get('cfu_per_ml', 'N/A')}\n"
            f"â€¢ Confidence: {analysis_data.get('confidence_score', 0) * 100:.1f}%\n\n"
            f"{status_icon} *Status*: {str(analysis_data.get('status')).upper()}\n"
        )
        
        if image_url:
            message += f"\nðŸ“¸ *Annotated Image*: {image_url}"

        logger.info(f"[{platform.upper()} API] Instant Alert queued and sent to {target_id}:\n{message}")
        return True

messenger_service = MessengerService()

