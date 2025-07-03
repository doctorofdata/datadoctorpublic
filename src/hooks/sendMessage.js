import { API } from 'aws-amplify';

export async function callSendMessage(message, conversationId) {

    const requestData = {
        body: {
            message: message,
            conversation_id: conversationId
        }
    }

    const data = await API.post(
        'frontendApi',
        '/v1/send_message',
        requestData)

    return data["body"]
}
