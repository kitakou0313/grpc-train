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