const axios = require('axios');
const config = require('../config/config');

class WhatsAppService {
  constructor() {
    this.baseURL = `https://graph.facebook.com/v22.0/${config.WHATSAPP_PHONE_ID}/messages`;
    this.headers = {
      'Authorization': `Bearer ${config.WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    };
  }

  async sendMessage(to, body) {
    try {
      await axios.post(this.baseURL, {
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body }
      }, { headers: this.headers });
    } catch (error) {
      console.error('Erreur envoi message:', error.response?.data || error.message);
    }
  }

  async replyMessage(to, body, messageId) {
    try {
      await axios.post(this.baseURL, {
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body },
        context: { message_id: messageId }
      }, { headers: this.headers });
    } catch (error) {
      console.error('Erreur réponse message:', error.response?.data || error.message);
    }
  }

  async sendButtons(to, text, buttons, header = null, footer = null) {
    try {
      const buttonData = {
        messaging_product: 'whatsapp',
        to,
        type: 'interactive',
        interactive: {
          type: 'button',
          body: { text },
          action: {
            buttons: buttons.map((btn, index) => ({
              type: 'reply',
              reply: {
                id: btn.id || `btn_${index}`,
                title: btn.title.substring(0, 20) // WhatsApp limite à 20 caractères
              }
            }))
          }
        }
      };

      if (header) {
        buttonData.interactive.header = { type: 'text', text: header };
      }

      if (footer) {
        buttonData.interactive.footer = { text: footer };
      }

      await axios.post(this.baseURL, buttonData, { headers: this.headers });
    } catch (error) {
      console.error('Erreur envoi boutons:', error.response?.data || error.message);
    }
  }

  async sendList(to, text, sections, header = null, footer = null) {
    try {
      const listData = {
        messaging_product: 'whatsapp',
        to,
        type: 'interactive',
        interactive: {
          type: 'list',
          body: { text },
          action: {
            button: 'Voir les options',
            sections
          }
        }
      };

      if (header) {
        listData.interactive.header = { type: 'text', text: header };
      }

      if (footer) {
        listData.interactive.footer = { text: footer };
      }

      await axios.post(this.baseURL, listData, { headers: this.headers });
    } catch (error) {
      console.error('Erreur envoi liste:', error.response?.data || error.message);
    }
  }
}

module.exports = new WhatsAppService();