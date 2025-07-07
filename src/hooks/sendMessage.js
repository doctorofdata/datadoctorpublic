import { API } from 'aws-amplify';

export async function callSendMessage(message, conversationId) {

    const requestData = {
        body: {
            message: message,
            conversation_id: conversationId
        }
    }

    const data = await API.post(
        'theDataDojo',
        '/v1/send-message',
        requestData)

    return data["body"]
}
