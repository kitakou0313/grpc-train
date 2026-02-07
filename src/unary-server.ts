import * as grpc from "@grpc/grpc-js";
import { MyServiceService, IMyServiceServer } from "./generated/service_grpc_pb";
import { 
    HelloRequest,
    HelloResponse,
    ListUsersRequest,
    UserResponse,
    ChatMessage,
    MessageSummary
 } from "./generated/service_pb";
import { error } from "console";

const sampleUsersList = [
    {id: '1', name: 'User1', email: 'user1@example.com'},
    {id: '1', name: 'User1', email: 'user1@example.com'},
    {id: '1', name: 'User1', email: 'user1@example.com'},
    {id: '1', name: 'User1', email: 'user1@example.com'}

]

const myServiceImpl: IMyServiceServer = {
// Unary gRPC実装
// 1リクエストに対して1レスポンスが返る
    sayHello: (
        call: grpc.ServerUnaryCall<HelloRequest, HelloResponse>,
        callback: grpc.sendUnaryData<HelloResponse>
    ) => {
        console.log('[Unary] SayHello が呼び出されました');

        const name = call.request.getName();

        const response = new HelloResponse();
        response.setMessage(`こんにちは, ${name}`)

        callback(null, response);
        console.log(`[Unary] レスポンスを送信`)
    },

    // Server Streaming gRPC実装
    // 1リクエスト受信 -> 複数レスポンス送信 -> 送信停止

    listUsers: (
        call: grpc.ServerWritableStream<ListUsersRequest, UserResponse>
    ) => {
        console.log('[Server Streaming] ListUsers is called')

        const maxResults = call.request.getMaxResults();

        const usersToSend = sampleUsersList.slice(0, maxResults);
        let index = 0;
        const intervalId = setInterval(() => {
            if (index >= usersToSend.length){
                clearInterval(intervalId);
                // 送信停止
                call.end();
                return
            }

            const user = usersToSend[index];
            const response = new UserResponse()
            response.setId(user.id);
            response.setName(user.name);
            response.setEmail(user.email);

            call.write(response);
        })

    },

    // Client streaming gRPC実装
    // Client側から複数メッセージ受信 -> 受信完了 -> 1レスポンスを返す
    recordMessages: (
        call: grpc.ServerReadableStream<ChatMessage, MessageSummary>,
        callback: grpc.sendUnaryData<MessageSummary>
    ) => {
        console.log('[Client Streaming] RecordMessages')

        const messages: string[] = []

        // Clientからmessageを受信するたびに実行
        call.on('data', (message: ChatMessage) => {
            const user = message.getUser()
            const text = message.getText()

            const messageString = `${user}: ${text}`;
            messages.push(messageString);
            console.log(`[Client Streaming] 受信]: ${messageString}`)
        })

        call.on("end", () => {
            const summary = new MessageSummary();
            summary.setMessageCount(messages.length)
            summary.setSummary(
                messages.length > 0
                    ? `受信したメッセージ:\n${messages.join('\n')}`
                    : 'メッセージは受信されませんでした'
                )
            callback(null, summary);
            }
        )
    }

}


function main() {
const server = new grpc.Server();

// serviceとserverの定義は別々？
server.addService(MyServiceService, myServiceImpl)

const address = '0.0.0.0:50051'

server.bindAsync(
    address,
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
        if (error) {
            console.error(`サーバー起動エラー`, error)
            return
        }

        console.log(`サーバー起動ずみ`)
    }
)
}


main()