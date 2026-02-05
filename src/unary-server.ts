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