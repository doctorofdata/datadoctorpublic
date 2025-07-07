import { API } from 'aws-amplify';

export async function callConversations(conversationId) {

    const requestData = {
        body: {
            conversation_id: conversationId
        }
    }

    const data = await API.post(
        'theDataDojo',
        '/v1/conversations',
        requestData)

    return data["body"]
}
